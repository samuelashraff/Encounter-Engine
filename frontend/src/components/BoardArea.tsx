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
    canvasMonsters?: Array<{ id: string; monster: MonsterType; x: number; y: number }>;
    onAddCanvasMonster?: (monster: MonsterType, x: number, y: number) => void;
    sessionTitle: string;
    numPlayers?: number;
    onImportGame?: (grid: GridCell[]) => void;
    onImportError?: (msg: string) => void;
    onMoveCanvasMonster?: (id: string, x: number, y: number) => void;
}

export default function BoardArea({ canvasMonsters, onAddCanvasMonster, sessionTitle, numPlayers, onImportGame, onImportError, onMoveCanvasMonster }: BoardAreaProps) {

    return (
        <div className="boardarea-root"> 
            <ExportImportControls onImportGame={onImportGame} onImportError={onImportError} />
            <div className="sessioninfo-top">
                <SessionInfoPanel
                    sessionTitle={sessionTitle}
                    numPlayers={numPlayers}
                />
            </div>
            <MonsterToolbox />
            <div className="canvas-area">
                <CombatGrid 
                    canvasMonsters={canvasMonsters}
                    onPlaceMonster={(m, nx, ny) => {
                        onAddCanvasMonster?.(m, nx, ny);
                    }}
                    onMoveMonster={(id, nx, ny) => {
                        onMoveCanvasMonster?.(id, nx, ny);
                    }}
                />
            </div>
        </div>
    );
}