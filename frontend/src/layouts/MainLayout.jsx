import React from 'react';

const MainLayout = ({ children }) => {
  return (
    <div 
      style={{ 
        backgroundColor: '#050814', 
        minHeight: '100vh', 
        width: '100%', 
        margin: 0, 
        padding: '24px', 
        boxSizing: 'border-box',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Aqui renderiza o conteúdo da página de forma fluida */}
      {children}
    </div>
  );
};

export default MainLayout;