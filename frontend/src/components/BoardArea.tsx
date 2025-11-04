
import React from 'react';
import CombatGrid from './CombatGrid';
import ExportImportControls from './ExportImportControls';
import type { GridCell } from '../App';
import '../styles/BoardArea.css';
import '../styles/CellActionModal.css';
import SessionInfoPanel from './SessionInfoPanel';
import MonsterToolbox from './MonsterToolbox';
import type { Monster as MonsterType } from '../types/monster';

interface BoardAreaProps {
    grid: GridCell[];
    onRemoveMonster: (idx: number) => void;
    canvasMonsters?: Array<{ id: string; monster: MonsterType; x: number; y: number }>;
    onAddCanvasMonster?: (monster: MonsterType, x: number, y: number) => void;
    sessionTitle: string;
    numPlayers?: number;
    onImportGame?: (grid: GridCell[]) => void;
    onImportError?: (msg: string) => void;
}

export default function BoardArea({ grid, canvasMonsters, onAddCanvasMonster, onRemoveMonster, sessionTitle, numPlayers, onImportGame, onImportError }: BoardAreaProps) {
    // onRemoveMonster will be used once canvas interactions are implemented; keep reference to avoid linter warnings
    void onRemoveMonster;
    const [draggingMonster, setDraggingMonster] = React.useState<MonsterType | null>(null);

    function handleStartDrag(m: MonsterType) {
        setDraggingMonster(m);
    }
    return (
        <div className="boardarea-root"> 
            <ExportImportControls grid={grid} onImportGame={onImportGame} onImportError={onImportError} />
            {/* SessionInfoPanel centered at top, overlaid above the canvas */}
            <div className="sessioninfo-top">
                <SessionInfoPanel
                    sessionTitle={sessionTitle}
                    numPlayers={numPlayers}
                    grid={grid}
                    onImportGame={onImportGame}
                    onImportError={onImportError}
                />
            </div>
            {/* Monster toolbox: fixed on center-left */}
            <MonsterToolbox onStartDrag={handleStartDrag} />
            <div className="canvas-area">
                <CombatGrid 
                    canvasMonsters={canvasMonsters}
                    draggingMonster={draggingMonster}
                    onPlaceMonster={(m, nx, ny) => {
                        // place and notify parent
                        onAddCanvasMonster?.(m, nx, ny);
                        setDraggingMonster(null);
                    }}
                    onCancelDrag={() => setDraggingMonster(null)}
                />
            </div>
        </div>
    );
}