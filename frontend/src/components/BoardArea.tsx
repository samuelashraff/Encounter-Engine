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
import SessionInfoPanel from './SessionInfoPanel';

interface BoardAreaProps {
    grid: GridCell[];
    onMonsterSelect: (monster: Monster, idx: number) => void;
    onMoveMonster: (fromIdx: number, toIdx: number) => void;
    onRemoveMonster: (idx: number) => void;
    sessionTitle: string;
    numPlayers?: number;
    onImportGame?: (grid: GridCell[]) => void;
    onImportError?: (msg: string) => void;
}

export default function BoardArea({ grid, onMonsterSelect, onRemoveMonster, sessionTitle, numPlayers, onImportGame, onImportError }: BoardAreaProps) {

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
            onRemoveMonster(selectedCell); // Remove monster from cell
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
                <SessionInfoPanel
                    sessionTitle={sessionTitle}
                    numPlayers={numPlayers}
                    grid={grid}
                    onImportGame={onImportGame}
                    onImportError={onImportError}
                />
            </div>

            <Divider orientation="vertical" className="boardarea-divider" />

            {/* Right column */}
            <div className="boardarea-right-main-col">
                <div className="boardarea-grid-row">
                    <CombatGrid 
                        grid={grid}
                        onCellClick={handleCellClick}
                        onError={onImportError}
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