import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from './supabaseClient'
import { registrarVenda } from './vendas'

vi.mock('./supabaseClient', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-009 — Registrar venda manual
// ---------------------------------------------------------------------------
describe('TC-009 – registrarVenda', () => {
  it('chama o RPC registrar_venda_completa com os parâmetros corretos', async () => {
    // Arrange
    vi.mocked(supabase.rpc).mockResolvedValue({ data: { ok: true }, error: null })

    // Act
    const result = await registrarVenda('prod-1', 2)

    // Assert
    expect(supabase.rpc).toHaveBeenCalledWith('registrar_venda_completa', {
      p_produto_id: 'prod-1',
      p_quantidade: 2,
    })
    expect(result).toEqual({ success: true, data: { ok: true } })
  })

  it('retorna { success: false } quando o RPC retorna erro', async () => {
    // Arrange — simula falha no RPC (ex: produto sem receita cadastrada)
    const erroRpc = { message: 'Produto não encontrado' }
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: erroRpc })

    // Act
    const result = await registrarVenda('prod-invalido', 1)

    // Assert — não lança exceção; retorna estrutura de falha
    expect(result.success).toBe(false)
    expect(result.error).toEqual(erroRpc)
  })

  it('passa a quantidade corretamente para o RPC', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null })

    await registrarVenda('prod-abc', 5)

    expect(supabase.rpc).toHaveBeenCalledWith(
      'registrar_venda_completa',
      expect.objectContaining({ p_quantidade: 5 }),
    )
  })
})
