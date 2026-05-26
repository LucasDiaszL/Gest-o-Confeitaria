import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from './supabaseClient'
import { getProdutos, createProduto, deleteProduto } from './produtos'

vi.mock('./supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

function criarChain(data = null, error = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  }
  chain.then = (onFulfilled) => Promise.resolve({ data, error }).then(onFulfilled)
  chain.catch = (onRejected) => Promise.resolve({ data, error }).catch(onRejected)
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-006 — Cadastrar novo produto
// ---------------------------------------------------------------------------
describe('TC-006 – createProduto', () => {
  it('insere o produto e retorna o registro criado', async () => {
    // Arrange
    const novoProduto = { nome: 'Bolo de Pote', preco_venda: 15.0, custo_total: 7.0 }
    const chain = criarChain([{ id: 'prod-1', ...novoProduto }])
    vi.mocked(supabase.from).mockReturnValue(chain)

    // Act
    const result = await createProduto(novoProduto)

    // Assert
    expect(supabase.from).toHaveBeenCalledWith('produtos')
    expect(chain.insert).toHaveBeenCalledWith([novoProduto])
    expect(result).toEqual([{ id: 'prod-1', ...novoProduto }])
  })

  it('lança erro quando o Supabase retorna erro no insert', async () => {
    const chain = criarChain(null, { message: 'Erro de constraint' })
    vi.mocked(supabase.from).mockReturnValue(chain)

    await expect(createProduto({ nome: 'Brigadeiro' })).rejects.toEqual({
      message: 'Erro de constraint',
    })
  })
})

// ---------------------------------------------------------------------------
// getProdutos — busca geral
// ---------------------------------------------------------------------------
describe('getProdutos', () => {
  it('retorna lista de produtos ordenada por nome', async () => {
    const lista = [
      { id: '1', nome: 'Bolo', preco_venda: 40 },
      { id: '2', nome: 'Trufa', preco_venda: 5 },
    ]
    const chain = criarChain(lista)
    vi.mocked(supabase.from).mockReturnValue(chain)

    const result = await getProdutos()

    expect(chain.order).toHaveBeenCalledWith('nome', { ascending: true })
    expect(result).toEqual(lista)
  })
})

// ---------------------------------------------------------------------------
// deleteProduto
// ---------------------------------------------------------------------------
describe('deleteProduto', () => {
  it('remove o produto pelo id e retorna true', async () => {
    const chain = criarChain(null)
    vi.mocked(supabase.from).mockReturnValue(chain)

    const result = await deleteProduto('prod-99')

    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', 'prod-99')
    expect(result).toBe(true)
  })
})
