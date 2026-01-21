import uuid
import json


def register_handlers(sio, redis):
    """Register all socket event handlers with the sio instance."""

    @sio.event
    async def connect(session_id, environ):
        print(f"Client connected: {session_id}")

    @sio.event
    async def create_session(session_id, data=None):
        """Handles creation of a new session. Generates a unique session ID, initializes a grid,
        stores the session and user in Redis, and emits a 'session_created' event to the client."""
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

    @sio.event
    async def join_session(session_id, data):
        """Allows a client to join an existing session. Adds the user to the session's user set in Redis,
        retrieves the grid, and emits a 'session_joined' event to the client. Emits an error if the session does not exist."""
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

    @sio.event
    async def canvas_monster_added(session_id, data):
        """Client notifies server it added a canvas monster."""
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

    @sio.event
    async def canvas_monster_moved(session_id, data):
        """Client notifies server it moved a monster."""
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
        """Client notifies server it deleted a monster."""
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

    @sio.event
    async def disconnect(sid):
        """Handles client disconnection. Removes the user from all session user sets in Redis.
        If a session has no users left, deletes the session data from Redis."""
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
        """Handles client leaving a session."""
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
