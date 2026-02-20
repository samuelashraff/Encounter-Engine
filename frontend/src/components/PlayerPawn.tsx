interface PlayerPawnProps {
  index: number;
  name?: string;
  color?: string;
}

export default function PlayerPawn({ index, name, color }: PlayerPawnProps) {

    // TODO: Initials (or name) should be set from the users name when authentication/login stuff is supported
    const initials = (name || `P${index + 1}`).split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();

    return (
    <div className="player-pawn" title={name ?? `Player ${index + 1}`}>
        <div className="player-pawn-circle" style={{ background: color ?? '#6b7280' }}>
        <span className="player-pawn-initials">{initials}</span>
        </div>
    </div>
    );
}
