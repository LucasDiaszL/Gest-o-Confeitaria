export function Estoque({ insumos, loading, error, funcaoExcluir }) {
  const handleExcluir = async (id, nome) => {
    if (
      window.confirm(`Tem certeza que deseja remover "${nome}" do estoque?`)
    ) {
      const result = await funcaoExcluir(id);
      if (!result.success) alert("Erro ao excluir: " + result.error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-center">
        Erro ao carregar estoque: {error}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
      {insumos.length > 0 ? (
        insumos.map((item) => {
          // LÓGICA DE ESTADO CRÍTICO
          const qtdAtual = Number(item.quantidade_atual) || 0;
          const qtdMinima = Number(item.estoque_minimo) || 5; 
          const isCritico = qtdAtual <= qtdMinima;
          // PEGA O PREÇO DO BANCO
          const precoUnidade = Number(item.preco) || 0;

          return (
            <div
              key={item.id}
              className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all group relative overflow-hidden ${
                isCritico 
                  ? "border-red-200 bg-red-50/50 animate-pulse-subtle" 
                  : "border-pink-50 hover:shadow-md"
              }`}
            >
              {/* BOTÃO DE EXCLUIR */}
              <button
                onClick={() => handleExcluir(item.id, item.nome)}
                className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100"
                title="Excluir insumo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>

              <div className="flex justify-between items-start mb-4">
                <div className={`${isCritico ? "bg-red-100" : "bg-pink-50"} p-3 rounded-2xl transition-colors`}>
                  <span className="text-xl">{isCritico ? "⚠️" : "📦"}</span>
                </div>
                
                {isCritico && (
                  <span className="mr-8 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase shadow-sm">
                    Crítico
                  </span>
                )}
              </div>

              <h3 className="text-lg font-black text-slate-800 mb-1 capitalize">
                {item.nome}
              </h3>
              
              {/* EXIBIÇÃO DO PREÇO ADICIONADA AQUI */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase">
                  R$ {precoUnidade.toFixed(2).replace(".", ",")} / {item.unidade_medida || "un"}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${isCritico ? "text-red-600" : "text-slate-900"}`}>
                  {qtdAtual}
                </span>
                <span className="text-slate-500 font-bold uppercase text-xs">
                  {item.unidade_medida || "un"}
                </span>
              </div>

              {/* BARRA DE PROGRESSO */}
              <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isCritico ? "bg-red-500 w-1/4" : "bg-pink-400 w-2/3"
                  }`}
                ></div>
              </div>

              {isCritico && (
                <p className="text-[10px] text-red-500 mt-2 font-bold italic">
                  Abaixo do limite de segurança ({qtdMinima}{item.unidade_medida || "un"})
                </p>
              )}
            </div>
          );
        })
      ) : (
        <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
          <p className="text-slate-400 font-medium">
            Nenhum item encontrado no estoque.
          </p>
        </div>
      )}
    </div>
  );
}