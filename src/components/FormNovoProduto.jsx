import { useState, useEffect } from "react";
import { useProdutos } from "../hooks/useProdutos";
import { supabase } from "../services/supabaseClient";

export function FormNovoProduto({ onSucesso, produtoParaEditar, darkMode }) {
  const { adicionarProduto } = useProdutos();
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  useEffect(() => {
    if (produtoParaEditar) {
      setNome(produtoParaEditar.nome || "");
      setPreco(produtoParaEditar.preco_venda || "");
    } else {
      setNome("");
      setPreco("");
    }
  }, [produtoParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dadosProduto = { nome, preco_venda: parseFloat(preco) };

    try {
      if (produtoParaEditar) {
        const { error } = await supabase
          .from('produtos')
          .update(dadosProduto)
          .eq('id', produtoParaEditar.id);
        if (error) throw error;
      } else {
        const result = await adicionarProduto(dadosProduto);
        if (!result.success) throw new Error(result.error);
      }
      setNome("");
      setPreco("");
      if (onSucesso) onSucesso();
    } catch (error) {
      alert("Erro ao salvar produto: " + error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-6 rounded-[2.5rem] shadow-xl border grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-in zoom-in-95 duration-300 transition-all ${
        darkMode 
          ? "bg-slate-900 border-slate-800 shadow-slate-950/50" 
          : "bg-white border-pink-50 shadow-pink-100/20"
      } ${produtoParaEditar && !darkMode ? "bg-slate-900 text-white" : ""}`}
    >
      <div className="md:col-span-1">
        <label className={`block text-xs font-black uppercase mb-2 ml-1 tracking-widest ${
          darkMode || produtoParaEditar ? "text-slate-500" : "text-slate-400"
        }`}>
          {produtoParaEditar ? "Editando Produto" : "Nome do Produto"}
        </label>
        <input
          type="text"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Bolo de Pote"
          className={`w-full p-4 rounded-2xl border-none outline-none focus:ring-2 transition-all font-bold ${
            darkMode || produtoParaEditar 
              ? "bg-slate-800 text-white focus:ring-slate-700" 
              : "bg-slate-50 text-slate-800 focus:ring-pink-200"
          }`}
        />
      </div>

      <div>
        <label className={`block text-xs font-black uppercase mb-2 ml-1 tracking-widest ${
          darkMode || produtoParaEditar ? "text-slate-500" : "text-slate-400"
        }`}>
          Preço de Venda (R$)
        </label>
        <input
          type="number"
          step="0.01"
          required
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          placeholder="0,00"
          className={`w-full p-4 rounded-2xl border-none outline-none focus:ring-2 transition-all font-bold ${
            darkMode || produtoParaEditar 
              ? "bg-slate-800 text-white focus:ring-slate-700" 
              : "bg-slate-50 text-slate-800 focus:ring-pink-200"
          }`}
        />
      </div>

      <button
        type="submit"
        className={`p-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 ${
          produtoParaEditar || darkMode
            ? "bg-white text-slate-900 hover:bg-pink-50" 
            : "bg-pink-500 text-white hover:bg-pink-600"
        }`}
      >
        {produtoParaEditar ? "💾 Salvar Alterações" : "Cadastrar Produto"}
      </button>
    </form>
  );
}