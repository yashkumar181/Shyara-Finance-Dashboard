import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#F4F7FA] dark:bg-[#0a0a0a] font-sans overflow-hidden transition-colors duration-300">
      
      {/* SIDEBAR (Hidden on Mobile) */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header />
        
        {/* Added pb-16 to ensure content isn't hidden behind the mobile bottom nav */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* BOTTOM NAV (Hidden on Desktop) */}
      <MobileNav />

    </div>
  );
};

export default Layout;