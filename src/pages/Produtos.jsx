import { useState } from "react";
import { useProdutos } from "../hooks/useProdutos";
import { ModalReceita } from "../components/ModalReceita";

export function Produtos({ produtos, loading, error, insumos, funcaoEditar, darkMode }) {
  const { excluirProduto } = useProdutos();
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [busca, setBusca] = useState("");

  const handleAbrirReceita = (produto) => {
    setProdutoSelecionado(produto);
    setModalAberto(true);
  };

  const handleExcluir = async (id, nome) => {
    if (window.confirm(`Deseja remover o produto "${nome}"?`)) {
      await excluirProduto(id);
    }
  };

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading)
    return (
      <div className={`text-center py-20 animate-pulse font-black uppercase tracking-widest ${darkMode ? "text-slate-700" : "text-pink-500"}`}>
        Sincronizando Vitrine...
      </div>
    );
    
  if (error)
    return (
      <div className={`text-center font-bold p-4 rounded-2xl border ${
        darkMode ? "bg-red-950/20 border-red-900 text-red-400" : "bg-red-50 border-red-100 text-red-500"
      }`}>
        Erro: {error}
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. DASHBOARD DE PRODUTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-6 rounded-[2.5rem] border flex items-center justify-between shadow-sm transition-all ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
        }`}>
          <div>
            <p className={`text-[10px] font-black uppercase mb-1 tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Catálogo Ativo</p>
            <h3 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-800"}`}>{produtos.length} Produtos</h3>
          </div>
          <div className={`p-3 rounded-2xl text-2xl ${darkMode ? "bg-slate-800" : "bg-pink-50"}`}>🧁</div>
        </div>
        
        <div className={`p-6 rounded-[2.5rem] shadow-xl flex items-center justify-between relative overflow-hidden transition-all ${
          darkMode ? "bg-slate-900 ring-1 ring-slate-800 text-white" : "bg-slate-900 text-white"
        }`}>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase opacity-50 mb-1 tracking-widest">Preço Médio</p>
            <h3 className="text-2xl font-black italic">
              R$ {(produtos.reduce((acc, p) => acc + Number(p.preco_venda || 0), 0) / (produtos.length || 1)).toFixed(2).replace(".", ",")}
            </h3>
          </div>
          <span className="text-5xl opacity-10 absolute -right-2 -bottom-2 select-none">💰</span>
        </div>
      </div>

      {/* 2. BARRA DE BUSCA */}
      <div className="relative group">
        <span className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? "text-slate-600" : "text-slate-400"}`}>🔍</span>
        <input 
          type="text"
          placeholder="Buscar na vitrine..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className={`w-full p-5 pl-14 rounded-[2rem] outline-none focus:ring-4 transition-all font-bold ${
            darkMode 
              ? "bg-slate-900 border border-slate-800 text-white focus:ring-slate-800" 
              : "bg-white border border-pink-50 text-slate-700 focus:ring-pink-100"
          }`}
        />
      </div>

      {/* 3. GRID DE PRODUTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtosFiltrados.map((p) => (
          <div
            key={p.id}
            className={`p-8 rounded-[3rem] border transition-all group relative flex flex-col ${
              darkMode 
                ? "bg-slate-900 border-transparent shadow-xl hover:border-slate-700" 
                : "bg-white border-transparent shadow-sm hover:border-pink-100 hover:shadow-xl"
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner group-hover:rotate-6 transition-transform ${
                darkMode ? "bg-slate-800" : "bg-pink-50"
              }`}>
                🧁
              </div>
              <div>
                <h3 className={`text-xl font-black capitalize leading-tight ${darkMode ? "text-white" : "text-slate-800"}`}>
                  {p.nome}
                </h3>
                <p className="text-pink-400 text-[9px] font-black uppercase tracking-[0.2em]">
                  Doce Autoral
                </p>
              </div>
            </div>

            <div className={`p-5 rounded-[2rem] mb-6 transition-colors ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}>
              <p className={`text-[10px] font-black uppercase mb-1 tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Valor de Venda</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-sm font-bold ${darkMode ? "text-slate-500" : "text-slate-400"}`}>R$</span>
                <span className={`text-4xl font-black italic ${darkMode ? "text-white" : "text-slate-900"}`}>
                  {parseFloat(p.preco_venda).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            {/* RODAPÉ PADRONIZADO: FICHA TÉCNICA + AÇÕES */}
            <div className="mt-auto pt-6 border-t border-dashed border-slate-100/10 flex items-center justify-between gap-2">
              <button
                onClick={() => handleAbrirReceita(p)}
                className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  darkMode 
                    ? "bg-slate-800 text-slate-300 hover:bg-white hover:text-slate-900" 
                    : "bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white"
                }`}
              >
                📄 Receita
              </button>

              <div className="flex gap-2">
                <button 
                  onClick={() => funcaoEditar(p)} 
                  className={`p-3 rounded-2xl transition-all border ${
                    darkMode ? "bg-slate-800 text-slate-400 border-slate-700 hover:text-pink-500" : "bg-slate-50 text-slate-400 border-slate-100 hover:text-pink-500"
                  }`}
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleExcluir(p.id, p.nome)} 
                  className={`p-3 rounded-2xl transition-all border ${
                    darkMode ? "bg-slate-800 text-slate-400 border-slate-700 hover:text-red-500" : "bg-slate-50 text-slate-400 border-slate-100 hover:text-red-500"
                  }`}
                  title="Excluir"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {produtosFiltrados.length === 0 && (
        <div className={`col-span-full py-20 text-center rounded-[3rem] border-2 border-dashed transition-colors ${
          darkMode ? "bg-slate-900 border-slate-800 text-slate-600" : "bg-white border-slate-100 text-slate-400"
        }`}>
          <p className="font-bold uppercase text-xs tracking-widest">Nenhum doce encontrado</p>
        </div>
      )}

      {modalAberto && (
        <ModalReceita
          produto={produtoSelecionado}
          insumos={insumos}
          onClose={() => setModalAberto(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}