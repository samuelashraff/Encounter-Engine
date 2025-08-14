import socketio
from fastapi import FastAPI
import uvicorn
import uuid
from fastapi.middleware.cors import CORSMiddleware
import httpx

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

sessions = {}  # session_id: {"grid": [...], "users": set()}
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

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def create_session(sid):
    session_id = str(uuid.uuid4())[:8]
    grid = [False] * (GRID_SIZE * GRID_SIZE)
    sessions[session_id] = {"grid": grid, "users": set()}
    sessions[session_id]["users"].add(sid)
    await sio.enter_room(sid, session_id)
    await sio.emit('session_created', {"session_id": session_id, "grid": grid}, to=sid)
    print(f"Session created: {session_id} by {sid}")

@sio.event
async def join_session(sid, data):
    session_id = data.get("session_id")
    if session_id in sessions:
        sessions[session_id]["users"].add(sid)
        await sio.enter_room(sid, session_id)
        await sio.emit('session_joined', {"session_id": session_id, "grid": sessions[session_id]["grid"]}, to=sid)
        print(f"User {sid} joined session {session_id}")
    else:
        await sio.emit('error', {"message": "Session not found."}, to=sid)

@sio.event
async def update_grid(sid, data):
    session_id = data.get("session_id")
    cell_index = data.get("cell_index")
    value = data.get("value")
    if session_id in sessions and 0 <= cell_index < GRID_SIZE * GRID_SIZE:
        sessions[session_id]["grid"][cell_index] = value
        await sio.emit('grid_updated', {"cell_index": cell_index, "value": value}, room=session_id)

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    for session_id, session in list(sessions.items()):
        session["users"].discard(sid)
        if not session["users"]:
            del sessions[session_id]

if __name__ == "__main__":
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)