import { useEffect, useState } from 'react';

export default function Cozinha({ API_URL }) {
  const [pedidos, setPedidos] = useState([]);
  const [agora, setAgora] = useState(new Date());

  const carregarPedidos = () => {
    fetch(`${API_URL}/pedidos/producao`)
      .then(r => r.json())
      .then(setPedidos);
  };

  useEffect(() => {
    carregarPedidos();
    const intervalDados = setInterval(carregarPedidos, 5000); // Busca novos pedidos
    const intervalRelogio = setInterval(() => setAgora(new Date()), 1000); // Atualiza cronômetro
    return () => { clearInterval(intervalDados); clearInterval(intervalRelogio); };
  }, []);

  const calcularTempo = (dataCriacao) => {
    const inicio = new Date(dataCriacao);
    const diff = Math.floor((agora - inicio) / 1000); // segundos
    const min = Math.floor(diff / 60);
    const seg = diff % 60;
    return `${min}m ${seg}s`;
  };

  const finalizar = (id) => {
    fetch(`${API_URL}/pedidos/${id}/finalizar`, { method: 'PUT' })
      .then(() => carregarPedidos());
  };

  return (
    <div className="container-interno">
      <h2>Fila de Produção</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {pedidos.map(ped => (
          <div key={ped.id} className="card-pedido" style={{ border: '2px solid #e2e8f0', padding: '15px', borderRadius: '10px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>#{ped.id}</span>
              <span style={{ color: 'red', fontWeight: 'bold' }}>{calcularTempo(ped.criado_em)}</span>
            </div>
            <h4 style={{ margin: '5px 0', color: '#2d3748' }}>Cliente: {ped.cliente_nome || 'Não informado'}</h4>
            <hr />
            <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
              {ped.itens.map((it, idx) => (
                <li key={idx}><b>{it.quantidade}x</b> {it.nome}</li>
              ))}
            </ul>
            <button 
              onClick={() => finalizar(ped.id)} 
              style={{ width: '100%', padding: '10px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              PRONTO / CHAMAR CLIENTE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}