import React from 'react';
import { exportGame, importGame } from '../utils/helpers';

interface SessionInfoPanelProps {
  sessionTitle: string;
  numPlayers?: number;
  grid: any[];
  onImportGame?: (grid: any[]) => void;
  onImportError?: (msg: string) => void;
}

export default function SessionInfoPanel({ sessionTitle, numPlayers, grid, onImportGame, onImportError }: SessionInfoPanelProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    importGame(
      file,
      (importedGrid) => {
        if (onImportGame) {
          onImportGame(importedGrid);
        }
      },
      (msg) => {
        if (onImportError) {
          onImportError(msg);
        } else {
          alert(msg);
        }
      }
    );
    e.target.value = "";
  }

  if (!(sessionTitle && numPlayers)) return null;

  return (
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
      {/* Export/Import Game Buttons side-by-side */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', marginTop: '1.2rem', marginBottom: '0.5rem' }}>
        <button
          className="boardarea-export-btn"
          onClick={() => exportGame(grid)}
        >
          Export Game
        </button>
        <button
          className="boardarea-export-btn"
          onClick={handleImportClick}
        >
          Import Game
        </button>
      </div>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}
