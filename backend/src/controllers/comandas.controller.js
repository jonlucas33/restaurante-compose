// ==========================================================
// 📝 CONTROLADOR DAS COMANDAS - "Chef" que cuida dos pedidos
// ==========================================================
// Gerencia pedidos (comandas) do restaurante
// Campo 'itens' é armazenado como JSONB no PostgreSQL
// ==========================================================

const db = require('../services/database');

// ========== LISTAR TODAS AS COMANDAS ==========
/**
 * GET /api/comandas
 * Retorna todas as comandas
 */
const listarComandas = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM comandas ORDER BY criado_em DESC, id DESC');

    // Garante que 'itens' seja um array (o driver pode devolver string ou objeto)
    const comandasComItens = rows.map(comanda => ({
      ...comanda,
      itens: Array.isArray(comanda.itens) 
        ? comanda.itens 
        : (typeof comanda.itens === 'string' ? JSON.parse(comanda.itens) : comanda.itens)
    }));

    res.json({
      sucesso: true,
      dados: comandasComItens
    });

  } catch (erro) {
    console.error('Erro ao listar comandas:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar comandas'
    });
  }
};

// ========== BUSCAR COMANDA ESPECÍFICA ==========
/**
 * GET /api/comandas/:id
 * Retorna uma comanda específica pelo ID
 */
const obterComanda = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID inválido'
      });
    }

    const [rows] = await db.query('SELECT * FROM comandas WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Comanda não encontrada'
      });
    }

    // Parse do campo JSON
    const comanda = {
      ...rows[0],
      itens: Array.isArray(rows[0].itens)
        ? rows[0].itens
        : (typeof rows[0].itens === 'string' ? JSON.parse(rows[0].itens) : rows[0].itens)
    };

    res.json({
      sucesso: true,
      dados: comanda
    });

  } catch (erro) {
    console.error('Erro ao buscar comanda:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar comanda'
    });
  }
};

// ========== CRIAR NOVA COMANDA ==========
/**
 * POST /api/comandas
 * Cria uma nova comanda
 * Body: { mesa, itens: [{ id, nome, quantidade, preco_unitario, subtotal }], total }
 */
const criarComanda = async (req, res) => {
  try {
    const { mesa, itens, total } = req.body;

    // Validações
    if (!mesa || !itens || !total) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Mesa, itens e total são obrigatórios'
      });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Itens deve ser um array não vazio'
      });
    }

    // if (isNaN(mesa) || mesa <= 0) {
    //   return res.status(400).json({
    //     sucesso: false,
    //     mensagem: 'Mesa deve ser um número positivo'
    //   });
    // }

    if (isNaN(total) || total < 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Total deve ser um número não negativo'
      });
    }

    // Converte itens para texto JSON (o PostgreSQL converte para JSONB)
    const itensJSON = JSON.stringify(itens);
    const status = 'pendente'; // Status padrão

    // Insert da comanda
    const [result] = await db.query(
      'INSERT INTO comandas (mesa, status, itens, total) VALUES (?, ?, ?, ?)',
      [mesa, status, itensJSON, total]
    );

    // Busca a comanda recém-criada
    const [novaComanda] = await db.query(
      'SELECT * FROM comandas WHERE id = ?',
      [result.insertId]
    );

    // Parse do campo JSON
    const comandaCriada = {
      ...novaComanda[0],
      itens: Array.isArray(novaComanda[0].itens)
        ? novaComanda[0].itens
        : (typeof novaComanda[0].itens === 'string' ? JSON.parse(novaComanda[0].itens) : novaComanda[0].itens)
    };

    res.status(201).json({
      sucesso: true,
      mensagem: 'Comanda criada com sucesso',
      dados: comandaCriada
    });

  } catch (erro) {
    console.error('Erro ao criar comanda:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar comanda'
    });
  }
};

