# 🧁 Doce Controle

> Sistema de gestão operacional e financeira para confeitarias independentes.

O **Doce Controle** foi desenvolvido para auxiliar confeiteiras autônomas no gerenciamento de estoque, vendas, custos e análise financeira, permitindo maior controle operacional e cálculo de lucro real.

---

## 🚀 Tecnologias Utilizadas

<div align="center">

React • Vite • Tailwind CSS • Supabase • JavaScript

</div>

- **Frontend:** React + Vite
- **Estilização:** Tailwind CSS
- **Banco de dados:** Supabase
- **Gerenciamento de estado:** Hooks React
- **Versionamento:** Git + GitHub

---

## 👥 Integrantes

| Integrante | Responsabilidade |
|---|---|
| Lucas Jorge | Líder Técnico, Engenharia de Software, Banco de Dados e Desenvolvimento Frontend |
| Letícia Rohod | Gestão de Produto, Levantamento de Requisitos, UI/UX e Regras de Negócio |

---

## 🎯 Objetivo do MVP

O projeto busca resolver dificuldades comuns enfrentadas por confeitarias independentes:

- Controle manual de estoque
- Dificuldade em calcular lucro real
- Falta de acompanhamento de perdas
- Ausência de indicadores financeiros

---

## 🔄 Fluxo Principal do Sistema

```text
Cadastro de Insumo
        ↓
Ficha Técnica
        ↓
Produção
        ↓
Venda
        ↓
Baixa automática do estoque
        ↓
Cálculo do Lucro Real
        ↓
Relatórios Financeiros
```

Este fluxo representa o eixo central do MVP e conecta a operação ao resultado financeiro.

---

## 📷 Demonstração do Sistema

### Login

<img width="800" src="./src/assets/login.png"/>

### Estoque

<img width="800" src="./src/assets/gest-o-confeitaria - Opera 2026-05-25 16-09-57.gif"/>

### Frente de Caixa

<img width="800" src="./src/assets/pdv.png"/>

### Relatórios

<img width="800" src="./src/assets/relatorios.png"/>

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: insumos

| Campo | Tipo |
|---|---|
| id | UUID |
| nome | TEXT |
| quantidade_atual | NUMERIC |
| preco | NUMERIC |

Responsável pelo armazenamento dos ingredientes e controle do estoque.

---

### Tabela: produtos

| Campo | Tipo |
|---|---|
| id | UUID |
| nome | TEXT |
| preco_venda | NUMERIC |

Armazena produtos disponíveis para venda.

---

### Tabela: ingredientes_produto

Tabela responsável pela ficha técnica.

| Campo | Tipo |
|---|---|
| produto_id | UUID |
| insumo_id | UUID |
| quantidade_utilizada | NUMERIC |

---

### Tabela: vendas

| Campo | Tipo |
|---|---|
| id | BIGINT |
| produto_id | UUID |
| quantidade | INTEGER |
| total | NUMERIC |

---

### Tabela: perdas

| Campo | Tipo |
|---|---|
| id | BIGINT |
| insumo_id | UUID |
| quantidade_perdida | NUMERIC |
| custo_prejuizo | NUMERIC |

---

## 📈 Regras de Negócio

### CMV (Custo da Mercadoria Vendida)

O lucro real não considera apenas o valor vendido.

Fórmula:

```text
Lucro Real = Total Vendido − Σ(Quantidade Utilizada × Preço do Insumo)
```

---

### Controle de Perdas

Sempre que uma perda é registrada:

- o estoque é atualizado;
- o prejuízo é calculado;
- o impacto financeiro é registrado;
- relatórios são atualizados.

---

## 🧪 Plano de Testes

| Módulo | Cenário | Resultado |
|---|---|---|
| Estoque | Cadastro de ingrediente | ✅ Aprovado |
| Frente de Caixa | Registro de venda | ✅ Aprovado |
| Perdas | Registro de descarte | ✅ Aprovado |
| Relatórios | Atualização financeira | ✅ Aprovado |

---

## 📁 Estrutura do Projeto

```bash
src/
├── components/
├── hooks/
├── pages/
├── services/
├── assets/
└── supabase/
```

---

## ⚙️ Configuração do Ambiente

### 1 — Clone o projeto

```bash
git clone URL_DO_REPOSITORIO
```

### 2 — Instale dependências

```bash
npm install
```

### 3 — Configure o arquivo `.env`

```env
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave
```

### 4 — Execute o projeto

```bash
npm run dev
```

---

## 📌 Próximas melhorias

- [ ] Dashboard financeiro avançado
- [ ] Relatórios PDF
- [ ] Controle de metas
- [ ] Histórico de produção
- [ ] Notificações de estoque baixo

---

## 📄 Licença

Projeto acadêmico desenvolvido para fins educacionais.
