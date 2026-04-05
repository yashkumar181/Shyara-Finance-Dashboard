import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import PageTransition from './PageTransition'; // NEW IMPORT

const Layout = () => {
  const location = useLocation(); // Hook to get current route

  return (
    <div className="flex h-screen bg-[#F4F7FA] dark:bg-[#0a0a0a] font-sans overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {/* Wrap Outlet in PageTransition and pass location.pathname as key */}
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default Layout;