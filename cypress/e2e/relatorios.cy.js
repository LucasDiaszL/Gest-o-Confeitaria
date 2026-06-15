describe('Fluxo de Testes - Tela de Relatórios e Performance', () => {
  const EMAIL = 'admin@docecontrole.com';
  const SENHA = 'senha123';
  const PRODUTO_BUSCA = 'brigadeiro';

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('http://localhost:5173/');

    // Login cadenciado
    cy.get('input[type="email"]').should('be.visible').type(EMAIL, { delay: 50 });
    cy.get('input[type="password"]').should('be.visible').type(SENHA, { delay: 50 });
    cy.contains('Entrar').click();

    cy.contains('Sincronizar Cloud', { timeout: 30000 }).should('be.visible');
    
    cy.wait(2000); 
    cy.contains('Relatórios', { timeout: 15000 }).should('be.visible').click();
  });

  it('Deve validar toda a estrutura dos relatórios e realizar as buscas por período', () => {
    // Espera o esqueleto inicial sumir
    cy.get('div.animate-pulse', { timeout: 30000 }).should('not.exist');
    cy.wait(3000); // Tempo para o estado inicial assentar

    // ==========================================================
    // CENÁRIO 1: TESTANDO NO FILTRO PADRÃO (7 DIAS)
    // ==========================================================
    cy.contains('Performance').should('be.visible');
    cy.get('[data-testid="buscar-relatorio"]', { timeout: 10000 }).should('be.visible');
    
    cy.get('[data-testid="buscar-relatorio"]').clear();
    cy.wait(800); 
    
    // 🔥 VELOCIDADE HUMANA: Digita cada letra com 100ms de intervalo
    cy.get('[data-testid="buscar-relatorio"]').type(PRODUTO_BUSCA, { delay: 100 });
    
    cy.contains('Histórico de Itens Vendidos').should('be.visible');
    cy.wait(3000); // Segura a tela para validação visual

    // ==========================================================
    // CENÁRIO 2: ALTERNANDO PARA O FILTRO "HOJE" + PESQUISA
    // ==========================================================
    cy.contains('Hoje').should('be.visible').click();
    
    // Espera o loading interno sumir
    cy.get('[data-testid="relatorio-loading-state"]', { timeout: 15000 }).should('not.exist');
    cy.wait(3000); // Aguarda o Recharts re-renderizar as barras do gráfico

    cy.get('[data-testid="buscar-relatorio"]').should('be.visible').clear();
    cy.wait(800);
    
    // 🔥 Digita de forma cadenciada novamente
    cy.get('[data-testid="buscar-relatorio"]').type(PRODUTO_BUSCA, { delay: 100 });
    cy.wait(3000); 

    // ==========================================================
    // CENÁRIO 3: ALTERNANDO PARA O FILTRO "30 DIAS" + PESQUISA
    // ==========================================================
    cy.contains('30 Dias').should('be.visible').click();
    
    // Espera o loading interno sumir
    cy.get('[data-testid="relatorio-loading-state"]', { timeout: 15000 }).should('not.exist');
    cy.wait(3000); 

    cy.get('[data-testid="buscar-relatorio"]').should('be.visible').clear();
    cy.wait(800);
    
    // 🔥 Digita compassado pela última vez
    cy.get('[data-testid="buscar-relatorio"]').type(PRODUTO_BUSCA, { delay: 100 });
    
    cy.wait(4000); // Pausa final antes de fechar o navegador
  });
});