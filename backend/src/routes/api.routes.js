// ==========================================================
// 📋 ROTAS DA API - O "livro de pedidos" da cozinha
// ==========================================================
// Liga cada URL (endereço) ao chef (controller) responsável.
// Todas começam com /api (definido no app.js).
// ==========================================================

const express = require('express');
const router = express.Router();

const cardapioController = require('../controllers/cardapio.controller');
const comandasController = require('../controllers/comandas.controller');

// ========== CARDÁPIO ==========
router.get('/cardapio', cardapioController.listarCardapio);
router.get('/cardapio/:id', cardapioController.obterItemCardapio);
router.post('/cardapio', cardapioController.criarItemCardapio);
router.put('/cardapio/:id', cardapioController.atualizarItemCardapio);
router.delete('/cardapio/:id', cardapioController.deletarItemCardapio);

// ========== COMANDAS (PEDIDOS) ==========
router.get('/comandas', comandasController.listarComandas);
// ⚠️ A rota /comandas/mesa/:numeroMesa vem ANTES de /comandas/:id,
// senão o Express acharia que "mesa" é um id.
router.get('/comandas/mesa/:numeroMesa', comandasController.listarComandasPorMesa);
router.get('/comandas/:id', comandasController.obterComanda);
router.post('/comandas', comandasController.criarComanda);
router.patch('/comandas/:id', comandasController.atualizarStatusComanda);
router.delete('/comandas/:id', comandasController.deletarComanda);

module.exports = router;
