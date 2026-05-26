import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Estoque } from './Estoque'

// Insumos usados nos testes
const INSUMO_NORMAL = {
  id: '2',
  nome: 'Açúcar',
  preco: 4,
  quantidade_atual: 20,
  estoque_minimo: 5,
  data_validade: null,
  unidade_medida: 'g',
}

const INSUMO_BAIXO_ESTOQUE = {
  id: '1',
  nome: 'Farinha',
  preco: 5,
  quantidade_atual: 2,  // 2 <= estoque_minimo (5) → crítico
  estoque_minimo: 5,
  data_validade: null,
  unidade_medida: 'g',
}

const INSUMO_VENCIDO = {
  id: '3',
  nome: 'Leite',
  preco: 3,
  quantidade_atual: 50,
  estoque_minimo: 5,
  data_validade: '2000-01-01',  // sempre no passado → crítico
  unidade_medida: 'ml',
}

const mockProps = {
  insumos: [INSUMO_BAIXO_ESTOQUE, INSUMO_NORMAL, INSUMO_VENCIDO],
  loading: false,
  funcaoExcluir: vi.fn(),
  funcaoEditar: vi.fn(),
  darkMode: false,
  registrarPerdaInsumo: vi.fn(),
  recarregarIns: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// TC-004 — Filtrar insumos críticos
// ---------------------------------------------------------------------------
describe('TC-004 – Filtrar insumos críticos', () => {
  it('exibe todos os insumos por padrão (sem filtro ativo)', () => {
    render(<Estoque {...mockProps} />)

    expect(screen.getByText(/farinha/i)).toBeInTheDocument()
    expect(screen.getByText(/açúcar/i)).toBeInTheDocument()
    expect(screen.getByText(/leite/i)).toBeInTheDocument()
  })

  it('exibe apenas insumos críticos ao ativar o filtro "Ver Críticos"', async () => {
    const user = userEvent.setup()
    render(<Estoque {...mockProps} />)

    await user.click(screen.getByText(/ver críticos/i))

    // Farinha (baixo estoque) e Leite (vencido) devem aparecer
    expect(screen.getByText(/farinha/i)).toBeInTheDocument()
    expect(screen.getByText(/leite/i)).toBeInTheDocument()
    // Açúcar (normal) não deve aparecer
    expect(screen.queryByText(/açúcar/i)).not.toBeInTheDocument()
  })

  it('item com quantidade ≤ estoque mínimo é tratado como crítico', async () => {
    const user = userEvent.setup()
    render(<Estoque {...mockProps} />)

    await user.click(screen.getByText(/ver críticos/i))

    expect(screen.getByText(/farinha/i)).toBeInTheDocument()
  })

  it('item com data de validade no passado é tratado como crítico', async () => {
    const user = userEvent.setup()
    render(<Estoque {...mockProps} />)

    await user.click(screen.getByText(/ver críticos/i))

    expect(screen.getByText(/leite/i)).toBeInTheDocument()
  })

  it('insumo normal não aparece quando filtro de críticos está ativo', async () => {
    const user = userEvent.setup()
    render(<Estoque {...mockProps} />)

    await user.click(screen.getByText(/ver críticos/i))

    expect(screen.queryByText(/açúcar/i)).not.toBeInTheDocument()
  })

  it('desativa o filtro ao clicar novamente e volta a mostrar todos', async () => {
    const user = userEvent.setup()
    render(<Estoque {...mockProps} />)

    await user.click(screen.getByText(/ver críticos/i))
    await user.click(screen.getByText(/mostrar tudo/i))

    expect(screen.getByText(/açúcar/i)).toBeInTheDocument()
  })

  it('exibe o contador de alertas críticos no dashboard', () => {
    render(<Estoque {...mockProps} />)

    // 2 itens críticos (Farinha + Leite) → label "2 Alertas"
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('busca por nome funciona em conjunto com o filtro de críticos', async () => {
    const user = userEvent.setup()
    render(<Estoque {...mockProps} />)

    await user.type(screen.getByPlaceholderText(/localizar insumo/i), 'farinha')
    await user.click(screen.getByText(/ver críticos/i))

    expect(screen.getByText(/farinha/i)).toBeInTheDocument()
    expect(screen.queryByText(/leite/i)).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TC-014 — Validar campos obrigatórios dos formulários (modal de perda)
// ---------------------------------------------------------------------------
describe('TC-014 – Validar campos obrigatórios (modal de perda)', () => {
  let alertSpy

  beforeEach(() => {
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    alertSpy.mockRestore()
  })

  it('bloqueia a confirmação e exibe alerta quando a quantidade está vazia', async () => {
    const user = userEvent.setup()
    render(<Estoque {...mockProps} />)

    // Abre o modal de perda do primeiro card (Farinha)
    const botoesPerdas = screen.getAllByText('📉')
    await user.click(botoesPerdas[0])

    // Tenta confirmar sem digitar quantidade
    await user.click(screen.getByRole('button', { name: /confirmar/i }))

    expect(alertSpy).toHaveBeenCalledWith('Insira uma quantidade válida.')
    expect(mockProps.registrarPerdaInsumo).not.toHaveBeenCalled()
  })

  it('bloqueia a confirmação quando a quantidade é zero', async () => {
    const user = userEvent.setup()
    render(<Estoque {...mockProps} />)

    const botoesPerdas = screen.getAllByText('📉')
    await user.click(botoesPerdas[0])

    // Digita 0 → inválido
    await user.type(screen.getByPlaceholderText('0.00'), '0')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))

    expect(alertSpy).toHaveBeenCalledWith('Insira uma quantidade válida.')
  })

  it('bloqueia a confirmação quando a quantidade é negativa', async () => {
    const user = userEvent.setup()
    render(<Estoque {...mockProps} />)

    const botoesPerdas = screen.getAllByText('📉')
    await user.click(botoesPerdas[0])

    await user.type(screen.getByPlaceholderText('0.00'), '-5')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))

    expect(alertSpy).toHaveBeenCalledWith('Insira uma quantidade válida.')
  })

  it('chama registrarPerdaInsumo com quantidade e motivo quando dados são válidos', async () => {
    const user = userEvent.setup()
    mockProps.registrarPerdaInsumo.mockResolvedValue()
    render(<Estoque {...mockProps} />)

    const botoesPerdas = screen.getAllByText('📉')
    await user.click(botoesPerdas[0])

    await user.type(screen.getByPlaceholderText('0.00'), '3')
    await user.click(screen.getByRole('button', { name: /confirmar/i }))

    expect(mockProps.registrarPerdaInsumo).toHaveBeenCalledWith(
      INSUMO_BAIXO_ESTOQUE,
      3,
      'Vencimento',
    )
  })

  it('fecha o modal ao clicar em Cancelar', async () => {
    const user = userEvent.setup()
    render(<Estoque {...mockProps} />)

    const botoesPerdas = screen.getAllByText('📉')
    await user.click(botoesPerdas[0])

    expect(screen.getByText(/registrar perda/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.queryByText(/registrar perda/i)).not.toBeInTheDocument()
  })
})
