# 🍰 Doce Controle - Gestão Inteligente para Confeitaria

O **Doce Controle** é uma aplicação web focada em transformar a rotina de confeiteiras independentes. O sistema vai além de um simples PDV, oferecendo inteligência de dados para garantir que cada doce vendido gere lucro real.

## 🚀 Funcionalidades Principais

* **📊 Inteligência de Vendas**: Painel com faturamento bruto, ticket médio e cálculo automático de lucro líquido.
* **📈 Gráficos de Desempenho**: Visualização comparativa entre Vendas vs. Lucro Real para tomada de decisão estratégica.
* **📦 Gestão de Estoque**: Controle de insumos com alertas de reposição e monitoramento de validade.
* **🧁 Ficha Técnica Integrada**: Cálculo automático do custo de produção de cada produto baseado nos preços atuais dos insumos.
* **🌓 Modo Escuro**: Interface adaptativa para maior conforto visual durante longas horas de gestão.

## 🛠️ Tecnologias Utilizadas

* **React + Vite**: Performance e rapidez na interface.
* **Tailwind CSS**: Design moderno, responsivo e "chic".
* **Supabase**: Banco de dados em tempo real e autenticação segura.
* **Recharts**: Gráficos interativos para análise de dados.

## 📈 Como o Lucro é Calculado?

O sistema utiliza uma lógica de **Custo de Mercadoria Vendida (CMV)** automatizada:
1.  O usuário cadastra o insumo (ex: 400g de Granulado por R$ 44,99).
2.  O sistema calcula o preço por grama ($R\$ 0,11/g$).
3.  Ao registrar uma venda, o sistema subtrai o custo proporcional de cada ingrediente do valor total, exibindo o **Lucro Líquido Real**.

---
Desenvolvido com ❤️ para facilitar a vida de quem adoça o mundo.
