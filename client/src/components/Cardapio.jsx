import React, { useState } from 'react';

export default function Cardapio({ 
  produtos = [], 
  categorias = [], 
  adicionarAoCarrinho, 
  removerUmDoCarrinho, 
  carrinho = [] 
}) {
  const [categoriaAtivaId, setCategoriaAtivaId] = useState(null);

  // 1. BLINDAGEM: Se produtos não for um array, mostra carregando
  if (!Array.isArray(produtos)) {
    return <div className="container-interno">Carregando cardápio...</div>;
  }

  // Helper para saber a quantidade de um item no carrinho
  const obterQtdNoCarrinho = (id) => {
    const item = carrinho.find(i => i.id === id);
    return item ? item.quantidade : 0;
  };

  // 2. Filtro de Produtos por Categoria
  const produtosExibidos = categoriaAtivaId 
    ? produtos.filter(p => p.categoria_id === categoriaAtivaId)
    : produtos;

  return (
    <div className="cardapio-container">
      {/* BARRA DE CATEGORIAS */}
      <div className="cat-bar" style={{ 
        display: 'flex', 
        gap: '10px', 
        overflowX: 'auto', 
        padding: '10px',
        marginBottom: '10px' 
      }}>
        <button 
          className={`cat-btn ${categoriaAtivaId === null ? 'active' : ''}`}
          onClick={() => setCategoriaAtivaId(null)}
        >
          Todos
        </button>
        {Array.isArray(categorias) && categorias.map(cat => (
          <button 
            key={cat.id} 
            className={`cat-btn ${categoriaAtivaId === cat.id ? 'active' : ''}`}
            onClick={() => setCategoriaAtivaId(cat.id)}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      {/* LISTA DE PRODUTOS ESTILO PDV */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px', 
        padding: '6px', 
        paddingBottom: '120px' // Espaço para não cobrir o carrinho
      }}>
        {produtosExibidos.length === 0 ? (
          <p style={{textAlign: 'center', color: 'var(--gray)', marginTop: '20px'}}>
            Nenhum produto encontrado.
          </p>
        ) : (
          produtosExibidos.map(p => {
            const qtd = obterQtdNoCarrinho(p.id);
            return (
              <div 
                key={p.id} 
                className={`card-pedido ${qtd > 0 ? 'selecionado' : ''}`} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '8px 12px',
                  cursor: 'pointer',
                  minHeight: '60px',
                  borderLeft: qtd > 0 ? '6px solid var(--blue)' : '6px solid transparent',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow)'
                }}
                onClick={() => adicionarAoCarrinho(p)}
              >
                {/* Imagem do Produto */}
                <img 
                  src={p.foto || 'https://via.placeholder.com/50'} 
                  alt={p.nome} 
                  style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} 
                />
                
                {/* Nome e Preço */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{p.nome}</div>
                  <div style={{ color: 'var(--green)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    R$ {Number(p.preco).toFixed(2)}
                  </div>
                </div>

                {/* Controles de Quantidade */}
                {qtd > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Não deixa o clique adicionar +1
                        removerUmDoCarrinho(p.id);
                      }}
                      style={{
                        background: 'var(--red)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        width: '28px',
                        height: '28px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      -
                    </button>
                    
                    <span style={{ fontWeight: '900', fontSize: '1rem', minWidth: '20px', textAlign: 'center' }}>
                      {qtd}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}