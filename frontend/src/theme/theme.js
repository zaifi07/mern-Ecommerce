// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

const getTheme = (mode = 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#DB4444',
        customBlack: '#191919',
      },
      secondary: {
        main: '#DB4444',
      },
      background: {
        default: mode === 'light' ? '#ffffff' : '#121212',
        paper: mode === 'light' ? '#f5f5f5' : '#1e1e1e',
        seagreen: mode === 'light' ? '#000000' : '#2E8B57',
      },
      text: {
        primary: mode === 'light' ? '#000000' : '#ffffff',
        secondary:
          mode === 'light'
            ? 'rgba(0, 0, 0, 0.6)'
            : 'rgba(255, 255, 255, 0.7)',
      },
      divider:
        mode === 'light'
          ? 'rgba(0, 0, 0, 0.12)'
          : 'rgba(255, 255, 255, 0.12)',
      action: {
        hover:
          mode === 'light'
            ? 'rgba(0, 0, 0, 0.04)'
            : 'rgba(255, 255, 255, 0.08)',
        selected:
          mode === 'light'
            ? 'rgba(0, 0, 0, 0.08)'
            : 'rgba(255, 255, 255, 0.16)',
        disabled:
          mode === 'light'
            ? 'rgba(0, 0, 0, 0.26)'
            : 'rgba(255, 255, 255, 0.3)',
      },
    },

    typography: {
      fontFamily: 'Poppins, sans-serif',
      h1: {
        fontSize: '6rem',
        color: mode === 'light' ? '#000000' : '#ffffff',
      },
      h2: {
        fontSize: '3.75rem',
        color: mode === 'light' ? '#000000' : '#ffffff',
      },
      h3: {
        fontSize: '3rem',
        color: mode === 'light' ? '#000000' : '#ffffff',
      },
      h4: {
        fontSize: '2.125rem',
        color: mode === 'light' ? '#000000' : '#ffffff',
      },
      h5: {
        fontSize: '1.5rem',
        color: mode === 'light' ? '#000000' : '#ffffff',
      },
      h6: {
        fontSize: '1.25rem',
        color: mode === 'light' ? '#000000' : '#ffffff',
      },
      body1: {
        fontSize: '1rem',
        color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
      },
      body2: {
        fontSize: '1rem',
        color: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
      },
    },

    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#f5f5f5' : '#1e1e1e',
            color: mode === 'light' ? '#000000' : '#ffffff',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1a1a1a',
            borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: mode === 'light'
                  ? 'rgba(0, 0, 0, 0.23)'
                  : 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: mode === 'light'
                  ? 'rgba(0, 0, 0, 0.5)'
                  : 'rgba(255, 255, 255, 0.5)',
              },
            },
          },
        },
      },
    },
  });

export default getTheme;
