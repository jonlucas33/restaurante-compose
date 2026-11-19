-- ==========================================================
-- 🥫 DESPENSA (PostgreSQL) - 02: CARGA INICIAL (SEED)
-- ==========================================================
-- Abastece a despensa com os primeiros ingredientes:
-- 6 pratos no cardápio e 3 comandas de exemplo.
--
-- Gerado a partir de cardapio.mock.js e comandas.mock.js
-- do projeto original (restaurante-api-demo).
--
-- Roda logo depois do 01-schema.sql, só na primeira subida
-- (volume vazio).
-- ==========================================================

-- ---------- CARDÁPIO ----------
-- O id é gerado sozinho (SERIAL): 1, 2, 3...
INSERT INTO cardapio (nome, preco, descricao) VALUES
  ('Prato Feito',          13.00, 'Arroz, feijão, bife e salada'),
  ('Suco de Laranja',       8.00, 'Suco natural 500ml'),
  ('Hambúrguer Artesanal', 35.00, 'Pão, carne 180g, queijo e batata'),
  ('Pizza Margherita',     40.00, 'Pizza tradicional italiana'),
  ('Refrigerante',          7.00, 'Lata 350ml'),
  ('Doce',                  7.00, 'Sobremesa do dia');

-- ---------- COMANDAS ----------
-- A coluna "itens" é JSONB: guardamos a lista de itens do pedido
-- como JSON dentro de uma única coluna.
INSERT INTO comandas (mesa, status, itens, total) VALUES
  (5, 'pendente',
   '[{"id": 1, "nome": "Prato Feito", "quantidade": 2, "preco_unitario": 13.00, "subtotal": 26.00},
     {"id": 2, "nome": "Suco de Laranja", "quantidade": 2, "preco_unitario": 8.00, "subtotal": 16.00}]',
   42.00),
  (8, 'em_preparo',
   '[{"id": 3, "nome": "Hambúrguer Artesanal", "quantidade": 1, "preco_unitario": 35.00, "subtotal": 35.00},
     {"id": 5, "nome": "Refrigerante", "quantidade": 1, "preco_unitario": 7.00, "subtotal": 7.00}]',
   42.00),
  (12, 'pronto',
   '[{"id": 4, "nome": "Pizza Margherita", "quantidade": 1, "preco_unitario": 40.00, "subtotal": 40.00},
     {"id": 2, "nome": "Suco de Laranja", "quantidade": 3, "preco_unitario": 8.00, "subtotal": 24.00},
     {"id": 6, "nome": "Doce", "quantidade": 2, "preco_unitario": 7.00, "subtotal": 14.00}]',
   78.00);
