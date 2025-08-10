// index.js
import React, { useMemo, useState, createContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme/theme';

// 🟩 Updated Context provides mode + setter
export const ColorModeContext = createContext({
  mode: 'light',
  setThemeMode: () => { },
});

const Root = () => {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(() => ({
    mode,
    setThemeMode: (newMode) => {
      if (newMode === 'light' || newMode === 'dark') {
        setMode(newMode);
      }
    },
  }), [mode]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <React.StrictMode>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Provider store={store}>
            <App />
            <ToastContainer position='top-right' autoClose={1500} closeOnClick />
          </Provider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
