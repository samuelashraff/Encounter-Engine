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

GRID_SIZE = 16

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
async def create_session(session_id):
    new_session_id = str(uuid.uuid4())[:8]
    grid = [False] * (GRID_SIZE * GRID_SIZE)    # Set all cells to False
    await redis.hset(f"session:{new_session_id}", mapping={
        "grid": json.dumps(grid)
    })
    await redis.sadd(f"session:{new_session_id}:users", session_id)
    await sio.enter_room(session_id, new_session_id)
    await sio.emit('session_created', {"session_id": new_session_id, "grid": grid}, to=session_id)
    print(f"Session created: {new_session_id} by {session_id}")

# Allows a client to join an existing session. Adds the user to the session's user set in Redis,
# retrieves the grid, and emits a 'session_joined' event to the client. Emits an error if the session does not exist.
@sio.event
async def join_session(session_id, data):
    join_session_id = data.get("session_id")
    if await redis.exists(f"session:{join_session_id}"):
        await redis.sadd(f"session:{join_session_id}:users", session_id)
        await sio.enter_room(session_id, join_session_id)
        grid_json = await redis.hget(f"session:{join_session_id}", "grid")
        grid = json.loads(grid_json)
        await sio.emit('session_joined', {"session_id": join_session_id, "grid": grid}, to=session_id)
        print(f"User {session_id} joined session {join_session_id}")
    else:
        await sio.emit('error', {"message": "Session not found."}, to=session_id)


# Updates the grid state for a session in Redis when a client makes a change.
# Emits a 'grid_updated' event to all users in the session's room.
@sio.event
async def update_grid(session_id, data):
    update_session_id = data.get("session_id")
    cell_index = data.get("cell_index")
    value = data.get("value")
    if await redis.exists(f"session:{update_session_id}") and 0 <= cell_index < GRID_SIZE * GRID_SIZE:
        grid_json = await redis.hget(f"session:{update_session_id}", "grid")
        grid = json.loads(grid_json)
        grid[cell_index] = value
        await redis.hset(f"session:{update_session_id}", "grid", json.dumps(grid))
        await sio.emit('grid_updated', {"cell_index": cell_index, "value": value}, room=update_session_id)
        print(f"Grid updated in session {update_session_id} by {session_id}: cell {cell_index} -> {value}")

# Handles client disconnection. Removes the user from all session user sets in Redis.
# If a session has no users left, deletes the session data from Redis.
@sio.event
async def disconnect(session_id):
    print(f"Client disconnected: {session_id}")
    # Remove user from all session user sets
    async for key in redis.scan_iter("session:*:users"):
        await redis.srem(key, session_id)
        if await redis.scard(key) == 0:
            # Delete session if no users left
            session_id_to_delete = key.decode().split(":")[1]
            await redis.delete(f"session:{session_id_to_delete}")
            await redis.delete(key)

if __name__ == "__main__":
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)