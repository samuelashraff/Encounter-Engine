import socketio
from fastapi import FastAPI
import uvicorn
import uuid
from fastapi.middleware.cors import CORSMiddleware
import httpx
from redis import asyncio as aioredis
import json

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
redis = None

@app.on_event("startup")
async def startup_event():
    global redis
    redis = await aioredis.from_url("redis://redis:6379", decode_responses=True)

@app.on_event("shutdown")
async def shutdown_event():
    global redis
    if redis:
        await redis.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/monsters")
async def get_monsters():
    async with httpx.AsyncClient() as client:
        # Get the list of monsters
        resp = await client.get("https://www.dnd5eapi.co/api/2014/monsters")
        data = resp.json()
        results = data.get("results", [])
        # Limit for demo, remove or adjust as needed
        results = results[:20]
        monsters = []
        for monster in results:
            detail_url = f"https://www.dnd5eapi.co{monster['url']}"
            detail_resp = await client.get(detail_url)
            detail = detail_resp.json()
            monsters.append({
                "index": detail.get("index"),
                "name": detail.get("name"),
                "image": detail.get("image", None)
            })
        return monsters

# Socket event handlers

@sio.event
async def connect(session_id, environ):
    print(f"Client connected: {session_id}")

# Handles creation of a new session. Generates a unique session ID, initializes a grid,
# stores the session and user in Redis, and emits a 'session_created' event to the client.
@sio.event
async def create_session(session_id, data=None):
    title = None
    num_players = None
    if isinstance(data, dict):
        title = data.get("title")
        num_players = data.get("num_players")

    new_session_id = str(uuid.uuid4())[:8]
    # store grid and metadata in hash, initialize canvas_monsters to empty list
    mapping = {"canvas_monsters": json.dumps([])}
    if title is not None:
        mapping["title"] = title
    if num_players is not None:
        mapping["num_players"] = str(num_players)
    await redis.hset(f"session:{new_session_id}", mapping=mapping)
    await redis.sadd(f"session:{new_session_id}:users", session_id)
    await sio.enter_room(session_id, new_session_id)
    await sio.emit('session_created', {"session_id": new_session_id, "title": title, "num_players": num_players}, to=session_id)
    print(f"Session created: {new_session_id} by {session_id}")

# Allows a client to join an existing session. Adds the user to the session's user set in Redis,
# retrieves the grid, and emits a 'session_joined' event to the client. Emits an error if the session does not exist.
@sio.event
async def join_session(session_id, data):
    join_session_id = data.get("session_id")
    if await redis.exists(f"session:{join_session_id}"):
        await redis.sadd(f"session:{join_session_id}:users", session_id)
        await sio.enter_room(session_id, join_session_id)
        canvas_monsters_json = await redis.hget(f"session:{join_session_id}", "canvas_monsters")
        canvas_monsters = json.loads(canvas_monsters_json) if canvas_monsters_json else []
        title = await redis.hget(f"session:{join_session_id}", "title")
        num_players = await redis.scard(f"session:{join_session_id}:users")
        await sio.emit('session_joined', {
            "session_id": join_session_id,
            "canvas_monsters": canvas_monsters,
            "title": title,
            "num_players": num_players
        }, to=session_id)
        print(f"User {session_id} joined session {join_session_id}")

        # Broadcast updated player count to all other clients in the room
        await sio.emit('update_num_players', {
            "num_players": num_players
        }, room=join_session_id, skip_sid=session_id)
    else:
        await sio.emit('error', {"message": "Session not found."}, to=session_id)

# Client notifies server it added a canvas monster
@sio.event
async def canvas_monster_added(session_id, data):
    # expected data: { session_id, id, monster, x, y }
    session = data.get("session_id")
    entry = {k: data.get(k) for k in ("id", "monster", "x", "y")}
    if not session or not entry.get("id") or not entry.get("monster"):
        await sio.emit('error', {"message": "Invalid canvas_monster_added payload"}, to=session_id)
        return
    if not await redis.exists(f"session:{session}"):
        await sio.emit('error', {"message": "Session not found."}, to=session_id)
        return

    # load current list, append if not duplicate, save
    cm_json = await redis.hget(f"session:{session}", "canvas_monsters")
    cm_list = json.loads(cm_json) if cm_json else []
    if any(c.get("id") == entry["id"] for c in cm_list):
        # ignore duplicates
        return
    cm_list.append(entry)
    await redis.hset(f"session:{session}", "canvas_monsters", json.dumps(cm_list))

    # broadcast to room
    await sio.emit('canvas_monster_added', entry, room=session)

