import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import PageTransition from './PageTransition';
import CommandMenu from './CommandMenu';

const Layout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F4F7FA] dark:bg-[#0a0a0a] font-sans overflow-hidden transition-colors duration-300">
      
      <CommandMenu /> 

      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />
        
        <main className="flex-1 overflow-auto pb-16 md:pb-0 relative">
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