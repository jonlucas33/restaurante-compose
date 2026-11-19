// ==========================================================
// 🚪 ABRE A COZINHA - Inicia o servidor HTTP
// ==========================================================

const app = require('./app');
const { pool } = require('./src/services/database');

// A porta vem do Compose (PORT=4000). Se não vier, usa 4000.
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Cozinha aberta na porta ${PORT}`);
  console.log(`🗄️ Despensa: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
});

// ========== FECHAMENTO ORGANIZADO ==========
// Quando rodamos "docker compose down", o Docker envia o sinal SIGTERM.
// Fechamos o servidor e as conexões com o banco e saímos na hora,
// em vez de o Docker esperar 10 segundos e "matar" o processo.
function encerrar(sinal) {
  console.log(`👋 ${sinal} recebido: fechando a cozinha...`);
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));
