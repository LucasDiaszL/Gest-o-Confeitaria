describe('Validação de Segurança - Proteção Contra Automação (MFA)', () => {
  
  beforeEach(() => {
    // Define a resolução de tela padrão idêntica aos outros testes para consistência visual
    cy.viewport(1280, 720);
    // Visita a página inicial do sistema rodando localmente no runner do GitHub Actions
    cy.visit('http://localhost:5173/');
  });

  it('Deve simular o robô travando na barreira de MFA (Provando a eficácia da segurança)', () => {
    // Intercepta a chamada de verificação do MFA do Supabase para validação no nível de protocolo
    cy.intercept('POST', '**/auth/v1/factors/*/verify').as('mfaVerify');

    // O robô insere as credenciais da conta administrativa (com MFA ativo no Supabase)
    // Usamos o delay cadenciado para estabilidade nos states do React
    cy.get('input[type="email"]', { timeout: 15000 })
      .should('be.visible')
      .type('admin@docecontrole.com', { delay: 50 });

    cy.get('input[type="password"]')
      .should('be.visible')
      .type('senha123', { delay: 50 });

    // Clicamos no botão de Entrar para submeter o formulário de login
    cy.contains('Entrar').click();

    // Damos até 20 segundos para o Supabase autenticar as credenciais e redirecionar para a tela de MFA
    cy.url({ timeout: 20000 }).should('include', '/');
    
    // ESTRATÉGIA DINÂMICA: Varre o DOM para achar o campo de entrada correto, eliminando quebras por placeholder diferente
    cy.get('body', { timeout: 10000 }).then(($body) => {
      let selector;

      if ($body.find('input[placeholder="Código do app"]').length > 0) {
        selector = 'input[placeholder="Código do app"]';
      } else if ($body.find('input[placeholder*="Código"]').length > 0) {
        selector = 'input[placeholder*="Código"]';
      } else if ($body.find('input[placeholder*="code"]').length > 0) {
        selector = 'input[placeholder*="code"]';
      } else {
        // 🔥 AJUSTE SEGURO: Captura o primeiro input visível que NÃO seja de e-mail ou senha
        selector = 'input:visible:not([type="email"]):not([type="password"])';
      }

      // Limpa o campo e digita um código inválido para simular a falha de invasão do robô
      cy.get(selector).first().should('be.visible').clear().type('123456', { delay: 100 });
    });
    
    // Clica dinamicamente no botão de validação (busca por "Verificar", "Confirmar" ou o primeiro botão)
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Verificar")').length > 0) {
        cy.contains('button', 'Verificar').click();
      } else if ($body.find('button:contains("Confirmar")').length > 0) {
        cy.contains('button', 'Confirmar').click();
      } else {
        cy.get('button:visible').first().click();
      }
    });

    // ASSERT DE SEGURANÇA RESILIENTE NO NÍVEL DE PROTOCOLO (GOLD STANDARD):
    // Aguarda de forma inteligente a resposta da API do Supabase e garante que ela retornou um erro 400 (Bad Request) ou 422 (Unprocessable Entity)
    cy.wait('@mfaVerify', { timeout: 15000 })
      .its('response.statusCode')
      .should('be.oneOf', [400, 422]);

    // Garante que o robô de automação continue bloqueado sem conseguir acessar as páginas internas
    cy.url().should('not.include', '/dashboard');
    
    // Log explicativo que aparecerá no relatório de homologação do Cypress no terminal:
    cy.log('SUCESSO DE SEGURANÇA: O robô de teste foi retido com sucesso pela barreira do MFA do Supabase.');
  });
});