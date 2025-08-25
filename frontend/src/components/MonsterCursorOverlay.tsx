import Box from '@mui/material/Box';
import type { Monster } from './MonsterDropdown';

interface MonsterCursorOverlayProps {
    placingMonster: boolean;
    monsterToPlace: Monster;
    cursorPos: { x: number; y: number };
}

export default function MonsterCursorOverlay({
    placingMonster,
    monsterToPlace,
    cursorPos,
}: MonsterCursorOverlayProps) {
    // No need for an internal conditional, since parent handles it
    return (
        <Box
            sx={{
                position: 'fixed',
                left: cursorPos.x + 10,
                top: cursorPos.y + 10,
                pointerEvents: 'none',
                zIndex: 2000,
            }}
        >
            {monsterToPlace.image ? (
                <img
                    src={`https://www.dnd5eapi.co${monsterToPlace.image}`}
                    alt={monsterToPlace.name}
                    width={52}
                    height={52}
                    style={{ borderRadius: 8, border: '2px solid #bb1e1eff', background: '#fff' }}
                />
            ) : (
                <Box
                    sx={{
                        color: '#fff',
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        fontWeight: 600,
                    }}
                >
                    {monsterToPlace.name}
                </Box>
            )}
        </Box>
    );
}