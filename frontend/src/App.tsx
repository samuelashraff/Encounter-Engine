import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BoardArea from './components/BoardArea';
import { Box, Modal, Backdrop } from '@mui/material';
import SessionSignUpForm from './components/SessionSignUpForm';
import { useSocket } from './context/SocketContext';
import type { AlertColor } from '@mui/material/Alert';
import SessionSnackbar from './components/SessionSnackbar';
import type { Monster } from './components/MonsterDropdown';


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
    const [sessionTitle, setSessionTitle] = useState("");
    const [numPlayers, setNumPlayers] = useState<number | undefined>(undefined);

    // SnackBar states
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');


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
            socket.emit('create_session');
        }
    };
    function handleCellClick(idx: number, value: boolean) {
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

    // Helper for placing monster in a cell
    function handleMonsterSelect(monster: Monster, idx: number) {
        setGrid(prev => {
            const next = [...prev];
            next[idx] = {
                occupied: true,
                monster,
            };
            return next;
        });
        // Emit to backend for multiplayer sync
        if (socket && sessionId) {
            socket.emit('update_grid', {
                session_id: sessionId,
                cell_index: idx,
                value: {
                    occupied: true,
                    monster,
                }
            });
        }
    }

    function handleLeaveSession() {
        setSessionJoined(false);
        setSessionId('');
        setSessionTitle('');
        setNumPlayers(undefined);
        setGrid([]);
        setSnackbarMessage('You have left the session.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    };

    function handleImportGame(importedGrid: GridCell[]) {
        setGrid(importedGrid);
        setSnackbarMessage('Game imported successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    }

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
                grid={gridToShow}
                onCellClick={handleCellClick}
                onMonsterSelect={handleMonsterSelect}
                sessionTitle={sessionTitle}
                numPlayers={numPlayers}
                onImportGame={handleImportGame}
                onImportError={handleImportError}
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