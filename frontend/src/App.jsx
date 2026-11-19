// ==========================================================
// 🪑 SALÃO (front-end) - Tela do cardápio e do carrinho
// ==========================================================
import { useState, useEffect } from 'react';
import { listarCardapio, criarComanda } from './services/api';
import { PainelCozinha } from './components/PainelCozinha';
import './App.css';

function App() {
  // Itens do cardápio vindos da cozinha (API)
  const [cardapio, setCardapio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Carrinho: itens escolhidos antes de fazer o pedido
  const [comanda, setComanda] = useState([]);
  const [numeroMesa, setNumeroMesa] = useState(1);
  // "Gatilho" para o Painel da Cozinha recarregar após um novo pedido
  const [refreshPedidos, setRefreshPedidos] = useState(0);

  // Ao abrir a tela, o garçom busca o cardápio na cozinha (uma única vez)
  useEffect(() => {
    const fetchCardapio = async () => {
      try {
        const response = await listarCardapio();
        setCardapio(response.data.dados || []);
      } catch (err) {
        console.error('❌ Erro ao buscar o cardápio:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardapio();
  }, []);

  const handleAddItemComanda = (item) => {
    setComanda((prevComanda) => [...prevComanda, item]);
  };

  // O PostgreSQL devolve DECIMAL como texto ("13.00"): convertemos para número
  const calcularTotalComanda = () =>
    comanda.reduce((total, item) => total + (parseFloat(item.preco) || 0), 0);

  // Envia o pedido para a cozinha
  const handleFazerPedido = async () => {
    if (comanda.length === 0) return;

    const dadosDoPedido = {
      mesa: Number(numeroMesa),
      itens: comanda.map((item) => item.id),
      total: calcularTotalComanda(),
    };

    try {
      await criarComanda(dadosDoPedido);
      setComanda([]);
      setRefreshPedidos((count) => count + 1);
    } catch (err) {
      console.error('❌ Erro ao enviar pedido:', err);
      alert('❌ Erro ao enviar pedido para a cozinha. Tente novamente.');
    }
  };

  // --- Renderização ---

  if (loading) {
    return (
      <div className="App">
        <h1>🍽️ Restaurante 🍽️</h1>
        <div className="loading">Carregando o cardápio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <h1>🍽️ Restaurante 🍽️</h1>
        <div className="error">
          <p>❌ A cozinha (back-end) não respondeu.</p>
          <p>Confira com: docker compose ps</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>🍽️ Cardápio do Restaurante 🍽️</h1>
      <p className="subtitle">Escolha os pratos e envie o pedido para a cozinha:</p>

      <div className="cardapio-lista">
        {cardapio.map((item) => (
          <div key={item.id} className="cardapio-item">
            <h2>{item.nome}</h2>
            <p className="descricao">{item.descricao}</p>
            <p className="preco">R$ {(parseFloat(item.preco) || 0).toFixed(2)}</p>
            <button onClick={() => handleAddItemComanda(item)}>
              ➕ Adicionar ao Pedido
            </button>
          </div>
        ))}
      </div>

      {/* CARRINHO */}
      <div className="comanda-secao">
        <h4>🛒 Sua Comanda (Carrinho)</h4>

        <label className="mesa-campo">
          🪑 Mesa:{' '}
          <input
            type="number"
            min="1"
            value={numeroMesa}
            onChange={(e) => setNumeroMesa(e.target.value)}
          />
        </label>

        <div className="comanda-lista">
          {comanda.length === 0 ? (
            <p className="comanda-vazia">Seu carrinho está vazio. Adicione itens do cardápio!</p>
          ) : (
            comanda.map((item, index) => (
              <div key={index} className="comanda-item">
                <span className="comanda-item-nome">{item.nome}</span>
                <span className="comanda-item-preco">R$ {(parseFloat(item.preco) || 0).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
        <hr />
        <div className="comanda-total">
          <strong>Total: R$ {calcularTotalComanda().toFixed(2)}</strong>
        </div>
        <button
          className="btn-fazer-pedido"
          onClick={handleFazerPedido}
          disabled={comanda.length === 0}
        >
          🍽️ Fazer Pedido
        </button>
      </div>

      {/* PAINEL DA COZINHA: pedidos gravados no banco */}
      <PainelCozinha refreshTrigger={refreshPedidos} />
    </div>
  );
}

export default App;
