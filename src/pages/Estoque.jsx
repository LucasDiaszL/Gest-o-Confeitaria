import { useState } from "react";

export function Estoque({ insumos, loading, funcaoExcluir, funcaoEditar, darkMode }) {
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroCritico, setFiltroCritico] = useState(false);

  const insumosFiltrados = insumos.filter((item) => {
    const matchesBusca = item.nome.toLowerCase().includes(termoBusca.toLowerCase());
    const isCritico = (Number(item.quantidade_atual) || 0) <= (Number(item.estoque_minimo) || 5);
    return filtroCritico ? matchesBusca && isCritico : matchesBusca;
  });

  // 💰 Cálculo do capital imobilizado no estoque
  const valorTotalEstoque = insumos.reduce((acc, item) => {
    return acc + (Number(item.quantidade_atual) * Number(item.preco || 0));
  }, 0);

  const totalCriticos = insumos.filter((i) => (Number(i.quantidade_atual) || 0) <= (Number(i.estoque_minimo) || 5)).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500">Sincronizando Inventário...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* 1. DASHBOARD DE ESTOQUE (ESTILO FRENTE DE CAIXA) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD VALOR TOTAL */}
        <div className="relative p-10 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl overflow-hidden group border border-white/5">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px]"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-[0.3em]">Capital em Estoque</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-pink-500 italic">R$</span>
              <h3 className="text-5xl font-black tracking-tighter italic leading-none">
                {valorTotalEstoque.toFixed(2).replace(".", ",")}
              </h3>
            </div>
          </div>
        </div>
        
        {/* CARD VARIEDADE */}
        <div className={`p-10 rounded-[3.5rem] border-2 flex items-center justify-between transition-all ${
          darkMode ? "bg-slate-900 border-white/5 shadow-2xl" : "bg-white border-slate-50 shadow-xl"
        }`}>
          <div>
            <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-[0.3em]">Variedade</p>
            <h3 className={`text-5xl font-black tracking-tighter italic ${darkMode ? "text-white" : "text-slate-800"}`}>
              {insumos.length} <span className="text-xl not-italic text-pink-500">Itens</span>
            </h3>
          </div>
          <div className="text-5xl">📦</div>
        </div>

        {/* CARD ALERTAS CRÍTICOS */}
        <div className={`p-10 rounded-[3.5rem] border-2 transition-all overflow-hidden relative ${
          totalCriticos > 0 
            ? "bg-red-500 text-white shadow-[0_20px_40px_rgba(239,68,68,0.3)] border-transparent" 
            : (darkMode ? "bg-slate-900 border-white/5 shadow-2xl" : "bg-white border-slate-50 shadow-xl")
        }`}>
          <div className="relative z-10">
            <p className={`text-[10px] font-black uppercase mb-2 tracking-[0.3em] ${totalCriticos > 0 ? "text-white/60" : "text-slate-400"}`}>Atenção Crítica</p>
            <h3 className="text-5xl font-black tracking-tighter italic">
              {totalCriticos} <span className={`text-xl not-italic ${totalCriticos > 0 ? "text-white" : "text-emerald-500"}`}>Alertas</span>
            </h3>
          </div>
          {totalCriticos > 0 && <div className="absolute right-8 bottom-8 text-4xl animate-bounce">⚠️</div>}
        </div>
      </div>

      {/* 2. BUSCA E FILTROS */}
      <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
        <div className="relative group flex-1">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          <input 
            type="text" 
            placeholder="Localizar insumo..." 
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            className={`w-full p-6 pl-16 rounded-[2.5rem] outline-none border-2 transition-all font-black text-sm tracking-tight ${
              darkMode 
                ? "bg-slate-900 border-white/5 text-white focus:border-pink-500/50" 
                : "bg-white border-slate-100 text-slate-700 focus:border-pink-200 shadow-sm"
            }`} 
          />
        </div>
        <button 
          onClick={() => setFiltroCritico(!filtroCritico)} 
          className={`px-10 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
            filtroCritico 
              ? "bg-red-500 text-white shadow-red-900/20" 
              : (darkMode ? "bg-slate-800 text-slate-400 border-2 border-transparent hover:border-pink-500/50 hover:text-white" : "bg-slate-900 text-white hover:bg-pink-600")
          }`}
        >
          {filtroCritico ? "Mostrar Tudo" : "⚠️ Ver Críticos"}
        </button>
      </div>

      {/* 3. GRID DE INSUMOS ESTILO "CARDS DE INTELIGÊNCIA" */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {insumosFiltrados.map((item) => {
          const isCritico = (Number(item.quantidade_atual) || 0) <= (Number(item.estoque_minimo) || 5);
          const hoje = new Date();
          const dataValidade = item.data_validade ? new Date(item.data_validade) : null;
          const diferencaDias = dataValidade ? Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24)) : null;
          const vencendo = diferencaDias !== null && diferencaDias <= 7;

          return (
            <div 
              key={item.id} 
              className={`group relative p-8 rounded-[4rem] border-2 transition-all duration-500 hover:-translate-y-3 ${
                isCritico || (vencendo && diferencaDias >= 0)
                  ? (darkMode ? "border-red-500/40 bg-red-500/5 shadow-2xl shadow-red-500/10" : "border-red-100 bg-red-50/50") 
                  : (darkMode ? "border-white/5 bg-slate-900 shadow-2xl hover:border-pink-500/30" : "border-slate-50 bg-white shadow-xl hover:border-pink-100")
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-inner transition-all duration-500 group-hover:rotate-12 ${
                    isCritico ? "bg-red-500/20" : (darkMode ? "bg-slate-800" : "bg-pink-50/50")
                  }`}>
                    {item.unidade_medida === "un" ? "🥚" : "⚖️"}
                  </div>
                  
                  <div className="flex flex-col gap-2 items-end">
                    {isCritico && <span className="animate-pulse bg-red-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Reposição!</span>}
                    {vencendo && <span className="bg-orange-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Vencimento!</span>}
                  </div>
                </div>

                <h4 className={`text-2xl font-black mb-1 capitalize tracking-tighter leading-tight ${darkMode ? "text-white" : "text-slate-800"}`}>
                  {item.nome}
                </h4>
                
                <div className="space-y-1 mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Custo Unit: R$ {Number(item.preco || 0).toFixed(2).replace(".", ",")}
                  </p>
                  {item.data_validade && (
                    <p className={`text-[10px] font-black uppercase tracking-widest ${vencendo ? "text-red-500" : "text-pink-400"}`}>
                      📅 {new Date(item.data_validade).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>

                {/* QUANTIDADE VISUAL */}
                <div className={`p-6 rounded-[2.5rem] mb-6 flex flex-col items-center transition-all ${
                  isCritico ? "bg-red-500/10" : (darkMode ? "bg-slate-800/50" : "bg-slate-50")
                }`}>
                  <p className={`text-[9px] font-black uppercase mb-1 tracking-[0.2em] ${isCritico ? "text-red-500" : "text-slate-400"}`}>Em Estoque</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-black tracking-tighter ${isCritico ? "text-red-500" : (darkMode ? "text-white" : "text-slate-900")}`}>
                      {parseFloat(Number(item.quantidade_atual).toFixed(2))}
                    </span>
                    <span className="text-xs font-bold opacity-30 uppercase">{item.unidade_medida}</span>
                  </div>
                </div>

                {/* AÇÕES */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => funcaoEditar(item)}
                    className={`flex-1 py-4 rounded-2xl transition-all font-black text-[9px] uppercase tracking-widest border-2 ${
                      darkMode ? "bg-slate-800 border-transparent text-slate-400 hover:border-pink-500/50 hover:text-white" : "bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-pink-200"
                    }`}
                  >
                    Ajustar
                  </button>
                  <button 
                    onClick={() => { if(confirm("Excluir?")) funcaoExcluir(item.id) }}
                    className={`px-6 py-4 rounded-2xl transition-all border-2 ${
                      darkMode ? "bg-slate-800 border-transparent text-slate-400 hover:bg-red-500/20 hover:text-red-500" : "bg-slate-50 border-transparent text-slate-400 hover:bg-red-50 hover:border-red-100 hover:text-red-500"
                    }`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}