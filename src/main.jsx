// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import NotificationProvider from './Providers/NotificationProvider';
import './index.css';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </React.StrictMode>
);