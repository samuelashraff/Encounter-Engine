import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BoardArea from '../components/BoardArea';
import { useSocket } from '../context/SocketContext';
import type { AlertColor } from '@mui/material/Alert';
import SessionSnackbar from '../components/SessionSnackbar';
import type { Monster } from '../types/monster';

interface MonsterCanvasInfo {
    id: string;
    monster: Monster;
    x: number;
    y: number;
}

function SessionPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { socket } = useSocket();

    // Canvas monsters: monsters placed on the canvas with normalized coords
    const [canvasMonsters, setCanvasMonsters] = useState<Array<MonsterCanvasInfo>>([]);

    // Session states
    const [sessionTitle, setSessionTitle] = useState("");
    const [numPlayers, setNumPlayers] = useState<number | undefined>(undefined);

    // SnackBar states
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');

    function updateSnackbar(message: string, severity: AlertColor, snackBarOpen: boolean): void {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(snackBarOpen);
    }

    // Websocket useEffect
    useEffect(() => {
        if (!socket || !sessionId) return;

        const onSessionJoined = (data: any) => {
            setSessionTitle(data.title ?? "");
            setNumPlayers(data.num_players ?? undefined);
            // set canvas monsters if provided by server
            if (Array.isArray(data.canvas_monsters)) {
                setCanvasMonsters(data.canvas_monsters);
            }
            updateSnackbar('Joined session successfully!', 'success', true);
        };
        
        const onError = (data: any) => {
            const message = data.message || 'An error occured';
            updateSnackbar(message, 'error', true);
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
                updateSnackbar('Monster deleted successfully!', 'success', true);
            } catch (e) { /* ignore malformed */ }
        };

        const onUpdateNumPlayers = (data: any) => {
            setNumPlayers(data.num_players);
        };

        socket.on('session_joined', onSessionJoined);
        socket.on('canvas_monster_added', onCanvasMonsterAdded);
        socket.on('canvas_monster_moved', onCanvasMonsterMoved);
        socket.on('canvas_monster_deleted', onCanvasMonsterDeleted);
        socket.on('update_num_players', onUpdateNumPlayers);
        socket.on('error', onError);

        // Rejoin the session if the page was reloaded/navigated to
        socket.emit('join_session', { session_id: sessionId });

        return () => {
            socket.off('session_joined', onSessionJoined);
            socket.off('canvas_monster_added', onCanvasMonsterAdded);
            socket.off('canvas_monster_moved', onCanvasMonsterMoved);
            socket.off('canvas_monster_deleted', onCanvasMonsterDeleted);
            socket.off('update_num_players', onUpdateNumPlayers);
            socket.off('error', onError);
        };
    }, [socket, sessionId]);

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

    function handleLeaveSession() {
        if (socket && sessionId) {
            socket.emit('leave_session', { session_id: sessionId });
            // Navigate after backend confirms
            socket.once('leave_confirmed', () => {
                setSessionTitle('');
                setNumPlayers(undefined);
                setCanvasMonsters([]);
                updateSnackbar('You have left the session.', 'success', true);
                navigate('/');
            });
        }

    }
    return (
        <div className='app-root'>
            <Header 
                onLeaveSession={handleLeaveSession}
                showLeaveButton={true}
            />
            <BoardArea
                canvasMonsters={canvasMonsters}
                onAddCanvasMonster={addCanvasMonster}
                sessionId={sessionId}
                sessionTitle={sessionTitle}
                numPlayers={numPlayers}
                onMoveCanvasMonster={moveCanvasMonster}
                onDeleteCanvasMonster={deleteCanvasMonster}
            />

            <SessionSnackbar
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={() => setSnackbarOpen(false)}
            />
        </div>
    );
}

export default SessionPage;
