import { useState } from "react";

export function Estoque({
  insumos,
  loading,
  funcaoExcluir,
  funcaoEditar,
  darkMode,
  registrarPerdaInsumo,
  recarregarIns,
}) {
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroCritico, setFiltroCritico] = useState(false);
  const [modalPerda, setModalPerda] = useState({
    show: false,
    insumo: null,
    quantidade: "",
    motivo: "Vencimento",
  });

  const insumosFiltrados = insumos.filter((item) => {
    const matchesBusca = item.nome
      .toLowerCase()
      .includes(termoBusca.toLowerCase());

    // 🔥 NOVA LÓGICA: É crítico se a quantidade estiver baixa OU se estiver vencido
    const hoje = new Date();
    const dataValidade = item.data_validade
      ? new Date(item.data_validade)
      : null;
    const isVencido = dataValidade && dataValidade < hoje;
    const isBaixoEstoque =
      (Number(item.quantidade_atual) || 0) <=
      (Number(item.estoque_minimo) || 5);

    const itemPrecisaAtencao = isBaixoEstoque || isVencido;

    return filtroCritico ? matchesBusca && itemPrecisaAtencao : matchesBusca;
  });
  const valorTotalEstoque = insumos.reduce(
    (acc, item) =>
      acc + Number(item.quantidade_atual) * Number(item.preco || 0),
    0,
  );
  const totalCriticos = insumos.filter((item) => {
    const hoje = new Date();
    const dataValidade = item.data_validade
      ? new Date(item.data_validade)
      : null;
    const isVencido = dataValidade && dataValidade < hoje;
    const isBaixoEstoque =
      (Number(item.quantidade_atual) || 0) <=
      (Number(item.estoque_minimo) || 5);
    return isBaixoEstoque || isVencido;
  }).length;

  const confirmarPerda = async () => {
    const { insumo, quantidade, motivo } = modalPerda;
    if (!quantidade || isNaN(quantidade) || Number(quantidade) <= 0)
      return alert("Insira uma quantidade válida.");
    try {
      await registrarPerdaInsumo(insumo, parseFloat(quantidade), motivo);
      setModalPerda({
        show: false,
        insumo: null,
        quantidade: "",
        motivo: "Vencimento",
      });
      if (recarregarIns) recarregarIns();
    } catch (error) {
      alert("Erro ao registrar perda: " + error.message);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-pink-500">
        <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">
          Sincronizando Inventário...
        </p>
      </div>
    );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* 1. DASHBOARD DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative p-10 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl overflow-hidden border border-white/5">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px]"></div>
          <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-[0.3em]">
            Capital em Estoque
          </p>
          <div className="flex items-baseline gap-2 text-white">
            <span className="text-2xl font-bold text-pink-500 italic">R$</span>
            <h3 className="text-5xl font-black tracking-tighter italic leading-none">
              {valorTotalEstoque.toFixed(2).replace(".", ",")}
            </h3>
          </div>
        </div>

        <div
          className={`p-10 rounded-[3.5rem] border-2 flex items-center justify-between transition-all ${darkMode ? "bg-slate-900 border-white/5 shadow-2xl" : "bg-white border-slate-50 shadow-xl"}`}
        >
          <div>
            <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-[0.3em]">
              Variedade
            </p>
            <h3
              className={`text-5xl font-black tracking-tighter italic ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              {insumos.length}{" "}
              <span className="text-xl not-italic text-pink-500">Itens</span>
            </h3>
          </div>
          <div className="text-5xl">📦</div>
        </div>

        <div
          className={`p-10 rounded-[3.5rem] border-2 relative transition-all ${totalCriticos > 0 ? "bg-red-500 text-white shadow-red-900/30 border-transparent" : darkMode ? "bg-slate-900 border-white/5 shadow-2xl" : "bg-white border-slate-50 shadow-xl"}`}
        >
          <p
            className={`text-[10px] font-black uppercase mb-2 tracking-[0.3em] ${totalCriticos > 0 ? "text-white/60" : "text-slate-400"}`}
          >
            Atenção Crítica
          </p>
          <h3 className="text-5xl font-black tracking-tighter italic">
            {totalCriticos}{" "}
            <span
              className={`text-xl not-italic ${totalCriticos > 0 ? "text-white" : "text-emerald-500"}`}
            >
              Alertas
            </span>
          </h3>
          {totalCriticos > 0 && (
            <div className="absolute right-8 bottom-8 text-4xl animate-bounce">
              ⚠️
            </div>
          )}
        </div>
      </div>

      {/* 2. BUSCA E FILTROS */}
      <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
        <div className="relative flex-1 group">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl transition-transform">
            🔍
          </span>
          <input
            type="text"
            placeholder="Localizar insumo..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className={`w-full p-6 pl-16 rounded-[2.5rem] outline-none border-2 transition-all font-black text-sm ${darkMode ? "bg-slate-900 border-white/5 text-white focus:border-pink-500/50" : "bg-white border-slate-100 text-slate-700 focus:border-pink-200 shadow-sm"}`}
          />
        </div>
        <button
          onClick={() => setFiltroCritico(!filtroCritico)}
          className={`px-10 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest transition-all ${filtroCritico ? "bg-red-500 text-white shadow-lg" : darkMode ? "bg-slate-800 text-slate-400 border-2 border-transparent hover:text-white" : "bg-slate-900 text-white hover:bg-pink-600"}`}
        >
          {filtroCritico ? "Mostrar Tudo" : "⚠️ Ver Críticos"}
        </button>
      </div>

      {/* 3. GRID DE CARDS SLIM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {insumosFiltrados.map((item) => {
          const isCritico =
            (Number(item.quantidade_atual) || 0) <=
            (Number(item.estoque_minimo) || 5);
          const hoje = new Date();
          const dataValidade = item.data_validade
            ? new Date(item.data_validade)
            : null;
          const diffDays = dataValidade
            ? Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24))
            : null;
          const estaVencendo =
            diffDays !== null && diffDays <= 7 && diffDays >= 0;
          const vencido = diffDays !== null && diffDays < 0;

          return (
            <div
              key={item.id}
              className={`group relative p-6 rounded-[3rem] border-2 transition-all duration-500 hover:-translate-y-2 ${
                isCritico || vencido || estaVencendo
                  ? darkMode
                    ? "border-red-500/40 bg-red-500/5 shadow-2xl shadow-red-500/10"
                    : "border-red-100 bg-red-50/50"
                  : darkMode
                    ? "border-white/5 bg-slate-900 shadow-2xl hover:border-pink-500/30"
                    : "border-slate-100 bg-white shadow-xl hover:border-pink-100"
              }`}
            >
              {/* TAG DE VALIDADE FLUTUANTE */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                {vencido && (
                  <span className="bg-red-600 text-white text-[7px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    🚨 Vencido
                  </span>
                )}
                {estaVencendo && !vencido && (
                  <span className="bg-orange-500 text-white text-[7px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                    ⚠️ {diffDays}d
                  </span>
                )}
              </div>

              {/* HEADER DO CARD */}
              <div className="flex justify-between items-center mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:rotate-6 ${isCritico || vencido ? "bg-red-500/20" : darkMode ? "bg-slate-800" : "bg-pink-50/50"}`}
                >
                  {item.unidade_medida === "un" ? "🥚" : "⚖️"}
                </div>

                {/* BOTÕES DISCRETOS NO HOVER */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() =>
                      setModalPerda({
                        show: true,
                        insumo: item,
                        quantidade: "",
                        motivo: "Vencimento",
                      })
                    }
                    className="p-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    📉
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Excluir?")) funcaoExcluir(item.id);
                    }}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* INFO DO INSUMO */}
              <div className="text-center mb-4">
                <h4
                  className={`text-lg font-black capitalize tracking-tight leading-tight truncate ${darkMode ? "text-white" : "text-slate-800"}`}
                >
                  {item.nome}
                </h4>
                <div className="flex justify-center items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>R$ {Number(item.preco || 0).toFixed(2)}</span>
                  {dataValidade && <span className="opacity-30">•</span>}
                  {dataValidade && (
                    <span className={vencido ? "text-red-500" : ""}>
                      {dataValidade.toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>

              {/* ÁREA DE ESTOQUE CENTRAL */}
              <div
                className={`py-4 rounded-[2rem] mb-5 flex flex-col items-center justify-center transition-colors ${isCritico || vencido ? "bg-red-500/10" : darkMode ? "bg-slate-800/40" : "bg-slate-50"}`}
              >
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-black tracking-tighter ${isCritico || vencido ? "text-red-500" : darkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {parseFloat(Number(item.quantidade_atual).toFixed(2))}
                  </span>
                  <span className="text-[9px] font-bold opacity-30 uppercase">
                    {item.unidade_medida}
                  </span>
                </div>
              </div>

              {/* BOTÃO PRINCIPAL */}
              <button
                onClick={() => funcaoEditar(item)}
                className={`w-full py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 ${
                  darkMode
                    ? "bg-white text-slate-900 hover:bg-pink-500 hover:text-white"
                    : "bg-slate-900 text-white hover:bg-pink-600 shadow-lg"
                }`}
              >
                Ajustar Estoque
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL DE PERDA */}
      {modalPerda.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-[3rem] p-10 shadow-2xl border-2 animate-in zoom-in-95 duration-300 ${darkMode ? "bg-slate-900 border-white/5 text-white" : "bg-white border-pink-50 text-slate-800"}`}
          >
            <h3 className="text-3xl font-black tracking-tighter italic mb-2 text-orange-500">
              Registrar Perda 📉
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
              {modalPerda.insumo?.nome}
            </p>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">
                  Quantidade ({modalPerda.insumo?.unidade_medida})
                </label>
                <input
                  type="number"
                  value={modalPerda.quantidade}
                  onChange={(e) =>
                    setModalPerda({ ...modalPerda, quantidade: e.target.value })
                  }
                  className={`w-full p-5 mt-2 rounded-2xl font-black outline-none ${darkMode ? "bg-slate-800 focus:ring-2 ring-orange-500" : "bg-slate-50 border border-slate-100"}`}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">
                  Motivo
                </label>
                <select
                  value={modalPerda.motivo}
                  onChange={(e) =>
                    setModalPerda({ ...modalPerda, motivo: e.target.value })
                  }
                  className={`w-full p-5 mt-2 rounded-2xl font-black outline-none ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}
                >
                  <option value="Vencimento">🗓️ Vencimento</option>
                  <option value="Erro de Produção">👩‍🍳 Erro de Produção</option>
                  <option value="Dano Físico">📦 Dano / Quebra</option>
                  <option value="Qualidade">🔍 Qualidade Comprometida</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button
                onClick={() =>
                  setModalPerda({
                    show: false,
                    insumo: null,
                    quantidade: "",
                    motivo: "Vencimento",
                  })
                }
                className="flex-1 py-5 rounded-2xl font-black bg-slate-100 dark:bg-slate-800 text-slate-400"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPerda}
                className="flex-1 py-5 rounded-2xl font-black bg-orange-500 text-white shadow-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