// ========== ATUALIZAR STATUS DA COMANDA ==========
/**
 * PATCH /api/comandas/:id
 * Atualiza o status de uma comanda
 * Body: { status: 'pendente' | 'em_preparo' | 'pronto' | 'entregue' | 'cancelado' }
 */
const atualizarStatusComanda = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    // Validação do ID
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID inválido'
      });
    }

    // Validação do status
    const statusValidos = ['pendente', 'em_preparo', 'pronto', 'entregue', 'cancelado'];
    if (!status || !statusValidos.includes(status)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Status inválido. Use: ${statusValidos.join(', ')}`
      });
    }

    // Verifica se a comanda existe
    const [comandaExistente] = await db.query(
      'SELECT * FROM comandas WHERE id = ?',
      [id]
    );

    if (comandaExistente.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Comanda não encontrada'
      });
    }

    // Atualiza o status
    await db.query(
      'UPDATE comandas SET status = ?, atualizado_em = NOW() WHERE id = ?',
      [status, id]
    );

    // Busca a comanda atualizada
    const [comandaAtualizada] = await db.query(
      'SELECT * FROM comandas WHERE id = ?',
      [id]
    );

    // Parse do campo JSON
    const comanda = {
      ...comandaAtualizada[0],
      itens: Array.isArray(comandaAtualizada[0].itens)
        ? comandaAtualizada[0].itens
        : (typeof comandaAtualizada[0].itens === 'string' ? JSON.parse(comandaAtualizada[0].itens) : comandaAtualizada[0].itens)
    };

    res.json({
      sucesso: true,
      mensagem: 'Status da comanda atualizado com sucesso',
      dados: comanda
    });

  } catch (erro) {
    console.error('Erro ao atualizar status:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar status da comanda'
    });
  }
};

// ========== DELETAR COMANDA ==========
/**
 * DELETE /api/comandas/:id
 * Remove uma comanda
 */
const deletarComanda = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID inválido'
      });
    }

    // Verifica se a comanda existe
    const [comandaExistente] = await db.query(
      'SELECT * FROM comandas WHERE id = ?',
      [id]
    );

    if (comandaExistente.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Comanda não encontrada'
      });
    }

    // Deleta a comanda
    await db.query('DELETE FROM comandas WHERE id = ?', [id]);

    // Parse do campo JSON para retorno
    const comanda = {
      ...comandaExistente[0],
      itens: Array.isArray(comandaExistente[0].itens)
        ? comandaExistente[0].itens
        : (typeof comandaExistente[0].itens === 'string' ? JSON.parse(comandaExistente[0].itens) : comandaExistente[0].itens)
    };

    res.json({
      sucesso: true,
      mensagem: 'Comanda removida com sucesso',
      dados: comanda
    });

  } catch (erro) {
    console.error('Erro ao deletar comanda:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao deletar comanda'
    });
  }
};

// ========== BUSCAR COMANDAS POR MESA ==========
/**
 * GET /api/comandas/mesa/:numeroMesa
 * Retorna todas as comandas de uma mesa específica
 */
const listarComandasPorMesa = async (req, res) => {
  try {
    const mesa = parseInt(req.params.numeroMesa);

    if (isNaN(mesa) || mesa <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Número da mesa inválido'
      });
    }

    const [rows] = await db.query(
      'SELECT * FROM comandas WHERE mesa = ? ORDER BY criado_em DESC, id DESC',
      [mesa]
    );

    // Parse do campo JSON
    const comandas = rows.map(comanda => ({
      ...comanda,
      itens: typeof comanda.itens === 'string' ? JSON.parse(comanda.itens) : comanda.itens
    }));

    res.json({
      sucesso: true,
      dados: comandas
    });

  } catch (erro) {
    console.error('Erro ao listar comandas por mesa:', erro);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar comandas da mesa'
    });
  }
};

// Exporta todas as funções
module.exports = {
  listarComandas,
  obterComanda,
  criarComanda,
  atualizarStatusComanda,
  deletarComanda,
  listarComandasPorMesa
};
