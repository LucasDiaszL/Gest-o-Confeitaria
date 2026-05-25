## 📋 Diagrama e Casos de Uso (Mapeamento Operacional)

O escopo do MVP foi delimitado sob o padrão de Casos de Uso para garantir a consistência das transações e integridade das regras de negócio (persistência e baixa de inventário).

### 👥 Atores do Sistema
* **Administrador (Proprietária):** Possui privilégios totais (CRUD de insumos, produtos, visualização de relatórios financeiros, cálculo de lucro e gestão de acessos).
* **Funcionário:** Possui privilégios operacionais restringidos (Visualização da Agenda de encomendas e operação básica do Frente de Caixa/PDV).

---

### 📝 Especificação Técnica dos Casos de Uso

#### **UC01: Registrar Venda Manual (Frente de Caixa)**
* **Ator Principal:** Administrador / Funcionário.
* **Pré-condições:** O produto selecionado deve estar cadastrado e com seus respectivos ingredientes vinculados na Ficha Técnica (`ingredientes_produto`).
* **Fluxo Principal:**
  1. O usuário acessa a aba "Frente de Caixa".
  2. O usuário seleciona o produto (ex: Cupcake) e escolhe a forma de pagamento (Dinheiro, PIX, Débito, Crédito).
  3. O sistema insere um registro na tabela `vendas` contendo o ID do produto, quantidade, método e valor total.
  4. O sistema dispara uma consulta na tabela associativa `ingredientes_produto` para identificar quais insumos compõem aquele item.
  5. Para cada ingrediente localizado, o sistema calcula a diferença e atualiza a coluna `quantidade_atual` na tabela `insumos`.
* **Pós-condições:** Registro de venda persistido e estoque atualizado proporcionalmente de forma automatizada.

#### **UC02: Registrar Perda de Insumo**
* **Ator Principal:** Administrador / Funcionário.
* **Pré-condições:** Insumo previamente existente no banco de dados.
* **Fluxo Principal:**
  1. O usuário acessa o módulo de "Estoque".
  2. Seleciona o insumo danificado/vencido e aciona a opção "Registrar Perda".
  3. O usuário informa a quantidade perdida e a justificativa (Ex: Validade vencida).
  4. O sistema captura o preço unitário de custo do insumo diretamente da tabela `insumos`.
  5. O sistema calcula o impacto financeiro: $Prejuízo = Quantidade \times Preço$.
  6. O sistema persiste a transação na tabela `perdas` e subtrai a quantidade do inventário ativo.
* **Pós-condições:** Estoque corrigido e prejuízo registrado para dedução nos relatórios gerenciais.

#### **UC03: Consolidação de Relatórios (Lucro Real vs. CMV)**
* **Ator Principal:** Administrador (Acesso estritamente bloqueado para o Funcionário).
* **Pré-condições:** Existência de registros de vendas e perdas no período consultado.
* **Fluxo Principal:**
  1. O Administrador acessa a aba "Relatórios".
  2. O sistema recupera a soma da coluna `total` da tabela `vendas` (Faturamento Bruto).
  3. O sistema calcula o custo operacional real varrendo as fichas técnicas dos itens vendidos multiplicados pelo preço de custo histórico dos insumos.
  4. O sistema deduz os valores da tabela `perdas`.
  5. A interface renderiza o gráfico de balanço exibindo a margem real de lucro.
* **Pós-condições:** Exibição clara e auditável da saúde financeira do negócio.