 import PlayerPawn from './PlayerPawn';

interface SessionInfoPanelProps {
  sessionId?: string;
  sessionTitle: string;
  numPlayers?: number;
}

const DEFAULT_COLORS = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#f97316'];

export default function SessionInfoPanel({ sessionId, sessionTitle, numPlayers }: SessionInfoPanelProps) {

  if (!sessionTitle) return null;

  const count = Math.max(0, numPlayers ?? 0);
  const pawns = Array.from({ length: Math.max(1, count) });

  return (
    <div className="boardarea-session-info-outer" role="region" aria-label="Session information">
      <div className="boardarea-session-pawns">
        <div className="boardarea-pawns-heading">Player Pawns</div>
        <div className="boardarea-pawns-list">
          {pawns.map((_, i) => (
            <PlayerPawn key={i} index={i} name={`Player ${i + 1}`} color={DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
          ))}
        </div>
      </div>
      <div className="boardarea-session-info-area">
        <span className="boardarea-session-label">Session ID:</span>
        <span className="boardarea-session-title">{sessionId ?? 'N/A'}</span>
      </div>
      <div className="boardarea-session-info-area">
        <span className="boardarea-session-label">Session name:</span>
        <span className="boardarea-session-title">{sessionTitle}</span>
      </div>
      <div className="boardarea-session-info-area">
        <span className="boardarea-session-label">Players:</span>
        <span className="boardarea-session-title">{count}</span>
      </div>
    </div>
  );
}
