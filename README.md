# 🧁 Doce Controle - MVP
> Sistema de gestão operacional e financeira para confeitarias independentes.

---

## 👥 Integrantes e Contribuições
* **Lucas Jorge**: Líder Técnico, Engenharia de Software, Modelagem de Banco de Dados e Desenvolvimento Frontend (React/Vite/Tailwind).
* **Letícia Rohod**: Gestão de Produto, Levantamento de Requisitos, Design de Interface (UI/UX) e Documentação de Regras de Negócio (CMV e Perdas).

---

## 🎯 Proposta de Valor & MVP
O Doce Controle resolve a complexidade operacional de confeiteiras autônomas através de um eixo central de fluxo de valor:
`Cadastro de Insumo ➔ Definição de Ficha Técnica ➔ Registro de Venda ➔ Cálculo de Lucro Real (CMV)`

---

## 🗄️ Modelagem de Dados (Supabase)
Para que o sistema seja auditável, a estrutura de persistência no Supabase segue as seguintes tabelas principais:

### 1. `insumos`
Guarda as matérias-prima e controla o estoque físico.
* `id` (UUID, PK)
* `nome` (TEXT)
* `quantidade_atual` (NUMERIC)
* `preco` (NUMERIC) - *Usado para o cálculo do CMV bruto*

### 2. `produtos`
Registra os produtos acabados disponíveis para o Frente de Caixa (PDV).
* `id` (UUID, PK)
* `nome` (TEXT)
* `preco_venda` (NUMERIC)

### 3. `ingredientes_produto` (Ficha Técnica)
Tabela associativa que relaciona produtos e insumos para dedução automática de estoque e cálculo de custo.
* `id` (BIGINT, PK)
* `produto_id` (UUID, FK ➔ produtos.id)
* `insumo_id` (UUID, FK ➔ insumos.id)
* `quantidade_utilizada` (NUMERIC)

### 4. `vendas`
Registra a saída financeira e aciona a baixa de insumos.
* `id` (BIGINT, PK)
* `produto_id` (UUID, FK ➔ produtos.id)
* `quantidade` (INTEGER)
* `metodo_pagamento` (TEXT)
* `total` (NUMERIC)
* `created_at` (TIMESTAMPTZ)

### 5. `perdas`
Mapeia o prejuízo operacional e o descarte de matéria-prima.
* `id` (BIGINT, PK)
* `insumo_id` (UUID, FK ➔ insumos.id)
* `quantidade_perdida` (NUMERIC)
* `motivo` (TEXT)
* `custo_prejuizo` (NUMERIC)

---

## 📈 Regras de Negócio Críticas

### 🪙 Custo de Mercadoria Vendida (CMV) & Lucro Real
O cálculo do lucro real exibido na aba de `Relatórios` não considera apenas o faturamento bruto. O sistema deduz o custo dos insumos baseando-se na tabela `ingredientes_produto`:
$$\text{Lucro Real} = \text{Total Vendido} - \sum (\text{Quantidade Utilizada} \times \text{Preço do Insumo})$$

### 🗑️ Fluxo de Perdas
Quando uma perda é registrada na aba de `Estoque`, o sistema calcula o impacto financeiro direto com base no preço de custo do insumo, lançando o valor na tabela de `perdas` para que o gráfico de saúde financeira do negócio seja atualizado negativamente.

---

## 🧪 Plano de Validação e Testes Manuais
Como o MVP utiliza validação manual homologada, os módulos foram testados conforme o checklist abaixo:

| Módulo | Cenário de Teste | Resultado Esperado | Status |
| :--- | :--- | :--- | :--- |
| **Estoque** | Cadastro de 1kg de Farinha de Trigo | Persistência correta no Supabase com Toast de sucesso. | ✅ Passou |
| **Frente de Caixa**| Venda manual de 1 Unidade de Cupcake | Inserção em `vendas` e decréscimo automático nos insumos da receita. | ✅ Passou |
| **Perdas** | Registrar perda de 200g de Chocolate por validade | Atualização imediata do estoque atual e cálculo do prejuízo em `perdas`. | ✅ Passou |

---

## 🛠️ Instruções de Setup e Execução

### 1. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as credenciais do seu Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase

2. Executando o Projeto Localmente
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev
