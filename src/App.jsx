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

      {/* Toast Notifications - Configuration optimisée */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
        theme="light"
        limit={5}
        style={{
          top: '80px',
          right: '1rem',
          zIndex: 9999,
        }}
      />
    </BrowserRouter>
  );
}

export default App;