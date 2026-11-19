// ==========================================================
// 🍽️ CONTROLADOR DO CARDÁPIO - "Chef" que cuida do menu
// ==========================================================
// Não sabe qual banco usamos: só chama db.query() (ver services/database.js)
// Queries usam prepared statements (?) para segurança
// ==========================================================

const db = require('../services/database');

// ========== LISTAR TODOS OS ITENS DO CARDÁPIO ==========
/**
 * GET /api/cardapio
 * Retorna todos os itens do cardápio
 */
const listarCardapio = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cardapio ORDER BY id'); 

    res.json({
      sucesso: true,
      dados: rows
    });
  } catch (erro) {
    console.error('Erro ao listar cardápio:', erro);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: "Erro ao acessar o banco de dados" 
    });
  }
};

// ========== BUSCAR ITEM ESPECÍFICO DO CARDÁPIO ==========
/**
 * GET /api/cardapio/:id
 * Retorna um item específico do cardápio pelo ID
 */
const obterItemCardapio = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Validação do ID
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID inválido. Deve ser um número positivo.'
      });
    }

    // Query com prepared statement (? é substituído pelo valor)
    const [rows] = await db.query('SELECT * FROM cardapio WHERE id = ?', [id]);

    // Se não encontrou nenhum registro
    if (rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Item não encontrado no cardápio'
      });
    }

    // Retorna o primeiro (e único) item encontrado
    res.json({
      sucesso: true,
      dados: rows[0]
    });

  } catch (erro) {
    console.error('Erro ao buscar item:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar item do cardápio'
    });
  }
};

// ========== CRIAR NOVO ITEM NO CARDÁPIO ==========
/**
 * POST /api/cardapio
 * Cria um novo item no cardápio
 * Body: { nome, preco, descricao }
 */
const criarItemCardapio = async (req, res) => {
  try {
    const { nome, preco, descricao } = req.body;

    // Validação dos campos obrigatórios
    if (!nome || !preco) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome e preço são obrigatórios'
      });
    }

    // Validação do preço
    if (isNaN(preco) || preco <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Preço deve ser um número positivo'
      });
    }

    // Insert com prepared statement
    const [result] = await db.query(
      'INSERT INTO cardapio (nome, preco, descricao) VALUES (?, ?, ?)',
      [nome, preco, descricao || null]
    );

    // Busca o item recém-criado
    const [novoItem] = await db.query(
      'SELECT * FROM cardapio WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Item adicionado ao cardápio com sucesso',
      dados: novoItem[0]
    });

  } catch (erro) {
    console.error('Erro ao criar item:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar item no cardápio'
    });
  }
};

// ========== ATUALIZAR ITEM DO CARDÁPIO ==========
/**
 * PUT /api/cardapio/:id
 * Atualiza um item existente no cardápio
 * Body: { nome, preco, descricao }
 */
const atualizarItemCardapio = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, preco, descricao } = req.body;

    // Validação do ID
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID inválido'
      });
    }

    // Validação dos campos
    if (!nome || !preco) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome e preço são obrigatórios'
      });
    }

    if (isNaN(preco) || preco <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Preço deve ser um número positivo'
      });
    }

    // Verifica se o item existe
    const [itemExistente] = await db.query(
      'SELECT * FROM cardapio WHERE id = ?',
      [id]
    );

    if (itemExistente.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Item não encontrado'
      });
    }

    // Atualiza o item
    await db.query(
      'UPDATE cardapio SET nome = ?, preco = ?, descricao = ? WHERE id = ?',
      [nome, preco, descricao || null, id]
    );

    // Busca o item atualizado
    const [itemAtualizado] = await db.query(
      'SELECT * FROM cardapio WHERE id = ?',
      [id]
    );

    res.json({
      sucesso: true,
      mensagem: 'Item atualizado com sucesso',
      dados: itemAtualizado[0]
    });

  } catch (erro) {
    console.error('Erro ao atualizar item:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar item do cardápio'
    });
  }
};

// ========== DELETAR ITEM DO CARDÁPIO ==========
/**
 * DELETE /api/cardapio/:id
 * Remove um item do cardápio
 */
const deletarItemCardapio = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Validação do ID
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID inválido'
      });
    }

    // Verifica se o item existe
    const [itemExistente] = await db.query(
      'SELECT * FROM cardapio WHERE id = ?',
      [id]
    );

    if (itemExistente.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Item não encontrado'
      });
    }

    // Deleta o item
    await db.query('DELETE FROM cardapio WHERE id = ?', [id]);

    res.json({
      sucesso: true,
      mensagem: 'Item removido do cardápio com sucesso',
      dados: itemExistente[0]
    });

  } catch (erro) {
    console.error('Erro ao deletar item:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao deletar item do cardápio'
    });
  }
};

// Exporta todas as funções
module.exports = {
  listarCardapio,
  obterItemCardapio,
  criarItemCardapio,
  atualizarItemCardapio,
  deletarItemCardapio
};
