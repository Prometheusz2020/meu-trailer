require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Pega os valores do .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Verifica se as variáveis foram carregadas para não quebrar o código
if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: SUPABASE_URL ou SUPABASE_KEY não encontradas no arquivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- ROTAS DE PRODUTOS E CATEGORIAS ---

app.get('/api/produtos', async (req, res) => {
  const { data, error } = await supabase.from('produtos').select('*');
  if (error) return res.status(400).json(error);
  res.json(data);
});

app.get('/api/categorias', async (req, res) => {
  const { data, error } = await supabase.from('categorias').select('*');
  if (error) return res.status(400).json(error);
  res.json(data);
});

// --- ROTAS DE PEDIDOS ---

app.get('/api/pedidos', async (req, res) => {
  // Buscamos apenas os pedidos que NÃO estão concluídos ou cancelados (para a fila)
  // Ou todos, se preferir filtrar no Front-end
  const { data, error } = await supabase.from('pedidos').select('*').order('criado_em', { ascending: false });
  if (error) return res.status(400).json(error);
  res.json(data);
});

app.post('/api/pedidos', async (req, res) => {
  const { data, error } = await supabase.from('pedidos').insert([req.body]).select();
  if (error) return res.status(400).json(error);
  res.json(data[0]);
});

app.put('/api/pedidos/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { data, error } = await supabase.from('pedidos').update({ status }).eq('id', id).select();
  if (error) return res.status(400).json(error);
  res.json(data[0]);
});

// --- ROTA DE PAGAMENTO (O CORAÇÃO DO SISTEMA) ---

// Rota para processar o pagamento e inserir na tabela 'pagamentos'
app.put('/api/pedidos/:id/pagamento', async (req, res) => {
  const { id } = req.params;
  const { valor_pago, metodo, total_acumulado, status } = req.body;

  console.log(`Tentando pagar R$ ${valor_pago} no pedido ${id} via ${metodo}`);

  try {
    // 1. Registro do Histórico
    const { error: errPag } = await supabase
      .from('pagamentos')
      .insert([{ pedido_id: id, metodo, valor: valor_pago }]);

    if (errPag) {
      console.error("ERRO TABELA PAGAMENTOS:", errPag.message);
      return res.status(400).json({ erro: "Falha na tabela pagamentos", detalhes: errPag });
    }

    // 2. Atualização do Pedido
    const { data, error: errPed } = await supabase
      .from('pedidos')
      .update({ total_pago: total_acumulado, status: status })
      .eq('id', id)
      .select();

    if (errPed) {
      console.error("ERRO TABELA PEDIDOS:", errPed.message);
      return res.status(400).json({ erro: "Falha na tabela pedidos", detalhes: errPed });
    }

    console.log("Pagamento registrado com sucesso!");
    res.json(data[0]);
  } catch (error) {
    console.error("ERRO GERAL:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// --- ROTA DE HISTÓRICO PARA O RESUMO DE VENDAS ---

app.get('/api/todos-pagamentos', async (req, res) => {
  // Busca todos os pagamentos individuais para somar no caixa por método
  const { data, error } = await supabase
    .from('pagamentos')
    .select('*')
    .order('criado_em', { ascending: false });
  
  if (error) return res.status(400).json(error);
  res.json(data);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));