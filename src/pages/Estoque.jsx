import { useInsumos } from '../hooks/useInsumos';

export function Estoque({ insumos, loading, error, funcaoExcluir }) {


  const handleExcluir = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja remover "${nome}" do estoque?`)) {
      const result = await funcaoExcluir(id);
      if (!result.success) alert("Erro ao excluir: " + result.error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-center">
      Erro ao carregar estoque: {error}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
      {insumos.length > 0 ? (
        insumos.map((item) => (
          <div 
            key={item.id} 
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-pink-50 hover:shadow-md transition-all group relative"
          >
            {/* Botão de Excluir - Aparece no Hover */}
            <button 
              onClick={() => handleExcluir(item.id, item.nome)}
              className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Excluir insumo"
            >
              🗑️
            </button>

            <div className="flex justify-between items-start mb-4">
              <div className="bg-pink-50 p-3 rounded-2xl group-hover:bg-pink-100 transition-colors">
                <span className="text-xl text-pink-600">📦</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                Ref: {item.id.toString().slice(0, 5)}
              </span>
            </div>
            
            <h3 className="text-lg font-black text-slate-800 mb-1 capitalize">
              {item.nome}
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
              Matéria-prima
            </p>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">
                {item.quantidade_atual}
              </span>
              <span className="text-slate-500 font-bold uppercase text-xs">
                {item.unidade_medida || 'g'}
              </span>
            </div>
            
            <div className="mt-4 w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
               <div className="bg-pink-200 h-full w-2/3 rounded-full"></div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
          <p className="text-slate-400 font-medium">Nenhum item encontrado no estoque.</p>
        </div>
      )}
    </div>
  );
}