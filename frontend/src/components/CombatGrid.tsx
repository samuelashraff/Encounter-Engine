import { useEffect, useState } from 'react';
import { APP_BAR_HEIGHT } from '../constants';
import '../styles/CombatGrid.css';
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
        <div
            className="combatgrid-root"
            style={{ height: `calc(100vh - ${APP_BAR_HEIGHT}px)` }}
        >
            <div
                className="combatgrid-grid"
                style={{
                    width: gridPx,
                    height: gridPx,
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize}, 1fr)`
                }}
            >
                {grid.map((cell, idx) => (
                    <div
                        key={idx}
                        className={`combatgrid-cell${cell.occupied ? ' combatgrid-cell-occupied' : ''}`}
                        onClick={() => onCellClick(idx, !cell.occupied)}
                    >
                        {cell.monster?.image && (
                            <img
                                src={`https://www.dnd5eapi.co${cell.monster.image}`}
                                alt={cell.monster.name}
                                className="combatgrid-monster-img"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}