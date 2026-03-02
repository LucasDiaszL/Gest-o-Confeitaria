export function ListaVendas({ vendas, loading }) {
  if (loading)
    return (
      <div className="text-center py-10 animate-pulse text-slate-400">
        Carregando...
      </div>
    );

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-pink-50">
      <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
        💰 Últimas Vendas
      </h3>

      <div className="space-y-4">
        {vendas && vendas.length > 0 ? (
          vendas.map((venda) => (
            <div
              key={venda.id}
              className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-pink-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="bg-white p-2 rounded-lg shadow-sm text-lg">
                  🧁
                </span>
                <div>
                  {/* Exibe o nome do produto que buscamos via relacionamento */}
                  <p className="font-black text-slate-700 capitalize">
                    {venda.produtos?.nome || "Produto Removido"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    {new Date(venda.criado_em).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-emerald-500">
                  + R${" "}
                  {parseFloat(venda.total || 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </p>
                <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-black uppercase">
                  {venda.metodo_pagamento}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 py-10">
            Nenhuma venda listada.
          </p>
        )}
      </div>
    </div>
  );
}
