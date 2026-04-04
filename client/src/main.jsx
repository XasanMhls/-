import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
