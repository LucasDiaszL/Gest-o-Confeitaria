describe('Fluxo completo de venda', () => {
  it('deve realizar uma venda com sucesso', () => {

    // abre aplicação no Vercel
    cy.visit('https://gest-o-confeitaria.vercel.app')

    // ===== LOGIN =====
    cy.get('input[type="email"]')
      .type('admin@docecontrole.com')

    cy.get('input[type="password"]')
      .type('senha123')

    cy.contains('Entrar').click()

    // ===== MFA =====
    cy.contains('Autenticação 2FA')

    // pausa para você digitar o código manualmente
    cy.pause()

    // ===== VALIDAR ENTRADA NO SISTEMA =====
    cy.contains('Frente de Caixa', { timeout: 10000 })

    // ===== BUSCAR PRODUTO =====
    cy.get('[data-testid="buscar-produto"]')
      .type('brigadeiro')

    // espera aparecer produto
    cy.wait(2000)

    // ===== REALIZAR VENDA =====
    cy.get('[data-testid="btn-PIX"]')
      .first()
      .click()

    // ===== VALIDAR SUCESSO =====
    cy.contains('Vendido', { timeout: 5000 })

  })
})