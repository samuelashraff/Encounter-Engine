import React from 'react';
import MonsterDropdown from './MonsterDropdown';
import CombatGrid from './CombatGrid';
import type { Monster } from './MonsterDropdown';
import type { GridCell } from '../App';
import '../styles/BoardArea.css';

interface BoardAreaProps {
    grid: GridCell[];
    onCellClick: (idx: number, value: boolean) => void;
    onMonsterSelect: (monster: Monster) => void;
    sessionTitle: string;
    numPlayers?: number;
}

export default function BoardArea({ grid, onCellClick, onMonsterSelect, sessionTitle, numPlayers }: BoardAreaProps) {
    return (
        <div className="boardarea-root">
            {/* Left column: Session Info */}
            <div className="boardarea-left-col">
                {(sessionTitle && numPlayers) && (
                    <>
                        <h1>Session Info</h1>
                        <div className="boardarea-session-info-outer">
                            <div className="boardarea-session-info-area">
                                <span className="boardarea-session-label">Session name:&nbsp;</span>
                                <span className="boardarea-session-title">{sessionTitle}</span>
                            </div>
                            <div className="boardarea-session-info-area">
                                <span className="boardarea-session-label">Players:&nbsp;</span>
                                <span className="boardarea-session-title">{numPlayers}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {/* Right column: Dropdown above Grid */}
            <div className="boardarea-right-main-col">
                <div className="boardarea-dropdown-col">
                    <MonsterDropdown onSelect={onMonsterSelect} />
                </div>
                <div className="boardarea-grid-row">
                    <CombatGrid 
                        grid={grid}
                        onCellClick={onCellClick}
                    />
                </div>
            </div>
        </div>
    );
}