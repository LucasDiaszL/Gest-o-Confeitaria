import { useState } from 'react';
import { useInsumos } from '../hooks/useInsumos';

export function FormNovoInsumo({ onSucesso }) {
  const { adicionarInsumo } = useInsumos();
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('g');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await adicionarInsumo({ 
      nome, 
      quantidade_atual: parseFloat(quantidade),
      unidade_medida: unidade 
    });
    
    if (result.success) {
      if (onSucesso) onSucesso(); // Dispara o recarregar no App.jsx
    } else {
      alert("Erro ao salvar: " + result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-xl shadow-pink-100/20 border border-pink-50 grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-in zoom-in-95">
      <div className="md:col-span-2">
        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Ingrediente</label>
        <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Chocolate 70%" className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-pink-200" />
      </div>
      <div>
        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Qtd.</label>
        <input type="number" step="0.01" required value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-pink-200" />
      </div>
      <div>
        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Unidade</label>
        <select value={unidade} onChange={(e) => setUnidade(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-pink-200 cursor-pointer">
          <option value="g">Gramas (g)</option>
          <option value="kg">Quilos (kg)</option>
          <option value="ml">Mililitros (ml)</option>
          <option value="un">Unidades (un)</option>
        </select>
      </div>
      <button type="submit" className="md:col-span-4 bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-2xl font-black shadow-lg transition-all active:scale-95">
        Salvar Insumo
      </button>
    </form>
  );
}