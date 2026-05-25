# Banco de Dados

## Objetivo

A modelagem foi desenvolvida para garantir controle operacional, rastreabilidade financeira e cálculo automático do lucro real.

---

## Entidades principais

### insumos

| Campo | Tipo |
|---|---|
| id | UUID |
| nome | TEXT |
| quantidade_atual | NUMERIC |
| preco | NUMERIC |

Função:
Armazenar ingredientes e controlar estoque.

---

### produtos

| Campo | Tipo |
|---|---|
| id | UUID |
| nome | TEXT |
| preco_venda | NUMERIC |

Função:
Armazenar produtos disponíveis.

---

### ingredientes_produto

| Campo | Tipo |
|---|---|
| produto_id | UUID |
| insumo_id | UUID |
| quantidade_utilizada | NUMERIC |

Função:
Representar ficha técnica.

---

### vendas

| Campo | Tipo |
|---|---|
| id | BIGINT |
| produto_id | UUID |
| quantidade | INTEGER |
| total | NUMERIC |

---

### perdas

| Campo | Tipo |
|---|---|
| id | BIGINT |
| insumo_id | UUID |
| quantidade_perdida | NUMERIC |
| custo_prejuizo | NUMERIC |

---

## Relacionamento

insumos
    ↓
ingredientes_produto
    ↓
produtos
    ↓
vendas
    ↓
relatórios