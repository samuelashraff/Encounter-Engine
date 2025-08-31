import React, { useState } from 'react';
import { Box, Divider, Typography, Button, TextField, Paper } from '@mui/material';
import CreateSessionForm from './CreateSessionForm';
import JoinSessionForm from './JoinSessionForm';

interface SessionSignUpFormProps {
    inputSessionId: string;
    setInputSessionId: (id: string) => void;
    handleJoinSession: (e: React.FormEvent) => void;
    handleCreateSession: (sessionTitle: string, numPlayers: number) => void;
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
                <JoinSessionForm
                    inputSessionId={inputSessionId}
                    setInputSessionId={setInputSessionId}
                    handleJoinSession={handleJoinSession}
                />
                {/* Divider */}
                <Divider orientation="vertical" flexItem sx={{ mx: 3, borderColor: '#fff' }} />
                {/* Create Session */}
                <CreateSessionForm onCreate={handleCreateSession} />
                
            </Paper>
        </Box>
    );
}