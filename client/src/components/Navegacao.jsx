import React from 'react';

export default function Navegacao({ aba, setAba }) {
  return (
    <header className="nav-header">
      {/* Título Estilizado */}
      <div className="app-branding">
        <span className="brand-icon">🚛</span>
        <h1 className="brand-name">Meu Trailer <span className="brand-suffix">Express</span></h1>
      </div>

      {/* Menu de Navegação */}
      <div className="nav-links">
         <button 
            className={`nav-btn ${aba === 'vendas' ? 'active' : ''}`} 
            onClick={() => setAba('vendas')}
          >
             PDV
        </button>
        
        <button 
          className={`nav-btn ${aba === 'pedidos' ? 'active' : ''}`} 
          onClick={() => setAba('pedidos')}
        >
          Pedidos
        </button>

        <button 
          className={`nav-btn ${aba === 'cadastro' ? 'active' : ''}`} 
          onClick={() => setAba('cadastro')}
        >
          Produtos
        </button>

        <button 
          className={`nav-btn ${aba === 'gerente' ? 'active' : ''}`} 
          onClick={() => setAba('gerente')}
        >
          Gerente
        </button>

       


        <button 
        className={`nav-btn ${aba === 'resumo' ? 'active' : ''}`} 
        onClick={() => setAba('resumo')}
        >
          Resumo
        </button>
      </div>
    </header>
  );
}