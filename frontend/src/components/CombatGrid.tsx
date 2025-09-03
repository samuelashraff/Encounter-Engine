import { useEffect, useState, useRef } from 'react';
import { APP_BAR_HEIGHT } from '../constants';
import '../styles/CombatGrid.css';
import type { GridCell } from '../App';

interface CombatGridProps {
    grid: GridCell[];
    onCellClick: (idx: number, value: boolean) => void;
    onMoveMonster: (fromIdx: number, toIdx: number) => void;
    gridSize?: number;
    padding?: number;
    onError?: (msg: string) => void;
}

export default function CombatGrid({ grid, onCellClick, onMoveMonster, gridSize = 16, padding = 32, onError }: CombatGridProps) {
    const [gridPx, setGridPx] = useState(0);

    // Hold click and Drag & Drop functionality
    const [longPressIdx, setLongPressIdx] = useState<number | null>(null);
    const [dragMode, setDragMode] = useState(false);
    const [errorIdx, setErrorIdx] = useState<number | null>(null);
    const longPressTimer = useRef<number | null>(null);

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

    // Snackbar error callback (to be wired to parent in Step 4)
    function showError(msg: string) {
        if (typeof onError === 'function') {
            onError(msg);
        }
    }

    function handleCellMouseDown(idx: number) {
        longPressTimer.current = window.setTimeout(() => {
            setLongPressIdx(idx);
            if (!grid[idx].occupied) {
                setErrorIdx(idx);
                showError('The cell is empty, nothing to move.');
                setTimeout(() => setErrorIdx(null), 1000);
            } else {
                setDragMode(true);
            }
        }, 500);
    }

    function handleCellMouseUp(idx: number) {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        // If not long press, treat as normal click
        if (!dragMode && !errorIdx) {
            onCellClick(idx, !grid[idx].occupied);
        }
        setLongPressIdx(null);
        setDragMode(false);
    }

    function handleCellMouseLeave() {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
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
                    if (errorIdx === idx) cellClass += ' combatgrid-cell-error';
                    if (dragMode && longPressIdx === idx) cellClass += ' combatgrid-cell-selected';
                    // Blur all cells except empty cells and the selected cell during drag mode
                    if (dragMode && longPressIdx !== null && idx !== longPressIdx && cell.occupied) {
                        cellClass += ' combatgrid-cell-blur';
                    }

                    function handleDropCell() {
                        if (!dragMode || longPressIdx === null) return;
                        if (idx === longPressIdx) return;
                        if (cell.occupied) {
                            showError('This cell is already occupied.');
                            setDragMode(false);
                            setLongPressIdx(null);
                            return;
                        }
                        onMoveMonster(longPressIdx, idx);
                        setDragMode(false);
                        setLongPressIdx(null);
                    }

                    return (
                        <div
                            key={idx}
                            className={cellClass}
                            onMouseDown={() => handleCellMouseDown(idx)}
                            onMouseUp={dragMode ? handleDropCell : () => handleCellMouseUp(idx)}
                            onMouseLeave={handleCellMouseLeave}
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