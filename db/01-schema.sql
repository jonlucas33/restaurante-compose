-- ==========================================================
-- 🗄️ DESPENSA (PostgreSQL) - 01: ESTRUTURA DAS TABELAS
-- ==========================================================
-- Este arquivo é executado AUTOMATICAMENTE pelo container "db"
-- na PRIMEIRA vez que ele sobe (pasta /docker-entrypoint-initdb.d).
-- Os arquivos rodam em ordem alfabética: 01-schema.sql → 02-seed.sql
--
-- ⚠️ Só roda com o volume VAZIO! Se o "freezer" (volume pgdata)
-- já tem dados, o PostgreSQL ignora esta pasta.
-- Para rodar de novo: docker compose down -v && docker compose up -d
-- ==========================================================

-- ==========================================================
-- 📋 DDL - LINGUAGEM DE DEFINIÇÃO DE DADOS
-- ==========================================================
-- 
-- PROPÓSITO: Este arquivo contém APENAS a ESTRUTURA do banco.
-- Não há INSERTs aqui porque seguimos boas práticas de separação:
--
-- ✅ DDL (Data Definition Language) = ESTRUTURA
--    - CREATE TABLE, ALTER TABLE, DROP TABLE
--    - CREATE INDEX, PRIMARY KEY, FOREIGN KEY
--    - Define "como os dados serão armazenados"
--
-- ✅ SEED (Alimentação) = DADOS INICIAIS
--    - INSERT, executados via script separado (02-seed.sql)
--    - Permite versionar dados de forma independente
--    - Facilita limpar/repopular dados sem recriar estrutura
--
-- ==========================================================
-- 🎓 POR QUE SEPARAR DDL DE SEED?
-- ==========================================================
-- 
-- 1. CONTROLE DE VERSÃO:
--    - Estrutura muda raramente (ex: adicionar coluna)
--    - Dados mudam frequentemente (ex: novos itens do cardápio)
--    - Separar permite rastrear mudanças de forma independente
--
-- 2. AMBIENTES DIFERENTES:
--    - DEV: Precisa de muitos dados de teste (seed completo)
--    - STAGING: Cópia dos dados de produção
--    - PRODUÇÃO: Sem seed (dados reais vêm de operações)
--
-- 3. TESTES AUTOMATIZADOS:
--    - Estrutura é criada 1x (migrations)
--    - Dados são limpos/recriados a cada teste (seed)
--    - TRUNCATE + SEED é mais rápido que DROP + CREATE
--
-- 4. SEGURANÇA:
--    - Em produção: DBA executa DDL (permissões elevadas)
--    - Em produção: Aplicação executa DML (permissões limitadas)
--
-- ==========================================================

-- Criar a tabela de cardápio
CREATE TABLE IF NOT EXISTS cardapio (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10, 2) NOT NULL CHECK (preco > 0),
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar a tabela de comandas (pedidos)
CREATE TABLE IF NOT EXISTS comandas (
  id SERIAL PRIMARY KEY,
  mesa INTEGER NOT NULL CHECK (mesa > 0),
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_preparo', 'pronto', 'entregue', 'cancelado')),
  itens JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 📊 ÍNDICES PARA PERFORMANCE
-- ==========================================================
-- Índices melhoram a velocidade de consultas (SELECT) mas
-- tornam INSERT/UPDATE um pouco mais lentos.
-- Criamos índices em colunas que são frequentemente usadas em:
-- - WHERE (filtros)
-- - JOIN (junções)
-- - ORDER BY (ordenação)
-- ==========================================================

-- Índice para buscar comandas por status (ex: WHERE status = 'pendente')
CREATE INDEX IF NOT EXISTS idx_comandas_status ON comandas(status);

-- Índice para buscar comandas por mesa (ex: WHERE mesa = 5)
CREATE INDEX IF NOT EXISTS idx_comandas_mesa ON comandas(mesa);

-- Índice composto para buscar por mesa E status juntos
-- Útil para queries como: SELECT * FROM comandas WHERE mesa = 5 AND status = 'pendente'
CREATE INDEX IF NOT EXISTS idx_comandas_mesa_status ON comandas(mesa, status);

-- ==========================================================
-- ✅ VERIFICAÇÃO
-- ==========================================================
-- Comentários SQL que ajudam a validar a criação das tabelas
-- ==========================================================

-- Listar todas as tabelas criadas
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verificar estrutura da tabela cardapio
-- \d cardapio

-- Verificar estrutura da tabela comandas
-- \d comandas

-- Verificar índices criados
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
