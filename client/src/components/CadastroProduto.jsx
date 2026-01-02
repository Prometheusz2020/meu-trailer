import { useState } from 'react';

export default function CadastroProduto({ categorias, API_URL, setProdutos, produtos, setAba }) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [foto, setFoto] = useState('');
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id || '');

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    const novoProd = {
      nome,
      preco: parseFloat(preco),
      foto,
      categoria_id: parseInt(categoriaId)
    };

    try {
      const res = await fetch(`${API_URL}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoProd)
      });

      if (res.ok) {
        const salvo = await res.json();
        setProdutos([...produtos, salvo]); // Atualiza a lista global
        alert('Produto cadastrado!');
        setAba('vendas'); // Volta para a tela de vendas
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor.');
    }
  };

  return (
    <form className="container-interno" onSubmit={salvar}>
      <h2>Novo Produto</h2>
      
      <label className="form-label">Nome do Item</label>
      <input 
        className="input-geral" 
        value={nome} 
        onChange={e => setNome(e.target.value)} 
        required 
        placeholder="Ex: X-Salada Especial"
      />

      <label className="form-label">Preço de Venda (R$)</label>
      <input 
        className="input-geral" 
        type="number" 
        step="0.01" 
        value={preco} 
        onChange={e => setPreco(e.target.value)} 
        required 
        placeholder="0.00"
      />

      <label className="form-label">Categoria</label>
      <select 
        className="input-geral" 
        value={categoriaId} 
        onChange={e => setCategoriaId(e.target.value)}
      >
        {categorias.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.nome}</option>
        ))}
      </select>

      <label className="form-label">Foto (Opcional)</label>
      <input className="input-geral" type="file" accept="image/*" onChange={handleFoto} />
      
      {foto && (
        <img 
          src={foto} 
          alt="Preview" 
          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', marginTop: '10px' }} 
        />
      )}

      <button type="submit" className="btn-pix" style={{marginTop: '20px'}}>
        SALVAR PRODUTO NO BANCO
      </button>
    </form>
  );
}