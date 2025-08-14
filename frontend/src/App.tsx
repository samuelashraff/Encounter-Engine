import React, { useState } from 'react';
import Header from './components/Header';
import CombatGrid from './components/CombatGrid';
import { Box } from '@mui/material';
import SessionSignUpForm from './components/SessionSignUpForm';
import { useSocket } from './context/SocketContext';
import { useEffect } from 'react';

function App() {
    const { socket } = useSocket();

    const [sessionJoined, setSessionJoined] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [inputSessionId, setInputSessionId] = useState('');
    const [grid, setGrid] = useState<boolean[]>([]);


    useEffect(() => {
        if (!socket) return;

        const onSessionCreated = (data: any) => {
            setSessionId(data.session_id);
            setGrid(data.grid);
            setSessionJoined(true);
        };
        const onSessionJoined = (data: any) => {
            setSessionId(data.session_id);
            setGrid(data.grid);
            setSessionJoined(true);
        };
        const onGridUpdated = (data: any) => {
            setGrid(prev => {
                const next = [...prev];
                next[data.cell_index] = data.value;
                return next;
            });
        };
        const onError = (data: any) => {
            alert(data.message);
        };

        socket.on('session_created', onSessionCreated);
        socket.on('session_joined', onSessionJoined);
        socket.on('grid_updated', onGridUpdated);
        socket.on('error', onError);

        return () => {
            socket.off('session_created', onSessionCreated);
            socket.off('session_joined', onSessionJoined);
            socket.off('grid_updated', onGridUpdated);
            socket.off('error', onError);
        };
    }, [socket]);

    // Handlers for form
    const handleJoinSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (socket && inputSessionId.trim()) {
            socket.emit('join_session', { session_id: inputSessionId.trim() });
        }
    };

    const handleCreateSession = () => {
        if (socket) {
            socket.emit('create_session');
        }
    };

    const handleCellClick = (idx: number, value: boolean) => {
        if (socket && sessionId) {
            socket.emit('update_grid', { session_id: sessionId, cell_index: idx, value });
        }
    };

    return (
        <Box minHeight="100vh" bgcolor="#f5f5f5">
            <Header />
            {!sessionJoined ? (
                <SessionSignUpForm
                    inputSessionId={inputSessionId}
                    setInputSessionId={setInputSessionId}
                    handleJoinSession={handleJoinSession}
                    handleCreateSession={handleCreateSession}
                />
            ) : (
                <CombatGrid 
                    grid={grid}
                    onCellClick={handleCellClick}
                />
            )}
        </Box>
    );
}

export default App;