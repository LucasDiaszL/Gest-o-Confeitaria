import { useState } from 'react'
import { Estoque } from './pages/Estoque'
import { FormNovoInsumo } from './components/FormNovoInsumo'
import { useInsumos } from './hooks/useInsumos'

function App() {
  const [aba, setAba] = useState('vendas')
  const [showForm, setShowForm] = useState(false)
  
  // O Hook é chamado aqui para que o estado seja compartilhado
  const { insumos, loading, error, recarregar, excluirInsumo } = useInsumos()

  return (
    <div className="min-h-screen bg-[#FDF8F9] font-sans text-slate-800">
      <nav className="bg-white border-b border-pink-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-pink-100 p-2 rounded-xl"><span className="text-2xl">🍰</span></div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-none">Doce Controle</h1>
            <span className="text-xs text-pink-500 font-medium uppercase tracking-wider">Gestão de Confeitaria</span>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => setAba('vendas')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${aba === 'vendas' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Vendas</button>
          <button onClick={() => setAba('estoque')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${aba === 'estoque' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Estoque</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-8">
        {aba === 'vendas' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Conteúdo de Vendas */}
             <h2 className="text-3xl font-black text-slate-900">Vendas</h2>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Estoque</h2>
                <p className="text-slate-500">Insumos e matéria-prima em tempo real.</p>
              </div>
              <button 
                onClick={() => setShowForm(!showForm)} 
                className={`${showForm ? 'bg-pink-100 text-pink-600' : 'bg-slate-900 text-white'} px-6 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2`}
              >
                <span>{showForm ? '✕' : '+'}</span> {showForm ? 'Fechar' : 'Adicionar Item'}
              </button>
            </header>
            
            {showForm && (
              <div className="mb-10">
                {/* Passamos o recarregar para o componente filho */}
                <FormNovoInsumo onSucesso={() => {
                  recarregar(); 
                  setShowForm(false);
                }} />
              </div>
            )}
            
            {/* O Estoque agora recebe os dados via Props */}
            <Estoque insumos={insumos} loading={loading} error={error} funcaoExcluir={excluirInsumo}/>
          </div>
        )}
      </main>
    </div>
  )
}

export default App