import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SimuladorReajuste } from './SimuladorReajuste'

// Massa de dados controlada para cálculos determinísticos
const insumos = [{ id: 'ins-1', nome: 'Farinha', preco: 5 }]
const produtos = [{ id: 'prod-1', nome: 'Bolo de Pote', preco_venda: 20, custo_total: 10 }]
// receita: produto prod-1 usa 2 unidades do insumo ins-1
const receitas = [{ produto_id: 'prod-1', insumo_id: 'ins-1', quantidade_utilizada: 2 }]

// ---------------------------------------------------------------------------
// TC-012 — Simular reajuste de insumo
// ---------------------------------------------------------------------------
describe('TC-012 – SimuladorReajuste', () => {
  it('exibe estado vazio enquanto nenhum insumo está selecionado', () => {
    render(
      <SimuladorReajuste
        insumos={insumos}
        produtos={produtos}
        receitas={receitas}
        darkMode={false}
      />,
    )

    expect(screen.getByText(/aguardando dados/i)).toBeInTheDocument()
  })

  it('não exibe resultados quando apenas o insumo é selecionado (sem novo preço)', async () => {
    const user = userEvent.setup()
    render(
      <SimuladorReajuste
        insumos={insumos}
        produtos={produtos}
        receitas={receitas}
        darkMode={false}
      />,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'ins-1')

    // Sem novo preço → impacto.length = 0 → estado vazio ainda visível
    expect(screen.getByText(/aguardando dados/i)).toBeInTheDocument()
  })

  it('calcula e exibe o novo lucro após reajuste do insumo', async () => {
    // Cálculo esperado:
    //   precoAntigo = 5, precoSimulado = 8, qtdUsada = 2
    //   aumentoNoCusto = (8×2) - (5×2) = 6
    //   lucroAntigo = 20 - 10 = 10
    //   lucroNovo   = 10 - 6  = 4   → exibe "R$ 4.00"
    const user = userEvent.setup()
    render(
      <SimuladorReajuste
        insumos={insumos}
        produtos={produtos}
        receitas={receitas}
        darkMode={false}
      />,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'ins-1')
    await user.type(screen.getByPlaceholderText('Ex: 7.50'), '8')

    expect(screen.getByText(/R\$ 4\.00/)).toBeInTheDocument()
    expect(screen.getByText(/Bolo de Pote/i)).toBeInTheDocument()
  })

  it('exibe a queda de margem percentual correta', async () => {
    // perdaMargem = ((lucroAntigo - lucroNovo) / preco_venda) * 100
    //             = ((10 - 4) / 20) * 100 = 30%
    const user = userEvent.setup()
    render(
      <SimuladorReajuste
        insumos={insumos}
        produtos={produtos}
        receitas={receitas}
        darkMode={false}
      />,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'ins-1')
    await user.type(screen.getByPlaceholderText('Ex: 7.50'), '8')

    expect(screen.getByText(/30\.0%/)).toBeInTheDocument()
  })

  it('detecta e exibe "Prejuízo Detectado" quando o novo lucro é negativo', async () => {
    // lucroAntigo = 10 - 8 = 2
    // aumentoNoCusto = (20×2) - (5×2) = 30
    // lucroNovo = 2 - 30 = -28 → prejuízo
    const user = userEvent.setup()
    const produtosBarato = [{ id: 'prod-1', nome: 'Bolo de Pote', preco_venda: 10, custo_total: 8 }]
    render(
      <SimuladorReajuste
        insumos={insumos}
        produtos={produtosBarato}
        receitas={receitas}
        darkMode={false}
      />,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'ins-1')
    await user.type(screen.getByPlaceholderText('Ex: 7.50'), '20')

    expect(screen.getByText(/prejuízo detectado/i)).toBeInTheDocument()
  })

  it('não exibe impacto para produto que não usa o insumo selecionado', async () => {
    const user = userEvent.setup()
    // Receita vazia → nenhum produto usa esse insumo
    render(
      <SimuladorReajuste
        insumos={insumos}
        produtos={produtos}
        receitas={[]}
        darkMode={false}
      />,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'ins-1')
    await user.type(screen.getByPlaceholderText('Ex: 7.50'), '8')

    // Lista vazia → estado de "aguardando" exibido
    expect(screen.getByText(/aguardando dados/i)).toBeInTheDocument()
  })

  it('lista o insumo disponível no select', () => {
    render(
      <SimuladorReajuste
        insumos={insumos}
        produtos={produtos}
        receitas={receitas}
        darkMode={false}
      />,
    )

    expect(screen.getByRole('option', { name: /farinha/i })).toBeInTheDocument()
  })
})
