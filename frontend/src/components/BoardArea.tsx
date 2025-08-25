import React from 'react';
import Box from '@mui/material/Box';
import MonsterDropdown from './MonsterDropdown';
import CombatGrid from './CombatGrid';
import type { Monster } from './MonsterDropdown';
import type { GridCell } from '../App';

interface BoardAreaProps {
    grid: GridCell[];
    onCellClick: (idx: number, value: boolean) => void;
    onMonsterSelect: (monster: Monster) => void;
}

export default function BoardArea({ grid, onCellClick, onMonsterSelect }: BoardAreaProps) {
    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="calc(100vh - 80px)"
            gap={4}
        >
            <Box minWidth={300} ml={4} pt={4} display="flex" justifyContent="flex-start">
                <MonsterDropdown onSelect={onMonsterSelect} />
            </Box>
            <CombatGrid 
                grid={grid}
                onCellClick={onCellClick}
            />
        </Box>
    );
}