import { useEffect, useState } from 'react';

export default function GestaoPedidos({ pedidos, API_URL, onAtualizar }) {
  const [filtro, setFiltro] = useState('preparando');
  const [agora, setAgora] = useState(new Date());
  
  const [pedidoEmPagamento, setPedidoEmPagamento] = useState(null);
  const [valorPagoInput, setValorPagoInput] = useState('');
  const [metodoSelecionado, setMetodoSelecionado] = useState('pix');

  // Atualiza o cronômetro a cada segundo
  useEffect(() => {
    const interval = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Muda apenas o status (Produção <-> Finalizado)
  const mudarStatus = async (id, novoStatus) => {
    try {
      await fetch(`${API_URL}/pedidos/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
      if (onAtualizar) onAtualizar();
    } catch (err) {
      console.error("Erro ao mudar status");
    }
  };

  // REGISTRA O PAGAMENTO INDIVIDUAL NA TABELA 'PAGAMENTOS'
  const confirmarPagamento = async (pedido) => {
    const valorTotalDoPedido = Number(pedido.total || 0);
    const totalJaPago = Number(pedido.total_pago || 0);
    const valorRestante = valorTotalDoPedido - totalJaPago;

    // Pega o valor digitado ou assume o valor que falta
    const valorDigitado = parseFloat(valorPagoInput.toString().replace(',', '.'));
    const valorDestaEntrada = !isNaN(valorDigitado) && valorDigitado > 0 
      ? valorDigitado 
      : valorRestante;

    const novoTotalAcumulado = totalJaPago + valorDestaEntrada;
    
    // O pedido só vai para 'concluido' (e sai da tela) se o valor total for pago
    const novoStatus = novoTotalAcumulado >= (valorTotalDoPedido - 0.01) ? 'concluido' : 'finalizado';

    try {
      const response = await fetch(`${API_URL}/pedidos/${pedido.id}/pagamento`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          valor_pago: valorDestaEntrada,
          metodo: metodoSelecionado, 
          total_acumulado: novoTotalAcumulado,
          status: novoStatus
        })
      });

      if (!response.ok) throw new Error("Erro no servidor");

      // Limpa os estados e atualiza a lista
      setPedidoEmPagamento(null);
      setValorPagoInput('');
      onAtualizar(); 
      alert(`Registrado: R$ ${valorDestaEntrada.toFixed(2)} em ${metodoSelecionado.toUpperCase()}`);

    } catch (err) {
      alert("Erro ao registrar pagamento. Verifique o servidor.");
    }
  };

  const calcularTempo = (inicio) => {
    const diff = Math.floor((agora - new Date(inicio)) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}m ${s}s`;
  };

  const pedidosFiltrados = pedidos.filter(p => p.status === filtro);

  return (
    <div className="container-interno">
      <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>📋 Fila de Pedidos</h2>

      {/* Abas de Status */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setFiltro('preparando')} className={`cat-btn ${filtro === 'preparando' ? 'active' : ''}`} style={{ flex: 1 }}>Produção</button>
        <button onClick={() => setFiltro('finalizado')} className={`cat-btn ${filtro === 'finalizado' ? 'active' : ''}`} style={{ flex: 1 }}>Finalizados</button>
        <button onClick={() => setFiltro('cancelado')} className={`cat-btn ${filtro === 'cancelado' ? 'active' : ''}`} style={{ flex: 1 }}>Canc.</button>
      </div>

      <div className="grid-pedidos">
        {pedidosFiltrados.map(ped => {
          const faltaPagar = Number(ped.total) - Number(ped.total_pago || 0);

          return (
            <div key={ped.id} className="card-pedido" style={{
              borderLeft: `6px solid ${filtro === 'preparando' ? 'var(--blue)' : filtro === 'finalizado' ? 'var(--green)' : 'var(--red)'}`
            }}>
              <div className="pedido-header">
                <span className="pedido-id">#{ped.id.toString().slice(-4)}</span>
                <span style={{fontSize: '0.75rem', color: 'var(--gray)', fontWeight: 'bold'}}>
                  {filtro === 'preparando' ? calcularTempo(ped.criado_em) : new Date(ped.criado_em).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>

              <h3 style={{ margin: '8px 0' }}>👤 {ped.cliente_nome}</h3>
              
              <div style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                Total: <b>R$ {Number(ped.total).toFixed(2)}</b>
                {Number(ped.total_pago) > 0 && (
                  <div style={{color: 'var(--green)', fontWeight: 'bold', marginTop: '4px'}}>
                    Pago: R$ {Number(ped.total_pago).toFixed(2)}
                  </div>
                )}
              </div>

              {/* INTERFACE DE PAGAMENTO */}
              {filtro === 'finalizado' && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
                  {pedidoEmPagamento === ped.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      
                      {/* Seleção de Método */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {['pix', 'dinheiro', 'credito', 'debito', 'voucher'].map((m) => (
                          <button 
                            key={m}
                            onClick={() => setMetodoSelecionado(m)} 
                            className={`nav-btn ${metodoSelecionado === m ? 'active' : ''}`}
                            style={{ fontSize: '0.55rem', padding: '8px 0', textTransform: 'uppercase' }}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                      
                      {/* Valor customizado */}
                      <input 
                        type="number" 
                        className="input-geral" 
                        placeholder={`Restante R$ ${faltaPagar.toFixed(2)}`}
                        value={valorPagoInput}
                        onChange={(e) => setValorPagoInput(e.target.value)}
                        style={{ marginBottom: 0 }}
                      />

                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => confirmarPagamento(ped)} className="btn-concluir" style={{ flex: 2, background: 'var(--green)' }}>CONFIRMAR</button>
                        <button onClick={() => setPedidoEmPagamento(null)} className="btn-cancelar" style={{ flex: 1 }}>X</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setPedidoEmPagamento(ped.id); setValorPagoInput(''); }} 
                      className="btn-pix" 
                      style={{ width: '100%', background: 'var(--blue)' }}
                    >
                      PAGAR R$ {faltaPagar.toFixed(2)}
                    </button>
                  )}
                </div>
              )}

              {/* Botão de retorno (Apenas se não estiver pagando) */}
              {ped.status !== 'preparando' && !pedidoEmPagamento && (
                <button 
                  onClick={() => mudarStatus(ped.id, 'preparando')} 
                  className="btn-dinheiro" 
                  style={{ width: '100%', fontSize: '0.75rem', marginTop: '10px', background: '#718096' }}
                >
                  VOLTAR PARA PRODUÇÃO
                </button>
              )}
              
              {ped.status === 'preparando' && (
                <button 
                  onClick={() => mudarStatus(ped.id, 'finalizado')} 
                  className="btn-concluir" 
                  style={{ marginTop: '10px', width: '100%' }}
                >
                  CONCLUIR ENTREGA
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}