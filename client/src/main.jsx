import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import './i18n/index.js';
import './index.css';
import App from './App.jsx';
import { applyTheme } from './store/uiStore.js';

// Применяем тему ДО первого рендера — без белой вспышки
try {
  const saved = JSON.parse(localStorage.getItem('chronos_ui') || '{}');
  applyTheme(saved.theme || 'dark');
} catch {
  applyTheme('dark');
}

// В Electron приложение загружается по file:// — нужен HashRouter
const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
