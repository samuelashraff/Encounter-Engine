import React from 'react';
import { useEffect, useCallback } from 'react';
import '../styles/CombatGrid.css';
import type { Monster as MonsterType } from '../types/monster';

interface CanvasMonster {
    id: string;
    monster: MonsterType;
    x: number; // normalized 0..1
    y: number; // normalized 0..1
}

interface CombatGridProps {
    canvasMonsters?: CanvasMonster[];
    draggingMonster?: MonsterType | null;
    onPlaceMonster?: (monster: MonsterType, nx: number, ny: number) => void;
    onCancelDrag?: () => void;
}

export default function CombatGrid({ canvasMonsters = [], draggingMonster = null, onPlaceMonster, onCancelDrag }: CombatGridProps) {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const pointerRef = React.useRef({ x: 0, y: 0 });
    const imageCache = React.useRef<Map<string, HTMLImageElement>>(new Map());

    void canvasMonsters; // to avoid linter warning if unused

    // make canvas fill available space (account for app bar)
    return (
        <div className="combatgrid-root" ref={containerRef}>
            <canvas ref={canvasRef} />
        </div>
    );
}