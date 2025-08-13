import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { appBarHeight } from './Header';
import '../index.css';

interface CombatGridProps {
  gridSize?: number;
  padding?: number;
}

export default function CombatGrid({ gridSize = 16, padding = 32 }: CombatGridProps) {
  const [gridPx, setGridPx] = useState(0);
  const [activeCells, setActiveCells] = useState<boolean[]>(() =>
    Array(gridSize * gridSize).fill(false)
  );

  useEffect(() => {
    function handleResize() {
      const availableWidth = window.innerWidth - padding * 2;
      const availableHeight = window.innerHeight - appBarHeight - padding * 2;
      setGridPx(Math.min(availableWidth, availableHeight));
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [padding]);

  const handleCellClick = (idx: number) => {
    setActiveCells((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  return (
    <Box
      flex={1}
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height={`calc(100vh - ${appBarHeight}px)`}
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
        {Array.from({ length: gridSize * gridSize }).map((_, idx) => (
          <Box
            key={idx}
            width="100%"
            height="100%"
            bgcolor={activeCells[idx] ? "#bc0f0f" : "#fff"}
            border="1px solid #bbb"
            boxSizing="border-box"
            sx={{ aspectRatio: '1 / 1' }}
            onClick={() => handleCellClick(idx)}
          />
        ))}
      </Box>
    </Box>
  );
}