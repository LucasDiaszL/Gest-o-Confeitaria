import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from './supabaseClient'
import { getItensReceita, addItemReceita, deleteItemReceita } from './receitas'

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
  }
  chain.then = (onFulfilled) => Promise.resolve({ data, error }).then(onFulfilled)
  chain.catch = (onRejected) => Promise.resolve({ data, error }).catch(onRejected)
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-007 — Montar ficha técnica (adicionar ingrediente na receita)
// ---------------------------------------------------------------------------
describe('TC-007 – addItemReceita', () => {
  it('insere o ingrediente na tabela ingredientes_produto e retorna o item criado', async () => {
    // Arrange
    const novoItem = { produto_id: 'prod-1', insumo_id: 'ins-1', quantidade_utilizada: 200 }
    const itemSalvo = { id: 'item-1', ...novoItem }
    const chain = criarChain([itemSalvo])
    vi.mocked(supabase.from).mockReturnValue(chain)

    // Act
    const result = await addItemReceita(novoItem)

    // Assert
    expect(supabase.from).toHaveBeenCalledWith('ingredientes_produto')
    expect(chain.insert).toHaveBeenCalledWith([
      {
        produto_id: novoItem.produto_id,
        insumo_id: novoItem.insumo_id,
        quantidade_utilizada: novoItem.quantidade_utilizada,
      },
    ])
    expect(result).toEqual(itemSalvo)
  })

  it('lança erro quando o insert falha', async () => {
    const chain = criarChain(null, { message: 'Violação de FK' })
    vi.mocked(supabase.from).mockReturnValue(chain)

    await expect(
      addItemReceita({ produto_id: 'p1', insumo_id: 'i-invalido', quantidade_utilizada: 10 }),
    ).rejects.toEqual({ message: 'Violação de FK' })
  })
})

// ---------------------------------------------------------------------------
// TC-008 — Remover ingrediente da ficha técnica
// ---------------------------------------------------------------------------
describe('TC-008 – deleteItemReceita', () => {
  it('remove o item da receita pelo id e retorna true', async () => {
    // Arrange
    const chain = criarChain(null)
    vi.mocked(supabase.from).mockReturnValue(chain)

    // Act
    const result = await deleteItemReceita('item-99')

    // Assert
    expect(supabase.from).toHaveBeenCalledWith('ingredientes_produto')
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', 'item-99')
    expect(result).toBe(true)
  })

  it('lança erro quando o delete falha', async () => {
    const chain = criarChain(null, { message: 'Item não encontrado' })
    vi.mocked(supabase.from).mockReturnValue(chain)

    await expect(deleteItemReceita('id-invalido')).rejects.toEqual({
      message: 'Item não encontrado',
    })
  })
})

// ---------------------------------------------------------------------------
// getItensReceita — busca ingredientes da receita de um produto
// ---------------------------------------------------------------------------
describe('getItensReceita', () => {
  it('retorna os itens da receita filtrados pelo produto_id', async () => {
    const itens = [
      { id: 'item-1', quantidade_utilizada: 200, insumos: { nome: 'Farinha', unidade_medida: 'g' } },
    ]
    const chain = criarChain(itens)
    vi.mocked(supabase.from).mockReturnValue(chain)

    const result = await getItensReceita('prod-1')

    expect(chain.eq).toHaveBeenCalledWith('produto_id', 'prod-1')
    expect(result).toEqual(itens)
  })

  it('retorna array vazio quando ocorre erro na busca', async () => {
    const chain = criarChain(null, { message: 'Erro' })
    vi.mocked(supabase.from).mockReturnValue(chain)

    const result = await getItensReceita('prod-x')

    expect(result).toEqual([])
  })
})
