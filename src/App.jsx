import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Styles
import 'react-toastify/dist/ReactToastify.css';
import './styles/globals.css';
import './App.css';
import './i18n'; 

// Router
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        limit={3}
      />
    </BrowserRouter>
  );
}

export default App;