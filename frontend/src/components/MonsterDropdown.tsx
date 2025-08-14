import { useState } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Avatar } from '@mui/material';

export interface Monster {
    index: string;
    name: string;
    image?: string;
}

interface MonsterDropdownProps {
    onSelect: (monster: Monster) => void;
}

export default function MonsterDropdown({ onSelect }: MonsterDropdownProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Monster[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMonsters = async () => {
        setLoading(true);
        const resp = await fetch('http://localhost:8000/monsters');
        const data = await resp.json();
        setOptions(data);
        setLoading(false);
    };

    return (
        <Autocomplete
            open={open}
            onOpen={() => {
                setOpen(true);
                if (options.length === 0) fetchMonsters();
            }}
            onClose={() => setOpen(false)}
            options={options}
            loading={loading}
            getOptionLabel={(option) => option.name}
            onChange={(_, value) => value && onSelect(value)}
            sx={{ width: 300 }}
            ListboxProps={{
                style: {
                    maxHeight: 300,
                    overflow: 'auto',
                },
            }}
            renderOption={(props, option) => (
                <Box component="li" {...props} display="flex" alignItems="center">
                    {option.image && (
                        <Avatar src={`https://www.dnd5eapi.co${option.image}`} sx={{ width: 32, height: 32, mr: 1 }} />
                    )}
                    {option.name}
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Add Monster"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
}