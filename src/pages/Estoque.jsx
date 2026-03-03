import { useState } from "react";

export function Estoque({ insumos, loading, funcaoExcluir, funcaoEditar, darkMode }) {
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroCritico, setFiltroCritico] = useState(false);

  const insumosFiltrados = insumos.filter((item) => {
    const matchesBusca = item.nome.toLowerCase().includes(termoBusca.toLowerCase());
    const isCritico = (Number(item.quantidade_atual) || 0) <= (Number(item.estoque_minimo) || 5);
    return filtroCritico ? matchesBusca && isCritico : matchesBusca;
  });

  // 1. TRATAMENTO NO CÁLCULO DO VALOR TOTAL (DINHEIRO)
  const valorTotalEstoque = insumos.reduce((acc, item) => {
    return acc + Number(item.quantidade_atual) * Number(item.preco || 0);
  }, 0);

  if (loading) return (
    <div className={`py-20 text-center animate-pulse font-black ${darkMode ? "text-slate-700" : "text-slate-300"}`}>
      Sincronizando Dispensa...
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. DASHBOARD DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-[2.5rem] text-white shadow-xl transition-all ${darkMode ? "bg-slate-900 ring-1 ring-slate-800" : "bg-slate-900"}`}>
          <p className="text-[10px] font-black uppercase opacity-50 tracking-widest mb-1">Valor em Insumos</p>
          <h3 className="text-3xl font-black italic">R$ {valorTotalEstoque.toFixed(2).replace(".", ",")}</h3>
        </div>
        
        <div className={`p-6 rounded-[2.5rem] border flex items-center justify-between transition-all ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
        }`}>
          <div>
            <p className={`text-[10px] font-black uppercase mb-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Itens</p>
            <h3 className={`text-2xl font-black ${darkMode ? "text-white" : "text-slate-800"}`}>{insumos.length}</h3>
          </div>
          <span className="text-3xl">📦</span>
        </div>

        <div className={`p-6 rounded-[2.5rem] border flex items-center justify-between transition-all ${
          insumos.some((i) => i.quantidade_atual <= 5) 
            ? (darkMode ? "bg-red-950/30 border-red-900" : "bg-red-50 border-red-100") 
            : (darkMode ? "bg-green-950/30 border-green-900" : "bg-green-50 border-green-100")
        }`}>
          <div>
            <p className={`text-[10px] font-black uppercase mb-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Críticos</p>
            <h3 className={`text-2xl font-black ${insumos.some((i) => i.quantidade_atual <= 5) ? "text-red-500" : "text-green-500"}`}>
              {insumos.filter((i) => i.quantidade_atual <= 5).length}
            </h3>
          </div>
          <span className="text-3xl">{insumos.some((i) => i.quantidade_atual <= 5) ? "⚠️" : "✅"}</span>
        </div>
      </div>

      {/* 2. BUSCA */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <span className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? "text-slate-600" : "text-slate-400"}`}>🔍</span>
          <input 
            type="text" 
            placeholder="O que você está procurando?" 
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            className={`w-full p-5 pl-14 rounded-3xl outline-none focus:ring-4 transition-all font-bold ${
              darkMode 
                ? "bg-slate-900 border border-slate-800 text-white focus:ring-slate-800 shadow-inner" 
                : "bg-white border border-pink-50 text-slate-700 focus:ring-pink-100"
            }`} 
          />
        </div>
        <button 
          onClick={() => setFiltroCritico(!filtroCritico)} 
          className={`px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
            filtroCritico 
              ? "bg-red-500 text-white shadow-red-900/20" 
              : (darkMode ? "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white" : "bg-white text-slate-400 border border-slate-100 hover:text-pink-500")
          }`}
        >
          {filtroCritico ? "🚫 Ver Tudo" : "⚠️ Ver Críticos"}
        </button>
      </div>

      {/* 3. GRID DE INSUMOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insumosFiltrados.map((item) => {
          const isCritico = (Number(item.quantidade_atual) || 0) <= (Number(item.estoque_minimo) || 5);
          const hoje = new Date();
          const dataValidade = item.data_validade ? new Date(item.data_validade) : null;
          const diferencaDias = dataValidade ? Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24)) : null;
          const statusVencimento = diferencaDias !== null && diferencaDias <= 7;

          return (
            <div 
              key={item.id} 
              className={`group relative p-8 rounded-[3rem] border-2 transition-all hover:shadow-2xl ${
                isCritico || (statusVencimento && diferencaDias >= 0)
                  ? (darkMode ? "border-red-900 bg-red-950/20" : "border-red-100 bg-red-50/20") 
                  : (darkMode ? "border-transparent bg-slate-900 shadow-xl" : "border-transparent bg-white shadow-sm hover:border-pink-100")
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl shadow-inner ${
                    isCritico || statusVencimento ? (darkMode ? "bg-red-900/40" : "bg-red-100") : (darkMode ? "bg-slate-800" : "bg-slate-50")
                  }`}>
                    {item.unidade_medida === "un" ? "📦" : "⚖️"}
                  </div>
                  
                  <div className="flex flex-col gap-2 items-end select-none">
                    {isCritico && (
                      <span className="bg-red-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase shadow-sm">
                        Reposição!
                      </span>
                    )}
                    {statusVencimento && (
                      <span className={`text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase shadow-sm ${diferencaDias < 0 ? "bg-slate-950" : "bg-orange-500"}`}>
                        {diferencaDias < 0 ? "Vencido!" : "Vence em Breve!"}
                      </span>
                    )}
                  </div>
                </div>

                <h4 className={`text-xl font-black mb-1 capitalize leading-tight ${darkMode ? "text-white" : "text-slate-800"}`}>
                  {item.nome}
                </h4>
                
                <div className="flex flex-col gap-1 mb-8">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    Preço Unit: R$ {Number(item.preco || 0).toFixed(2).replace(".", ",")}
                  </p>
                  {item.data_validade && (
                    <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                      statusVencimento ? "text-red-500" : (darkMode ? "text-pink-400" : "text-pink-500")
                    }`}>
                      📅 Val: {new Date(item.data_validade).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>

                {/* RODAPÉ: QUANTIDADE TRATADA + BOTÕES DE AÇÃO */}
                <div className="mt-auto pt-6 border-t border-dashed border-slate-100/10 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    {/* 2. TRATAMENTO PARA REMOVER DÍZIMAS (ex: 9.399... -> 9,4) */}
                    <span className={`text-4xl font-black italic ${isCritico || (statusVencimento && diferencaDias >= 0) ? "text-red-600" : (darkMode ? "text-white" : "text-slate-900")}`}>
                      {parseFloat(Number(item.quantidade_atual).toFixed(3))}
                    </span>
                    <span className={`font-black uppercase text-[10px] ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
                      {item.unidade_medida}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); funcaoEditar(item); }} 
                      className={`p-3 rounded-2xl transition-all border ${
                        darkMode ? "bg-slate-800 text-slate-400 border-slate-700 hover:text-pink-500" : "bg-slate-50 text-slate-400 border-slate-100 hover:text-pink-500"
                      }`}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); funcaoExcluir(item.id, item.nome); }} 
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
            </div>
          );
        })}
      </div>
    </div>
  );
}