import { AppBar, Toolbar, Typography } from '@mui/material';

const appBarHeight = 80;

export default function Header() {
  return (
    <AppBar
      position="static"
      sx={{ alignItems: 'center', bgcolor: '#fff', boxShadow: 1 }}
      elevation={1}
    >
      <Toolbar sx={{ justifyContent: 'center', minHeight: appBarHeight }}>
        <Typography 
            variant="h3" 
            component="div" 
            sx={{
                 color: '#bc0f0f' ,
                 fontFamily: "'UnifrakturCook', cursive"
            }}
        >
          Encounter Engine
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export { appBarHeight };