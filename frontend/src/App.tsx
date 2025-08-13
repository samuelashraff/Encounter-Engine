import React, { useState } from 'react';
import Header from './components/Header';
import CombatGrid from './components/CombatGrid';
import { Box } from '@mui/material';
import SessionSignUpForm from './components/SessionSignUpForm';

function App() {
  const [sessionJoined, setSessionJoined] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [inputSessionId, setInputSessionId] = useState('');

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSessionId.trim()) {
      setSessionId(inputSessionId.trim());
      setSessionJoined(true);
    }
  };

  const handleCreateSession = () => {
    const newSessionId = Math.random().toString(36).substring(2, 10);
    setSessionId(newSessionId);
    setSessionJoined(true);
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
        <CombatGrid />
      )}
    </Box>
  );
}

export default App;