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
} from "recharts";

// Componente de Skeleton para um carregamento suave e elegante
const SkeletonLocal = ({ className }) => (
  <div className={`animate-pulse ${className} ${
    'bg-slate-200 dark:bg-slate-800/50' 
  }`} />
);

export function Relatorios({ darkMode }) {
  const [vendas, setVendas] = useState([]);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("7");

  useEffect(() => {
    async function buscarRelatorio() {
      setLoading(true);
      try {
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - parseInt(filtro));

        const { data, error } = await supabase
          .from("vendas")
          .select(`
            id, total, quantidade, criado_em,
            produtos (
              nome,
              ingredientes_produto (
                quantidade_utilizada,
                insumos (preco, quantidade_atual)
              )
            )
          `)
          .gte("criado_em", dataInicio.toISOString())
          .order("criado_em", { ascending: true });

        if (error) throw error;

        if (data) {
          const processados = data.map((v) => {
            const ingredientes = v.produtos?.ingredientes_produto || [];
            const custoUnitario = ingredientes.reduce((acc, ing) => {
              const precoEmb = Number(ing.insumos?.preco) || 0;
              const qtdUsada = Number(ing.quantidade_utilizada) || 0;
              // Ajustado para usar o custo proporcional direto
              return acc + (precoEmb * qtdUsada);
            }, 0);

            const vendaTotal = Number(v.total) || 0;
            const custoTotalVenda = custoUnitario * (Number(v.quantidade) || 1);
            return { ...v, lucro: vendaTotal - custoTotalVenda };
          });

          setVendas([...processados].reverse());

          const agrupado = processados.reduce((acc, v) => {
            const dia = new Date(v.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
            if (!acc[dia]) acc[dia] = { faturamento: 0, lucro: 0 };
            acc[dia].faturamento += Number(v.total) || 0;
            acc[dia].lucro += Number(v.lucro) || 0;
            return acc;
          }, {});

          setDadosGrafico(Object.keys(agrupado).map((dia) => ({
            dia,
            faturamento: parseFloat(agrupado[dia].faturamento.toFixed(2)),
            lucro: parseFloat(agrupado[dia].lucro.toFixed(2)),
          })));
        }
      } catch (err) {
        console.error("Erro ao gerar relatório:", err);
      } finally {
        setLoading(false);
      }
    }
    buscarRelatorio();
  }, [filtro]);

  const faturamentoTotalGeral = useMemo(() => vendas.reduce((acc, v) => acc + (Number(v.total) || 0), 0), [vendas]);
  const lucroTotalGeral = useMemo(() => vendas.reduce((acc, v) => acc + (v.lucro || 0), 0), [vendas]);

  if (loading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <SkeletonLocal className="h-12 w-64 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SkeletonLocal className="h-44 rounded-[4rem]" />
          <SkeletonLocal className="h-44 rounded-[4rem]" />
        </div>
        <SkeletonLocal className="h-[450px] rounded-[4rem]" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
      
      {/* HEADER & FILTRO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter italic bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
            Performance
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">Análise de Resultados</p>
        </div>

        <div className={`flex p-1.5 rounded-[2rem] border transition-all ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
          {[{l: "Hoje", v: "1"}, {l: "7 Dias", v: "7"}, {l: "30 Dias", v: "30"}].map((item) => (
            <button
              key={item.v}
              onClick={() => setFiltro(item.v)}
              className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                filtro === item.v ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" : "text-slate-400 hover:text-pink-500"
              }`}
            >
              {item.l}
            </button>
          ))}
        </div>
      </header>

      {/* MÉTRICAS PRINCIPAIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`relative p-12 rounded-[4rem] border transition-all overflow-hidden group ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-pink-50 shadow-xl shadow-pink-500/[0.03]"}`}>
          <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em] mb-4">Faturamento Bruto</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-pink-500 italic">R$</span>
            <h3 className={`text-7xl font-black tracking-tighter ${darkMode ? "text-white" : "text-slate-900"}`}>
              {faturamentoTotalGeral.toFixed(2).replace(".", ",")}
            </h3>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-500/10 transition-all duration-700"></div>
        </div>

        <div className={`relative p-12 rounded-[4rem] border transition-all overflow-hidden group ${darkMode ? "bg-slate-900 border-green-900/20" : "bg-emerald-50 border-emerald-100 shadow-xl shadow-emerald-500/[0.05]"}`}>
          <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em] mb-4 text-emerald-600">Lucro Real (Líquido)</p>
          <div className="flex items-baseline gap-3 text-emerald-500">
            <span className="text-3xl font-bold italic">R$</span>
            <h3 className="text-7xl font-black tracking-tighter">
              {lucroTotalGeral.toFixed(2).replace(".", ",")}
            </h3>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>
        </div>
      </div>

      {/* GRÁFICO PERSONALIZADO */}
      <div className={`p-10 rounded-[4rem] border transition-all h-[500px] flex flex-col ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"}`}>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-10 text-center">Evolução de Performance</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGrafico} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
            <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} />
            <Tooltip
              cursor={{ fill: darkMode ? "#ffffff05" : "#00000005" }}
              contentStyle={{ borderRadius: "24px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", background: darkMode ? "#0f172a" : "#ffffff", padding: "20px" }}
              formatter={(value) => [`R$ ${value.toFixed(2).replace(".", ",")}`, ""]}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: "40px", fontSize: "10px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px" }} />
            <Bar name="Venda Bruta" dataKey="faturamento" fill="#ec4899" radius={[10, 10, 0, 0]} barSize={32} />
            <Bar name="Lucro Líquido" dataKey="lucro" fill="#10b981" radius={[10, 10, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* HISTÓRICO DE VENDAS */}
      <div className={`rounded-[4rem] border p-10 transition-all ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"}`}>
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-slate-400 px-4">Histórico Detalhado</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400">
                <th className="px-8">Data</th>
                <th className="px-8">Produto</th>
                <th className="px-8 text-right">Lucro Gerado</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((v) => (
                <tr key={v.id} className={`group transition-all ${darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"}`}>
                  <td className="px-8 py-6 first:rounded-l-[2.5rem] font-bold text-xs opacity-40">
                    {new Date(v.criado_em).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-8 py-6 font-black text-sm tracking-tight capitalize">
                    {v.produtos?.nome || "Produto Removido"}
                  </td>
                  <td className="px-8 py-6 last:rounded-r-[2.5rem] text-right">
                    <span className="bg-emerald-500/10 text-emerald-500 px-5 py-2.5 rounded-full font-black text-[10px] tracking-widest uppercase">
                      + R$ {v.lucro?.toFixed(2).replace(".", ",")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}