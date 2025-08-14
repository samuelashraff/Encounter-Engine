import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material/Alert';

interface SessionSnackbarProps {
    open: boolean;
    message: string;
    severity: AlertColor;
    onClose: () => void;
}

export default function SessionSnackbar({
    open,
    message,
    severity,
    onClose,
}: SessionSnackbarProps) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={2000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <MuiAlert
                onClose={onClose}
                severity={severity}
                sx={{
                    width: '100%',
                    bgcolor: severity === 'success' ? '#2e7d32' : '#bc0f0f',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 18,
                }}
                elevation={6}
                variant="filled"
            >
                {message}
            </MuiAlert>
        </Snackbar>
    );
}