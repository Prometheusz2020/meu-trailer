import './index.css'; 
import { useState, useEffect } from 'react';
import Navegacao from './components/Navegacao';
import Cardapio from './components/Cardapio';
import Carrinho from './components/Carrinho';
import CadastroProduto from './components/CadastroProduto';
import Gerenciamento from './components/Gerenciamento';
import GestaoPedidos from './components/GestaoPedidos';
import ResumoVendas from './components/ResumoVendas';

export default function App() {
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]); 
  const [carrinho, setCarrinho] = useState([]);
  const [aba, setAba] = useState('vendas');
  const [categoriaAtivaId, setCategoriaAtivaId] = useState(null);

  const API_URL = 'http://192.168.0.66:3001/api';

  // Função centralizada para carregar todos os dados do banco
  const carregarDados = async () => {
    try {
      const resCat = await fetch(`${API_URL}/categorias`);
      const dadosCat = await resCat.json();
      setCategorias(dadosCat);
      if (dadosCat.length > 0 && !categoriaAtivaId) setCategoriaAtivaId(dadosCat[0].id);

      const resProd = await fetch(`${API_URL}/produtos`);
      const dadosProd = await resProd.json();
      setProdutos(dadosProd);

      const resPed = await fetch(`${API_URL}/pedidos`);
      const dadosPed = await resPed.json();
      setPedidos(dadosPed);

      const [pagamentos, setPagamentos] = useState([]);

      const carregarDados = async () => {
  // ... suas buscas de produtos e pedidos ...
      const resPag = await fetch(`${API_URL}/todos-pagamentos`);
     const dataPag = await resPag.json();
    setPagamentos(dataPag);
};
      
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  };

  // Carrega ao iniciar
  useEffect(() => {
    carregarDados();
  }, []);

  // Atualiza sempre que o usuário clica em uma aba de monitoramento
  useEffect(() => {
    if (aba === 'resumo' || aba === 'pedidos') {
      carregarDados();
    }
  }, [aba]);

  const adicionarAoCarrinho = (p) => {
    const ex = carrinho.find(i => i.id === p.id);
    if (ex) setCarrinho(carrinho.map(i => i.id === p.id ? { ...i, quantidade: i.quantidade + 1 } : i));
    else setCarrinho([...carrinho, { ...p, quantidade: 1 }]);
  };

  const removerUmDoCarrinho = (id) => {
    const ex = carrinho.find(i => i.id === id);
    if (!ex) return;
    if (ex.quantidade > 1) setCarrinho(carrinho.map(i => i.id === id ? { ...i, quantidade: i.quantidade - 1 } : i));
    else setCarrinho(carrinho.filter(i => i.id !== id));
  };
  

  return (
    <div className="app-container">
      <Navegacao aba={aba} setAba={setAba} />
      
      {/* ABA PDV (VENDAS) */}
      {aba === 'vendas' && (
        <>
          <Cardapio 
            categorias={categorias} 
            categoriaAtivaId={categoriaAtivaId} 
            setCategoriaAtivaId={setCategoriaAtivaId}
            produtos={produtos}
            adicionarAoCarrinho={adicionarAoCarrinho}
            removerUmDoCarrinho={removerUmDoCarrinho} // <-- Adicione esta linha!
            carrinho={carrinho}
          />
          <Carrinho 
            carrinho={carrinho} 
            setCarrinho={setCarrinho} 
            removerUmDoCarrinho={removerUmDoCarrinho}
            API_URL={API_URL} 
            onSucesso={carregarDados}
          />
        </>
      )}

      {/* ABA COZINHA (PEDIDOS) - Passando a lista global e função de atualizar */}
      {aba === 'pedidos' && (
        <GestaoPedidos 
          pedidos={pedidos} 
          API_URL={API_URL} 
          onAtualizar={carregarDados} 
        />
      )}

      {/* ABA FINANCEIRO (RESUMO) */}
      {aba === 'resumo' && (
        <ResumoVendas pedidos={pedidos} />
      )}

      {/* ABA NOVO PRODUTO */}
      {aba === 'cadastro' && (
        <CadastroProduto 
          categorias={categorias} 
          API_URL={API_URL} 
          setProdutos={setProdutos} 
          setAba={setAba}
        />
      )}

      {/* ABA GERENTE */}
      {aba === 'gerente' && (
        <Gerenciamento 
          produtos={produtos} 
          setProdutos={setProdutos} 
          categorias={categorias} 
          API_URL={API_URL} 
        />
      )}
    </div>
  );
}