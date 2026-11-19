// ==========================================================
// 🧑‍🍳➡️ GARÇOM: leva os pedidos do salão até a cozinha
// ==========================================================
import axios from 'axios';

// URL base da cozinha (API).
// No Docker usamos '/api': o navegador chama o PRÓPRIO Nginx do salão
// (localhost:8080/api/...) e o Nginx repassa para o serviço "backend".
// Assim o navegador nunca precisa saber onde a cozinha está.
// VITE_API_URL é lida na hora do BUILD (npm run build), não em tempo de execução.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

// ---------- CARDÁPIO ----------
export const listarCardapio = () => api.get('/cardapio');

export const getCardapioItem = (id) => api.get(`/cardapio/${id}`);

// ---------- COMANDAS ----------
export const criarComanda = (comanda) => api.post('/comandas', comanda);

export const getComandas = () => api.get('/comandas');

export const updateComandaStatus = (id, novoStatus) =>
  api.patch(`/comandas/${id}`, { status: novoStatus });

export const deleteComanda = (id) => api.delete(`/comandas/${id}`);
