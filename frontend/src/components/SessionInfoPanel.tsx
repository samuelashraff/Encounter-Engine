 

interface SessionInfoPanelProps {
  sessionId?: string;
  sessionTitle: string;
  numPlayers?: number;
}

export default function SessionInfoPanel({ sessionId, sessionTitle, numPlayers }: SessionInfoPanelProps) {

  if (!sessionTitle) return null;

  return (
    <div className="boardarea-session-info-outer" role="region" aria-label="Session information">
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
        <span className="boardarea-session-title">{numPlayers ?? 0}</span>
      </div>
    </div>
  );
}
