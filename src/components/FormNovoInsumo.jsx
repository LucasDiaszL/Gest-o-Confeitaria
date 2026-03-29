import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

export function FormNovoInsumo({
  darkMode,
  insumoParaEditar,
  onSucesso,
  onCancelar,
}) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [unidade, setUnidade] = useState("g");
  const [quantidade, setQuantidade] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("5");
  const [validade, setValidade] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (insumoParaEditar) {
      setNome(insumoParaEditar.nome || "");
      // Suporta tanto 'preco' quanto 'preço' vindo do banco
      setPreco(insumoParaEditar.preco || insumoParaEditar.preço || "");
      setUnidade(insumoParaEditar.unidade_medida || "g");
      setQuantidade(insumoParaEditar.quantidade_atual || "");
      setEstoqueMinimo(insumoParaEditar.estoque_minimo || "5");
      setValidade(insumoParaEditar.data_validade || "");
    }
  }, [insumoParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);

    // Mapeamento corrigido: o banco usa 'preco' (sem acento) conforme os erros de schema
    const dados = {
      nome: nome.trim(),
      preco: parseFloat(preco) || 0, 
      unidade_medida: unidade,
      quantidade_atual: parseFloat(quantidade) || 0,
      estoque_minimo: parseFloat(estoqueMinimo) || 0,
      data_validade: validade === "" ? null : validade,
    };

    try {
      let result;

      if (insumoParaEditar) {
        // Atualização
        result = await supabase
          .from("insumos")
          .update(dados)
          .eq("id", insumoParaEditar.id);
      } else {
        // Inserção
        result = await supabase
          .from("insumos")
          .insert([dados]);
      }

      if (result.error) throw result.error;

      onSucesso();
    } catch (error) {
      console.error("Erro ao salvar no Supabase:", error.message);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg rounded-[3.5rem] shadow-2xl border-2 animate-in zoom-in-95 duration-300 ${
          darkMode
            ? "bg-slate-900 border-white/5 text-white"
            : "bg-white border-pink-50 text-slate-800"
        }`}
      >
        <header className="p-10 pb-0 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tighter italic bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
              {insumoParaEditar ? "Ajustar Insumo" : "Novo Insumo"}
            </h2>
            <p className="text-pink-500 text-[10px] font-black uppercase tracking-widest mt-1">
              Gerenciamento de Dispensa
            </p>
          </div>

          <button
            type="button"
            onClick={onCancelar}
            className={`p-3 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-sm border ${
              darkMode
                ? "bg-slate-800 border-white/5 text-white hover:bg-red-500/20 hover:text-red-500"
                : "bg-slate-100 border-slate-200 text-slate-900 hover:bg-red-50 hover:text-red-500 hover:border-red-100"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase ml-4 opacity-40">Nome do Ingrediente</label>
            <input
              required
              type="text"
              placeholder="Ex: Farinha de Trigo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`w-full p-5 rounded-3xl outline-none border-2 transition-all font-bold ${
                darkMode ? "bg-slate-800 border-transparent focus:border-pink-500/50" : "bg-slate-50 border-transparent focus:border-pink-200"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-4 opacity-40">Preço Pago (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className={`w-full p-5 rounded-3xl outline-none border-2 transition-all font-bold ${
                  darkMode ? "bg-slate-800 border-transparent focus:border-pink-500/50" : "bg-slate-50 border-transparent focus:border-pink-200"
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-4 opacity-40">Unidade</label>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className={`w-full p-5 rounded-3xl outline-none border-2 transition-all font-bold appearance-none ${
                  darkMode ? "bg-slate-800 border-transparent focus:border-pink-500/50" : "bg-slate-50 border-transparent focus:border-pink-200"
                }`}
              >
                <option value="g">Grama (g)</option>
                <option value="kg">Quilo (kg)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="l">Litro (l)</option>
                <option value="un">Unidade (un)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-4 opacity-40">Qtd Atual</label>
              <input
                required
                type="number"
                step="0.001"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className={`w-full p-5 rounded-3xl outline-none border-2 transition-all font-bold ${
                  darkMode ? "bg-slate-800 border-transparent focus:border-pink-500/50" : "bg-slate-50 border-transparent focus:border-pink-200"
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-4 opacity-40">Vencimento</label>
              <input
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                className={`w-full p-5 rounded-3xl outline-none border-2 transition-all font-bold ${
                  darkMode ? "bg-slate-800 border-transparent focus:border-pink-500/50" : "bg-slate-50 border-transparent focus:border-pink-200"
                }`}
              />
            </div>
          </div>

          <button
            disabled={enviando}
            type="submit"
            className="w-full py-6 bg-pink-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-pink-500/20 hover:bg-pink-600 active:scale-95 transition-all mt-4"
          >
            {enviando ? "Salvando..." : insumoParaEditar ? "Atualizar Insumo" : "Cadastrar na Dispensa"}
          </button>
        </form>
      </div>
    </div>
  );
}