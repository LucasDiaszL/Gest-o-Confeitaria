import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { X } from "lucide-react";

export function FormNovaEncomenda({ produtos, onSucesso, onCancelar, darkMode }) {
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [dataEntrega, setDataEntrega] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Encontra o produto selecionado para pegar o preço
      const produto = produtos.find(p => p.id === produtoId);
      
      // 2. CORREÇÃO: Definindo a variável precoCalculado
      const precoCalculado = (Number(produto?.preco_venda) || 0) * Number(quantidade);

      const { error } = await supabase.from("vendas").insert([
        {
          produto_id: produtoId,
          quantidade: Number(quantidade),
          total: precoCalculado, // Agora a variável existe!
          data_entrega: dataEntrega, 
          metodo_pagamento: "Encomenda",
          // Removido o criado_em manual para o banco usar o default e não dar conflito de fuso
        }
      ]);

      if (error) throw error;
      
      onSucesso();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar encomenda no banco.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-10 rounded-[4rem] border-2 transition-all ${darkMode ? "bg-slate-950 border-pink-500/20" : "bg-white border-pink-100 shadow-2xl"}`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black italic text-pink-500">Agendar Nova Encomenda</h3>
        <button onClick={onCancelar} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-4 text-pink-500 tracking-widest">Produto</label>
            <select 
              required
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value)}
              className={`w-full p-5 rounded-3xl font-bold outline-none border-2 transition-all ${darkMode ? "bg-slate-900 border-white/5 text-white focus:border-pink-500" : "bg-slate-50 border-transparent focus:border-pink-200"}`}
            >
              <option value="">Selecione...</option>
              {produtos.map(p => <option key={p.id} value={p.id}>{p.nome.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-4 text-pink-500 tracking-widest">Quantidade</label>
            <input 
              type="number" 
              min="1"
              required
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className={`w-full p-5 rounded-3xl font-bold outline-none border-2 transition-all ${darkMode ? "bg-slate-900 border-white/5 text-white" : "bg-slate-50 border-transparent"}`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase ml-4 text-pink-500 tracking-widest">Data da Entrega</label>
            <input 
              type="date" 
              required
              value={dataEntrega}
              onChange={(e) => setDataEntrega(e.target.value)}
              className={`w-full p-5 rounded-3xl font-bold outline-none border-2 transition-all ${darkMode ? "bg-slate-900 border-white/5 text-white focus:border-pink-500" : "bg-slate-50 border-transparent focus:border-pink-200"}`}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 py-5 bg-pink-500 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/20"
          >
            {loading ? "Salvando..." : "Confirmar Encomenda"}
          </button>
        </div>
      </form>
    </div>
  );
}