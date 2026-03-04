import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Estoque } from "./pages/Estoque";
import { Produtos } from "./pages/Produtos";
import { Relatorios } from "./pages/Relatorios";
import { ListaVendas } from "./components/ListaVendas";
import { FormNovoInsumo } from "./components/FormNovoInsumo";
import { FormNovoProduto } from "./components/FormNovoProduto";
import { useInsumos } from "./hooks/useInsumos";
import { useProdutos } from "./hooks/useProdutos";
import { useVendas } from "./hooks/useVendas";
import { supabase } from "./services/supabaseClient";

function App() {
  const [aba, setAba] = useState("vendas");
  const [showForm, setShowForm] = useState(false);
  const [insumoParaEditar, setInsumoParaEditar] = useState(null);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const {
    insumos,
    loading: loadIns,
    recarregar: recarregarIns,
    excluirInsumo,
  } = useInsumos();
  const {
    produtos,
    loading: loadProd,
    recarregar: recarregarProd,
  } = useProdutos();
  const {
    vendas,
    loading: loadVendas,
    recarregar: recarregarVendas,
  } = useVendas();

  const handleAbrirEdicao = (insumo) => {
    setInsumoParaEditar(insumo);
    setAba("estoque");
    setShowForm(true);
  };

  const handleAbrirEdicaoProduto = (produto) => {
    setProdutoParaEditar(produto);
    setAba("produtos");
    setShowForm(true);
  };

  const handleVendaManual = async (produto, metodo) => {
    try {
      const { error: erroVenda } = await supabase.from("vendas").insert([
        {
          produto_id: produto.id,
          quantidade: 1,
          metodo_pagamento: metodo,
          total: produto.preco_venda,
        },
      ]);
      if (erroVenda) throw erroVenda;

      const { data: receita, error: erroReceita } = await supabase
        .from("ingredientes_produto")
        .select("insumo_id, quantidade_utilizada")
        .eq("produto_id", produto.id);

      if (erroReceita) throw erroReceita;

      if (receita) {
        for (const item of receita) {
          const { data: insumo } = await supabase
            .from("insumos")
            .select("quantidade_atual")
            .eq("id", item.insumo_id)
            .single();
          if (insumo) {
            const novaQtd = insumo.quantidade_atual - item.quantidade_utilizada;
            await supabase
              .from("insumos")
              .update({ quantidade_atual: novaQtd })
              .eq("id", item.insumo_id);
          }
        }
      }
      await Promise.all([recarregarIns(), recarregarVendas()]);
      alert("Venda realizada!");
    } catch (error) {
      alert("Erro ao vender: " + error.message);
    }
  };

  return (
    <div
      className={`min-h-screen flex font-sans transition-colors duration-500 ${
        darkMode ? "bg-slate-950 text-slate-100" : "bg-[#FDF8F9] text-slate-800"
      }`}
    >
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        abaAtiva={aba}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        setAbaAtiva={(novaAba) => {
          setAba(novaAba);
          setShowForm(false);
          setInsumoParaEditar(null);
          setProdutoParaEditar(null);
        }}
      />

      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}
      >
        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">
          {/* ABA VENDAS */}
          {aba === "vendas" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <header className="flex justify-between items-center">
                <div>
                  <h2
                    className={`text-4xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Frente de Caixa
                  </h2>
                  <p className={darkMode ? "text-slate-400" : "text-slate-500"}>
                    Faturamento e vendas rápidas.
                  </p>
                </div>
                <button
                  onClick={() => recarregarVendas()}
                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all shadow-sm ${
                    darkMode
                      ? "bg-slate-800 text-pink-400 border-slate-700"
                      : "bg-white text-pink-500 border-pink-100"
                  } border`}
                >
                  🔄 Atualizar
                </button>
              </header>

              <div
                className={`p-10 rounded-[3rem] shadow-2xl text-white flex justify-between items-center relative overflow-hidden transition-all ${
                  darkMode
                    ? "bg-slate-900 ring-1 ring-slate-800"
                    : "bg-slate-900"
                }`}
              >
                <div className="relative z-10">
                  <p className="text-xs font-black uppercase opacity-50 mb-3 tracking-[0.2em]">
                    Hoje
                  </p>
                  <h3 className="text-6xl font-black italic">
                    R${" "}
                    {vendas
                      ?.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0)
                      .toFixed(2)
                      .replace(".", ",")}
                  </h3>
                </div>
                <div className="text-right relative z-10">
                  <p className="text-xs font-black uppercase opacity-50 mb-3 tracking-[0.2em]">
                    Pedidos
                  </p>
                  <p className="text-5xl font-black">{vendas?.length || 0}</p>
                </div>
                <div className="absolute -right-10 -bottom-12 text-[15rem] opacity-10 select-none rotate-12">
                  🍰
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {produtos.map((p) => (
                  <div
                    key={p.id}
                    className={`p-6 rounded-[2.5rem] shadow-sm border transition-all flex flex-col group ${
                      darkMode
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-pink-50"
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <span
                        className={`text-3xl p-3 rounded-2xl ${darkMode ? "bg-slate-800" : "bg-pink-50"}`}
                      >
                        🧁
                      </span>
                      <div>
                        <h3
                          className={`font-black text-lg leading-tight ${darkMode ? "text-white" : "text-slate-800"}`}
                        >
                          {p.nome}
                        </h3>
                        <p className="text-pink-500 font-bold text-xl">
                          R${" "}
                          {parseFloat(p.preco_venda)
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      {["Dinheiro", "PIX", "Débito", "Crédito"].map(
                        (metodo) => (
                          <button
                            key={metodo}
                            onClick={() => handleVendaManual(p, metodo)}
                            className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                              darkMode
                                ? "bg-slate-800 text-slate-300 hover:bg-pink-500 hover:text-white"
                                : "bg-slate-50 text-slate-800 hover:bg-slate-900 hover:text-white"
                            }`}
                          >
                            {metodo}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <ListaVendas
                vendas={vendas}
                loading={loadVendas}
                darkMode={darkMode}
              />
            </div>
          )}

          {/* ABA PRODUTOS */}
          {aba === "produtos" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h2
                    className={`text-4xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Produtos
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    if (showForm) setProdutoParaEditar(null);
                  }}
                  className={`${showForm ? "bg-pink-100 text-pink-600" : darkMode ? "bg-slate-800 text-white" : "bg-slate-900 text-white"} px-8 py-4 rounded-[1.5rem] font-black shadow-lg transition-all`}
                >
                  {showForm ? "✕ Fechar" : "+ Novo Produto"}
                </button>
              </header>
              {showForm && (
                <div className="mb-12">
                  <FormNovoProduto
                    darkMode={darkMode}
                    produtoParaEditar={produtoParaEditar}
                    onSucesso={() => {
                      recarregarProd();
                      setShowForm(false);
                      setProdutoParaEditar(null);
                    }}
                  />
                </div>
              )}
              <Produtos
                produtos={produtos}
                loading={loadProd}
                insumos={insumos}
                funcaoEditar={handleAbrirEdicaoProduto}
                darkMode={darkMode}
              />
            </div>
          )}

          {/* ABA ESTOQUE */}
          {aba === "estoque" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h2
                    className={`text-4xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Estoque
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    if (showForm) setInsumoParaEditar(null);
                  }}
                  className={`${showForm ? "bg-pink-100 text-pink-600" : darkMode ? "bg-slate-800 text-white" : "bg-slate-900 text-white"} px-8 py-4 rounded-[1.5rem] font-black shadow-lg transition-all`}
                >
                  {showForm ? "✕ Fechar" : "+ Adicionar Insumo"}
                </button>
              </header>
              {showForm && (
                <div className="mb-12">
                  <FormNovoInsumo
                    darkMode={darkMode}
                    insumoParaEditar={insumoParaEditar}
                    onSucesso={() => {
                      recarregarIns();
                      setShowForm(false);
                      setInsumoParaEditar(null);
                    }}
                  />
                </div>
              )}
              <Estoque
                insumos={insumos}
                loading={loadIns}
                funcaoExcluir={excluirInsumo}
                funcaoEditar={handleAbrirEdicao}
                darkMode={darkMode}
              />
            </div>
          )}

          {aba === "relatorios" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <header className="flex justify-between items-center">
                <div>
                  <h2
                    className={`text-4xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Inteligência de Vendas
                  </h2>
                  <p className={darkMode ? "text-slate-400" : "text-slate-500"}>
                    Análise de faturamento e ticket médio.
                  </p>
                </div>
              </header>

              <Relatorios darkMode={darkMode} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
