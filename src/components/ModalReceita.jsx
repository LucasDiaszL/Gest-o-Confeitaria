import { useState, useEffect, useMemo } from "react";
import {
  getItensReceita,
  addItemReceita,
  deleteItemReceita,
} from "../services/receitas";
import { ChevronDown, Trash2, Plus, AlertCircle, Scale } from "lucide-react";

export function ModalReceita({ produto, insumos, onClose, darkMode }) {
  const [itensReceita, setItensReceita] = useState([]);
  const [insumoSelecionado, setInsumoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [carregando, setCarregando] = useState(true);

  // 1. CARREGAR DADOS DA RECEITA
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

  // 2. CÁLCULOS DE CUSTO E LUCRO (REATIVOS)
  const { custoTotal, lucro } = useMemo(() => {
    const total = itensReceita.reduce((acc, item) => {
      // Suporta 'preco' ou 'preço' vindo do banco
      const precoUnitario = Number(
        item.insumos?.preco || item.insumos?.preço || 0,
      );
      const qtdUtilizada = Number(item.quantidade_utilizada) || 0;
      return acc + precoUnitario * qtdUtilizada;
    }, 0);

    return {
      custoTotal: parseFloat(total.toFixed(2)),
      lucro: parseFloat((Number(produto.preco_venda || 0) - total).toFixed(2)),
    };
  }, [itensReceita, produto.preco_venda]);

  // 3. AÇÕES (ADICIONAR / REMOVER)
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
    if (confirm("Deseja remover este ingrediente da ficha técnica?")) {
      try {
        await deleteItemReceita(id);
        carregarDados();
      } catch (error) {
        console.error("Erro ao remover item:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-3xl rounded-[4rem] shadow-2xl border-2 overflow-hidden flex flex-col max-h-[92vh] transition-all duration-500 ${
          darkMode
            ? "bg-slate-900 border-white/5 text-white"
            : "bg-white border-pink-50 text-slate-800"
        }`}
      >
        {/* EFEITO DE BRILHO AO FUNDO (DARK MODE) */}
        {darkMode && (
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        )}

        {/* HEADER */}
        <header className="relative z-10 p-10 pb-6 flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tighter italic bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent truncate max-w-[450px]">
              Ficha: {produto.nome}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full animate-pulse ${lucro > 0 ? "bg-emerald-500" : "bg-red-500"}`}
              ></span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Análise de Rentabilidade Real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-4 rounded-3xl transition-all active:scale-90 ${
              darkMode
                ? "bg-white/5 text-white hover:bg-red-500/20 hover:text-red-500"
                : "bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <Plus className="rotate-45" size={24} />
          </button>
        </header>

        {/* DASHBOARD DE CUSTOS */}
        <section className="relative z-10 px-10 py-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className={`p-8 rounded-[3rem] border flex flex-col justify-center ${
              darkMode
                ? "bg-white/5 border-white/5"
                : "bg-slate-50 border-slate-100 shadow-sm"
            }`}
          >
            <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.3em] mb-2 text-pink-500">
              Custo Total Insumos
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold italic opacity-50">R$</span>
              <h3 className="text-6xl font-black tracking-tighter italic">
                {custoTotal.toFixed(2).replace(".", ",")}
              </h3>
            </div>
          </div>

          <div
            className={`p-8 rounded-[3rem] border flex flex-col justify-center transition-all duration-700 ${
              lucro > 0
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : "bg-red-500/10 border-red-500/20 text-red-500"
            }`}
          >
            <p className="text-[10px] uppercase font-black tracking-[0.3em] mb-2">
              {lucro > 0 ? "Margem de Lucro" : "Atenção: Margem Negativa"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold italic">R$</span>
              <h3 className="text-6xl font-black tracking-tighter italic">
                {lucro.toFixed(2).replace(".", ",")}
              </h3>
            </div>
          </div>
        </section>

        {/* LISTA DE INGREDIENTES COM SCROLL CUSTOMIZADO */}
        <section className="relative z-10 flex-1 overflow-y-auto px-10 py-6 space-y-3 scrollbar-hide">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">
            Composição da Receita
          </p>

          {carregando ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500">
                Calculando Ficha...
              </p>
            </div>
          ) : itensReceita.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem]">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Nenhum ingrediente adicionado
              </p>
            </div>
          ) : (
            itensReceita.map((item) => {
              const qtdAtual = Number(item.insumos?.quantidade_atual || 0);
              const isCritico =
                qtdAtual <= Number(item.insumos?.estoque_minimo || 5);

              return (
                <div
                  key={item.id}
                  className={`group flex justify-between items-center p-5 rounded-[2.5rem] border transition-all ${
                    darkMode
                      ? "bg-white/5 border-white/5 hover:border-pink-500/30"
                      : "bg-slate-50 border-slate-100 hover:border-pink-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-colors ${
                        isCritico
                          ? "bg-red-500 text-white animate-pulse"
                          : darkMode
                            ? "bg-slate-800 text-slate-400"
                            : "bg-white text-slate-400 shadow-sm"
                      }`}
                    >
                      {isCritico ? (
                        <AlertCircle size={20} />
                      ) : (
                        <Scale size={20} />
                      )}
                    </div>
                    <div>
                      <h4
                        className={`font-black text-md capitalize tracking-tight ${darkMode ? "text-white" : "text-slate-700"}`}
                      >
                        {item.insumos?.nome}
                      </h4>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        Utilizado:{" "}
                        <span className="text-pink-500">
                          {item.quantidade_utilizada}
                          {item.insumos?.unidade_medida}
                        </span>
                        <span className="mx-2 opacity-30">•</span>
                        Estoque:{" "}
                        <span className={isCritico ? "text-red-500" : ""}>
                          {parseFloat(Number(qtdAtual).toFixed(2))}
                          {item.insumos?.unidade_medida}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemover(item.id)}
                    className="p-3 rounded-2xl text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })
          )}
        </section>

        {/* FOOTER: FORMULÁRIO DE ADIÇÃO (DESIGN PRO) */}
        <footer
          className={`relative z-10 p-10 border-t ${
            darkMode
              ? "bg-black/40 border-white/5"
              : "bg-slate-50 border-slate-100 shadow-inner"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-3 h-auto sm:h-14">
            {/* SELECT CUSTOMIZADO */}
            <div className="relative flex-[2] group">
              <ChevronDown
                className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:rotate-180 transition-transform z-10"
                size={18}
              />
              <select
                value={insumoSelecionado}
                onChange={(e) => setInsumoSelecionado(e.target.value)}
                className={`w-full h-full p-4 pr-12 rounded-[1.5rem] outline-none border-2 transition-all font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer ${
                  darkMode
                    ? "bg-slate-800 border-white/5 text-white focus:border-pink-500/50"
                    : "bg-white border-slate-200 text-slate-700 focus:border-pink-200 shadow-sm"
                }`}
              >
                <option value="">🛒 Escolher Insumo (Lote)</option>
                {insumos
                  ?.sort(
                    (a, b) =>
                      new Date(a.data_validade) - new Date(b.data_validade),
                  )
                  .map((ins) => {
                    const qtdLimpa = parseFloat(
                      Number(ins.quantidade_atual).toFixed(2),
                    );
                    const dataVal = ins.data_validade
                      ? new Date(ins.data_validade).toLocaleDateString(
                          "pt-BR",
                          { day: "2-digit", month: "2-digit" },
                        )
                      : "S/V";

                    return (
                      <option
                        key={ins.id}
                        value={ins.id}
                        className={
                          darkMode ? "bg-slate-900" : "bg-white text-slate-900"
                        }
                      >
                        {ins.nome.toUpperCase()} • VAL: {dataVal} • ({qtdLimpa}
                        {ins.unidade_medida})
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* INPUT DE QUANTIDADE */}
            <input
              type="number"
              placeholder="Qtd"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className={`flex-1 h-full p-4 rounded-[1.5rem] text-center font-black text-xs outline-none border-2 transition-all ${
                darkMode
                  ? "bg-slate-800 border-white/5 text-white focus:border-pink-500/50"
                  : "bg-white border-slate-200 text-slate-700 focus:border-pink-200 shadow-sm"
              }`}
            />

            {/* BOTÃO ADICIONAR */}
            <button
              onClick={handleAdicionar}
              className="px-10 py-5 bg-pink-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all active:scale-95 shadow-lg shadow-pink-500/20 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
            >
              Adicionar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
