import { useRef, useState } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Avatar } from '@mui/material';
import { DND_API_URL, BACKEND_URL } from '../constants';

export interface Monster {
    index: string;
    name: string;
    image?: string;
}

interface MonsterDropdownProps {
    onSelect: (monster: Monster) => void;
}

// Styles for the dropdown
const monsterDropdownSx = {
    width: 300,
    color: '#fff',
    bgcolor: '#000000de',
    borderRadius: 2,
    '& .MuiInputBase-root': {
        color: '#fff',
        bgcolor: '#000000de',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#fff',
    },
    '& .MuiInputLabel-root': {
        color: '#fff',
    },
    '& .MuiAutocomplete-popupIndicator': {
        color: '#fff',
    },
    '& .MuiAutocomplete-clearIndicator': {
        color: '#fff',
    },
};

export default function MonsterDropdown({ onSelect }: MonsterDropdownProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Monster[]>([]);
    const [loading, setLoading] = useState(false);
    const cachedMonsters = useRef<Monster[] | null>(null);

    const fetchMonsters = async () => {
        if (cachedMonsters.current) {
            setOptions(cachedMonsters.current);
            return;
        }
        setLoading(true);
        const resp = await fetch(`${BACKEND_URL}/monsters`);
        const data = await resp.json();
        setOptions(data);
        cachedMonsters.current = data;
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
            sx={monsterDropdownSx}
            renderOption={(props, option) => {
                const {key, ... rest} = props;
                return (
                    <Box component="li" key={key} {...rest} display="flex" alignItems="center" sx={{cursor: 'pointer'}}>
                        {option.image && (
                            <Avatar src={`${DND_API_URL}${option.image}`} sx={{ width: 32, height: 32, mr: 1 }} />
                        )}
                        {option.name}
                    </Box>
                )
            }}
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