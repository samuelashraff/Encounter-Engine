 

interface SessionInfoPanelProps {
  sessionTitle: string;
  numPlayers?: number;
}

export default function SessionInfoPanel({ sessionTitle, numPlayers }: SessionInfoPanelProps) {

  if (!(sessionTitle && numPlayers)) return null;

  return (
    <div className="boardarea-session-info-outer" role="region" aria-label="Session information">
      <div className="boardarea-session-info-area">
        <span className="boardarea-session-label">Session name:</span>
        <span className="boardarea-session-title">{sessionTitle}</span>
      </div>
      <div className="boardarea-session-info-area">
        <span className="boardarea-session-label">Players:</span>
        <span className="boardarea-session-title">{numPlayers}</span>
      </div>
    </div>
  );
}
