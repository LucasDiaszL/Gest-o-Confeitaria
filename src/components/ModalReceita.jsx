import { useState, useEffect, useMemo } from "react";
import { getItensReceita, addItemReceita, deleteItemReceita } from "../services/receitas";

export function ModalReceita({ produto, insumos, onClose, darkMode }) {
  const [itensReceita, setItensReceita] = useState([]);
  const [insumoSelecionado, setInsumoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const dados = await getItensReceita(produto.id);
      setItensReceita(dados || []);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (produto?.id) carregarDados();
  }, [produto?.id]);

  const { somaFinalCusto, valorFinalLucro } = useMemo(() => {
    const total = itensReceita.reduce((acc, item) => {
      const p = Number(item.insumos?.preço || item.insumos?.preco || 0);
      const q = Number(item.quantidade_utilizada) || 0;
      return acc + (p * q);
    }, 0);
    const venda = Number(produto.preco_venda || 0);
    return { somaFinalCusto: total, valorFinalLucro: venda - total };
  }, [itensReceita, produto.preco_venda]);

  const handleAdicionar = async () => {
    if (!insumoSelecionado || !quantidade) return;
    try {
      await addItemReceita({
        produto_id: produto.id,
        insumo_id: insumoSelecionado,
        quantidade_utilizada: parseFloat(quantidade),
      });
      setInsumoSelecionado(""); setQuantidade("");
      carregarDados();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-hidden">
      <div className={`w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] border transition-all ${
        darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-pink-100 text-slate-800"
      }`}>
        
        {/* HEADER REFINADO */}
        <header className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight leading-tight italic">
              {produto.nome}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
              <p className="text-pink-500 text-[10px] font-black uppercase tracking-[0.2em]">Ficha Técnica e Margem</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-3 rounded-2xl transition-all hover:scale-110 active:scale-95 ${
            darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </header>

        {/* DASHBOARD DE VALORES ESTILIZADO */}
        <section className="px-8 py-4 grid grid-cols-2 gap-6">
          <div className={`p-6 rounded-[2.5rem] border-2 transition-all ${
            darkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-100"
          }`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Custo de Produção</p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold opacity-50">R$</span>
              <span className="text-3xl font-black tracking-tighter">
                {somaFinalCusto.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>

          <div className={`p-6 rounded-[2.5rem] border-2 transition-all ${
            valorFinalLucro > 0 
              ? (darkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100")
              : (darkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100")
          }`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
              valorFinalLucro > 0 ? "text-emerald-500" : "text-red-500"
            }`}>
              {valorFinalLucro > 0 ? "Lucro por Unidade" : "Prejuízo Detectado"}
            </p>
            <div className="flex items-baseline gap-1">
              <span className={`text-sm font-bold opacity-50 ${valorFinalLucro > 0 ? "text-emerald-500" : "text-red-500"}`}>R$</span>
              <span className={`text-3xl font-black tracking-tighter ${
                valorFinalLucro > 0 ? "text-emerald-500" : "text-red-500"
              }`}>
                {valorFinalLucro.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        </section>

        {/* LISTA DE INGREDIENTES COM DESIGN CLEAN */}
        <section className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ingredientes Escalados</h4>
          <div className="space-y-3">
            {carregando ? (
               <div className="flex flex-col items-center justify-center py-12 opacity-20">
                 <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                 <p className="text-[10px] font-black uppercase">Sincronizando...</p>
               </div>
            ) : (
              itensReceita.map((item) => {
                const val = Number(item.insumos?.preço || item.insumos?.preco || 0);
                return (
                  <div key={item.id} className={`group flex justify-between items-center p-5 rounded-[2rem] border-2 border-transparent transition-all hover:border-pink-500/30 ${
                    darkMode ? "bg-slate-800/40 hover:bg-slate-800/60" : "bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-pink-500/5"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                        darkMode ? "bg-slate-700" : "bg-white"
                      }`}>⚖️</div>
                      <div>
                        <p className="font-black text-sm capitalize tracking-tight">{item.insumos?.nome}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.quantidade_utilizada} {item.insumos?.unidade_medida} — <span className="text-pink-500">R$ {(val * Number(item.quantidade_utilizada)).toFixed(2).replace(".", ",")}</span>
                        </p>
                      </div>
                    </div>
                    <button onClick={async () => { if(confirm("Remover?")) { await deleteItemReceita(item.id); carregarDados(); } }} 
                      className="opacity-0 group-hover:opacity-100 p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* FOOTER: FORMULÁRIO DE ADIÇÃO "POP" */}
        <footer className={`p-8 pt-4 rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.05)] ${
          darkMode ? "bg-slate-800/80" : "bg-slate-50"
        }`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-3">
              <select value={insumoSelecionado} onChange={(e) => setInsumoSelecionado(e.target.value)} 
                className={`flex-2 p-4 rounded-2xl text-xs font-black border-2 outline-none focus:border-pink-500 transition-all ${
                  darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
                }`}>
                <option value="">Ingrediente...</option>
                {insumos.map((ins) => <option key={ins.id} value={ins.id}>{ins.nome}</option>)}
              </select>
              <input type="number" placeholder="Qtd" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} 
                className={`w-24 p-4 rounded-2xl text-xs font-black border-2 outline-none focus:border-pink-500 transition-all ${
                  darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
                }`} />
            </div>
            <button onClick={handleAdicionar} 
              className="px-8 py-4 bg-slate-900 text-white dark:bg-pink-500 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-pink-500/20 transition-all whitespace-nowrap">
              Adicionar à Receita
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}