export function ListaVendas({ vendas, loading, darkMode }) {
  if (loading)
    return (
      <div className={`text-center py-10 animate-pulse font-bold ${darkMode ? "text-slate-700" : "text-slate-400"}`}>
        Carregando histórico...
      </div>
    );

  return (
    <div className={`rounded-[2.5rem] p-8 shadow-sm border transition-all duration-500 ${
      darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-50"
    }`}>
      <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
        💰 Últimas Vendas
      </h3>

      <div className="space-y-4">
        {vendas && vendas.length > 0 ? (
          vendas.map((venda) => (
            <div
              key={venda.id}
              className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${
                darkMode 
                  ? "bg-slate-800/50 border-transparent hover:border-slate-700" 
                  : "bg-slate-50 border-transparent hover:border-pink-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`p-2 rounded-lg shadow-sm text-lg ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                  🧁
                </span>
                <div>
                  <p className={`font-black capitalize ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                    {venda.produtos?.nome || "Produto Removido"}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-tight ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    {new Date(venda.criado_em).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black ${darkMode ? "text-emerald-400" : "text-emerald-500"}`}>
                  + R${" "}
                  {parseFloat(venda.total || 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </p>
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase ${
                  darkMode ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"
                }`}>
                  {venda.metodo_pagamento}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className={`text-center py-10 ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
            Nenhuma venda listada.
          </p>
        )}
      </div>
    </div>
  );
}