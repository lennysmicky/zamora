import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

// Components
import Sidebar from './SideBar';
import Header from './Header';

// Styles
import '../styles/layout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fermer le sidebar quand on redimensionne vers desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fermer sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout-wrapper">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
      />

      {/* Main Content */}
      <div className="layout-content">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* Page Content */}
        <main className="layout-main">
          <div className="layout-main-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;