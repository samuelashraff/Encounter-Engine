import React from 'react';
import { exportGame, importGame } from '../utils/helpers';
import type { GridCell } from '../App';

interface Props {
  grid: GridCell[];
  onImportGame?: (grid: GridCell[]) => void;
  onImportError?: (msg: string) => void;
}

export default function ExportImportControls({ grid, onImportGame, onImportError }: Props) {
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  function handleExport() {
    exportGame(grid);
  }

  function handleImportClick() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    importGame(
      file,
      (importedGrid) => {
        onImportGame?.(importedGrid);
      },
      (msg) => {
        onImportError?.(msg);
      }
    );
    e.currentTarget.value = '';
  }

  return (
    <div className="export-import-controls" role="region" aria-label="Export and import controls">
      <button className="boardarea-export-btn" onClick={handleExport} aria-label="Export game">Export</button>
      <button className="boardarea-export-btn" onClick={handleImportClick} aria-label="Import game">Import</button>
      <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
    </div>
  );
}
