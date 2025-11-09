import React from 'react';
import { TextField, Button } from '@mui/material';
import '../styles/SessionForm.css';

interface JoinSessionFormProps {
  inputSessionId: string;
  setInputSessionId: (id: string) => void;
  handleJoinSession: (e: React.FormEvent) => void;
}


export default function JoinSessionForm({
  inputSessionId,
  setInputSessionId,
  handleJoinSession,
}: JoinSessionFormProps) {
  return (
    <div className="sessionform-root">
      <span className="sessionform-title">Join a Session</span>
      <form className="sessionform-form" onSubmit={handleJoinSession}>
        <TextField
          label="Session Link or Code"
          variant="outlined"
          fullWidth
          value={inputSessionId}
          onChange={e => setInputSessionId(e.target.value)}
          InputLabelProps={{ style: { color: '#fff' } }}
          InputProps={{ style: { color: '#fff' } }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#bb1e1eff' },
              '&:hover fieldset': { borderColor: '#bb1e1eff' },
              '&.Mui-focused fieldset': { borderColor: '#bb1e1eff' },
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          className="sessionform-join-btn"
        >
          Join
        </Button>
      </form>
    </div>
  );
}