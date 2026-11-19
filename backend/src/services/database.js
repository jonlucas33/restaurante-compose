// ==========================================================
// 🗄️ CONEXÃO COM A DESPENSA (PostgreSQL)
// ==========================================================
// ⭐ Este é o ÚNICO arquivo do back-end que sabe qual banco usamos.
// Os controllers (os "chefs") só chamam db.query(sql, params) e
// não fazem ideia se a despensa é PostgreSQL, MySQL ou outra coisa.
// Se um dia trocarmos de banco, só este arquivo muda.
//
// As configurações vêm de VARIÁVEIS DE AMBIENTE, definidas no
// docker-compose.yml (serviço "backend"). Não usamos arquivo .env.
//
// 💡 Repare no DB_HOST: dentro do Compose ele vale "db", que é o
// NOME DO SERVIÇO do banco. O Docker resolve esse nome para o IP
// do container, como uma agenda de ramais da cozinha.
// ==========================================================

const { Pool } = require('pg');

// Pool = um "grupo de entregadores" (conexões) reaproveitados,
// em vez de abrir uma conexão nova a cada pedido.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'senai',
  password: process.env.DB_PASSWORD || 'senai',
  database: process.env.DB_DATABASE || 'restaurante',
});

pool.on('error', (erro) => {
  console.error('❌ Erro inesperado na conexão com o PostgreSQL:', erro.message);
});

// ----------------------------------------------------------
// Tradutor de "?" (estilo MySQL) para "$1, $2..." (estilo PostgreSQL)
// Os controllers foram escritos com "?" e assim continuam.
// Ignora "?" que estejam dentro de textos entre aspas simples.
// ----------------------------------------------------------
function converterPlaceholders(sql) {
  let contador = 0;
  let dentroDeTexto = false;
  let resultado = '';

  for (const caractere of sql) {
    if (caractere === "'") dentroDeTexto = !dentroDeTexto;

    if (caractere === '?' && !dentroDeTexto) {
      contador += 1;
      resultado += `$${contador}`;
    } else {
      resultado += caractere;
    }
  }
  return resultado;
}

// ----------------------------------------------------------
// query(sql, params): mesma "interface" que os controllers já usavam
//   SELECT  → [rows]
//   INSERT  → [{ insertId, affectedRows }]  (acrescenta RETURNING id)
//   demais  → [{ affectedRows }]            (UPDATE, DELETE...)
// ----------------------------------------------------------
async function query(sql, params = []) {
  let texto = converterPlaceholders(sql).trim();
  const comando = texto.split(/\s+/)[0].toUpperCase();

  // No PostgreSQL, para saber o id gerado é preciso pedir: RETURNING id
  if (comando === 'INSERT' && !/\bRETURNING\b/i.test(texto)) {
    texto = `${texto.replace(/;\s*$/, '')} RETURNING id`;
  }

  const resultado = await pool.query(texto, params);

  if (comando === 'SELECT' || comando === 'WITH') {
    return [resultado.rows];
  }

  if (comando === 'INSERT') {
    return [{
      insertId: resultado.rows[0] ? resultado.rows[0].id : undefined,
      affectedRows: resultado.rowCount,
    }];
  }

  return [{ affectedRows: resultado.rowCount }];
}

module.exports = { query, pool };
