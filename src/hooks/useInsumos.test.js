import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useInsumos } from './useInsumos'
import { getInsumos, createInsumo, deleteInsumo } from '../services/insumos'

vi.mock('../services/insumos', () => ({
  getInsumos: vi.fn(),
  createInsumo: vi.fn(),
  deleteInsumo: vi.fn(),
}))

const mockInsumos = [
  { id: '1', nome: 'Farinha', preco: 5, quantidade_atual: 100, estoque_minimo: 5 },
  { id: '2', nome: 'Açúcar', preco: 3, quantidade_atual: 50, estoque_minimo: 5 },
]

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getInsumos).mockResolvedValue(mockInsumos)
})

describe('useInsumos – carregamento inicial', () => {
  it('inicia em estado de loading e carrega os insumos ao montar', async () => {
    // Arrange + Act
    const { result } = renderHook(() => useInsumos())

    expect(result.current.loading).toBe(true)

    // Assert — após resolução da promise
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.insumos).toEqual(mockInsumos)
    expect(getInsumos).toHaveBeenCalledTimes(1)
  })

  it('define error quando getInsumos lança exceção', async () => {
    vi.mocked(getInsumos).mockRejectedValue(new Error('Sem conexão'))

    const { result } = renderHook(() => useInsumos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Sem conexão')
    expect(result.current.insumos).toEqual([])
  })
})

describe('useInsumos – filtro por termoBusca', () => {
  it('retorna todos os insumos quando termoBusca está vazio', async () => {
    const { result } = renderHook(() => useInsumos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.insumos).toHaveLength(2)
  })

  it('filtra insumos pelo nome (case-insensitive)', async () => {
    const { result } = renderHook(() => useInsumos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setTermoBusca('farinha'))

    expect(result.current.insumos).toHaveLength(1)
    expect(result.current.insumos[0].nome).toBe('Farinha')
  })

  it('retorna lista vazia quando nenhum insumo corresponde ao filtro', async () => {
    const { result } = renderHook(() => useInsumos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setTermoBusca('XYZ-inexistente'))

    expect(result.current.insumos).toHaveLength(0)
  })
})

describe('useInsumos – adicionarInsumo', () => {
  it('normaliza o campo preço (com acento) para preco (sem acento) antes de enviar', async () => {
    // Este comportamento garante que o payload enviado ao Supabase use sempre 'preco'
    vi.mocked(createInsumo).mockResolvedValue([{ id: '3', nome: 'Leite' }])

    const { result } = renderHook(() => useInsumos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.adicionarInsumo({ nome: 'Leite', preço: 2.5, quantidade_atual: 10 })
    })

    const payload = vi.mocked(createInsumo).mock.calls[0][0]
    expect(payload).toHaveProperty('preco', 2.5)
    expect(payload).not.toHaveProperty('preço')
  })

  it('retorna { success: true } quando o insumo é adicionado', async () => {
    vi.mocked(createInsumo).mockResolvedValue([{ id: '3' }])

    const { result } = renderHook(() => useInsumos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let res
    await act(async () => {
      res = await result.current.adicionarInsumo({ nome: 'Leite', preco: 2 })
    })

    expect(res.success).toBe(true)
  })

  it('retorna { success: false } quando createInsumo lança exceção', async () => {
    vi.mocked(createInsumo).mockRejectedValue(new Error('Erro de inserção'))

    const { result } = renderHook(() => useInsumos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let res
    await act(async () => {
      res = await result.current.adicionarInsumo({ nome: 'Leite', preco: 2 })
    })

    expect(res.success).toBe(false)
    expect(res.error).toBe('Erro de inserção')
  })

  it('recarrega a lista de insumos após adicionar', async () => {
    vi.mocked(createInsumo).mockResolvedValue([{ id: '3' }])

    const { result } = renderHook(() => useInsumos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.adicionarInsumo({ nome: 'Leite', preco: 2 })
    })

    // chamada inicial (mount) + chamada após adicionar
    expect(getInsumos).toHaveBeenCalledTimes(2)
  })
})

describe('useInsumos – excluirInsumo', () => {
  it('chama deleteInsumo com o id correto e retorna { success: true }', async () => {
    vi.mocked(deleteInsumo).mockResolvedValue(true)

    const { result } = renderHook(() => useInsumos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let res
    await act(async () => {
      res = await result.current.excluirInsumo('1')
    })

    expect(deleteInsumo).toHaveBeenCalledWith('1')
    expect(res.success).toBe(true)
  })

  it('recarrega a lista após excluir', async () => {
    vi.mocked(deleteInsumo).mockResolvedValue(true)

    const { result } = renderHook(() => useInsumos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.excluirInsumo('1')
    })

    expect(getInsumos).toHaveBeenCalledTimes(2)
  })

  it('retorna { success: false } quando deleteInsumo lança exceção', async () => {
    vi.mocked(deleteInsumo).mockRejectedValue(new Error('Sem permissão'))

    const { result } = renderHook(() => useInsumos())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let res
    await act(async () => {
      res = await result.current.excluirInsumo('99')
    })

    expect(res.success).toBe(false)
  })
})
