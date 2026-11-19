// ==========================================================
// 👨‍🍳 PAINEL DA COZINHA - pedidos que estão na despensa (banco)
// ==========================================================
// Fluxo de status (igual ao back-end):
//   pendente → em_preparo → pronto
// ==========================================================
import { useState, useEffect } from 'react';
import { getComandas, updateComandaStatus, deleteComanda } from '../services/api';

// Textos amigáveis para cada status do banco
const ROTULOS_STATUS = {
  pendente: 'Pendente',
  em_preparo: 'Em Preparo',
  pronto: 'Pronto',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export function PainelCozinha({ refreshTrigger }) {
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Busca os pedidos ao abrir e sempre que um novo pedido é feito
  useEffect(() => {
    const fetchComandas = async () => {
      setLoading(true);
      try {
        const response = await getComandas();
        // A API já devolve do mais novo para o mais antigo (ORDER BY criado_em DESC)
        setComandas(response.data.dados || []);
        setError(null);
      } catch (err) {
        console.error('❌ Erro ao buscar pedidos:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComandas();
  }, [refreshTrigger]);

  // Muda o status de um pedido (PATCH /api/comandas/:id)
  const handleMudarStatus = async (id, novoStatus) => {
    try {
      const response = await updateComandaStatus(id, novoStatus);
      // A comanda atualizada vem dentro do envelope: { sucesso, mensagem, dados }
      const comandaAtualizada = response.data.dados;

      setComandas((anteriores) =>
        anteriores.map((comanda) => (comanda.id === id ? comandaAtualizada : comanda))
      );
    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      alert('Falha ao atualizar o status do pedido.');
    }
  };

  // Cancela (apaga) um pedido (DELETE /api/comandas/:id)
  const handleCancelarPedido = async (id) => {
    try {
      await deleteComanda(id);
      setComandas((anteriores) => anteriores.filter((c) => c.id !== id));
    } catch (err) {
      console.error('❌ Erro ao cancelar pedido:', err);
      alert('Falha ao cancelar o pedido.');
    }
  };

  if (loading && comandas.length === 0) {
    return (
      <div className="cozinha-secao">
        <h3>👨‍🍳 Painel da Cozinha</h3>
        <div className="loading-cozinha">Carregando pedidos da cozinha...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cozinha-secao">
        <h3>👨‍🍳 Painel da Cozinha</h3>
        <div className="error-cozinha">
          ❌ Erro ao buscar pedidos. Verifique se a cozinha (backend) está rodando.
        </div>
      </div>
    );
  }

  return (
    <div className="cozinha-secao">
      <h3>👨‍🍳 Painel da Cozinha</h3>
      <p className="cozinha-info">
        {comandas.length === 0
          ? 'Nenhum pedido ainda. Faça o primeiro!'
          : `Total de pedidos: ${comandas.length}`}
      </p>

      {comandas.length > 0 && (
        <div className="cozinha-lista">
          {comandas.map((comanda) => {
            // Proteção: se o status vier vazio, tratamos como 'pendente'
            const status = comanda.status || 'pendente';
            const qtdItens = Array.isArray(comanda.itens) ? comanda.itens.length : 0;
            const total = Number(comanda.total) || 0;
            const recebidoEm = comanda.criado_em
              ? new Date(comanda.criado_em).toLocaleString('pt-BR')
              : '-';

            return (
              <div key={comanda.id} className="cozinha-pedido">
                <h3>Pedido #{comanda.id}</h3>
                <p className="cozinha-mesa">🪑 Mesa: {comanda.mesa}</p>
                <p className="cozinha-status">
                  Status:{' '}
                  <span className={`status status-${status.replace('_', '-')}`}>
                    {ROTULOS_STATUS[status] || status}
                  </span>
                </p>
                <p className="cozinha-itens">
                  📋 Itens: {qtdItens} {qtdItens === 1 ? 'item' : 'itens'}
                </p>
                <p className="cozinha-total">
                  <strong>💰 Total: R$ {total.toFixed(2)}</strong>
                </p>
                <p className="cozinha-data">
                  <small>🕐 Recebido: {recebidoEm}</small>
                </p>

                <div className="botoes-acao">
                  {status === 'pendente' && (
                    <button
                      className="btn-em-preparo"
                      onClick={() => handleMudarStatus(comanda.id, 'em_preparo')}
                    >
                      Marcar "Em Preparo"
                    </button>
                  )}

                  {status === 'em_preparo' && (
                    <button
                      className="btn-concluido"
                      onClick={() => handleMudarStatus(comanda.id, 'pronto')}
                    >
                      Marcar "Concluído"
                    </button>
                  )}

                  {status === 'pronto' ? (
                    <p className="status-concluido-msg">✅ Pedido Finalizado!</p>
                  ) : (
                    <button
                      className="btn-cancelar"
                      onClick={() => handleCancelarPedido(comanda.id)}
                    >
                      🗑️ Cancelar Pedido
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
