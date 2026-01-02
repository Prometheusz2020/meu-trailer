import { useState } from 'react';

export default function Carrinho({ carrinho, setCarrinho, API_URL }) {
  const [cliente, setCliente] = useState('');
  const total = carrinho.reduce((acc, i) => acc + (i.preco * i.quantidade), 0);

  const enviarPedido = async () => {
    if (!cliente.trim()) {
      alert("⚠️ Digite o nome do cliente!");
      return;
    }

    const dadosDoPedido = {
      cliente_nome: cliente,
      itens: carrinho,
      total: total
    };

    try {
      const res = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosDoPedido)
      });

      if (res.ok) {
        alert("✅ Pedido enviado com sucesso!");
        setCarrinho([]); // Limpa o carrinho
        setCliente('');  // Limpa o nome
      } else {
        const erroDados = await res.json();
        console.error("Erro do servidor:", erroDados);
        alert("❌ Erro ao enviar pedido para o servidor.");
      }
    } catch (err) {
      console.error("Erro de rede:", err);
      alert("❌ Servidor offline ou erro de conexão.");
    }
  };

  if (carrinho.length === 0) return null;

  return (
    <footer className="footer-caixa">
      <div className="resumo-lista">
        {carrinho.map(item => (
          <div key={item.id} className="resumo-item">
            <span>{item.quantidade}x {item.nome}</span>
            <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <input 
        type="text" 
        placeholder="Nome do Cliente..." 
        className="input-geral"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
        style={{marginBottom: '10px'}}
      />
      
      <div className="total-area">
        <span style={{fontWeight: 'bold'}}>TOTAL:</span>
        <span style={{fontSize: '1.5rem', fontWeight: '900'}}>R$ {total.toFixed(2)}</span>
      </div>

      <button onClick={enviarPedido} className="btn-pix" style={{width: '100%'}}>
        ENVIAR PARA COZINHA
      </button>
    </footer>
  );
}