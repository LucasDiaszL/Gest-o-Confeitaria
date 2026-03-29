import { useState } from "react";
import { useProdutos } from "../hooks/useProdutos";
import { ModalReceita } from "../components/ModalReceita";

export function Produtos({
  produtos,
  loading,
  error,
  insumos,
  funcaoEditar,
  darkMode,
}) {
  const { excluirProduto } = useProdutos();
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [busca, setBusca] = useState("");

  const handleAbrirReceita = (produto) => {
    setProdutoSelecionado(produto);
    setModalAberto(true);
  };

  const handleExcluir = async (id, nome) => {
    if (window.confirm(`Deseja remover o produto "${nome}"?`)) {
      await excluirProduto(id);
    }
  };

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500">
          Sincronizando Vitrine...
        </p>
      </div>
    );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* 1. DASHBOARD DE PRODUTOS (ESTILO FRENTE DE CAIXA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`p-10 rounded-[3.5rem] border-2 transition-all flex items-center justify-between overflow-hidden relative group ${
            darkMode
              ? "bg-slate-900 border-white/5 shadow-2xl"
              : "bg-white border-slate-50 shadow-xl"
          }`}
        >
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-[0.3em]">
              Catálogo Ativo
            </p>
            <h3
              className={`text-5xl font-black tracking-tighter italic ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              {produtos.length}{" "}
              <span className="text-2xl not-italic text-pink-500">Doces</span>
            </h3>
          </div>
          <div className="text-6xl group-hover:scale-125 transition-transform duration-500 relative z-10">
            🧁
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative p-10 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl overflow-hidden group border border-white/5">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>
          <div className="relative z-10 flex flex-col justify-center h-full">
            <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-[0.4em]">
              Ticket Médio
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-pink-500 italic">
                R$
              </span>
              <h3 className="text-5xl font-black tracking-tighter italic leading-none">
                {(
                  produtos.reduce(
                    (acc, p) => acc + Number(p.preco_venda || 0),
                    0,
                  ) / (produtos.length || 1)
                )
                  .toFixed(2)
                  .replace(".", ",")}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE BUSCA PREMIUM */}
      <div className="relative group max-w-2xl mx-auto">
        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-110 transition-transform">
          🔍
        </span>
        <input
          type="text"
          placeholder="O que você está procurando hoje?..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className={`w-full p-6 pl-16 rounded-[2.5rem] outline-none border-2 transition-all font-black text-sm tracking-tight ${
            darkMode
              ? "bg-slate-900 border-white/5 text-white focus:border-pink-500/50"
              : "bg-white border-slate-100 text-slate-700 focus:border-pink-200 shadow-sm"
          }`}
        />
      </div>

      {/* 3. GRID DE PRODUTOS ESTILO VITRINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {produtosFiltrados.map((p) => (
          <div
            key={p.id}
            className={`group relative p-8 rounded-[4rem] border-2 transition-all duration-500 hover:-translate-y-3 ${
              darkMode
                ? "bg-slate-900 border-white/5 shadow-2xl hover:border-pink-500/30"
                : "bg-white border-slate-50 shadow-xl hover:border-pink-100"
            }`}
          >
            <div className="flex flex-col items-center text-center mb-8">
              <div
                className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl mb-6 shadow-inner transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${
                  darkMode ? "bg-slate-800" : "bg-pink-50/50"
                }`}
              >
                🍰
              </div>
              <h3
                className={`text-2xl font-black tracking-tighter leading-tight mb-2 ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                {p.nome}
              </h3>
              <span className="px-4 py-1 rounded-full bg-pink-500/10 text-pink-500 text-[9px] font-black uppercase tracking-widest">
                Exclusivo
              </span>
            </div>

            <div
              className={`p-6 rounded-[2.5rem] mb-8 flex flex-col items-center transition-colors ${darkMode ? "bg-slate-800/50" : "bg-slate-50"}`}
            >
              <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">
                Valor na Vitrine
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-pink-500 italic">
                  R$
                </span>
                <span
                  className={`text-5xl font-black tracking-tighter ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  {parseFloat(p.preco_venda).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            {/* AÇÕES (BOTÕES ARREDONDADOS) */}
            <div className="space-y-3">
              <button
                onClick={() => handleAbrirReceita(p)}
                className={`w-full py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                  darkMode
                    ? "bg-white text-slate-900 hover:bg-pink-500 hover:text-white"
                    : "bg-slate-900 text-white hover:bg-pink-600"
                }`}
              >
                📄 Ver Ficha Técnica
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => funcaoEditar(p)}
                  className={`flex-1 py-4 rounded-2xl transition-all font-black text-[9px] uppercase tracking-widest border-2 ${
                    darkMode
                      ? "bg-slate-800 border-transparent text-slate-400 hover:border-pink-500/50 hover:text-white"
                      : "bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-pink-200"
                  }`}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleExcluir(p.id, p.nome)}
                  className={`px-6 rounded-2xl transition-all border-2 ${
                    darkMode
                      ? "bg-slate-800 border-transparent text-slate-400 hover:bg-red-500/20 hover:text-red-500"
                      : "bg-slate-50 border-transparent text-slate-400 hover:bg-red-50 hover:border-red-100 hover:text-red-500"
                  }`}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CONECTADO */}
      {modalAberto && (
        <ModalReceita
          produto={produtoSelecionado}
          insumos={insumos}
          onClose={() => setModalAberto(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
