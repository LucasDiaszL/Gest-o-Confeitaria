describe('Fluxo de venda automatizado', () => {

  it('deve realizar venda e registrar com sucesso', () => {

    cy.visit('https://gest-o-confeitaria.vercel.app')

    // se tiver login, faz login antes
    // ajustar conforme sua tela

    // garantir que está em vendas
    cy.contains('Frente de Caixa')

    // procurar produto
    cy.get('input[placeholder*="Buscar doce"]')
      .type('Cento de Brigadeiros')

    // clicar em PIX
    cy.contains('PIX')
      .first()
      .click()

    // verificar toast sucesso
    cy.contains('Vendido')

  })

})