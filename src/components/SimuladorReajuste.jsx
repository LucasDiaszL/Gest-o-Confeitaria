import { useState, useMemo } from "react";
import { TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";

export function SimuladorReajuste({ insumos, produtos, receitas, darkMode }) {
  const [insumoId, setInsumoId] = useState("");
  const [novoPreco, setNovoPreco] = useState("");

  const impacto = useMemo(() => {
    if (!insumoId || !novoPreco) return [];

    const insumoAlvo = insumos.find(i => i.id === insumoId);
    const precoAntigo = Number(insumoAlvo?.preco || 0);
    const precoSimulado = parseFloat(novoPreco);

    // Filtra produtos que usam este insumo específico
    return receitas
      .filter(r => r.insumo_id === insumoId)
      .map(r => {
        const produto = produtos.find(p => p.id === r.produto_id);
        const qtdUsada = Number(r.quantidade_utilizada || 0);
        
        const aumentoNoCusto = (precoSimulado * qtdUsada) - (precoAntigo * qtdUsada);
        
        // Cálculo baseado no preço de venda e custo total do produto
        const lucroAntigo = Number(produto?.preco_venda || 0) - Number(produto?.custo_total || 0);
        const lucroNovo = lucroAntigo - aumentoNoCusto;

        return {
          id: produto?.id,
          nome: produto?.nome || "Produto Indefinido",
          lucroAntigo,
          lucroNovo,
          perdaMargem: ((lucroAntigo - lucroNovo) / (Number(produto?.preco_venda) || 1)) * 100
        };
      });
  }, [insumoId, novoPreco, insumos, produtos, receitas]);

  return (
    <div className={`p-10 rounded-[4rem] border transition-all ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"}`}>
      <div className="flex items-center gap-5 mb-10">
        <div className="p-5 bg-pink-500 rounded-[2rem] text-white shadow-lg shadow-pink-500/20">
          <TrendingUp size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tighter italic">Simulador de Impacto</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Previsão de Lucratividade</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase ml-6 text-pink-500 tracking-widest opacity-60">Insumo Alvo</label>
          <select 
            value={insumoId}
            onChange={(e) => setInsumoId(e.target.value)}
            className={`w-full p-6 rounded-[2rem] font-bold outline-none border-2 transition-all appearance-none cursor-pointer ${darkMode ? "bg-slate-800 border-white/5 text-white focus:border-pink-500/50" : "bg-slate-50 border-slate-100 text-slate-700 focus:border-pink-200 shadow-sm"}`}
          >
            <option value="">Selecione o ingrediente...</option>
            {insumos.map(ins => (
              <option key={ins.id} value={ins.id}>{ins.nome.toUpperCase()} (Atual: R$ {Number(ins.preco).toFixed(2)})</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase ml-6 text-pink-500 tracking-widest opacity-60">Novo Preço Unitário (R$)</label>
          <input 
            type="number"
            value={novoPreco}
            onChange={(e) => setNovoPreco(e.target.value)}
            placeholder="Ex: 7.50"
            className={`w-full p-6 rounded-[2rem] font-bold outline-none border-2 transition-all ${darkMode ? "bg-slate-800 border-white/5 text-white focus:border-pink-500/50" : "bg-slate-50 border-slate-100 text-slate-700 focus:border-pink-200 shadow-sm"}`}
          />
        </div>
      </div>

      <div className="space-y-4">
        {impacto.length > 0 ? (
          impacto.map(p => (
            <div key={p.id} className={`flex justify-between items-center p-8 rounded-[3rem] border animate-in zoom-in-95 duration-300 ${darkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"}`}>
              <div className="space-y-1">
                <h4 className="font-black text-xl italic tracking-tight">{p.nome}</h4>
                <div className="flex items-center gap-2">
                   <span className={`h-2 w-2 rounded-full ${p.lucroNovo < 0 ? "bg-red-500 animate-pulse" : "bg-pink-500"}`}></span>
                   <p className={`text-[10px] font-black uppercase tracking-widest ${p.lucroNovo < 0 ? "text-red-500" : "text-slate-400"}`}>
                    {p.lucroNovo < 0 ? "⚠️ Prejuízo Detectado" : `Queda de ${p.perdaMargem.toFixed(1)}% na margem`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right opacity-30 hidden sm:block">
                  <p className="text-[8px] font-black uppercase">Lucro Atual</p>
                  <p className="font-bold text-sm italic font-mono">R$ {p.lucroAntigo.toFixed(2)}</p>
                </div>
                <ArrowRight size={20} className="text-pink-500 opacity-50" />
                <div className="text-right p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black uppercase text-pink-500">Novo Lucro</p>
                  <p className={`text-2xl font-black font-mono italic ${p.lucroNovo < 0 ? "text-red-500" : "text-emerald-500"}`}>
                    R$ {p.lucroNovo.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[4rem]">
            <AlertTriangle size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Aguardando dados para simulação financeira</p>
          </div>
        )}
      </div>
    </div>
  );
}