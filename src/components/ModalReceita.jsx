import { useState } from 'react';
import { addIngredienteReceita } from '../services/fichaTecnica';

export function ModalReceita({ produto, insumos, onClose }) {
  const [insumoSelecionado, setInsumoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const salvarIngrediente = async () => {
    if (!insumoSelecionado || !quantidade) return;

    const { error } = await addIngredienteReceita({
      produto_id: produto.id,
      insumo_id: insumoSelecionado,
      quantidade_necessaria: parseFloat(quantidade)
    });

    if (!error) {
      alert("Ingrediente adicionado!");
      setInsumoSelecionado('');
      setQuantidade('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800">Receita: {produto.nome}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </header>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Selecionar Insumo</label>
            <select 
              className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-pink-200"
              value={insumoSelecionado}
              onChange={(e) => setInsumoSelecionado(e.target.value)}
            >
              <option value="">Escolha um item...</option>
              {insumos.map(ins => (
                <option key={ins.id} value={ins.id}>{ins.nome} ({ins.unidade_medida})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Quantidade Gasta</label>
            <input 
              type="number" 
              className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-pink-200"
              placeholder="Ex: 0.500"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>

          <button 
            onClick={salvarIngrediente}
            className="w-full bg-pink-500 text-white p-4 rounded-2xl font-black shadow-lg shadow-pink-200 active:scale-95 transition-all"
          >
            Adicionar à Receita
          </button>
        </div>
      </div>
    </div>
  );
}