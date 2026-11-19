# 🍽️ Restaurante Compose

Aplicação com **múltiplos serviços** usando **Docker Compose** e **PostgreSQL**.

Pense num restaurante:

| Peça do restaurante | Serviço | O que faz |
|---|---|---|
| 🪑 Salão | `frontend` | Tela React (servida pelo Nginx) onde o cliente faz o pedido |
| 👨‍🍳 Cozinha | `backend` | API Node.js + Express que recebe e prepara os pedidos |
| 🥫 Despensa | `db` | Banco PostgreSQL que guarda cardápio e comandas |
| 📋 Gerência | `adminer` | Interface web para conferir a despensa |
| 🧊 Freezer | volume `pgdata` | Onde os dados ficam guardados mesmo se o container for apagado |

## Serviços e portas

| Serviço | Imagem / Build | Porta no seu PC | Porta no container | Depende de |
|---|---|---|---|---|
| `frontend` | `./frontend` (Node → Nginx) | **8080** | 80 | backend |
| `backend` | `./backend` (Node 22) | **4000** | 4000 | db (healthy) |
| `db` | `postgres:16-alpine` | — (não exposto) | 5432 | — |
| `adminer` | `adminer` | **8081** | 8080 | db |

```
Navegador ──► :8080 Nginx (salão) ──/api──► backend:4000 (cozinha) ──► db:5432 (despensa)
                                                                          │
Navegador ──► :8081 Adminer (gerência) ───────────────────────────────────┘
```

## Como rodar

Pré-requisito: **Docker Desktop** aberto (com o Docker Compose v2).

```bash
# 1ª vez: crie o seu .env a partir do modelo (credenciais do banco)
copy .env.example .env      # Windows (Prompt/PowerShell)
# cp .env.example .env      # Linux/macOS/Git Bash

# Constrói as imagens e sobe tudo em segundo plano
docker compose up -d --build

# Confere se está tudo de pé (o db deve aparecer como "healthy")
docker compose ps
```

Depois abra:

- Salão (front-end): <http://localhost:8080>
- Cozinha (API): <http://localhost:4000/health>
- Gerência (Adminer): <http://localhost:8081>

### Credenciais do Adminer

| Campo | Valor |
|---|---|
| Sistema | **PostgreSQL** |
| Servidor | **db** (nome do serviço, não "localhost") |
| Usuário | **senai** |
| Senha | **senai** |
| Base de dados | **restaurante** |

> Estes são os valores do `.env.example`. As credenciais ficam no `.env` (fora do Git) e o Compose as lê automaticamente; se você trocar no seu `.env`, use os novos valores aqui. Para conferir a substituição: `docker compose config`.

## Endpoints da API

| Método | Rota | O que faz | Corpo (JSON) |
|---|---|---|---|
| GET | `/health` | A cozinha fala com a despensa? (`SELECT 1`) | — |
| GET | `/api/cardapio` | Lista o cardápio | — |
| GET | `/api/cardapio/:id` | Busca um prato | — |
| POST | `/api/cardapio` | Cria um prato | `{ "nome", "preco", "descricao" }` |
| PUT | `/api/cardapio/:id` | Atualiza um prato | `{ "nome", "preco", "descricao" }` |
| DELETE | `/api/cardapio/:id` | Remove um prato | — |
| GET | `/api/comandas` | Lista os pedidos (mais novo primeiro) | — |
| GET | `/api/comandas/:id` | Busca um pedido | — |
| GET | `/api/comandas/mesa/:numeroMesa` | Pedidos de uma mesa | — |
| POST | `/api/comandas` | Cria um pedido | `{ "mesa": 3, "itens": [1, 2], "total": 21 }` |
| PATCH | `/api/comandas/:id` | Muda o status | `{ "status": "em_preparo" }` |
| DELETE | `/api/comandas/:id` | Cancela (apaga) um pedido | — |

Status válidos: `pendente`, `em_preparo`, `pronto`, `entregue`, `cancelado`.

### Testando no terminal

> **Windows:** no PowerShell, `curl` é um apelido de outro comando. Use **`curl.exe`** ou a extensão **Thunder Client** do VS Code.

```bash
curl.exe http://localhost:4000/health
curl.exe http://localhost:4000/api/cardapio

# Criar um prato (Windows PowerShell 5.1: aspas simples por fora e \" por dentro;
# no PowerShell 7.3+ use o JSON sem as barras: '{"nome":"Feijoada",...}')
curl.exe -X POST http://localhost:4000/api/cardapio -H "Content-Type: application/json" -d '{\"nome\":\"Feijoada\",\"preco\":32.5,\"descricao\":\"Sábado\"}'

# Criar uma comanda
curl.exe -X POST http://localhost:4000/api/comandas -H "Content-Type: application/json" -d '{\"mesa\":3,\"itens\":[1,2],\"total\":21}'
```

