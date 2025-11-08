import React, { useState, useEffect } from 'react';
import { BACKEND_URL, DND_API_URL } from './constants';
import { preloadImages } from './utils/imagePreloader';
import Header from './components/Header';
import BoardArea from './components/BoardArea';
import { Box, Modal, Backdrop } from '@mui/material';
import SessionSignUpForm from './components/SessionSignUpForm';
import { useSocket } from './context/SocketContext';
import type { AlertColor } from '@mui/material/Alert';
import SessionSnackbar from './components/SessionSnackbar';
import type { Monster } from './types/monster';


export type GridCell = {
    occupied: boolean;
    monster?: Monster;
}

function App() {
    const { socket } = useSocket();

    // Canvas monsters: monsters placed on the canvas with normalized coords
    const [canvasMonsters, setCanvasMonsters] = useState<Array<{ id: string; monster: Monster; x: number; y: number }>>([]);

    // Session states
    const [sessionJoined, setSessionJoined] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [inputSessionId, setInputSessionId] = useState('');
    const [sessionTitle, setSessionTitle] = useState("");
    const [numPlayers, setNumPlayers] = useState<number | undefined>(undefined);

    // SnackBar states
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');



    // Websocket useEffect
    useEffect(() => {
        if (!socket) return;

        const onSessionCreated = (data: any) => {
            setSessionId(data.session_id);
            setSessionTitle(data.title ?? "");
            setNumPlayers(data.num_players ?? undefined);
            setSessionJoined(true);
            setSnackbarMessage('Session created successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        };
        const onSessionJoined = (data: any) => {
            setSessionId(data.session_id);
            setSessionTitle(data.title ?? "");
            setNumPlayers(data.num_players ?? undefined);
            setSessionJoined(true);
            // set canvas monsters if provided by server (new)
            if (Array.isArray(data.canvas_monsters)) {
            setCanvasMonsters(data.canvas_monsters);
            }
            setSnackbarMessage('Joined session successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        };
        const onError = (data: any) => {
            setSnackbarMessage(data.message || 'An error occurred');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        };
        
        // receive canvas monster events from other clients
        const onCanvasMonsterAdded = (data: any) => {
            try {
            const { id, monster, x, y } = data;
            if (!id || !monster) return;
            setCanvasMonsters(prev => {
                if (prev.find(m => m.id === id)) return prev;
                return [...prev, { id, monster, x, y }];
            });
            } catch (e) { /* ignore malformed */ }
        };

        const onCanvasMonsterMoved = (data: any) => {
            try {
            const { id, x, y } = data;
            if (!id) return;
            setCanvasMonsters(prev => prev.map(cm => cm.id === id ? { ...cm, x, y } : cm));
            } catch (e) { /* ignore malformed */ }
        };

        const onCanvasMonsterDeleted = (data: any) => {
            try {
            const { id } = data;
            if (!id) return;
            setCanvasMonsters(prev => prev.filter(cm => cm.id !== id));
            } catch (e) { /* ignore malformed */ }
        };

        const onUpdateNumPlayers = (data: any) => {
            setNumPlayers(data.num_players);
        };

        socket.on('session_created', onSessionCreated);
        socket.on('session_joined', onSessionJoined);
        socket.on('canvas_monster_added', onCanvasMonsterAdded);
        socket.on('canvas_monster_moved', onCanvasMonsterMoved);
        socket.on('canvas_monster_deleted', onCanvasMonsterDeleted);
        socket.on('update_num_players', onUpdateNumPlayers);
        socket.on('error', onError);

        return () => {
            socket.off('session_created', onSessionCreated);
            socket.off('session_joined', onSessionJoined);
            socket.off('canvas_monster_added', onCanvasMonsterAdded);
            socket.off('canvas_monster_moved', onCanvasMonsterMoved);
            socket.off('canvas_monster_deleted', onCanvasMonsterDeleted);
            socket.off('update_num_players', onUpdateNumPlayers);
            socket.off('error', onError);
        };
    }, [socket]);

    // add a canvas monster locally and emit to server
    function addCanvasMonster(monster: Monster, x: number, y: number) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        const entry = { id, monster, x, y };
        setCanvasMonsters(prev => [...prev, entry]);
        if (socket && sessionId) {
            socket.emit('canvas_monster_added', { session_id: sessionId, ...entry });
        }
    }

    function moveCanvasMonster(id: string, x: number, y: number) {
        setCanvasMonsters(prev => prev.map(cm => cm.id === id ? { ...cm, x, y } : cm));
        if (socket && sessionId) {
            socket.emit('canvas_monster_moved', { session_id: sessionId, id, x, y });
        }
    }

    function deleteCanvasMonster(id: string) {
        setCanvasMonsters(prev => prev.filter(cm => cm.id !== id));
        if (socket && sessionId) {
            socket.emit('canvas_monster_deleted', { session_id: sessionId, id });
        }
    }

    // Preload monster images at app startup for snappy UI.
    // Run once per browser session to avoid repeated network work on reloads.
    useEffect(() => {

        async function fetchAndPreload() {
            try {
                const resp = await fetch(`${BACKEND_URL}/monsters`);
                if (!resp.ok) return;
                const data = await resp.json();
                const urls = (data || [])
                    .map((m: any) => m.image)
                    .filter(Boolean)
                    .map((p: string) => `${DND_API_URL}${p}`);
                if (urls.length) await preloadImages(urls);
            } catch (e) {
                // ignore preload failures
            }
        }
        fetchAndPreload();
    }, []);

    // Handlers for form
    function handleJoinSession(e: React.FormEvent) {
        e.preventDefault();
        if (socket && inputSessionId.trim()) {
            socket.emit('join_session', { session_id: inputSessionId.trim() });
        }
    };
    function handleCreateSession(title: string, numPlayers: number) {
        setSessionTitle(title);
        setNumPlayers(numPlayers);
        if (socket) {
            // You may want to send title/numPlayers to backend in the future
            socket.emit('create_session', { title, num_players: numPlayers });
        }
    };

    // Helper for placing monster in a cell (grid-based) was removed in favor of canvas placement

    function handleLeaveSession() {
        if (socket && sessionId) {
            socket.emit('leave_session', { session_id: sessionId });
            // Clear local state after backend confirms
            socket.once('leave_confirmed', () => {
                setSessionJoined(false);
                setSessionId('');
                setSessionTitle('');
                setNumPlayers(undefined);
                setSnackbarMessage('You have left the session.');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            });
        }
    }

    // TODO: Refactor to canvas-based instead of grid-based
    function handleImportGame(importedGrid: GridCell[]) {
        setSnackbarMessage('Game imported successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    }

    // TODO: Refactor to canvas-based instead of grid-based
    function handleImportError(msg: string) {
        setSnackbarMessage(msg);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    }

    return (
        <div className='app-root'>
            <Header 
                onLeaveSession={handleLeaveSession}
                showLeaveButton={sessionJoined}
            />
            <BoardArea
                canvasMonsters={canvasMonsters}
                onAddCanvasMonster={addCanvasMonster}
                sessionTitle={sessionTitle}
                numPlayers={numPlayers}
                onImportGame={handleImportGame}
                onImportError={handleImportError}
                onMoveCanvasMonster={moveCanvasMonster}
                onDeleteCanvasMonster={deleteCanvasMonster}
            />
            <Modal
                open={!sessionJoined}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                        sx: { backgroundColor: '#000000b3' }
                    }
                }}
            >
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                >
                    <SessionSignUpForm
                        inputSessionId={inputSessionId}
                        setInputSessionId={setInputSessionId}
                        handleJoinSession={handleJoinSession}
                        handleCreateSession={handleCreateSession}
                    />
                </Box>
            </Modal>

            <SessionSnackbar
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={() => setSnackbarOpen(false)}
            />
        </div>
    );
}

export default App;