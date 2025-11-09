import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import '../styles/SessionForm.css';

interface CreateSessionFormProps {
  onCreate: (sessionTitle: string, numPlayers: number) => void;
}


export default function CreateSessionForm({ onCreate }: CreateSessionFormProps) {
  const [sessionTitle, setSessionTitle] = useState('');
  const [numPlayers, setNumPlayers] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(sessionTitle, numPlayers);
  };

  return (
    <div className="sessionform-root sessionform-root-create">
      <span className="sessionform-title">Create a New Game</span>
      <form className="sessionform-form" onSubmit={handleSubmit}>
        <TextField
          label="Session Title"
          variant="outlined"
          fullWidth
          required
          value={sessionTitle}
          onChange={e => setSessionTitle(e.target.value)}
          slotProps={{
            input: { style: { color: '#fff' } },
            inputLabel: { style: { color: '#fff' } }
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#bb1e1eff' },
              '&:hover fieldset': { borderColor: '#bb1e1eff' },
              '&.Mui-focused fieldset': { borderColor: '#bb1e1eff' },
            },
          }}
        />
        <TextField
          label="Number of Players"
          type="number"
          variant="outlined"
          fullWidth
          required
          value={numPlayers}
          onChange={e => setNumPlayers(Number(e.target.value))}
          slotProps={{
            input: {
                inputProps: { min: 1, max: 20 },
                style: { color: '#fff' }
            },
            inputLabel: { style: { color: '#fff' } }
            }
        }
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#bb1e1eff' },
              '&:hover fieldset': { borderColor: '#bb1e1eff' },
              '&.Mui-focused fieldset': { borderColor: '#bb1e1efff' },
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          className="sessionform-join-btn sessionform-create-btn"
        >
          Create Session
        </Button>
      </form>
    </div>
  );
}