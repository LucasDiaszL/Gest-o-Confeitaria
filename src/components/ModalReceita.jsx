import { useState, useEffect, useMemo } from "react";
import {
  getItensReceita,
  addItemReceita,
  deleteItemReceita,
} from "../services/receitas";

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
      console.error("Erro ao carregar dados da receita:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (produto?.id) carregarDados();
  }, [produto?.id]);

  // Cálculo Unificado: Arredondamento + Nomes de variáveis consistentes
  const { custoTotal, lucro } = useMemo(() => {
    const total = itensReceita.reduce((acc, item) => {
      const preco = Number(item.insumos?.preco || item.insumos?.preço || 0);
      const q = Number(item.quantidade_utilizada) || 0;
      return acc + (preco * q);
    }, 0);

    return {
      custoTotal: parseFloat(total.toFixed(2)),
      lucro: parseFloat((Number(produto.preco_venda || 0) - total).toFixed(2)),
    };
  }, [itensReceita, produto.preco_venda]);

  const handleAdicionar = async () => {
    if (!insumoSelecionado || !quantidade) return;
    try {
      await addItemReceita({
        produto_id: produto.id,
        insumo_id: insumoSelecionado,
        quantidade_utilizada: parseFloat(quantidade),
      });
      setInsumoSelecionado("");
      setQuantidade("");
      carregarDados();
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    }
  };

  const handleRemover = async (id) => {
    try {
      if (confirm("Remover este ingrediente da receita?")) {
        await deleteItemReceita(id);
        carregarDados();
      }
    } catch (error) {
      console.error("Erro ao remover item:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className={`relative w-full max-w-3xl rounded-[4rem] shadow-2xl border-2 overflow-hidden flex flex-col max-h-[92vh] transition-all duration-500 ${
        darkMode ? "bg-slate-900 border-white/5 text-white" : "bg-white border-pink-50 text-slate-800"
      }`}>
        
        {darkMode && <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px]"></div>}

        <header className="relative z-10 p-10 pb-6 flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tighter italic bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
              Ficha: {produto.nome}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full animate-pulse ${lucro > 0 ? "bg-emerald-500" : "bg-red-500"}`}></span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cálculo de Margem Real</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-4 rounded-3xl transition-all active:scale-90 ${darkMode ? "bg-white/5 text-white hover:bg-red-500/20 hover:text-red-500" : "bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500"}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <section className="relative z-10 px-10 py-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-8 rounded-[3rem] border flex flex-col justify-center ${darkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"}`}>
            <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.3em] mb-2">Custo Produção</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-pink-500 italic">R$</span>
              <h3 className="text-6xl font-black tracking-tighter">{custoTotal.toFixed(2).replace(".", ",")}</h3>
            </div>
          </div>

          <div className={`p-8 rounded-[3rem] border flex flex-col justify-center transition-colors ${lucro > 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
            <p className={`text-[10px] uppercase font-black tracking-[0.3em] mb-2 ${lucro > 0 ? "text-emerald-500" : "text-red-500"}`}>
              {lucro > 0 ? "Lucro por Unidade" : "Prejuízo Detectado"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold italic ${lucro > 0 ? "text-emerald-500" : "text-red-500"}`}>R$</span>
              <h3 className={`text-6xl font-black tracking-tighter ${lucro > 0 ? "text-emerald-500" : "text-red-500"}`}>{lucro.toFixed(2).replace(".", ",")}</h3>
            </div>
          </div>
        </section>

        <section className="relative z-10 flex-1 overflow-y-auto px-10 py-6 space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Ingredientes Utilizados</p>
          {carregando ? (
            <div className="text-center py-10 animate-pulse font-black text-xs text-pink-500 uppercase tracking-widest">Sincronizando...</div>
          ) : (
            itensReceita.map((item) => {
              const qtdAtual = Number(item.insumos?.quantidade_atual || 0);
              const isEstoqueBaixo = qtdAtual <= Number(item.insumos?.estoque_minimo || 5);
              const valTotalItem = (Number(item.insumos?.preco || item.insumos?.preço || 0) * Number(item.quantidade_utilizada));

              return (
                <div key={item.id} className={`group flex justify-between items-center p-6 rounded-[2.5rem] border transition-all ${
                  darkMode ? "bg-white/5 border-white/5 hover:border-pink-500/30" : "bg-slate-50 border-slate-100 hover:border-pink-200"
                } ${isEstoqueBaixo ? "ring-2 ring-amber-500/50" : ""}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110 ${
                      isEstoqueBaixo ? "bg-amber-500/20 animate-pulse" : (darkMode ? "bg-slate-800" : "bg-white border border-pink-50")
                    }`}>
                      {isEstoqueBaixo ? "⚠️" : "⚖️"}
                    </div>
                    <div>
                      <h4 className={`font-black text-lg capitalize tracking-tight flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-700"}`}>
                        {item.insumos?.nome}
                        {isEstoqueBaixo && <span className="text-[8px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase font-black">Estoque Baixo</span>}
                      </h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        Uso: {item.quantidade_utilizada}{item.insumos?.unidade_medida} — 
                        <span className={`ml-2 ${isEstoqueBaixo ? "text-amber-500" : ""}`}> Dispensa: {parseFloat(qtdAtual.toFixed(2))} {item.insumos?.unidade_medida}</span>
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleRemover(item.id)} className="p-3 rounded-2xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              );
            })
          )}
        </section>

        <footer className={`relative z-10 p-10 border-t ${darkMode ? "bg-black/40 border-white/5" : "bg-slate-50 border-slate-100"}`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-3">
              <select value={insumoSelecionado} onChange={(e) => setInsumoSelecionado(e.target.value)} className={`flex-[2] p-5 rounded-3xl text-xs font-black outline-none appearance-none transition-all ${darkMode ? "bg-slate-800 text-white focus:ring-2 focus:ring-pink-500" : "bg-white text-slate-600 border border-slate-200 focus:border-pink-300"}`}>
                <option value="">Selecionar Insumo...</option>
                {insumos.map((ins) => <option key={ins.id} value={ins.id}>{ins.nome}</option>)}
              </select>
              <input type="number" placeholder="Qtd" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className={`w-28 p-5 rounded-3xl text-xs font-black outline-none transition-all ${darkMode ? "bg-slate-800 text-white focus:ring-2 focus:ring-pink-500" : "bg-white text-slate-600 border border-slate-200 focus:border-pink-300"}`} />
            </div>
            <button onClick={handleAdicionar} className="px-10 py-5 bg-pink-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all active:scale-95 shadow-lg shadow-pink-500/20">
              Confirmar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}