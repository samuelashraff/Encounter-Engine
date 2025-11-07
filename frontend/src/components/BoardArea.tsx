import { useEffect, useRef, useState } from 'react';
import CombatGrid from './CombatGrid';
import ExportImportControls from './ExportImportControls';
import type { GridCell } from '../App';
import '../styles/BoardArea.css';
import SessionInfoPanel from './SessionInfoPanel';
import MonsterToolbox from './MonsterToolbox';
import type { Monster as MonsterType } from '../types/monster';
import TrashcanBox from './TrashcanBox';

interface BoardAreaProps {
    canvasMonsters?: Array<{ id: string; monster: MonsterType; x: number; y: number }>;
    onAddCanvasMonster?: (monster: MonsterType, x: number, y: number) => void;
    sessionTitle: string;
    numPlayers?: number;
    onImportGame?: (grid: GridCell[]) => void;
    onImportError?: (msg: string) => void;
    onMoveCanvasMonster?: (id: string, x: number, y: number) => void;
    onDeleteCanvasMonster?: (id: string) => void;
}

export default function BoardArea({ canvasMonsters, onAddCanvasMonster, sessionTitle, numPlayers, onImportGame, onImportError, onMoveCanvasMonster, onDeleteCanvasMonster }: BoardAreaProps) {

    const trashRef = useRef<HTMLDivElement>(null);
    const [trashBounds, setTrashBounds] = useState<{ x: number; y: number; width: number; height: number }>();

    useEffect(() => {
        if (!trashRef.current) return;

        const rect = trashRef.current.getBoundingClientRect();
        setTrashBounds({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });

        // Update bounds on resize
        const handleResize = () => {
            const rect = trashRef.current?.getBoundingClientRect();
            if (rect) setTrashBounds({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="boardarea-root"> 
            <ExportImportControls onImportGame={onImportGame} onImportError={onImportError} />
            <div className="sessioninfo-top">
                <SessionInfoPanel
                    sessionTitle={sessionTitle}
                    numPlayers={numPlayers}
                />
                <TrashcanBox ref={trashRef}/>
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
                    onDeleteMonster={onDeleteCanvasMonster}
                    trashBounds={trashBounds}
                />
            </div>
        </div>
    );
}