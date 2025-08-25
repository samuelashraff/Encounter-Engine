import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import BoardArea from './components/BoardArea';
import { Box, Modal, Backdrop } from '@mui/material';
import SessionSignUpForm from './components/SessionSignUpForm';
import { useSocket } from './context/SocketContext';
import type { AlertColor } from '@mui/material/Alert';
import SessionSnackbar from './components/SessionSnackbar';
import type { Monster } from './components/MonsterDropdown';
import MonsterCursorOverlay from './components/MonsterCursorOverlay';


export type GridCell = {
    occupied: boolean;
    monster?: Monster;
}

function App() {
    const { socket } = useSocket();

    // Session states
    const [sessionJoined, setSessionJoined] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [inputSessionId, setInputSessionId] = useState('');
    const [grid, setGrid] = useState<GridCell[]>([]);

    // SnackBar states
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');

    // Monster placement logic
    const [monsterToPlace, setMonsterToPlace] = useState<Monster | null>(null);
    const [placingMonster, setPlacingMonster] = useState(false);
    const cursorPosRef = useRef({ x: 0, y: 0 });
    const [, setCursorTick] = useState(0); // dummy state to force re-render

    // Compute the grid to show: real grid if joined, empty otherwise
    const gridToShow = sessionJoined
        ? grid
        : Array(16 * 16).fill(null).map(() => ({ occupied: false })); // 16x16 empty grid


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
            cursorPosRef.current = { x: e.clientX, y: e.clientY };
            setCursorTick(tick => tick + 1); // force re-render
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
        if (placingMonster && monsterToPlace) {
            // Local update
            setGrid(prev => {
                const next = [...prev];
                next[idx] = {
                    occupied: true,
                    monster: monsterToPlace,
                };
                return next;
            });
            setPlacingMonster(false);
            setMonsterToPlace(null);
            setSnackbarMessage('Monster placed!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            // Emit to backend for multiplayer sync
            if (socket && sessionId) {
                socket.emit('update_grid', {
                    session_id: sessionId,
                    cell_index: idx,
                    value: {
                        occupied: true,
                        monster: monsterToPlace,
                    }
                });
            }
            return;
        }

        // Toggle cell color (occupied) when not placing a monster
        setGrid(prev => {
            const next = [...prev];
            next[idx] = {
                ...next[idx],
                occupied: !next[idx].occupied,
                ...(next[idx].occupied ? {} : { monster: undefined }),
            };
            return next;
        });

        // Emit toggle to backend
        if (socket && sessionId) {
            socket.emit('update_grid', {
                session_id: sessionId,
                cell_index: idx,
                value: {
                    occupied: !grid[idx].occupied,
                    monster: grid[idx].occupied ? undefined : grid[idx].monster,
                }
            });
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
        <div className='app-root'>
            <Header 
                onLeaveSession={handleLeaveSession}
                showLeaveButton={sessionJoined}
            />
            <BoardArea
                grid={gridToShow}
                onCellClick={handleCellClick}
                onMonsterSelect={(monster) => {
                    setMonsterToPlace(monster);
                    setPlacingMonster(true);
                }}
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
                <MonsterCursorOverlay
                    placingMonster={placingMonster}
                    monsterToPlace={monsterToPlace}
                    cursorPos={cursorPosRef.current}
                />
            )}
        </div>
    );
}

export default App;