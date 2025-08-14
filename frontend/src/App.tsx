import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CombatGrid from './components/CombatGrid';
import { Box, Modal, Backdrop, Button } from '@mui/material';
import SessionSignUpForm from './components/SessionSignUpForm';
import { useSocket } from './context/SocketContext';
import type { AlertColor } from '@mui/material/Alert';
import SessionSnackbar from './components/SessionSnackbar';
import type { Monster } from './components/MonsterDropdown';
import MonsterDropdown from './components/MonsterDropdown';

function App() {
    const { socket } = useSocket();

    // Session states
    const [sessionJoined, setSessionJoined] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [inputSessionId, setInputSessionId] = useState('');
    const [grid, setGrid] = useState<boolean[]>([]);

    // SnackBar states
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');

    // Monster placement logic
    const [monsterToPlace, setMonsterToPlace] = useState<Monster | null>(null);
    const [placingMonster, setPlacingMonster] = useState(false);
    const [cursorPos, setCursorPos] = useState<{x: number, y: number}>({x: 0, y: 0});

    // Compute the grid to show: real grid if joined, empty otherwise
    const gridToShow = sessionJoined
        ? grid
        : Array(16 * 16).fill(false); // 16x16 empty grid


    // UseEffects
    useEffect(() => {
        if (!socket) return;

        const onSessionCreated = (data: any) => {
            setSessionId(data.session_id);
            setGrid(data.grid);
            setSessionJoined(true);
            setSnackbarMessage('Session created successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        };
        const onSessionJoined = (data: any) => {
            setSessionId(data.session_id);
            setGrid(data.grid);
            setSessionJoined(true);
            setSnackbarMessage('Joined session successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        };
        const onError = (data: any) => {
            setSnackbarMessage(data.message || 'An error occurred');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        };
        const onGridUpdated = (data: any) => {
            setGrid(prev => {
                const next = [...prev];
                next[data.cell_index] = data.value;
                return next;
            });
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

    useEffect(() => {
        if (!placingMonster) return;
        const handleMouseMove = (e: MouseEvent) => {
            setCursorPos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [placingMonster]);



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
    const handleLeaveSession = () => {
        setSessionJoined(false);
        setSessionId('');
        setGrid([]);
        setSnackbarMessage('You have left the session.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    };

    return (
        <Box minHeight="100vh" bgcolor="#242527">
            <Header 
                onLeaveSession={handleLeaveSession}
                showLeaveButton={sessionJoined}
            />
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="calc(100vh - 80px)" // adjust 80px if your header height is different
                gap={4}
            >
                <Box minWidth={300} ml={4} display="flex" justifyContent="flex-start">
                    <MonsterDropdown
                        onSelect={(monster) => {
                            setMonsterToPlace(monster);
                            setPlacingMonster(true);
                        }}
                    />
                </Box>
                <CombatGrid 
                    grid={gridToShow}
                    onCellClick={handleCellClick}
                />
            </Box>
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
                    height="100vh"
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
            {placingMonster && monsterToPlace && (
                <Box
                    sx={{
                        position: 'fixed',
                        left: cursorPos.x + 10,
                        top: cursorPos.y + 10,
                        pointerEvents: 'none',
                        zIndex: 2000,
                    }}
                >
                    {monsterToPlace.image ? (
                        <img
                            src={`https://www.dnd5eapi.co${monsterToPlace.image}`}
                            alt={monsterToPlace.name}
                            width={48}
                            height={48}
                            style={{ borderRadius: 8, border: '2px solid #bb1e1eff', background: '#fff' }}
                        />
                    ) : (
                        <Box
                            sx={{
                                bgcolor: '#bb1e1eff',
                                color: '#fff',
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                fontWeight: 600,
                            }}
                        >
                            {monsterToPlace.name}
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}

export default App;