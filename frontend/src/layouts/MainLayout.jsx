import React from 'react';

// 1. Recebemos 'children' como propriedade
const MainLayout = ({ children, paginaAtiva }) => {
  return (
    // Removi o bg-gray-100 do Tailwind e coloquei a cor escura do seu Dashboard
    <div className="flex h-screen" style={{ backgroundColor: '#050814', minHeight: '100vh' }}>
      
      {/* Sidebar ou Header poderão ser adicionados aqui futuramente */}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          
          {/* 2. A MÁGICA ACONTECE AQUI: Renderiza tudo que está DENTRO do <MainLayout> */}
          {children} 
          
        </main>
      </div>
    </div>
  );
};

export default MainLayout;