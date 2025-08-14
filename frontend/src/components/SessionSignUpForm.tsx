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
            height={`calc(100vh - 80px)`}
            p={4}
        >
            <Paper elevation={3} sx={{ p: 4, minWidth: 600, display: 'flex' }}>
                {/* Join Session */}
                <Box flex={1} display="flex" flexDirection="column" alignItems="center" pr={3}>
                    <Typography variant="h5" mb={2}>
            Join a Session
                    </Typography>
                    <form onSubmit={handleJoinSession} style={{ width: '100%' }}>
                        <TextField
                            label="Session Link or Code"
                            variant="outlined"
                            fullWidth
                            value={inputSessionId}
                            onChange={e => setInputSessionId(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth>
              Join
                        </Button>
                    </form>
                </Box>
                {/* Divider */}
                <Divider orientation="vertical" flexItem sx={{ mx: 3 }} />
                {/* Create Session */}
                <Box flex={1} display="flex" flexDirection="column" alignItems="center" pl={3}>
                    <Typography variant="h5" mb={2}>
            Create a New Game
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={handleCreateSession}
                        sx={{ mt: 2, width: '100%' }}
                    >
            Create Session
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}