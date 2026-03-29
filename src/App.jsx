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

  const [toast, setToast] = useState({
    show: false,
    mensagem: "",
    tipo: "sucesso",
  });

  const [modal, setModal] = useState({
    show: false,
    titulo: "",
    mensagem: "",
    tipo: "confirmar",
    valorInput: "",
    metodoInput: "",
    aoConfirmar: null,
  });

  // Hooks de Dados - Extraindo as funções necessárias
  const {
    insumos,
    loading: loadIns,
    recarregar: recarregarIns,
    excluirInsumo,
    adicionarInsumo, // Importante para o FormNovoInsumo
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

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    setToast({ show: true, mensagem, tipo });
    setTimeout(() => setToast({ show: false, mensagem: "", tipo: "sucesso" }), 3000);
  };

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

      const { data: receita } = await supabase
        .from("ingredientes_produto")
        .select("insumo_id, quantidade_utilizada")
        .eq("produto_id", produto.id);

      if (receita) {
        const promessas = receita.map(async (item) => {
          const { data: ins } = await supabase
            .from("insumos")
            .select("quantidade_atual")
            .eq("id", item.insumo_id)
            .single();
          if (ins)
            return supabase
              .from("insumos")
              .update({
                quantidade_atual: ins.quantidade_atual - item.quantidade_utilizada,
              })
              .eq("id", item.insumo_id);
        });
        await Promise.all(promessas);
      }

      await Promise.all([recarregarIns(), recarregarVendas()]);
      mostrarToast(`Venda de ${produto.nome} realizada! 🧁`);
    } catch (error) {
      mostrarToast("Erro ao vender: " + error.message, "erro");
    }
  };

  const handleEditarVenda = (idVenda, valorAtual, metodoAtual) => {
    setModal({
      show: true,
      titulo: "Editar Venda ✏️",
      mensagem: "Ajuste o valor ou a forma de pagamento desta venda.",
      tipo: "input",
      valorInput: valorAtual,
      metodoInput: metodoAtual,
      aoConfirmar: async (novoValor, novoMetodo) => {
        try {
          const { error } = await supabase
            .from("vendas")
            .update({
              total: parseFloat(novoValor),
              metodo_pagamento: novoMetodo,
            })
            .eq("id", idVenda);
          if (error) throw error;
          await recarregarVendas();
          mostrarToast("Venda atualizada!");
          setModal((prev) => ({ ...prev, show: false }));
        } catch (e) {
          mostrarToast("Erro ao editar", "erro");
        }
      },
    });
  };

  const handleExcluirVenda = (idVenda, idProduto) => {
    setModal({
      show: true,
      titulo: "Excluir Venda 🗑️",
      mensagem: "Tem certeza? Os ingredientes serão devolvidos ao estoque.",
      tipo: "confirmar",
      aoConfirmar: async () => {
        try {
          if (idProduto) {
            const { data: receita } = await supabase
              .from("ingredientes_produto")
              .select("insumo_id, quantidade_utilizada")
              .eq("produto_id", idProduto);
            if (receita) {
              const promessas = receita.map(async (item) => {
                const { data: ins } = await supabase
                  .from("insumos")
                  .select("quantidade_atual")
                  .eq("id", item.insumo_id)
                  .single();
                if (ins)
                  return supabase
                    .from("insumos")
                    .update({
                      quantidade_atual: ins.quantidade_atual + item.quantidade_utilizada,
                    })
                    .eq("id", item.insumo_id);
              });
              await Promise.all(promessas);
            }
          }
          await supabase.from("vendas").delete().eq("id", idVenda);
          await Promise.all([recarregarVendas(), recarregarIns()]);
          mostrarToast("Venda excluída!");
          setModal((prev) => ({ ...prev, show: false }));
        } catch (e) {
          mostrarToast("Erro ao excluir", "erro");
        }
      },
    });
  };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-[#FDF8F9] text-slate-800"}`}>
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        abaAtiva={aba}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        insumos={insumos}
        setAbaAtiva={(n) => {
          setAba(n);
          setShowForm(false);
          setInsumoParaEditar(null);
          setProdutoParaEditar(null);
        }}
      />

      <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">
          
          {/* --- ABA VENDAS --- */}
          {aba === "vendas" && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-5xl font-black tracking-tighter italic bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
                    Frente de Caixa
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Terminal de Vendas Ativo</p>
                  </div>
                </div>
                <button
                  onClick={() => recarregarVendas()}
                  className={`group flex items-center gap-2 px-8 py-4 rounded-2xl border-2 font-black text-xs transition-all shadow-sm active:scale-95 ${
                    darkMode ? "bg-slate-900 border-slate-800 text-slate-300 hover:border-pink-500" : "bg-white border-slate-100 text-slate-500 hover:border-pink-200"
                  }`}
                >
                  <span className="group-hover:rotate-180 transition-transform duration-700 inline-block">🔄</span> Sincronizar Cloud
                </button>
              </header>

              <div className="relative p-12 rounded-[4rem] bg-slate-900 text-white shadow-2xl overflow-hidden group border border-white/5">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px] group-hover:bg-pink-500/30 transition-all duration-1000"></div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                  <div className="text-center lg:text-left space-y-2">
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em]">Faturamento de Hoje</p>
                    <div className="flex items-baseline justify-center lg:justify-start gap-3">
                      <span className="text-3xl font-bold text-pink-500 italic">R$</span>
                      <h3 className="text-8xl font-black tracking-tighter leading-none">
                        {vendas?.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0).toFixed(2).replace(".", ",")}
                      </h3>
                    </div>
                  </div>
                  <div className="hidden lg:block h-24 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                  <div className="text-center lg:text-right space-y-2">
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em]">Pedidos Concluídos</p>
                    <p className="text-7xl font-black italic text-emerald-400 drop-shadow-sm">{vendas?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {produtos.map((p) => (
                  <div key={p.id} className={`group relative p-8 rounded-[3.5rem] border-2 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] ${
                    darkMode ? "bg-slate-900 border-slate-800 hover:border-pink-500/40" : "bg-white border-slate-50 hover:border-pink-100"
                  }`}>
                    <div className="flex flex-col items-center text-center mb-10">
                      <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl mb-6 shadow-inner transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${
                        darkMode ? "bg-slate-800" : "bg-pink-50/50"
                      }`}>🧁</div>
                      <h3 className="font-black text-2xl tracking-tight mb-2">{p.nome}</h3>
                      <div className="px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-500 font-black text-xl tracking-tighter">
                        R$ {parseFloat(p.preco_venda).toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Dinheiro", icon: "💵", color: "hover:bg-emerald-500" },
                        { label: "PIX", icon: "⚡", color: "hover:bg-cyan-500" },
                        { label: "Débito", icon: "💳", color: "hover:bg-blue-500" },
                        { label: "Crédito", icon: "🛍️", color: "hover:bg-indigo-500" }
                      ].map((m) => (
                        <button key={m.label} onClick={() => handleVendaManual(p, m.label)} className={`flex flex-col items-center justify-center py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm border border-transparent ${
                          darkMode ? "bg-slate-800 text-slate-400 " + m.color : "bg-slate-50 text-slate-500 " + m.color
                        } hover:text-white hover:shadow-lg active:scale-90`}>
                          <span className="text-lg mb-1">{m.icon}</span>{m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <ListaVendas vendas={vendas} loading={loadVendas} darkMode={darkMode} onEditar={handleEditarVenda} onExcluir={handleExcluirVenda} />
            </div>
          )}

          {/* --- ABA PRODUTOS --- */}
          {aba === "produtos" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header className="flex justify-between items-end">
                <h2 className="text-4xl font-black tracking-tighter italic">Produtos</h2>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setProdutoParaEditar(null);
                  }}
                  className="px-8 py-4 rounded-[1.5rem] font-black shadow-lg bg-slate-900 text-white hover:bg-pink-500 transition-all"
                >
                  + Novo Produto
                </button>
              </header>
              {showForm && (
                <FormNovoProduto
                  darkMode={darkMode}
                  produtoParaEditar={produtoParaEditar}
                  onSucesso={() => {
                    recarregarProd();
                    setShowForm(false);
                    setProdutoParaEditar(null);
                    mostrarToast("Produto guardado!");
                  }}
                  onCancelar={() => {
                    setShowForm(false);
                    setProdutoParaEditar(null);
                  }}
                />
              )}
              <Produtos produtos={produtos} loading={loadProd} insumos={insumos} funcaoEditar={handleAbrirEdicaoProduto} darkMode={darkMode} />
            </div>
          )}

          {/* --- ABA ESTOQUE --- */}
          {aba === "estoque" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header className="flex justify-between items-end">
                <h2 className="text-4xl font-black tracking-tighter italic text-slate-800 dark:text-white">Estoque</h2>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setInsumoParaEditar(null);
                  }}
                  className="px-8 py-4 rounded-[1.5rem] font-black shadow-lg bg-slate-900 text-white hover:bg-pink-500 transition-all"
                >
                  + Adicionar Insumo
                </button>
              </header>
              
              {showForm && (
                <FormNovoInsumo
                  darkMode={darkMode}
                  insumoParaEditar={insumoParaEditar}
                  adicionarInsumo={adicionarInsumo} // Propriedade corrigida
                  onSucesso={() => {
                    recarregarIns();
                    setShowForm(false);
                    setInsumoParaEditar(null);
                    mostrarToast("Estoque atualizado!");
                  }}
                  onCancelar={() => {
                    setShowForm(false);
                    setInsumoParaEditar(null);
                  }}
                />
              )}
              <Estoque insumos={insumos} loading={loadIns} funcaoExcluir={excluirInsumo} funcaoEditar={handleAbrirEdicao} darkMode={darkMode} />
            </div>
          )}

          {aba === "relatorios" && <Relatorios darkMode={darkMode} />}
        </div>

        {/* FEEDBACK & MODAIS */}
        {toast.show && (
          <div className={`fixed bottom-10 right-10 p-4 px-6 rounded-2xl shadow-2xl z-[150] animate-in slide-in-from-bottom-5 font-black text-white ${toast.tipo === "sucesso" ? "bg-emerald-500" : "bg-red-500"}`}>
            {toast.tipo === "sucesso" ? "✅ " : "❌ "}{toast.mensagem}
          </div>
        )}

        {modal.show && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl ${darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-800"}`}>
              <h3 className="text-2xl font-black mb-2 tracking-tight">{modal.titulo}</h3>
              <p className="opacity-60 mb-6 font-bold">{modal.mensagem}</p>
              {modal.tipo === "input" && (
                <div className="space-y-4 mb-6">
                  <input type="number" value={modal.valorInput} onChange={(e) => setModal({...modal, valorInput: e.target.value})} className={`w-full p-4 rounded-2xl font-black outline-pink-500 ${darkMode ? "bg-slate-800" : "bg-slate-100"}`} placeholder="Valor" />
                  <select value={modal.metodoInput} onChange={(e) => setModal({...modal, metodoInput: e.target.value})} className={`w-full p-4 rounded-2xl font-black ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                    {["Dinheiro", "PIX", "Débito", "Crédito"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setModal({...modal, show: false})} className="flex-1 py-4 rounded-2xl font-black bg-slate-100 dark:bg-slate-800 opacity-50">Cancelar</button>
                <button onClick={() => modal.tipo === "input" ? modal.aoConfirmar(modal.valorInput, modal.metodoInput) : modal.aoConfirmar()} className="flex-1 py-4 rounded-2xl font-black bg-pink-500 text-white">Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;