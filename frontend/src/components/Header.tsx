import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { APP_BAR_HEIGHT } from '../constants';

interface HeaderProps {
    onLeaveSession?: () => void;
    showLeaveButton?: boolean;
}

export default function Header({ onLeaveSession, showLeaveButton }: HeaderProps) {
    return (
        <AppBar
            position="static"
            sx={{ bgcolor: '#000000', boxShadow: 1 }}
            elevation={1}
        >
            <Toolbar
                sx={{
                    minHeight: APP_BAR_HEIGHT,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Left: Leave Button */}
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    {showLeaveButton && (
                        <Button
                            variant="contained"
                            onClick={onLeaveSession}
                            sx={{
                                bgcolor: '#bb1e1eff',
                                color: '#fff',
                                '&:hover': { bgcolor: '#7a1010' },
                                fontWeight: 600,
                                textTransform: 'none'
                            }}
                        >
                            Leave game
                        </Button>
                    )}
                </Box>
                {/* Center: Title */}
                <Box sx={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
                    <Typography
                        variant="h3"
                        component="div"
                        sx={{
                            color: '#bc0f0f',
                            fontFamily: "'UnifrakturCook', cursive",
                            letterSpacing: 2,
                            textAlign: 'center',
                        }}
                    >
                        DnD Encounter Engine
                    </Typography>
                </Box>
                {/* Right: Empty for spacing */}
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                            variant="contained"
                            sx={{
                                bgcolor: '#bb1e1eff',
                                color: '#fff',
                                '&:hover': { bgcolor: '#7a1010' },
                                fontWeight: 600,
                                textTransform: 'none'
                            }}
                        >
                            Sign in
                        </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}