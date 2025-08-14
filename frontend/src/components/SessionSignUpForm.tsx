import React from 'react';
import { Box, Divider, Typography, Button, TextField, Paper } from '@mui/material';

interface SessionSignUpFormProps {
    inputSessionId: string;
    setInputSessionId: (id: string) => void;
    handleJoinSession: (e: React.FormEvent) => void;
    handleCreateSession: () => void;
}

export default function SessionSignUpForm({
    inputSessionId,
    setInputSessionId,
    handleJoinSession,
    handleCreateSession,
}: SessionSignUpFormProps) {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
        >
            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    minWidth: 600,
                    display: 'flex',
                    bgcolor: '#272020ff',
                    color: '#fff',
                }}
            >
                {/* Join Session */}
                <Box flex={1} display="flex" flexDirection="column" alignItems="center" pr={3}>
                    <Typography variant="h5" mb={2} color="#fff">
                        Join a Session
                    </Typography>
                    <form onSubmit={handleJoinSession} style={{ width: '100%' }}>
                        <TextField
                            label="Session Link or Code"
                            variant="outlined"
                            fullWidth
                            value={inputSessionId}
                            onChange={e => setInputSessionId(e.target.value)}
                            sx={{
                                mb: 2,
                                input: { color: '#fff' },
                                label: { color: '#fff' },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#fff' },
                                    '&:hover fieldset': { borderColor: '#fff' },
                                    '&.Mui-focused fieldset': { borderColor: '#fff' },
                                },
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                bgcolor: '#bb1e1eff',
                                color: '#fff',
                                '&:hover': { bgcolor: '#7a1010' },
                            }}
                        >
                            Join
                        </Button>
                    </form>
                </Box>
                {/* Divider */}
                <Divider orientation="vertical" flexItem sx={{ mx: 3, borderColor: '#fff' }} />
                {/* Create Session */}
                <Box flex={1} display="flex" flexDirection="column" alignItems="center" pl={3}>
                    <Typography variant="h5" mb={2} color="#fff">
                        Create a New Game
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleCreateSession}
                        sx={{
                            mt: 2,
                            width: '100%',
                            bgcolor: '#bb1e1eff',
                            color: '#fff',
                            '&:hover': { bgcolor: '#7a1010' },
                        }}
                    >
                        Create Session
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}