# Client notifies server it moved a monster
@sio.event
async def canvas_monster_moved(session_id, data):
    # expected data: { session_id, id, x, y }
    session = data.get("session_id")
    mid = data.get("id")
    nx = data.get("x")
    ny = data.get("y")
    if not session or not mid:
        await sio.emit('error', {"message": "Invalid canvas_monster_moved payload"}, to=session_id)
        return
    if not await redis.exists(f"session:{session}"):
        await sio.emit('error', {"message": "Session not found."}, to=session_id)
        return

    cm_json = await redis.hget(f"session:{session}", "canvas_monsters")
    cm_list = json.loads(cm_json) if cm_json else []
    updated = False
    for c in cm_list:
        if c.get("id") == mid:
            c["x"] = nx
            c["y"] = ny
            updated = True
            break
    if updated:
        await redis.hset(f"session:{session}", "canvas_monsters", json.dumps(cm_list))
        await sio.emit('canvas_monster_moved', {"id": mid, "x": nx, "y": ny}, room=session)
    else:
        # monster not found; optionally inform the client or ignore
        await sio.emit('error', {"message": "Monster id not found."}, to=session_id)

@sio.event
async def canvas_monster_deleted(session_id, data):
    session = data.get("session_id")
    mid = data.get("id")
    if not session or not mid:
        await sio.emit('error', {"message": "Invalid canvas_monster_deleted payload"}, to=session_id)
        return
    if not await redis.exists(f"session:{session}"):
        await sio.emit('error', {"message": "Session not found."}, to=session_id)
        return

    cm_json = await redis.hget(f"session:{session}", "canvas_monsters")
    cm_list = json.loads(cm_json) if cm_json else []
    cm_list = [c for c in cm_list if c.get("id") != mid]
    await redis.hset(f"session:{session}", "canvas_monsters", json.dumps(cm_list))

    await sio.emit('canvas_monster_deleted', {"id": mid}, room=session)
    print(f"Canvas monster deleted in session {session}: {mid}")


# Handles client disconnection. Removes the user from all session user sets in Redis.
# If a session has no users left, deletes the session data from Redis.
@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    try:
        # Iterate through all session user sets
        async for key in redis.scan_iter("session:*:users"):
            if await redis.sismember(key, sid):
                await redis.srem(key, sid)

                # Extract session_id from key (e.g., "session:abc123:users" -> "abc123")
                session_id = key.split(":")[1]

                # Count remaining players
                remaining_players = await redis.scard(key)

                if remaining_players > 0:
                    # Broadcast updated count to remaining players
                    await sio.emit('update_num_players', {
                        "num_players": remaining_players
                    }, room=session_id)
                else:
                    # Delete the session entirely if no players remain
                    await redis.delete(f"session:{session_id}")
                    await redis.delete(key)
                    print(f"Cleaned up empty session: {session_id}")

    except Exception as e:
        print(f"Error in disconnect handler: {e}")

@sio.event
async def leave_session(session_id, data):
    leave_session_id = data.get("session_id")
    if await redis.exists(f"session:{leave_session_id}"):
        # Remove user from session
        await redis.srem(f"session:{leave_session_id}:users", session_id)
        await sio.leave_room(session_id, leave_session_id)

        # Check remaining players
        remaining_players = await redis.scard(f"session:{leave_session_id}:users")
        if remaining_players > 0:
            # Broadcast updated player count to remaining clients
            await sio.emit('update_num_players', {
                "num_players": remaining_players
            }, room=leave_session_id)
        else:
            # Delete session if no players remain
            await redis.delete(f"session:{leave_session_id}")
        
        await sio.emit('leave_confirmed', to=session_id)

if __name__ == "__main__":
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)