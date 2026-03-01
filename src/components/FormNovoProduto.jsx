import { useState } from 'react';
import { useProdutos } from '../hooks/useProdutos';

export function FormNovoProduto({ onSucesso }) {
  const { adicionarProduto } = useProdutos();
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await adicionarProduto({ 
      nome, 
      preco_venda: parseFloat(preco) 
    });
    
    if (result.success) {
      setNome('');
      setPreco('');
      if (onSucesso) onSucesso();
    } else {
      alert("Erro ao salvar produto: " + result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-xl shadow-pink-100/20 border border-pink-50 grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-in zoom-in-95 duration-300">
      <div className="md:col-span-1">
        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Nome do Produto</label>
        <input 
          type="text" 
          required 
          value={nome} 
          onChange={(e) => setNome(e.target.value)} 
          placeholder="Ex: Bolo de Pote" 
          className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-pink-200 transition-all" 
        />
      </div>
      <div>
        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Preço de Venda (R$)</label>
        <input 
          type="number" 
          step="0.01" 
          required 
          value={preco} 
          onChange={(e) => setPreco(e.target.value)} 
          placeholder="0,00" 
          className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-pink-200" 
        />
      </div>
      <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl font-black shadow-lg transition-all active:scale-95">
        Cadastrar Produto
      </button>
    </form>
  );
}