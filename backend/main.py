import socketio
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import httpx
from redis import asyncio as aioredis
from handlers import register_handlers
from os import getenv
from dotenv import load_dotenv

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
redis = None

if getenv("ENV", "dev") != "prod":
    load_dotenv()

@app.on_event("startup")
async def startup_event():
    global redis
    redis_url = getenv("REDIS_URL")
    redis = await aioredis.from_url(redis_url, decode_responses=True)
    register_handlers(sio, redis)

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

        if not results:
            return []
        
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
                "image": detail.get("image", None),
                "health": detail.get("hit_points"),
            })
        return monsters