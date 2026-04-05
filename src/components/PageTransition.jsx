import React from 'react';

const PageTransition = ({ children }) => {
  return (
    <div className="animate-fade-slide-up w-full h-full">
      {children}
    </div>
  );
};

export default PageTransition;