No Git Bash / Linux / macOS, as aspas internas não precisam de `\`:

```bash
curl -X POST http://localhost:4000/api/comandas -H "Content-Type: application/json" -d '{"mesa":3,"itens":[1,2],"total":21}'
```

## Persistência (o freezer)

Os dados do PostgreSQL ficam no **volume** `pgdata`, não dentro do container.

| Comando | Containers | Volume `pgdata` | Resultado |
|---|---|---|---|
| `docker compose down` | apagados | **mantido** | Ao subir de novo, os pedidos continuam lá |
| `docker compose down -v` | apagados | **apagado** | Banco zerado: volta ao cardápio inicial |

⚠️ **Os scripts da pasta `db/` só rodam com o volume vazio.** O PostgreSQL executa `/docker-entrypoint-initdb.d` apenas na primeira inicialização. Se você mudar `01-schema.sql` ou `02-seed.sql`, rode:

```bash
docker compose down -v
docker compose up -d
```

## Comandos úteis

```bash
docker compose ps                    # quem está rodando (e o healthcheck)
docker compose logs -f backend       # logs da cozinha em tempo real
docker compose logs db               # logs da despensa (inclui os scripts db/)
docker compose up -d --build backend # reconstrói só um serviço após mudar o código
docker compose restart backend       # reinicia um serviço
docker compose exec db psql -U senai -d restaurante   # abre o psql dentro do banco
docker compose exec db psql -U senai -d restaurante -c "SELECT * FROM comandas;"
docker compose config                # mostra o compose "resolvido" (valida o YAML)
docker compose down                  # para tudo (mantém os dados)
docker compose down -v               # para tudo e apaga os dados
```

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `failed to connect to the docker API` / `pipe/dockerDesktopLinuxEngine` | Docker Desktop fechado | Abra o Docker Desktop e espere ficar "running" |
| `port is already allocated` (4000, 8080 ou 8081) | Outro programa usando a porta | Feche o programa ou troque a porta da esquerda em `ports:` (ex.: `"8090:80"`) |
| `/health` responde 503 | Backend não alcança o banco | `docker compose ps` (db healthy?) e `docker compose logs db` |
| Tabela não existe / seed não aparece | Volume já tinha dados de antes | `docker compose down -v` e `docker compose up -d` |
| Mudei o código e nada mudou | Imagem antiga | `docker compose up -d --build` |
| Adminer não conecta com "localhost" | Dentro da rede do Compose, o banco se chama `db` | Use **Servidor: db** |
| Salão mostra "A cozinha não respondeu" | Backend parado ou com erro | `docker compose logs backend` |
| `curl` no PowerShell pede parâmetros estranhos | `curl` é apelido de `Invoke-WebRequest` | Use `curl.exe` ou Thunder Client |

## Estrutura

```
restaurante-compose/
├── docker-compose.yml       # orquestra os 4 serviços
├── db/
│   ├── 01-schema.sql        # cria as tabelas cardapio e comandas
│   └── 02-seed.sql          # 6 pratos e 3 comandas de exemplo
├── backend/
│   ├── Dockerfile
│   ├── app.js, server.js
│   └── src/
│       ├── routes/api.routes.js
│       ├── controllers/     # cardapio e comandas
│       └── services/database.js   # ÚNICO arquivo que conhece o PostgreSQL
└── frontend/
    ├── Dockerfile           # multi-stage: Node (build) → Nginx
    ├── nginx.conf           # serve o React e faz proxy de /api → backend:4000
    └── src/                 # App.jsx, PainelCozinha.jsx, services/api.js
```

---

## 📝 Atividade de casa: Reservas

Adicione ao restaurante um sistema de **reservas de mesa**.

1. **Banco:** crie `db/03-reservas.sql` com a tabela `reservas`:

   | Coluna | Tipo sugerido |
   |---|---|
   | `id` | `SERIAL PRIMARY KEY` |
   | `nome_cliente` | `VARCHAR(100) NOT NULL` |
   | `mesa` | `INTEGER NOT NULL CHECK (mesa > 0)` |
   | `data_hora` | `TIMESTAMP NOT NULL` |
   | `pessoas` | `INTEGER NOT NULL CHECK (pessoas > 0)` |
   | `criado_em` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` |

   Lembre: o script só roda com o volume vazio (`docker compose down -v`).

2. **API:** crie `reservas.controller.js` e as rotas:
   - `GET /api/reservas`: lista as reservas;
   - `POST /api/reservas`: cria uma reserva (valide os campos obrigatórios e devolva `201`).

3. **Prove a persistência:** crie uma reserva, rode `docker compose down` e depois `docker compose up -d`, e mostre que ela continua lá.

4. **Entregue:**
   - o link do seu repositório;
   - um print do `docker compose ps` com tudo rodando (db `healthy`);
   - um print da consulta `SELECT * FROM reservas;` no Adminer.

### ⭐ Bônus

- Troque a senha do banco no seu `.env`, recrie tudo com `docker compose down -v` + `docker compose up -d --build` e entre no Adminer com a senha nova (o volume precisa ser apagado: o PostgreSQL só aplica a senha ao criar o banco).
- Crie uma tela de reservas no front-end (formulário + lista).
