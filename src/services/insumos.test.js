import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from './supabaseClient'
import { getInsumos, createInsumo, deleteInsumo, registrarPerdaInsumo } from './insumos'

vi.mock('./supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// Cria um mock encadeável do Supabase que resolve com o valor informado.
// Qualquer método da cadeia retorna o próprio objeto (mockReturnThis),
// e ao ser aguardado (await) o objeto resolve com { data, error }.
function criarChain(data = null, error = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
  }
  chain.then = (onFulfilled) => Promise.resolve({ data, error }).then(onFulfilled)
  chain.catch = (onRejected) => Promise.resolve({ data, error }).catch(onRejected)
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-001 — Cadastrar novo insumo com dados válidos
// ---------------------------------------------------------------------------
describe('TC-001 – createInsumo (novo insumo)', () => {
  it('insere o insumo quando o nome ainda não existe no banco', async () => {
    // Arrange
    const novoInsumo = { nome: 'Farinha de Trigo', preco: 5.5, quantidade_atual: 1000, unidade_medida: 'g' }
    const chainBusca = criarChain(null)           // maybeSingle → sem registro existente
    const chainInsert = criarChain([{ id: '1', ...novoInsumo }])
    vi.mocked(supabase.from)
      .mockReturnValueOnce(chainBusca)
      .mockReturnValueOnce(chainInsert)

    // Act
    const result = await createInsumo(novoInsumo)

    // Assert
    expect(chainInsert.insert).toHaveBeenCalledWith([novoInsumo])
    expect(result).toEqual([{ id: '1', ...novoInsumo }])
  })

  it('lança erro quando o Supabase retorna erro no insert', async () => {
    const chainBusca = criarChain(null)
    const chainInsert = criarChain(null, { message: 'Erro de banco' })
    vi.mocked(supabase.from)
      .mockReturnValueOnce(chainBusca)
      .mockReturnValueOnce(chainInsert)

    await expect(createInsumo({ nome: 'Sal', preco: 1 })).rejects.toEqual({ message: 'Erro de banco' })
  })
})

// ---------------------------------------------------------------------------
// TC-002 — Editar insumo existente (lógica de soma de quantidade)
// ---------------------------------------------------------------------------
describe('TC-002 – createInsumo (insumo já existente)', () => {
  it('soma a quantidade ao insumo existente em vez de criar duplicata', async () => {
    // Arrange
    const existente = { id: 'ins-existente', quantidade_atual: 500 }
    const novoInsumo = { nome: 'Farinha', preco: 6, quantidade_atual: 300 }
    const chainBusca = criarChain(existente)
    const chainUpdate = criarChain([{ id: 'ins-existente', quantidade_atual: 800 }])
    vi.mocked(supabase.from)
      .mockReturnValueOnce(chainBusca)
      .mockReturnValueOnce(chainUpdate)

    // Act
    await createInsumo(novoInsumo)

    // Assert — deve somar 500 + 300 = 800
    expect(chainUpdate.update).toHaveBeenCalledWith(
      expect.objectContaining({ quantidade_atual: 800 }),
    )
  })

  it('usa o preço informado ao atualizar o insumo existente', async () => {
    const existente = { id: 'ins-existente', quantidade_atual: 100 }
    const novoInsumo = { nome: 'Açúcar', preco: 4.5, quantidade_atual: 50 }
    const chainBusca = criarChain(existente)
    const chainUpdate = criarChain([])
    vi.mocked(supabase.from)
      .mockReturnValueOnce(chainBusca)
      .mockReturnValueOnce(chainUpdate)

    await createInsumo(novoInsumo)

    expect(chainUpdate.update).toHaveBeenCalledWith(
      expect.objectContaining({ preco: 4.5 }),
    )
  })
})

// ---------------------------------------------------------------------------
// TC-003 — Excluir insumo
// ---------------------------------------------------------------------------
describe('TC-003 – deleteInsumo', () => {
  it('remove o insumo pelo id e retorna true', async () => {
    // Arrange
    const chain = criarChain(null)
    vi.mocked(supabase.from).mockReturnValue(chain)

    // Act
    const result = await deleteInsumo('ins-123')

    // Assert
    expect(supabase.from).toHaveBeenCalledWith('insumos')
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', 'ins-123')
    expect(result).toBe(true)
  })

  it('lança erro quando o Supabase retorna erro no delete', async () => {
    const chain = criarChain(null, { message: 'Insumo não encontrado' })
    vi.mocked(supabase.from).mockReturnValue(chain)

    await expect(deleteInsumo('id-invalido')).rejects.toEqual({ message: 'Insumo não encontrado' })
  })
})

// ---------------------------------------------------------------------------
// TC-005 — Registrar perda de insumo
// ---------------------------------------------------------------------------
describe('TC-005 – registrarPerdaInsumo', () => {
  it('calcula o custo de prejuízo corretamente (custo unitário × quantidade)', async () => {
    // Arrange
    // custo_unitario = preco / quantidade_atual = 10 / 20 = 0.5
    // prejuizo = 0.5 * 5 = 2.5
    const insumo = { id: 'ins-1', preco: 10, quantidade_atual: 20 }
    const chainPerdas = criarChain(null)
    const chainUpdate = criarChain(null)
    vi.mocked(supabase.from)
      .mockReturnValueOnce(chainPerdas)
      .mockReturnValueOnce(chainUpdate)

    // Act
    await registrarPerdaInsumo(insumo, 5, 'Vencimento')

    // Assert
    expect(chainPerdas.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        insumo_id: 'ins-1',
        quantidade_perdida: 5,
        motivo: 'Vencimento',
        custo_prejuizo: 2.5,
      }),
    ])
  })

  it('subtrai a quantidade perdida do estoque atual', async () => {
    // Arrange — estoque: 20 - 5 = 15
    const insumo = { id: 'ins-1', preco: 10, quantidade_atual: 20 }
    const chainPerdas = criarChain(null)
    const chainUpdate = criarChain(null)
    vi.mocked(supabase.from)
      .mockReturnValueOnce(chainPerdas)
      .mockReturnValueOnce(chainUpdate)

    // Act
    await registrarPerdaInsumo(insumo, 5, 'Dano Físico')

    // Assert
    expect(chainUpdate.update).toHaveBeenCalledWith({ quantidade_atual: 15 })
    expect(chainUpdate.eq).toHaveBeenCalledWith('id', 'ins-1')
  })

  it('registra primeiro na tabela perdas depois atualiza insumos', async () => {
    const insumo = { id: 'ins-2', preco: 8, quantidade_atual: 10 }
    const chainPerdas = criarChain(null)
    const chainUpdate = criarChain(null)
    vi.mocked(supabase.from)
      .mockReturnValueOnce(chainPerdas)
      .mockReturnValueOnce(chainUpdate)

    await registrarPerdaInsumo(insumo, 2, 'Erro de Produção')

    const primeiraTabela = vi.mocked(supabase.from).mock.calls[0][0]
    const segundaTabela = vi.mocked(supabase.from).mock.calls[1][0]
    expect(primeiraTabela).toBe('perdas')
    expect(segundaTabela).toBe('insumos')
  })

  it('lança erro quando o insert na tabela perdas falha', async () => {
    const insumo = { id: 'ins-3', preco: 5, quantidade_atual: 10 }
    const chainPerdas = criarChain(null, { message: 'Erro ao inserir perda' })
    vi.mocked(supabase.from).mockReturnValue(chainPerdas)

    await expect(registrarPerdaInsumo(insumo, 1, 'Vencimento')).rejects.toEqual({
      message: 'Erro ao inserir perda',
    })
  })
})

// ---------------------------------------------------------------------------
// getInsumos — busca geral (base para TC-001 / TC-004)
// ---------------------------------------------------------------------------
describe('getInsumos', () => {
  it('retorna lista de insumos ordenada por nome', async () => {
    const lista = [
      { id: '1', nome: 'Açúcar', preco: 3, quantidade_atual: 50 },
      { id: '2', nome: 'Farinha', preco: 5, quantidade_atual: 100 },
    ]
    const chain = criarChain(lista)
    vi.mocked(supabase.from).mockReturnValue(chain)

    const result = await getInsumos()

    expect(supabase.from).toHaveBeenCalledWith('insumos')
    expect(chain.order).toHaveBeenCalledWith('nome', { ascending: true })
    expect(result).toEqual(lista)
  })

  it('lança erro quando o Supabase retorna erro na busca', async () => {
    const chain = criarChain(null, { message: 'Falha na conexão' })
    vi.mocked(supabase.from).mockReturnValue(chain)

    await expect(getInsumos()).rejects.toEqual({ message: 'Falha na conexão' })
  })
})
