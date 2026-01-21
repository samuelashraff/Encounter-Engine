import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Modal, Backdrop } from '@mui/material';
import Header from '../components/Header';
import SessionSignUpForm from '../components/SessionSignUpForm';
import { useSocket } from '../context/SocketContext';
import type { AlertColor } from '@mui/material/Alert';
import SessionSnackbar from '../components/SessionSnackbar';

function HomePage() {
    const { socket } = useSocket();
    const navigate = useNavigate();

    const [inputSessionId, setInputSessionId] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');

    function updateSnackbar(message: string, severity: AlertColor, snackBarOpen: boolean): void {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(snackBarOpen);
    }

    function handleJoinSession(e: React.FormEvent) {
        e.preventDefault();
        if (socket && inputSessionId.trim()) {
            socket.emit('join_session', { session_id: inputSessionId.trim() });
            
            // Listen for session_joined event to navigate
            const onSessionJoined = () => {
                socket.off('session_joined', onSessionJoined);
                const sessionId = inputSessionId.trim();
                navigate(`/session/${sessionId}`);
            };
            socket.once('session_joined', onSessionJoined);
        }
    }

    function handleCreateSession(title: string, numPlayers: number) {
        if (socket) {
            // Listen for session_created event to navigate
            const onSessionCreated = (data: any) => {
                socket.off('session_created', onSessionCreated);
                navigate(`/session/${data.session_id}`);
            };
            socket.once('session_created', onSessionCreated);
            socket.emit('create_session', { title, num_players: numPlayers });
        }
    }

    return (
        <div className='app-root'>
            <Header showLeaveButton={false} />
            <Modal
                open={true}
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

export default HomePage;
