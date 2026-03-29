import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

export function FormNovoProduto({
  darkMode,
  produtoParaEditar,
  onSucesso,
  onCancelar,
}) {
  const [nome, setNome] = useState("");
  const [precoVenda, setPrecoVenda] = useState(""); // Nome da variável interna
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (produtoParaEditar) {
      setNome(produtoParaEditar.nome || "");
      // Ajuste para capturar o preço vindo do banco (pode ser preco_venda)
      setPrecoVenda(produtoParaEditar.preco_venda || "");
    }
  }, [produtoParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);

    const dados = {
      nome: nome.trim(),
      // 🚨 CORREÇÃO: Certifique-se que o nome da coluna no banco é 'preco_venda'
      preco_venda: parseFloat(precoVenda) || 0,
    };

    try {
      let error;
      if (produtoParaEditar) {
        const res = await supabase
          .from("produtos")
          .update(dados)
          .eq("id", produtoParaEditar.id);
        error = res.error;
      } else {
        const res = await supabase.from("produtos").insert([dados]);
        error = res.error;
      }

      if (error) throw error;
      onSucesso();
    } catch (error) {
      console.error("Erro ao salvar produto:", error.message);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-[3.5rem] p-10 animate-in zoom-in-95 duration-300 ${
          darkMode
            ? "bg-slate-900 text-white border border-white/5"
            : "bg-white text-slate-800"
        }`}
      >
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black italic tracking-tighter text-pink-500">
            {produtoParaEditar ? "Ajustar Doce" : "Novo Doce"}
          </h2>
          <button
            onClick={onCancelar}
            className="p-2 hover:scale-110 transition-transform"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase opacity-40 ml-4">
              Nome do Produto
            </label>
            <input
              required
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`w-full p-5 rounded-3xl outline-none border-2 transition-all font-bold ${
                darkMode
                  ? "bg-slate-800 border-transparent focus:border-pink-500/50"
                  : "bg-slate-50 border-transparent focus:border-pink-200"
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase opacity-40 ml-4">
              Preço de Venda (R$)
            </label>
            <input
              required
              type="number"
              step="0.01"
              value={precoVenda}
              onChange={(e) => setPrecoVenda(e.target.value)}
              className={`w-full p-5 rounded-3xl outline-none border-2 transition-all font-bold ${
                darkMode
                  ? "bg-slate-800 border-transparent focus:border-pink-500/50"
                  : "bg-slate-50 border-transparent focus:border-pink-200"
              }`}
            />
          </div>

          <button
            disabled={enviando}
            type="submit"
            className="w-full py-6 bg-pink-500 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-lg shadow-pink-500/20 hover:bg-pink-600 transition-all active:scale-95"
          >
            {enviando ? "Sincronizando..." : "Salvar Produto"}
          </button>
        </form>
      </div>
    </div>
  );
}
