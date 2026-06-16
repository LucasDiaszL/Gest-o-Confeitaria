describe('Fluxo completo: Venda e baixa automática de estoque', () => {

  const EMAIL = 'admin@docecontrole.com'
  const SENHA = 'senha123'
  const NOME_DOCE = 'brigadeiro'
  const NOME_INSUMO = 'Leite Condensado'

  beforeEach(() => {
    cy.visit('http://localhost:5173/')

    // =========================
    // LOGIN
    // =========================
    cy.log('Iniciando login...')

    cy.get('input[type="email"]', { timeout: 20000 })
      .should('be.visible')
      .clear()
      .type(EMAIL, { delay: 150 })

    cy.wait(1000)

    cy.get('input[type="password"]')
      .should('be.visible')
      .clear()
      .type(SENHA, { delay: 150 })

    cy.wait(1000)

    cy.contains('Entrar').click()

    cy.contains('Sincronizar Cloud', { timeout: 30000 })
      .should('be.visible')

    cy.log('Login realizado com sucesso')

    // deixa sistema terminar requests
    cy.wait(4000)
  })


  it('deve realizar venda e baixar estoque automaticamente', () => {

    // ============================================
    // IR PARA ESTOQUE
    // ============================================
    cy.log('Abrindo estoque...')

    cy.get('[data-testid="menu-estoque"]', {
      timeout: 20000
    })
      .should('exist')
      .click({ force: true })

    cy.wait(4000)

    // garante cards carregados
    cy.get('[data-testid="insumo-card"]', {
      timeout: 30000
    })
      .should('have.length.at.least', 1)

    cy.log('Pesquisando insumo...')

    // pesquisa insumo visualmente
    cy.get('[data-testid="busca-insumo"]')
      .should('be.visible')
      .clear()
      .type(NOME_INSUMO, { delay: 250 })

    cy.wait(3000)

    cy.contains(/condensado/i, {
      timeout: 30000
    }).should('exist')

    // ============================================
    // CAPTURA ESTOQUE ANTES
    // ============================================
    cy.log('Capturando estoque inicial...')

    cy.contains(/condensado/i)
      .parents('[data-testid="insumo-card"]')
      .find('[data-testid="estoque-quantidade"]')
      .invoke('text')
      .then((textoAntes) => {

        const estoqueAntes = parseFloat(
          textoAntes.trim().replace(',', '.')
        )

        cy.log('Estoque inicial: ' + estoqueAntes)

        cy.wait(3000)

        // ============================================
        // IR PARA VENDAS
        // ============================================
        cy.log('Abrindo vendas...')

        cy.get('[data-testid="menu-vendas"]')
          .click({ force: true })

        cy.wait(3000)

        cy.contains('Catálogo de Doces', {
          timeout: 20000
        }).should('be.visible')

        cy.log('Pesquisando produto...')

        // pesquisa produto visual
        cy.get('[data-testid="buscar-produto"]')
          .should('be.visible')
          .clear()
          .type(NOME_DOCE, { delay: 250 })

        cy.wait(3000)

        cy.contains(/brigadeiro/i, {
          timeout: 10000
        }).should('exist')

        cy.log('Realizando venda...')

        // faz venda
        cy.get('[data-testid="btn-pix"]')
          .eq(0)
          .should('be.visible')
          .click({ force: true })

        cy.contains('Vendido', {
          timeout: 15000
        }).should('be.visible')

        cy.wait(4000)

        // ============================================
        // VOLTA ESTOQUE
        // ============================================
        cy.log('Voltando para estoque...')

        cy.get('[data-testid="menu-estoque"]')
          .click({ force: true })

        cy.wait(4000)

        cy.get('[data-testid="insumo-card"]', {
          timeout: 30000
        })
          .should('have.length.at.least', 1)

        cy.log('Pesquisando novamente o insumo...')

        // pesquisa novamente
        cy.get('[data-testid="busca-insumo"]')
          .clear()
          .type(NOME_INSUMO, { delay: 250 })

        cy.wait(3000)

        // ============================================
        // CAPTURA ESTOQUE FINAL
        // ============================================
        cy.log('Validando estoque final...')

        cy.contains(/condensado/i)
          .parents('[data-testid="insumo-card"]')
          .find('[data-testid="estoque-quantidade"]')
          .invoke('text')
          .then((textoDepois) => {

            const estoqueDepois = parseFloat(
              textoDepois.trim().replace(',', '.')
            )

            cy.log('Estoque final: ' + estoqueDepois)

            expect(estoqueDepois)
              .to.be.lessThan(estoqueAntes)

            cy.log(
              `Sucesso! Estoque caiu de ${estoqueAntes} para ${estoqueDepois}`
            )

            cy.wait(3000)
          })
      })
  })


  it('deve bloquear venda sem ficha técnica', () => {

    cy.log('Abrindo tela de vendas...')

    cy.get('[data-testid="menu-vendas"]')
      .click({ force: true })

    cy.wait(3000)

    cy.contains('Catálogo de Doces', {
      timeout: 20000
    }).should('be.visible')

    cy.log('Pesquisando produto sem receita...')

    cy.get('[data-testid="buscar-produto"]')
      .clear()
      .type('Bolo Formigueiro', { delay: 250 })

    cy.wait(3000)

    cy.contains(/bolo formigueiro/i)
      .should('exist')

    cy.log('Tentando vender produto sem ficha técnica...')

    cy.get('[data-testid="btn-pix"]')
      .eq(0)
      .click({ force: true })

    cy.contains('Cadastre a ficha técnica', {
      timeout: 15000
    }).should('be.visible')

    cy.wait(3000)
  })

})