import '../styles/Header.css';

interface HeaderProps {
    onLeaveSession?: () => void;
    showLeaveButton?: boolean;
}

export default function Header({ onLeaveSession, showLeaveButton }: HeaderProps) {
    return (
        <header className="header-appbar">
            <div className="header-toolbar">
                {/* Left: Leave Button */}
                <div className="header-left">
                    {showLeaveButton && (
                        <button className="header-leave-btn" onClick={onLeaveSession}>
                            Leave game
                        </button>
                    )}
                </div>
                {/* Center: Title */}
                <div className="header-center">
                    <span className="header-title">DnD Encounter Engine</span>
                </div>
                {/* Right: Empty section to maintain layout */}
                <div className="header-right">
                </div>
            </div>
        </header>
    );
}