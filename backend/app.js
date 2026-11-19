// ==========================================================
// 👨‍🍳 COZINHA (back-end) - Configuração do Express
// ==========================================================
// Este arquivo MONTA a cozinha (middlewares e rotas).
// Quem ABRE as portas é o server.js.
// ==========================================================

const express = require('express');
const cors = require('cors');
const db = require('./src/services/database');
const apiRoutes = require('./src/routes/api.routes');

const app = express();

// ========== MIDDLEWARES ==========
// CORS: permite chamadas vindas de outra origem (ex.: Vite em dev).
// No Compose o salão chama a cozinha pelo proxy do Nginx (mesma origem).
app.use(cors());

// Faz o Express entender JSON no corpo das requisições (req.body)
app.use(express.json());

// ========== ROTA RAIZ ==========
app.get('/', (req, res) => {
  res.json({
    mensagem: '🍽️ Bem-vindo à API do Restaurante!',
    endpoints: {
      saude: 'GET /health',
      cardapio: 'GET /api/cardapio',
      comandas: 'GET /api/comandas',
    },
  });
});

// ========== HEALTH CHECK ==========
// "A cozinha consegue falar com a despensa?"
// Roda um SELECT 1 no banco: se responder, está tudo ok.
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', banco: 'conectado' });
  } catch (erro) {
    console.error('❌ Health check falhou:', erro.message);
    res.status(503).json({ status: 'erro', banco: 'desconectado', detalhe: erro.message });
  }
});

// ========== ROTAS DA API ==========
app.use('/api', apiRoutes);

module.exports = app;
