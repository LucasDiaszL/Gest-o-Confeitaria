import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from './Sidebar'

const propsBase = {
  abaAtiva: 'vendas',
  setAbaAtiva: vi.fn(),
  collapsed: false,
  setCollapsed: vi.fn(),
  darkMode: false,
  setDarkMode: vi.fn(),
  insumos: [],
}

// ---------------------------------------------------------------------------
// TC-015 — Alternar modo escuro
// ---------------------------------------------------------------------------
describe('TC-015 – Modo Escuro / Claro', () => {
  it('exibe o botão "Modo Escuro" quando o modo claro está ativo', () => {
    render(<Sidebar {...propsBase} darkMode={false} />)

    expect(screen.getByText(/modo escuro/i)).toBeInTheDocument()
  })

  it('exibe o botão "Modo Claro" quando o modo escuro está ativo', () => {
    render(<Sidebar {...propsBase} darkMode={true} />)

    expect(screen.getByText(/modo claro/i)).toBeInTheDocument()
  })

  it('chama setDarkMode(true) ao clicar no toggle no modo claro', async () => {
    const user = userEvent.setup()
    const setDarkMode = vi.fn()
    render(<Sidebar {...propsBase} darkMode={false} setDarkMode={setDarkMode} />)

    await user.click(screen.getByText(/modo escuro/i))

    expect(setDarkMode).toHaveBeenCalledWith(true)
  })

  it('chama setDarkMode(false) ao clicar no toggle no modo escuro', async () => {
    const user = userEvent.setup()
    const setDarkMode = vi.fn()
    render(<Sidebar {...propsBase} darkMode={true} setDarkMode={setDarkMode} />)

    await user.click(screen.getByText(/modo claro/i))

    expect(setDarkMode).toHaveBeenCalledWith(false)
  })

  it('aplica classe bg-slate-950 na sidebar quando modo escuro está ativo', () => {
    render(<Sidebar {...propsBase} darkMode={true} />)

    const aside = screen.getByRole('complementary')
    expect(aside).toHaveClass('bg-slate-950')
  })

  it('não aplica classe bg-slate-950 na sidebar quando modo claro está ativo', () => {
    render(<Sidebar {...propsBase} darkMode={false} />)

    const aside = screen.getByRole('complementary')
    expect(aside).not.toHaveClass('bg-slate-950')
    expect(aside).toHaveClass('bg-white')
  })

  it('mantém todos os itens de navegação visíveis após alternar o modo', async () => {
    const user = userEvent.setup()
    const setDarkMode = vi.fn()
    render(<Sidebar {...propsBase} darkMode={false} setDarkMode={setDarkMode} />)

    // Verifica menus antes do toggle
    expect(screen.getByText(/vendas/i)).toBeInTheDocument()
    expect(screen.getByText(/estoque/i)).toBeInTheDocument()
    expect(screen.getByText(/produtos/i)).toBeInTheDocument()

    await user.click(screen.getByText(/modo escuro/i))

    // setDarkMode é chamado; a reexibição depende do pai (App), mas
    // os itens do menu continuam presentes na sidebar renderizada
    expect(screen.getByText(/vendas/i)).toBeInTheDocument()
    expect(screen.getByText(/estoque/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Sidebar – indicador de alerta de estoque crítico
// ---------------------------------------------------------------------------
describe('Sidebar – alerta de insumos críticos', () => {
  const insumosCriticos = [
    { id: '1', nome: 'Farinha', quantidade_atual: 1, estoque_minimo: 5, data_validade: null, unidade_medida: 'g' },
    { id: '2', nome: 'Leite', quantidade_atual: 50, estoque_minimo: 5, data_validade: '2000-01-01', unidade_medida: 'ml' },
  ]

  it('exibe botão de reposição urgente quando há insumos críticos', () => {
    render(<Sidebar {...propsBase} insumos={insumosCriticos} />)

    expect(screen.getByText(/reposição urgente/i)).toBeInTheDocument()
  })

  it('exibe a contagem correta de itens críticos', () => {
    render(<Sidebar {...propsBase} insumos={insumosCriticos} />)

    expect(screen.getByText(/2 itens/i)).toBeInTheDocument()
  })

  it('não exibe botão de reposição quando não há insumos críticos', () => {
    render(<Sidebar {...propsBase} insumos={[]} />)

    expect(screen.queryByText(/reposição urgente/i)).not.toBeInTheDocument()
  })
})
