describe('Fluxo completo de venda', () => {
  it('deve realizar uma venda com sucesso', () => {

    cy.visit('https://gest-o-confeitaria.vercel.app')

    // LOGIN
    cy.get('input[type="email"]').type('admin@docecontrole.com')
    cy.get('input[type="password"]').type('senha123')
    cy.contains('Entrar').click()

    // MFA
    cy.contains('Autenticação 2FA')
    cy.pause()

    // 🔥 GARANTE QUE ENTROU NA ÁREA LOGADA
    cy.contains('Sincronizar Cloud', { timeout: 20000 })

    // 🔥 AGORA GARANTE ABA VENDAS DE VERDADE
    cy.contains('Catálogo de Doces', { timeout: 20000 })

    // 🔥 INPUT DE PESQUISA
    cy.get('[data-testid="buscar-produto"]', { timeout: 20000 })
      .should('exist')
      .should('be.visible')
      .clear()
      .type('brigadeiro')

    // valida filtro
    cy.contains('brigadeiro', { timeout: 10000 })

    // 🔥 botão PIX (CUIDADO COM CASE)
    cy.get('[data-testid="btn-pix"]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .click()

    // TOAST
    cy.contains('Vendido', { timeout: 10000 })

  })
})