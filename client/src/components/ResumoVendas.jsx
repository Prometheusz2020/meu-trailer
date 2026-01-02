import React from 'react';

export default function ResumoVendas({ pedidos }) {
  // Pegamos tudo que teve algum pagamento (parcial, finalizado ou concluído)
  const pedidosComPagamento = pedidos.filter(p => (p.total_pago || 0) > 0);

  // Soma baseada no que REALMENTE foi pago (total_pago) e não no valor bruto do pedido
  const faturamentoReal = pedidosComPagamento.reduce((acc, p) => acc + Number(p.total_pago || 0), 0);
  
  // Cálculo por método usando o campo 'pagamento' que salvamos no fechamento da conta
  const totalPix = pedidosComPagamento
    .filter(p => p.pagamento === 'pix')
    .reduce((acc, p) => acc + Number(p.total_pago || 0), 0);

  const totalDinheiro = pedidosComPagamento
    .filter(p => p.pagamento === 'dinheiro')
    .reduce((acc, p) => acc + Number(p.total_pago || 0), 0);

  return (
    <div className="container-interno">
      <div className="app-branding" style={{marginBottom: '20px'}}>
        <h2 className="brand-name">CAIXA <span className="brand-suffix">DO DIA</span></h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
        
        {/* Faturamento Real (Dinheiro que entrou) */}
        <div className="card-pedido" style={{ borderLeft: '6px solid var(--green)', textAlign: 'center', background: '#f0fff4' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>TOTAL RECEBIDO</span>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--green)', margin: '10px 0' }}>
            R$ {faturamentoReal.toFixed(2)}
          </h2>
          <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{pedidosComPagamento.length} movimentações de caixa</span>
        </div>

        {/* Detalhe por tipo de entrada */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="card-pedido" style={{ borderLeft: '6px solid #63b3ed', padding: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--gray)', fontWeight: 'bold' }}>🔵 PIX</span>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2b6cb0' }}>R$ {totalPix.toFixed(2)}</div>
          </div>
          <div className="card-pedido" style={{ borderLeft: '6px solid #2d3748', padding: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--gray)', fontWeight: 'bold' }}>💵 DINHEIRO</span>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2d3748' }}>R$ {totalDinheiro.toFixed(2)}</div>
          </div>
        </div>

        {/* Lista de Recebimentos Recentes */}
        <div className="card-pedido">
          <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', fontSize: '1rem' }}>
            📈 Entradas Recentes
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {pedidosComPagamento.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--gray)' }}>Nenhum pagamento registrado.</p>
            ) : (
              pedidosComPagamento.map(p => (
                <div key={p.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '10px 0', 
                  borderBottom: '1px solid #f9f9f9' 
                }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{p.cliente_nome}</span>
                    <div style={{ fontSize: '0.65rem', color: 'var(--gray)' }}>
                      {p.pagamento === 'pix' ? '🔵 Pix' : '💵 Dinheiro'} • {new Date(p.criado_em).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--green)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      R$ {Number(p.total_pago || 0).toFixed(2)}
                    </div>
                    {p.total_pago < p.total && (
                      <div style={{ fontSize: '0.6rem', color: 'var(--red)' }}>Parcial (Falta R$ {(p.total - p.total_pago).toFixed(2)})</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}