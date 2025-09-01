import React from 'react';
import { useState } from 'react';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import MonsterDropdown from './MonsterDropdown';
import CombatGrid from './CombatGrid';
import type { Monster } from './MonsterDropdown';
import type { GridCell } from '../App';
import { Divider } from '@mui/material';
import '../styles/BoardArea.css';
import '../styles/CellActionModal.css';

interface BoardAreaProps {
    grid: GridCell[];
    onCellClick: (idx: number, value: boolean) => void;
    onMonsterSelect: (monster: Monster, idx: number) => void;
    sessionTitle: string;
    numPlayers?: number;
}

export default function BoardArea({ grid, onCellClick, onMonsterSelect, sessionTitle, numPlayers }: BoardAreaProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState<number | null>(null);

    // Helper to check if cell is empty
    function cellHasMonster(idx: number | null) {
        if (idx === null) return false;
        return grid[idx] && grid[idx].monster;
    }

    function handleCellClick(idx: number) {
        setSelectedCell(idx);
        setModalOpen(true);
    }

    function handleRemove() {
        if (selectedCell !== null) {
            onCellClick(selectedCell, false); // Remove monster from cell
        }
        setModalOpen(false);
    }

    function handleMonsterSelect(monster: Monster) {
        if (selectedCell !== null) {
            onMonsterSelect(monster, selectedCell); // Place monster directly in cell
        }
        setModalOpen(false);
    }

    return (
        <div className="boardarea-root">
            {/* Left column: Session Info */}
            <div className="boardarea-left-col">
                {(sessionTitle && numPlayers) && (
                    <>
                        <h1 className="boardarea-session-main-title">Session Info</h1>
                        <div className="boardarea-session-info-outer">
                            <div className="boardarea-session-info-area">
                                <span className="boardarea-session-label">Session name: </span>
                                <span className="boardarea-session-title">{sessionTitle}</span>
                            </div>
                            <div className="boardarea-session-info-area">
                                <span className="boardarea-session-label">Players: </span>
                                <span className="boardarea-session-title">{numPlayers}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Divider remains if you want visual separation */}
            <Divider orientation="vertical" flexItem sx={{ mx: 3, borderColor: '#fff', mt: "2.5rem", mb: "5.5rem" }}/>

            {/* Right column: Grid only */}
            <div className="boardarea-right-main-col">
                <div className="boardarea-grid-row">
                    <CombatGrid 
                        grid={grid}
                        onCellClick={handleCellClick}
                    />
                </div>
            </div>
            {/* Modal for cell actions */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                className="cellaction-modal"
            >
                <div className="cellaction-modal-content">
                    {cellHasMonster(selectedCell) && (
                        <Button onClick={handleRemove} className="cellaction-remove-btn">Remove Monster</Button>
                    )}
                    <MonsterDropdown onSelect={handleMonsterSelect} />
                </div>
            </Modal>
        </div>
    );
}