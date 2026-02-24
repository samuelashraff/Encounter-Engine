import { useEffect, useRef, useState } from 'react';
import CombatGrid from './CombatGrid';
import '../styles/BoardArea.css';
import SessionInfoPanel from './SessionInfoPanel';
import MonsterToolbox from './MonsterToolbox';
import PlayerPawn from './PlayerPawn';
import type { Monster as MonsterType } from '../types/monster';
import TrashcanBox from './TrashcanBox';

interface BoardAreaProps {
    canvasMonsters?: Array<{ id: string; monster: MonsterType; x: number; y: number }>;
    onAddCanvasMonster?: (monster: MonsterType, x: number, y: number) => void;
    sessionId?: string;
    sessionTitle: string;
    numPlayers?: number;
    onMoveCanvasMonster?: (id: string, x: number, y: number) => void;
    onDeleteCanvasMonster?: (id: string) => void;
}

const DEFAULT_COLORS = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#f97316'];

export default function BoardArea({ canvasMonsters, onAddCanvasMonster, sessionId, sessionTitle, numPlayers, onMoveCanvasMonster, onDeleteCanvasMonster }: BoardAreaProps) {

    const trashRef = useRef<HTMLDivElement>(null);
    const [trashBounds, setTrashBounds] = useState<{ x: number; y: number; width: number; height: number }>();
    const count = Math.max(0, numPlayers ?? 0);
    const pawns = Array.from({ length: Math.max(1, count) });

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
            <div className="sessioninfo-top">
                <div className="boardarea-session-pawns">
                    <div className="boardarea-pawns-heading">Player Pawns</div>
                    <div className="boardarea-pawns-list">
                        {pawns.map((_, i) => (
                            <PlayerPawn key={i} index={i} name={`Player ${i + 1}`} color={DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
                        ))}
                    </div>
                </div>
                <SessionInfoPanel
                    sessionId={sessionId}
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