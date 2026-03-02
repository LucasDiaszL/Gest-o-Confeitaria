import { useState } from "react";
import { useProdutos } from "../hooks/useProdutos";
import { ModalReceita } from "../components/ModalReceita";

export function Produtos({ produtos, loading, error, insumos }) {
  const { excluirProduto } = useProdutos();
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const handleAbrirReceita = (produto) => {
    setProdutoSelecionado(produto);
    setModalAberto(true);
  };

  const handleExcluir = async (id, nome) => {
    if (window.confirm(`Deseja remover o produto "${nome}"?`)) {
      await excluirProduto(id);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 animate-pulse text-pink-500 font-bold">
        Carregando vitrine...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center">Erro: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
      {produtos.map((p) => (
        <div
          key={p.id}
          className="bg-white p-6 rounded-4xl shadow-sm border border-pink-50 hover:shadow-md transition-all group relative"
        >
          <button
            onClick={() => handleExcluir(p.id, p.nome)}
            className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
          >
            🗑️
          </button>

          <div className="bg-pink-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-2xl">
            🧁
          </div>

          <h3 className="text-lg font-black text-slate-800 capitalize mb-1">
            {p.nome}
          </h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
            Produto Final
          </p>

          <div className="flex justify-between items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-slate-400">R$</span>
              <span className="text-3xl font-black text-slate-900">
                {parseFloat(p.preco_venda).toFixed(2).replace(".", ",")}
              </span>
            </div>

            <button
              onClick={() => handleAbrirReceita(p)}
              className="bg-pink-50 text-pink-600 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-pink-500 hover:text-white transition-all"
            >
              + Receita
            </button>
          </div>
        </div>
      ))}

      {modalAberto && (
        <ModalReceita
          produto={produtoSelecionado}
          insumos={insumos}
          onClose={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}
