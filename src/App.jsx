import { useState } from "react";
import { Estoque } from "./pages/Estoque";
import { Produtos } from "./pages/Produtos";
import { ListaVendas } from "./components/ListaVendas";
import { FormNovoInsumo } from "./components/FormNovoInsumo";
import { FormNovoProduto } from "./components/FormNovoProduto";
import { useInsumos } from "./hooks/useInsumos";
import { useProdutos } from "./hooks/useProdutos";
import { useVendas } from "./hooks/useVendas";
import { registrarVenda } from "./services/vendas";

function App() {
  const [aba, setAba] = useState("vendas");
  const [showForm, setShowForm] = useState(false);

  const {
    insumos,
    loading: loadIns, // Aqui garantimos que o nome é loadIns
    error: errIns,
    recarregar: recarregarIns,
    excluirInsumo,
  } = useInsumos();

  const {
    produtos,
    loading: loadProd,
    error: errProd,
    recarregar: recarregarProd,
  } = useProdutos();

  const {
    vendas,
    loading: loadVendas,
    recarregar: recarregarVendas,
  } = useVendas();

  return (
    <div className="min-h-screen bg-[#FDF8F9] font-sans text-slate-800">
      <nav className="bg-white border-b border-pink-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-pink-100 p-2 rounded-xl">
            <span className="text-2xl">🍰</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-none">
              Doce Controle
            </h1>
            <span className="text-xs text-pink-500 font-medium uppercase tracking-wider">
              Gestão de Confeitaria
            </span>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {["vendas", "produtos", "estoque"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setAba(item);
                setShowForm(false);
              }}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize ${aba === item ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-8">
        {aba === "vendas" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <header className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900">
                  Frente de Caixa
                </h2>
                <p className="text-slate-500">Gestão de vendas do dia atual.</p>
              </div>

              <button
                onClick={() => {
                  if (
                    confirm("Deseja atualizar e conferir as vendas de hoje?")
                  ) {
                    recarregarVendas();
                  }
                }}
                className="bg-white text-slate-400 hover:text-pink-500 border border-slate-100 px-4 py-2 rounded-2xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-2"
              >
                🔄 Atualizar Dia
              </button>
            </header>

            {/* RESUMO DETALHADO POR MÉTODO */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Dinheiro", "PIX", "Débito", "Crédito"].map((metodo) => {
                // Adicionamos o '|| []' para garantir que nunca tente filtrar algo que não existe
                const totalMetodo = (vendas || [])
                  .filter((v) => v.metodo_pagamento === metodo)
                  .reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0);

                return (
                  <div
                    key={metodo}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-pink-50"
                  >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {metodo}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] font-bold text-slate-400">
                        R$
                      </span>
                      <span className="text-xl font-black text-slate-800">
                        {totalMetodo.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CARD DE FATURAMENTO BRUTO */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white flex justify-between items-center">
              <div>
                <p className="text-xs font-bold uppercase opacity-60 mb-1">
                  Faturamento Bruto
                </p>
                <h3 className="text-4xl font-black">
                  R${" "}
                  {vendas
                    ?.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase opacity-60 mb-1">
                  Total de Pedidos
                </p>
                <p className="text-3xl font-black">{vendas?.length || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {produtos.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-pink-50 hover:border-pink-300 transition-all"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl bg-pink-50 p-3 rounded-2xl">
                        🧁
                      </span>
                      <div>
                        <h3 className="font-black text-slate-800">{p.nome}</h3>
                        <p className="text-pink-500 font-bold">
                          R${" "}
                          {parseFloat(p.preco_venda)
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Dinheiro", "PIX", "Débito", "Crédito"].map((metodo) => (
                      <button
                        key={metodo}
                        onClick={async () => {
                          const res = await registrarVenda(p.id, 1, metodo);
                          if (res.success) {
                            await Promise.all([
                              recarregarIns(),
                              recarregarVendas(),
                            ]);
                          }
                        }}
                        className="bg-slate-50 hover:bg-slate-900 hover:text-white py-3 rounded-xl text-[10px] font-black uppercase transition-all"
                      >
                        {metodo}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <ListaVendas vendas={vendas} loading={loadVendas} />
          </div>
        )}

        {aba === "produtos" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">
                  Vitrine de Produtos
                </h2>
                <p className="text-slate-500">
                  Cadastre seus produtos e defina as receitas.
                </p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className={`${showForm ? "bg-pink-100 text-pink-600" : "bg-slate-900 text-white"} px-6 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95`}
              >
                {showForm ? "✕ Fechar" : "+ Novo Produto"}
              </button>
            </header>
            {showForm && (
              <div className="mb-10">
                <FormNovoProduto
                  onSucesso={() => {
                    recarregarProd();
                    setShowForm(false);
                  }}
                />
              </div>
            )}
            <Produtos
              produtos={produtos}
              loading={loadProd}
              error={errProd}
              insumos={insumos}
            />
          </div>
        )}

        {aba === "estoque" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Estoque</h2>
                <p className="text-slate-500">
                  Insumos e matéria-prima em tempo real.
                </p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className={`${showForm ? "bg-pink-100 text-pink-600" : "bg-slate-900 text-white"} px-6 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95`}
              >
                {showForm ? "✕ Fechar" : "+ Adicionar Insumo"}
              </button>
            </header>
            {showForm && (
              <div className="mb-10">
                <FormNovoInsumo
                  onSucesso={() => {
                    recarregarIns();
                    setShowForm(false);
                  }}
                />
              </div>
            )}
            <Estoque
              insumos={insumos}
              loading={loadIns}
              error={errIns}
              funcaoExcluir={excluirInsumo}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
