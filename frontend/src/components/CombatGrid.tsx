import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { APP_BAR_HEIGHT } from '../constants';
import '../index.css';
import type { GridCell } from '../App';

interface CombatGridProps {
  grid: GridCell[];
  onCellClick: (idx: number, value: boolean) => void;
  gridSize?: number;
  padding?: number;
}

export default function CombatGrid({ grid, onCellClick, gridSize = 16, padding = 32 }: CombatGridProps) {
    const [gridPx, setGridPx] = useState(0);

    useEffect(() => {
        function handleResize() {
            const availableWidth = window.innerWidth - padding * 2;
            const availableHeight = window.innerHeight - APP_BAR_HEIGHT - padding * 2;
            setGridPx(Math.min(availableWidth, availableHeight));
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [padding]);

    return (
        <Box
            flex={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height={`calc(100vh - ${APP_BAR_HEIGHT}px)`}
            p={4}
            boxSizing="border-box"
        >
            <Box
                display="grid"
                width={gridPx}
                height={gridPx}
                gridTemplateColumns={`repeat(${gridSize}, 1fr)`}
                gridTemplateRows={`repeat(${gridSize}, 1fr)`}
                bgcolor="#ccc"
                gap={0.5}
            >
                {grid.map((cell, idx) => (
                    <Box
                        key={idx}
                        width="100%"
                        height="100%"
                        bgcolor={"#fff"}
                        border="1px solid #bbb"
                        boxSizing="border-box"
                        sx={{ aspectRatio: '1 / 1', cursor: 'pointer', position: 'relative' }}
                        onClick={() => onCellClick(idx, !cell.occupied)}
                    >
                        {cell.monster?.image && (
                            <img
                                src={`https://www.dnd5eapi.co${cell.monster.image}`}
                                alt={cell.monster.name}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '100%',
                                    height: '100%',
                                    transform: 'translate(-50%, -50%)',
                                    pointerEvents: 'none',
                                }}
                            />
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}