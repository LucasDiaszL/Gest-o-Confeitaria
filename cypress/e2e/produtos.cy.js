describe('Busca de produtos', () => {

  it('deve pesquisar um produto', () => {

    cy.visit('http://localhost:5173')

    // entrar na tela de produtos (ajusta se tiver menu)
    cy.contains('Produtos').click()

    // digitar busca
    cy.get('input[placeholder*="procurando"]')
      .type('chocolate')

    // verificar se apareceu produto
    cy.contains('chocolate')

  })

})