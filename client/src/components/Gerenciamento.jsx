import { useState, useEffect } from 'react';

export default function Gerenciamento({ produtos, setProdutos, categorias, API_URL }) {
  const [editandoId, setEditandoId] = useState(null);
  const [produtoEditado, setProdutoEditado] = useState({});
  const [categoriaAtivaId, setCategoriaAtivaId] = useState(null);

  // Define a primeira categoria como ativa ao abrir a tela
  useEffect(() => {
    if (categorias.length > 0 && !categoriaAtivaId) {
      setCategoriaAtivaId(categorias[0].id);
    }
  }, [categorias]);

  const abrirEdicao = (p) => {
    setEditandoId(p.id);
    setProdutoEditado({ ...p });
  };

 const redimensionarEConverter = (file) => {
  if (!file) return;
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Reduzimos para 400px para garantir que o banco aceite sem erro de tamanho
      const MAX_WIDTH = 400; 
      const scaleSize = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scaleSize;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Qualidade em 0.6 para o arquivo ficar bem leve (aprox 30kb)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      
      console.log("Foto processada com sucesso!");
      setProdutoEditado(prev => ({ ...prev, foto: dataUrl }));
    };
  };
};

  const salvar = async (id) => {
    try {
      const res = await fetch(`${API_URL}/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produtoEditado)
      });
      if (res.ok) {
        const atualizado = await res.json();
        setProdutos(produtos.map(p => p.id === id ? atualizado : p));
        setEditandoId(null);
        alert("Produto atualizado com sucesso!");
      }
    } catch (err) { alert("Erro ao salvar"); }
  };

  const produtosFiltrados = produtos.filter(p => p.categoria_id === categoriaAtivaId);

  return (
    <div className="gerenciamento-container">
      {/* Barra de Categorias Superior (Igual ao PDV) */}
      <div className="cat-bar">
        {categorias.map(cat => (
          <button
            key={cat.id}
            className={`cat-btn ${categoriaAtivaId === cat.id ? 'active' : ''}`}
            onClick={() => setCategoriaAtivaId(cat.id)}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      <div className="container-interno" style={{ paddingBottom: '100px' }}>
        <div className="grid-pedidos">
          {produtosFiltrados.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--gray)', marginTop: '20px' }}>
              Nenhum produto cadastrado nesta categoria.
            </p>
          ) : (
            produtosFiltrados.map(p => (
              <div key={p.id} className="card-pedido" style={{ borderLeft: '6px solid var(--blue)' }}>
                {editandoId === p.id ? (
                  /* MODO EDIÇÃO */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ textAlign: 'center', position: 'relative' }}>
                       <img src={produtoEditado.foto} style={{ width: '120px', height: '120px', borderRadius: '15px', objectFit: 'cover', border: '2px solid var(--blue)' }} alt="Preview" />
                       <label style={{ display: 'block', marginTop: '10px', color: 'var(--blue)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>
                          📸 ALTERAR FOTO
                          <input type="file" accept="image/*" onChange={(e) => redimensionarEConverter(e.target.files[0])} style={{ display: 'none' }} />
                       </label>
                    </div>

                    <input className="input-geral" value={produtoEditado.nome} onChange={e => setProdutoEditado({ ...produtoEditado, nome: e.target.value })} placeholder="Nome do Produto" />
                    <input className="input-geral" type="number" value={produtoEditado.preco} onChange={e => setProdutoEditado({ ...produtoEditado, preco: e.target.value })} placeholder="Preço" />
                    
                    <select className="input-geral" value={produtoEditado.categoria_id} onChange={e => setProdutoEditado({ ...produtoEditado, categoria_id: Number(e.target.value) })}>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => salvar(p.id)} className="btn-concluir" style={{ flex: 1 }}>SALVAR</button>
                      <button onClick={() => setEditandoId(null)} className="btn-cancelar" style={{ flex: 1 }}>CANCELAR</button>
                    </div>
                  </div>
                ) : (
                  /* MODO VISUALIZAÇÃO */
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <img src={p.foto} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} alt={p.nome} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{p.nome}</div>
                      <div style={{ color: 'var(--green)', fontWeight: 'bold' }}>R$ {Number(p.preco).toFixed(2)}</div>
                    </div>
                    <button onClick={() => abrirEdicao(p)} className="nav-btn" style={{ border: '1px solid var(--blue)', color: 'var(--blue)', padding: '5px 15px' }}>
                      Editar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}