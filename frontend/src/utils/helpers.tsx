/**
 * Moves a monster from one cell to another in the grid.
 * Updates the grid array and returns the new grid.
 */
export function moveMonster(grid: GridCell[], fromIdx: number, toIdx: number): GridCell[] {
    const next = [...grid];
    const monster = next[fromIdx].monster;
    next[fromIdx] = { occupied: false };
    next[toIdx] = { occupied: true, monster };
    return next;
}


/**
 * Handles drag-and-drop logic for moving a monster between grid cells.
 * - Only allows dropping on empty cells.
 * - If dropped on occupied cell, reverts monster to original cell and shows error.
 *
 * @param params Object containing dragMode, longPressIdx, idx, cell, onCellClick, showError, setDragMode, setLongPressIdx
 */
export function handleDrop({ dragMode, longPressIdx, idx, cell, onCellClick, showError, setDragMode, setLongPressIdx }: {
    dragMode: boolean;
    longPressIdx: number | null;
    idx: number;
    cell: GridCell;
    onCellClick: (idx: number, value: boolean) => void;
    showError: (msg: string) => void;
    setDragMode: (active: boolean) => void;
    setLongPressIdx: (idx: number | null) => void;
}) {
    if (!dragMode || longPressIdx === null) return;
    if (idx === longPressIdx) return; // Don't drop on original cell
    if (cell.occupied) {
        showError('This cell is already occupied.');
        setDragMode(false);
        setLongPressIdx(null);
        return;
    }
    // Move monster to new cell
    onCellClick(longPressIdx, false); // Remove from original
    onCellClick(idx, true); // Place in new cell
    setDragMode(false);
    setLongPressIdx(null);
}


// Helper function to import grid/session from JSON file
export function importGame(
    file: File,
    onImport: (grid: GridCell[]) => void,
    onError?: (msg: string) => void
) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target?.result as string);
            if (data.grid && Array.isArray(data.grid)) {
                onImport(data.grid);
            } else {
                onError?.("Invalid file format: missing or malformed grid.");
            }
        } catch (err) {
            onError?.("Could not parse file. Make sure it's a valid exported game JSON.");
        }
    };
    reader.readAsText(file);
}

import type { GridCell } from "../App";

// Helper function to export grid/session as JSON file
export function exportGame(grid: GridCell[]) {
    const dataToExport = { grid };
    const json = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "encounter-grid.json";
    a.click();
    URL.revokeObjectURL(url);
}