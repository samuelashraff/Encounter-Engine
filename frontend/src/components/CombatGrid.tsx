import { useEffect, useState } from 'react';
import { APP_BAR_HEIGHT } from '../constants';
import '../styles/CombatGrid.css';
import type { GridCell } from '../App';

interface CombatGridProps {
    grid: GridCell[];
    onCellClick: (idx: number, value: boolean) => void;
    gridSize?: number;
    padding?: number;
    onError?: (msg: string) => void;
}

export default function CombatGrid({ grid, onCellClick, gridSize = 16, padding = 32 }: CombatGridProps) {
    const [gridPx, setGridPx] = useState(0);

    useEffect(() => {
        function handleResize() {
            // Get the container's dimensions
            const container = document.querySelector('.boardarea-right-main-col');
            if (!container) return;
            
            const containerWidth = container.clientWidth - padding * 2;
            const containerHeight = container.clientHeight - padding * 2;
            
            // Use the smaller dimension to maintain square grid
            setGridPx(Math.min(containerWidth, containerHeight));
        }
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [padding]);

    // onError is provided by parent if desired; keep prop for future use

    // Simple click handler: toggle into cell click flow (parent decides how to handle)
    function handleCellClick(idx: number) {
        onCellClick(idx, !grid[idx].occupied);
    }

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
                {grid.map((cell, idx) => {
                    let cellClass = `combatgrid-cell`;
                    if (cell.occupied) cellClass += ' combatgrid-cell-occupied';

                    return (
                        <div
                            key={idx}
                            className={cellClass}
                            onClick={() => handleCellClick(idx)}
                        >
                            {cell.monster?.image && (
                                <img
                                    src={`https://www.dnd5eapi.co${cell.monster.image}`}
                                    alt={cell.monster.name}
                                    className="combatgrid-monster-img"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}