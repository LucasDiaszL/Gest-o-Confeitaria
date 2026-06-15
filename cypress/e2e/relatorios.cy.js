describe('Fluxo de Relatório Financeiro: Pesquisa Automatizada', () => {
  it('deve acessar o relatório, pesquisar faturamento e validar os dados na tela', () => {

    const TERMO_PESQUISA = 'brigadeiro'; // Pode ser o nome do doce, do cliente ou uma data

    cy.visit('https://gest-o-confeitaria.vercel.app')

    // ==========================================
    // LOGIN E MFA
    // ==========================================
    cy.get('input[type="email"]').type('admin@docecontrole.com', { delay: 100 })
    cy.get('input[type="password"]').type('senha123', { delay: 100 })
    cy.wait(500)
    cy.contains('Entrar').click()

    cy.contains('Autenticação 2FA')
    cy.pause() // Interação manual para o MFA

    cy.contains('Sincronizar Cloud', { timeout: 20000 })
    cy.wait(2000) // Pausa dramática para a banca ver a tela inicial

    // ==========================================
    // 1. NAVEGAR PARA O RELATÓRIO FINANCEIRO
    // ==========================================
    // Clica na aba Relatórios na Sidebar
    cy.contains('Relatórios').click() 
    cy.wait(1500) // Deixa a tela de gráficos/relatórios carregar

    // ==========================================
    // 2. PESQUISA AUTOMATIZADA
    // ==========================================
    // ⚠️ ATENÇÃO: Se a tua barra de pesquisa nos relatórios tiver outro placeholder, altera aqui!
    cy.get('input[placeholder*="Buscar"], input[placeholder*="Pesquisar"]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .clear()
      .type(TERMO_PESQUISA, { delay: 100 }) // O robô digita lentamente
    
    cy.wait(2000) // Deixa a banca ver o relatório a ser filtrado em tempo real

    // ==========================================
    // 3. PROVA DE SUCESSO: VALIDAÇÃO DOS DADOS
    // ==========================================
    // Garante que o termo pesquisado apareceu na tabela ou lista de vendas
    cy.contains(TERMO_PESQUISA, { matchCase: false, timeout: 10000 }).should('be.visible')

    // Garante que existe algum valor financeiro sendo exibido (o "R$")
    cy.contains('R$').should('be.visible')

    // Grande pausa final para os professores admirarem o Dashboard Filtrado
    cy.wait(4000) 
    
    cy.log('✅ SUCESSO DO TESTE: A pesquisa automatizada do Relatório Financeiro funciona perfeitamente!');
  })
})