import { useState, useEffect, useMemo } from "react";
import { supabase } from "../services/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell
} from "recharts";

const SkeletonLocal = ({ className }) => (
  <div className={`animate-pulse ${className} bg-slate-200 dark:bg-slate-800/50`} />
);

export function Relatorios({ darkMode }) {
  const [vendas, setVendas] = useState([]);
  const [perdas, setPerdas] = useState([]);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("7");

  useEffect(() => {
    async function buscarRelatorio() {
      setLoading(true);
      try {
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - parseInt(filtro));
        const isoInicio = dataInicio.toISOString();

        // 1. Busca Vendas e Custos
        const { data: dataVendas, error: errorVendas } = await supabase
          .from("vendas")
          .select(`
            id, total, quantidade, criado_em,
            produtos (
              nome,
              ingredientes_produto (
                quantidade_utilizada,
                insumos (preco)
              )
            )
          `)
          .gte("criado_em", isoInicio)
          .order("criado_em", { ascending: true });

        if (errorVendas) throw errorVendas;

        // 2. Busca Perdas/Desperdícios
        const { data: dataPerdas, error: errorPerdas } = await supabase
          .from("perdas")
          .select("id, custo_prejuizo, motivo, criado_em")
          .gte("criado_em", isoInicio);

        if (errorPerdas) throw errorPerdas;

        setPerdas(dataPerdas || []);

        // Processamento de Vendas (Lucro Bruto por item)
        const processados = dataVendas.map((v) => {
          const ingredientes = v.produtos?.ingredientes_produto || [];
          const custoUnitario = ingredientes.reduce((acc, ing) => {
            return acc + (Number(ing.insumos?.preco || 0) * Number(ing.quantidade_utilizada || 0));
          }, 0);
          const lucroVenda = Number(v.total) - (custoUnitario * Number(v.quantidade));
          return { ...v, lucro: lucroVenda };
        });

        setVendas([...processados].reverse());

        // Agrupamento por Dia (Vendas + Perdas)
        const agrupado = {};
        
        processados.forEach(v => {
          const dia = new Date(v.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
          if (!agrupado[dia]) agrupado[dia] = { faturamento: 0, lucroBruto: 0, prejuizo: 0 };
          agrupado[dia].faturamento += Number(v.total);
          agrupado[dia].lucroBruto += Number(v.lucro);
        });

        dataPerdas.forEach(p => {
          const dia = new Date(p.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
          if (!agrupado[dia]) agrupado[dia] = { faturamento: 0, lucroBruto: 0, prejuizo: 0 };
          agrupado[dia].prejuizo += Number(p.custo_prejuizo);
        });

        setDadosGrafico(Object.keys(agrupado).map(dia => ({
          dia,
          faturamento: parseFloat(agrupado[dia].faturamento.toFixed(2)),
          lucroReal: parseFloat((agrupado[dia].lucroBruto - agrupado[dia].prejuizo).toFixed(2)),
          prejuizo: parseFloat(agrupado[dia].prejuizo.toFixed(2))
        })));

      } catch (err) {
        console.error("Erro ao gerar relatório:", err);
      } finally {
        setLoading(false);
      }
    }
    buscarRelatorio();
  }, [filtro]);

  const faturamentoTotal = useMemo(() => vendas.reduce((acc, v) => acc + (Number(v.total) || 0), 0), [vendas]);
  const prejuizoTotal = useMemo(() => perdas.reduce((acc, p) => acc + (Number(p.custo_prejuizo) || 0), 0), [perdas]);
  const lucroRealTotal = useMemo(() => (vendas.reduce((acc, v) => acc + (v.lucro || 0), 0)) - prejuizoTotal, [vendas, prejuizoTotal]);

  if (loading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SkeletonLocal className="h-44 rounded-[4rem]" />
          <SkeletonLocal className="h-44 rounded-[4rem]" />
          <SkeletonLocal className="h-44 rounded-[4rem]" />
        </div>
        <SkeletonLocal className="h-[450px] rounded-[4rem]" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10 pb-20">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter italic bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">Performance</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">Faturamento vs Desperdício</p>
        </div>

        <div className={`flex p-1.5 rounded-[2rem] border transition-all ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
          {[{l: "Hoje", v: "1"}, {l: "7 Dias", v: "7"}, {l: "30 Dias", v: "30"}].map((item) => (
            <button key={item.v} onClick={() => setFiltro(item.v)} className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filtro === item.v ? "bg-pink-500 text-white shadow-lg" : "text-slate-400 hover:text-pink-500"}`}>{item.l}</button>
          ))}
        </div>
      </header>

      {/* DASHBOARD FINANCEIRO MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`relative p-10 rounded-[4rem] border transition-all ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-50 shadow-xl"}`}>
          <p className="text-[9px] opacity-40 uppercase font-black tracking-[0.3em] mb-4">Venda Bruta</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-pink-500 italic">R$</span>
            <h3 className="text-5xl font-black tracking-tighter">{faturamentoTotal.toFixed(2).replace(".", ",")}</h3>
          </div>
        </div>

        <div className={`relative p-10 rounded-[4rem] border transition-all ${darkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100"}`}>
          <p className="text-[9px] uppercase font-black tracking-[0.3em] mb-4 text-red-500">Desperdício (Perdas)</p>
          <div className="flex items-baseline gap-2 text-red-500">
            <span className="text-xl font-bold italic">R$</span>
            <h3 className="text-5xl font-black tracking-tighter">{prejuizoTotal.toFixed(2).replace(".", ",")}</h3>
          </div>
        </div>

        <div className={`relative p-10 rounded-[4rem] border transition-all ${darkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100 shadow-xl"}`}>
          <p className="text-[9px] uppercase font-black tracking-[0.3em] mb-4 text-emerald-600">Lucro Real Líquido</p>
          <div className="flex items-baseline gap-2 text-emerald-600">
            <span className="text-xl font-bold italic">R$</span>
            <h3 className="text-5xl font-black tracking-tighter">{lucroRealTotal.toFixed(2).replace(".", ",")}</h3>
          </div>
        </div>
      </div>

      {/* GRÁFICO DE BARRAS COMPARATIVO */}
      <div className={`p-10 rounded-[4rem] border transition-all h-[500px] flex flex-col ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"}`}>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-10 text-center">Saúde Financeira Diária</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
            <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} />
            <Tooltip
              cursor={{ fill: darkMode ? "#ffffff05" : "#00000005" }}
              contentStyle={{ borderRadius: "24px", border: "none", background: darkMode ? "#0f172a" : "#ffffff", padding: "20px" }}
              formatter={(value) => [`R$ ${value.toFixed(2).replace(".", ",")}`, ""]}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: "40px", fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }} />
            <Bar name="Venda Bruta" dataKey="faturamento" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar name="Lucro Real" dataKey="lucroReal" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar name="Prejuízo (Perda)" dataKey="prejuizo" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABELA DE MOTIVOS DE PERDA (INTELIGÊNCIA) */}
      <div className={`rounded-[4rem] border p-10 ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"}`}>
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-slate-400 px-4">Análise de Desperdício</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-400">
                  <th className="pb-4">Motivo</th>
                  <th className="pb-4 text-right">Custo Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(perdas.reduce((acc, p) => {
                  if (!acc[p.motivo]) acc[p.motivo] = { motivo: p.motivo, total: 0 };
                  acc[p.motivo].total += Number(p.custo_prejuizo);
                  return acc;
                }, {})).map((p, idx) => (
                  <tr key={idx} className="border-t border-slate-100 dark:border-white/5">
                    <td className="py-4 font-bold text-sm text-slate-500">{p.motivo}</td>
                    <td className="py-4 text-right font-black text-red-500">R$ {p.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center p-6 bg-red-500/5 rounded-[3rem] border border-red-500/10">
            <div className="text-center">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Índice de Perda</p>
              <h5 className="text-6xl font-black text-red-500 tracking-tighter">
                {faturamentoTotal > 0 ? ((prejuizoTotal / faturamentoTotal) * 100).toFixed(1) : 0}%
              </h5>
              <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Do faturamento total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}