import { APP_BAR_HEIGHT } from '../constants';
import '../styles/Header.css';

interface HeaderProps {
    onLeaveSession?: () => void;
    showLeaveButton?: boolean;
}

export default function Header({ onLeaveSession, showLeaveButton }: HeaderProps) {
    return (
        <header className="header-appbar" style={{ minHeight: APP_BAR_HEIGHT }}>
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
                {/* Right: Sign in */}
                <div className="header-right">
                    <button className="header-signin-btn">
                        Sign in
                    </button>
                </div>
            </div>
        </header>
    );
}