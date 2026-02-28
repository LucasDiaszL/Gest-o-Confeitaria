import { useState } from 'react'
import { Estoque } from './pages/Estoque'

function App() {
  const [aba, setAba] = useState('vendas')

  return (
    <div className="min-h-screen bg-[#FDF8F9] font-sans text-slate-800">
      {/* Sidebar ou Navbar Lateral/Superior refinada */}
      <nav className="bg-white border-b border-pink-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-pink-100 p-2 rounded-xl">
            <span className="text-2xl">🍰</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-none">Doce Controle</h1>
            <span className="text-xs text-pink-500 font-medium uppercase tracking-wider">Gestão de Confeitaria</span>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setAba('vendas')} 
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${aba === 'vendas' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Vendas
          </button>
          <button 
            onClick={() => setAba('estoque')} 
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${aba === 'estoque' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Estoque
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-8">
        {aba === 'vendas' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
              <h2 className="text-3xl font-black text-slate-900">Registrar Pedido</h2>
              <p className="text-slate-500">Gerencie as vendas do dia e encomendas.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card de exemplo para o PDV */}
              <div className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl shadow-pink-100/50 border border-white">
                 <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-slate-400 font-medium">Selecione os produtos...</p>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Estoque</h2>
                <p className="text-slate-500">Insumos e matéria-prima em tempo real.</p>
              </div>
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-2">
                <span>+</span> Adicionar Item
              </button>
            </header>
            
            <Estoque />
          </div>
        )}
      </main>
    </div>
  )
}

export default App