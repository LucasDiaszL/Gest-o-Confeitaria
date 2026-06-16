import { useState, useEffect, useMemo } from "react";
import { supabase } from "../services/supabaseClient";
import { SimuladorReajuste } from "../components/SimuladorReajuste";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

const SkeletonLocal = ({ className }) => (
  <div className={`animate-pulse ${className} bg-slate-200 dark:bg-slate-800/50`} />
);

export function Relatorios({ darkMode }) {
  const [vendas, setVendas] = useState([]);
  const [vendasOriginais, setVendasOriginais] = useState([]); 
  const [perdas, setPerdas] = useState([]);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [primeiroCarregamento, setPrimeiroCarregamento] = useState(true); // 🔥 Evita desmontar a barra de busca
  const [filtro, setFiltro] = useState("7");
  const [termoPesquisa, setTermoPesquisa] = useState("");

  // Estados para o Simulador
  const [insumos, setInsumos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [receitas, setReceitas] = useState([]);

  useEffect(() => {
    async function buscarDadosRelatorio() {
      setLoading(true);
      try {
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - parseInt(filtro));
        const isoInicio = dataInicio.toISOString();

        const [
          { data: dataVendas },
          { data: dataPerdas },
          { data: dataInsumos },
          { data: dataProdutos },
          { data: dataReceitas }
        ] = await Promise.all([
          supabase.from("vendas").select(`id, total, quantidade, criado_em, produtos (nome, ingredientes_produto (quantidade_utilizada, insumos (preco)))`).gte("criado_em", isoInicio).order("criado_em", { ascending: true }),
          supabase.from("perdas").select("id, custo_prejuizo, motivo, criado_em").gte("criado_em", isoInicio),
          supabase.from("insumos").select("*"),
          supabase.from("produtos").select("*"),
          supabase.from("ingredientes_produto").select("*")
        ]);

        setInsumos(dataInsumos || []);
        setProdutos(dataProdutos || []);
        setReceitas(dataReceitas || []);
        setPerdas(dataPerdas || []);

        // Processamento de Lucratividade
        const processados = (dataVendas || []).map((v) => {
          const ingredientes = v.produtos?.ingredientes_produto || [];
          const custoUnitario = ingredientes.reduce((acc, ing) => {
            return acc + (Number(ing.insumos?.preco || 0) * Number(ing.quantidade_utilizada || 0));
          }, 0);
          const lucroVenda = Number(v.total) - (custoUnitario * Number(v.quantidade));
          return { ...v, lucro: lucroVenda };
        });

        const listaInvertida = [...processados].reverse();
        setVendas(listaInvertida);
        setVendasOriginais(listaInvertida); 

        // Agrupamento para o Gráfico
        const agrupado = {};
        processados.forEach(v => {
          const dia = new Date(v.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
          if (!agrupado[dia]) agrupado[dia] = { faturamento: 0, lucroBruto: 0, prejuizo: 0 };
          agrupado[dia].faturamento += Number(v.total);
          agrupado[dia].lucroBruto += Number(v.lucro);
        });

        (dataPerdas || []).forEach(p => {
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
        setPrimeiroCarregamento(false); // 🔥 Tela principal montada de vez
      }
    }
    buscarDadosRelatorio();
  }, [filtro]);

  // Filtro local reativo por termo de busca
  useEffect(() => {
    if (!termoPesquisa.trim()) {
      setVendas(vendasOriginais);
      return;
    }
    const filtradas = vendasOriginais.filter((v) =>
      v.produtos?.nome?.toLowerCase().includes(termoPesquisa.toLowerCase())
    );
    setVendas(filtradas);
  }, [termoPesquisa, vendasOriginais]);

  // 🔥 CORREÇÃO DE MÉTRICA: Cards superiores sempre calculam com base na lista total (vendasOriginais)
  const faturamentoTotal = useMemo(() => vendasOriginais.reduce((acc, v) => acc + (Number(v.total) || 0), 0), [vendasOriginais]);
  const prejuizoTotal = useMemo(() => perdas.reduce((acc, p) => acc + (Number(p.custo_prejuizo) || 0), 0), [perdas]);
  const lucroRealTotal = useMemo(() => {
    const bruto = vendasOriginais.reduce((acc, v) => acc + (Number(v.lucro) || 0), 0);
    return bruto - prejuizoTotal;
  }, [vendasOriginais, prejuizoTotal]);

  // Tela de bloqueio apenas no primeiro loading da página
  if (primeiroCarregamento) {
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
      
      {/* HEADER E CAMPOS DE BUSCA DISPONÍVEIS SEMPRE */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-dashed border-slate-200 dark:border-white/10">
        <div>
          <h2 className={`text-5xl font-black italic tracking-tighter leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
            Performance
          </h2>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] mt-1 ${darkMode ? "text-indigo-300" : "text-slate-500"}`}>
            Inteligência de Negócio
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          {/* BARRA DE PESQUISA CRUCIAL PARA O CYPRESS */}
          <div className="relative group w-full md:w-80">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            <input
              data-testid="buscar-relatorio"
              type="text"
              placeholder="Pesquisar produto vendido..."
              value={termoPesquisa}
              onChange={(e) => setTermoPesquisa(e.target.value)}
              className={`w-full p-4 pl-14 rounded-[2rem] text-xs font-black outline-none border-2 transition-all ${
                darkMode
                  ? "bg-slate-900 border-white/5 text-white focus:border-pink-500/50 placeholder:text-slate-600"
                  : "bg-white border-slate-100 text-slate-700 focus:border-pink-200 shadow-sm placeholder:text-slate-400"
              }`}
            />
          </div>

          {/* SELETORES DE ABA */}
          <div className={`flex p-1.5 rounded-[2rem] border transition-all ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
            {[{l: "Hoje", v: "1"}, {l: "7 Dias", v: "7"}, {l: "30 Dias", v: "30"}].map((item) => (
              <button 
                key={item.v} 
                onClick={() => setFiltro(item.v)} 
                className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  filtro === item.v ? "bg-pink-500 text-white shadow-lg" : "text-slate-400 hover:text-pink-500"
                }`}
              >
                {item.l}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ÁREA DOS DADOS (Sofre loading parcial sem sumir com a estrutura superior) */}
      {loading ? (
        <div className="space-y-10 animate-in fade-in duration-300" data-testid="relatorio-loading-state">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SkeletonLocal className="h-32 rounded-[3rem]" />
            <SkeletonLocal className="h-32 rounded-[3rem]" />
            <SkeletonLocal className="h-32 rounded-[3rem]" />
          </div>
          <SkeletonLocal className="h-64 rounded-[3rem]" />
        </div>
      ) : (
        <>
          {/* MÉTRICAS FINANCEIRAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-10 rounded-[4rem] border shadow-xl ${darkMode ? "bg-slate-900 border-white/5 text-white" : "bg-white border-slate-50 text-slate-900"}`}>
              <p className="text-[9px] opacity-40 uppercase font-black tracking-[0.3em] mb-4">Venda Bruta</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-pink-500 italic">R$</span>
                <h3 className="text-5xl font-black tracking-tighter">{faturamentoTotal.toFixed(2).replace(".", ",")}</h3>
              </div>
            </div>

            <div className={`p-10 rounded-[4rem] border ${darkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100 shadow-lg shadow-red-500/5"}`}>
              <p className="text-[9px] uppercase font-black tracking-[0.3em] mb-4 text-red-500">Desperdício</p>
              <div className="flex items-baseline gap-2 text-red-500">
                <span className="text-xl font-bold italic">R$</span>
                <h3 className="text-5xl font-black tracking-tighter">{prejuizoTotal.toFixed(2).replace(".", ",")}</h3>
              </div>
            </div>

            <div className={`p-10 rounded-[4rem] border ${darkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100 shadow-xl shadow-emerald-500/5"}`}>
              <p className="text-[9px] uppercase font-black tracking-[0.3em] mb-4 text-emerald-600">Lucro Real</p>
              <div className="flex items-baseline gap-2 text-emerald-600">
                <span className="text-xl font-bold italic">R$</span>
                <h3 className="text-5xl font-black tracking-tighter">{lucroRealTotal.toFixed(2).replace(".", ",")}</h3>
              </div>
            </div>
          </div>

          {/* GRÁFICO */}
          <div className={`p-10 rounded-[4rem] border transition-all ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"}`}>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-10 text-center">Saúde Financeira Diária</p>
            <div className="h-[400px] w-full min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                  <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} />
                  <Tooltip
                    cursor={{ fill: darkMode ? "#ffffff05" : "#00000005" }}
                    contentStyle={{ borderRadius: "24px", border: "none", background: darkMode ? "#0f172a" : "#ffffff", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                    formatter={(value) => [`R$ ${value.toFixed(2).replace(".", ",")}`, ""]}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: "40px", fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }} />
                  <Bar name="Venda Bruta" dataKey="faturamento" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar name="Lucro Real" dataKey="lucroReal" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LISTA DE PRODUTOS ENCONTRADOS PELA BUSCA */}
          <div className={`p-10 rounded-[4rem] border ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"}`}>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-slate-400 px-4">Histórico de Itens Vendidos</h4>
            {vendas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 max-h-60 overflow-y-auto">
                {vendas.map((v) => (
                  <div key={v.id} data-testid="item-vendido-card" className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${darkMode ? "bg-slate-800/40 border-white/5 text-white" : "bg-slate-50 border-slate-100 text-slate-800"}`}>
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-wider text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full">
                        {new Date(v.criado_em).toLocaleDateString("pt-BR")}
                      </span>
                      <h5 className="font-black capitalize text-sm mt-2 truncate">{v.produtos?.nome || "Doce Avulso"}</h5>
                    </div>
                    <div className="flex justify-between items-baseline mt-4 border-t border-dashed border-slate-400/10 pt-2">
                      <span className="text-[10px] font-bold opacity-40">x{v.quantidade} un</span>
                      <span className="font-black text-emerald-500 text-sm">R$ {Number(v.total).toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center py-6">
                Nenhuma venda localizada para esta pesquisa.
              </p>
            )}
          </div>
        </>
      )}

      {/* SIMULADOR DE IMPACTO */}
      <SimuladorReajuste insumos={insumos} produtos={produtos} receitas={receitas} darkMode={darkMode} />

      {/* ANÁLISE DE DESPERDÍCIO */}
      <div className={`rounded-[4rem] border p-10 ${darkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-xl"}`}>
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-slate-400 px-4">Análise de Motivos de Perda</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase text-pink-500">
                  <th className="pb-4">Motivo</th>
                  <th className="pb-4 text-right">Prejuízo Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(perdas.reduce((acc, p) => {
                  if (!acc[p.motivo]) acc[p.motivo] = { motivo: p.motivo, total: 0 };
                  acc[p.motivo].total += Number(p.custo_prejuizo);
                  return acc;
                }, {})).map((p, idx) => (
                  <tr key={idx} className="border-t border-slate-100 dark:border-white/5">
                    <td className="py-4 font-bold text-sm text-slate-500 dark:text-slate-400">{p.motivo}</td>
                    <td className="py-4 text-right font-black text-red-500 italic">R$ {p.total.toFixed(2).replace(".", ",")}</td>
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
              <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Sobre o faturamento bruto</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}