import { useState } from "react";
import { Estoque } from "./pages/Estoque";
import { Produtos } from "./pages/Produtos";
import { ListaVendas } from "./components/ListaVendas";
import { FormNovoInsumo } from "./components/FormNovoInsumo";
import { FormNovoProduto } from "./components/FormNovoProduto";
import { useInsumos } from "./hooks/useInsumos";
import { useProdutos } from "./hooks/useProdutos";
import { useVendas } from "./hooks/useVendas";
import { supabase } from "./services/supabaseClient";

function App() {
  const [aba, setAba] = useState("vendas");
  const [showForm, setShowForm] = useState(false); // Estado para controlar os formulários

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
      alert("Venda realizada e estoque atualizado!");
    } catch (error) {
      console.error("Erro ao vender:", error.message);
      alert("Erro ao vender: " + error.message);
    }
  };

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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  Frente de Caixa
                </h2>
                <p className="text-slate-500">
                  Gestão de vendas e faturamento em tempo real.
                </p>
              </div>
              <button
                onClick={() => recarregarVendas()}
                className="bg-white text-pink-500 border border-pink-100 px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all shadow-sm hover:bg-pink-50 active:scale-95"
              >
                🔄 Atualizar Caixa
              </button>
            </header>

            {/* DASHBOARD DE FATURAMENTO PRINCIPAL */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white flex justify-between items-center relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase opacity-60 mb-2 tracking-widest">
                  Faturamento Total (Hoje)
                </p>
                <h3 className="text-5xl font-black italic">
                  R${" "}
                  {vendas
                    ?.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </h3>
              </div>
              <div className="text-right relative z-10">
                <p className="text-xs font-bold uppercase opacity-60 mb-2 tracking-widest">
                  Pedidos Realizados
                </p>
                <p className="text-4xl font-black">{vendas?.length || 0}</p>
              </div>
              {/* Detalhe de fundo decorativo */}
              <div className="absolute -right-8 -bottom-10 text-[12rem] opacity-10 select-none">
                🍰
              </div>
            </div>

            {/* RESUMO POR MÉTODO DE PAGAMENTO */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Dinheiro", "PIX", "Débito", "Crédito"].map((metodo) => {
                const totalMetodo = (vendas || [])
                  .filter((v) => v.metodo_pagamento === metodo)
                  .reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0);
                return (
                  <div
                    key={metodo}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-pink-50 hover:shadow-md transition-all"
                  >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      {metodo}
                    </p>
                    <p className="text-xl font-black text-slate-800">
                      R$ {totalMetodo.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* VITRINE DE VENDAS RÁPIDAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtos.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-pink-50 hover:border-pink-200 transition-all flex flex-col group"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-3xl bg-pink-50 p-3 rounded-2xl group-hover:bg-pink-100 transition-colors">
                      🧁
                    </span>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg leading-tight">
                        {p.nome}
                      </h3>
                      <p className="text-pink-500 font-bold text-xl">
                        R${" "}
                        {parseFloat(p.preco_venda).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    {["Dinheiro", "PIX", "Débito", "Crédito"].map((metodo) => (
                      <button
                        key={metodo}
                        onClick={() => handleVendaManual(p, metodo)}
                        className="bg-slate-50 hover:bg-slate-900 hover:text-white py-3 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95"
                      >
                        {metodo}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <h3 className="text-xl font-black text-slate-800 mb-6">
                Histórico Recente
              </h3>
              <ListaVendas vendas={vendas} loading={loadVendas} />
            </div>
          </div>
        )}
        {aba === "produtos" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Produtos</h2>
                <p className="text-slate-500">Gerencie sua vitrine.</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className={`${showForm ? "bg-pink-100 text-pink-600" : "bg-slate-900 text-white"} px-6 py-3 rounded-2xl font-bold shadow-lg transition-all`}
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
              insumos={insumos}
            />
          </div>
        )}
        {aba === "estoque" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Estoque</h2>
                <p className="text-slate-500">Insumos em tempo real.</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className={`${showForm ? "bg-pink-100 text-pink-600" : "bg-slate-900 text-white"} px-6 py-3 rounded-2xl font-bold shadow-lg transition-all`}
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
              funcaoExcluir={excluirInsumo}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
