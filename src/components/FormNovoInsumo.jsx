import { useState, useEffect } from "react";
import { useInsumos } from "../hooks/useInsumos";
import { supabase } from "../services/supabaseClient";

export function FormNovoInsumo({ onSucesso, insumoParaEditar, darkMode }) {
  const { adicionarInsumo } = useInsumos();
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("g");
  const [preco, setPreco] = useState("");
  const [validade, setValidade] = useState(""); // Novo estado

  useEffect(() => {
    if (insumoParaEditar) {
      setNome(insumoParaEditar.nome || "");
      setQuantidade(insumoParaEditar.quantidade_atual || "");
      setUnidade(insumoParaEditar.unidade_medida || "g");
      setPreco(insumoParaEditar.preco || "");
      setValidade(insumoParaEditar.data_validade || ""); // Novo campo
    } else {
      setNome("");
      setQuantidade("");
      setUnidade("g");
      setPreco("");
      setValidade("");
    }
  }, [insumoParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dadosInsumo = {
      nome,
      quantidade_atual: parseFloat(quantidade),
      unidade_medida: unidade,
      preco: parseFloat(preco),
      data_validade: validade, // Envia para o banco
    };

    try {
      if (insumoParaEditar) {
        const { error } = await supabase
          .from('insumos')
          .update(dadosInsumo)
          .eq('id', insumoParaEditar.id);
        if (error) throw error;
      } else {
        const result = await adicionarInsumo(dadosInsumo);
        if (!result.success) throw new Error(result.error);
      }
      if (onSucesso) onSucesso();
      setNome("");
      setQuantidade("");
      setPreco("");
      setValidade("");
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-6 rounded-[2.5rem] shadow-xl border grid grid-cols-1 md:grid-cols-6 gap-4 items-end animate-in zoom-in-95 transition-all ${
        darkMode 
          ? "bg-slate-900 border-slate-800 shadow-slate-950/50" 
          : "bg-white border-pink-50 shadow-pink-100/20"
      }`}
    >
      <div className="md:col-span-1">
        <label className={`block text-xs font-black uppercase mb-2 ml-1 tracking-widest ${
          darkMode || insumoParaEditar ? "text-slate-500" : "text-slate-400"
        }`}>
          {insumoParaEditar ? "Editando" : "Ingrediente"}
        </label>
        <input
          type="text"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Chocolate"
          className={`w-full p-4 rounded-2xl border-none outline-none focus:ring-2 transition-all font-bold ${
            darkMode || insumoParaEditar 
              ? "bg-slate-800 text-white focus:ring-slate-700" 
              : "bg-slate-50 text-slate-800 focus:ring-pink-200"
          }`}
        />
      </div>

      <div>
        <label className={`block text-xs font-black uppercase mb-2 ml-1 tracking-widest ${
          darkMode || insumoParaEditar ? "text-slate-500" : "text-slate-400"
        }`}>
          Qtd
        </label>
        <input
          type="number"
          step="0.01"
          required
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          className={`w-full p-4 rounded-2xl border-none outline-none focus:ring-2 transition-all font-bold ${
            darkMode || insumoParaEditar 
              ? "bg-slate-800 text-white focus:ring-slate-700" 
              : "bg-slate-50 text-slate-800 focus:ring-pink-200"
          }`}
        />
      </div>

      <div>
        <label className={`block text-xs font-black uppercase mb-2 ml-1 tracking-widest ${
          darkMode || insumoParaEditar ? "text-slate-500" : "text-slate-400"
        }`}>
          Unidade
        </label>
        <select
          value={unidade}
          onChange={(e) => setUnidade(e.target.value)}
          className={`w-full p-4 rounded-2xl border-none outline-none focus:ring-2 transition-all font-bold cursor-pointer ${
            darkMode || insumoParaEditar 
              ? "bg-slate-800 text-white focus:ring-slate-700" 
              : "bg-slate-50 text-slate-800 focus:ring-pink-200"
          }`}
        >
          <option value="g">Gramas (g)</option>
          <option value="kg">Quilos (kg)</option>
          <option value="ml">Mililitros (ml)</option>
          <option value="un">Unidades (un)</option>
        </select>
      </div>

      <div>
        <label className={`block text-xs font-black uppercase mb-2 ml-1 tracking-widest ${
          darkMode || insumoParaEditar ? "text-slate-500" : "text-slate-400"
        }`}>
          Preço (R$)
        </label>
        <input
          type="number"
          step="0.01"
          required
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className={`w-full p-4 rounded-2xl border-none outline-none focus:ring-2 transition-all font-bold ${
            darkMode || insumoParaEditar 
              ? "bg-slate-800 text-pink-400 focus:ring-slate-700" 
              : "bg-pink-50/50 text-pink-600 focus:ring-pink-200"
          }`}
        />
      </div>

      {/* CAMPO DE VALIDADE ADICIONADO */}
      <div>
        <label className={`block text-xs font-black uppercase mb-2 ml-1 tracking-widest ${
          darkMode || insumoParaEditar ? "text-slate-500" : "text-slate-400"
        }`}>
          Validade
        </label>
        <input
          type="date"
          required
          value={validade}
          onChange={(e) => setValidade(e.target.value)}
          className={`w-full p-4 rounded-2xl border-none outline-none focus:ring-2 transition-all font-bold ${
            darkMode || insumoParaEditar 
              ? "bg-slate-800 text-white focus:ring-slate-700 [color-scheme:dark]" 
              : "bg-slate-50 text-slate-800 focus:ring-pink-200"
          }`}
        />
      </div>

      <button
        type="submit"
        className={`md:col-span-1 p-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 ${
          insumoParaEditar || darkMode
            ? "bg-white text-slate-900 hover:bg-pink-50" 
            : "bg-pink-500 text-white hover:bg-pink-600"
        }`}
      >
        {insumoParaEditar ? "💾 Salvar" : "Salvar"}
      </button>
    </form>
  );
}