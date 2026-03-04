import { useState, useEffect } from "react";
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

        // Busca profunda: Venda -> Produto -> Ingredientes -> Preço do Insumo
        const { data, error } = await supabase
          .from("vendas")
          .select(
            `
            id, total, quantidade, criado_em,
            produtos (
              nome,
              ingredientes_produto (
                quantidade_utilizada,
                insumos (preco, quantidade_atual)
              )
            )
          `,
          )
          .gte("criado_em", dataInicio.toISOString())
          .order("criado_em", { ascending: true });

        if (error) throw error;

        if (data) {
          const processados = data.map((v) => {
            // Cálculo do custo unitário do produto baseado na receita
            const ingredientes = v.produtos?.ingredientes_produto || [];

            const custoUnitario = ingredientes.reduce((acc, ing) => {
              const precoEmb = Number(ing.insumos?.preco) || 0;
              const qtdEmb = Number(ing.insumos?.quantidade_atual) || 1;
              const qtdUsada = Number(ing.quantidade_utilizada) || 0;
              // Regra de 3: (Preço da Embalagem / Qtd da Embalagem) * Qtd Usada na Receita
              return acc + (precoEmb / qtdEmb) * qtdUsada;
            }, 0);

            const vendaTotal = Number(v.total) || 0;
            const custoTotalVenda = custoUnitario * (Number(v.quantidade) || 1);
            const lucroCalculado = vendaTotal - custoTotalVenda;

            return {
              ...v,
              lucro: lucroCalculado,
            };
          });

          // Atualiza a lista (mais recentes primeiro)
          setVendas([...processados].reverse());

          // Agrupamento por dia para o gráfico
          const agrupado = processados.reduce((acc, v) => {
            const dia = new Date(v.criado_em).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            });
            if (!acc[dia]) acc[dia] = { faturamento: 0, lucro: 0 };
            acc[dia].faturamento += Number(v.total) || 0;
            acc[dia].lucro += Number(v.lucro) || 0;
            return acc;
          }, {});

          const formatadoGrafico = Object.keys(agrupado).map((dia) => ({
            dia,
            faturamento: agrupado[dia].faturamento,
            lucro: agrupado[dia].lucro,
          }));

          setDadosGrafico(formatadoGrafico);
        }
      } catch (err) {
        console.error("Erro nos Relatórios:", err);
      } finally {
        setLoading(false);
      }
    }
    buscarRelatorio();
  }, [filtro]);

  const faturamentoTotalGeral = vendas.reduce(
    (acc, v) => acc + (Number(v.total) || 0),
    0,
  );
  const lucroTotalGeral = vendas.reduce((acc, v) => acc + (v.lucro || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* SELEÇÃO DE PERÍODO */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {[
          { label: "Hoje", valor: "1" },
          { label: "7 Dias", valor: "7" },
          { label: "30 Dias", valor: "30" },
        ].map((item) => (
          <button
            key={item.valor}
            onClick={() => setFiltro(item.valor)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filtro === item.valor
                ? "bg-white dark:bg-slate-700 text-pink-500 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`p-8 rounded-[3rem] shadow-xl ${darkMode ? "bg-slate-900 border border-slate-800" : "bg-white"}`}
        >
          <p className="text-[10px] font-black uppercase text-pink-500 mb-2 tracking-widest">
            Faturamento Bruto
          </p>
          <h2
            className={`text-4xl font-black italic ${darkMode ? "text-white" : "text-slate-800"}`}
          >
            R$ {faturamentoTotalGeral.toFixed(2).replace(".", ",")}
          </h2>
        </div>

        <div
          className={`p-8 rounded-[3rem] shadow-xl ${darkMode ? "bg-slate-900 border border-green-900/30" : "bg-white border border-green-50"}`}
        >
          <p className="text-[10px] font-black uppercase text-green-500 mb-2 tracking-widest">
            Lucro Real (Líquido)
          </p>
          <h2 className="text-4xl font-black italic text-green-500">
            R$ {lucroTotalGeral.toFixed(2).replace(".", ",")}
          </h2>
        </div>
      </div>

      {/* GRÁFICO COMPARATIVO */}
      <div
        className={`p-8 rounded-[3rem] shadow-2xl h-[400px] ${darkMode ? "bg-slate-900 border border-slate-800" : "bg-white"}`}
      >
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 text-center">
          Desempenho: Vendas vs Lucro
        </p>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={dadosGrafico}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={darkMode ? "#1e293b" : "#f1f5f9"}
            />
            <XAxis
              dataKey="dia"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: darkMode ? "#1e293b" : "#f8fafc" }}
              contentStyle={{
                borderRadius: "20px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                fontWeight: "bold",
              }}
              // 👇 ADICIONE ESTA PROPRIEDADE ABAIXO
              formatter={(value) =>
                `R$ ${Number(value).toFixed(2).replace(".", ",")}`
              }
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{
                paddingBottom: "20px",
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            />
            <Bar
              name="Venda"
              dataKey="faturamento"
              fill="#ec4899"
              radius={[6, 6, 0, 0]}
              barSize={30}
            />
            <Bar
              name="Lucro"
              dataKey="lucro"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABELA DE HISTÓRICO */}
      <div
        className={`rounded-[3rem] overflow-hidden shadow-2xl ${darkMode ? "bg-slate-900 border border-slate-800" : "bg-white border-pink-50"}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={darkMode ? "bg-slate-800/50" : "bg-slate-50"}>
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-50 text-pink-500">
                  Data
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-50 text-pink-500">
                  Produto
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest opacity-50 text-pink-500 text-right">
                  Lucro
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="3"
                    className="p-20 text-center animate-pulse font-black text-slate-400 uppercase text-xs tracking-widest"
                  >
                    Processando Inteligência Financeira...
                  </td>
                </tr>
              ) : vendas.length > 0 ? (
                vendas.map((v) => (
                  <tr
                    key={v.id}
                    className={`border-t ${darkMode ? "border-slate-800 hover:bg-slate-800/30" : "border-pink-50/50 hover:bg-pink-50/20"}`}
                  >
                    <td className="p-6 text-xs font-bold opacity-60">
                      {new Date(v.criado_em).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-6 font-black text-sm">
                      {v.produtos?.nome || "Produto Excluído"}
                    </td>
                    <td className="p-6 font-black text-green-500 text-right">
                      R$ {v.lucro.toFixed(2).replace(".", ",")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="p-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest"
                  >
                    Sem dados para este período. 🍰
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
