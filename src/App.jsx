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

  const [toast, setToast] = useState({ show: false, mensagem: "", tipo: "sucesso" });
  const [modal, setModal] = useState({
    show: false,
    titulo: "",
    mensagem: "",
    tipo: "confirmar",
    valorInput: "",
    metodoInput: "",
    aoConfirmar: null,
  });

  const { insumos, loading: loadIns, recarregar: recarregarIns, excluirInsumo, adicionarInsumo } = useInsumos();
  const { produtos, loading: loadProd, recarregar: recarregarProd } = useProdutos();
  const { vendas, loading: loadVendas, recarregar: recarregarVendas } = useVendas();

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    setToast({ show: true, mensagem, tipo });
    setTimeout(() => setToast({ show: false, mensagem: "", tipo: "sucesso" }), 3000);
  };

  const handleVendaManual = async (produto, metodo) => {
    try {
      // 1. Registra a venda
      const { error: erroVenda } = await supabase.from("vendas").insert([
        { 
          produto_id: produto.id, 
          quantidade: 1, 
          metodo_pagamento: metodo, 
          total: produto.preco_venda 
        },
      ]);
      if (erroVenda) throw erroVenda;

      // 2. Busca a receita (ingredientes)
      const { data: receita, error: erroReceita } = await supabase
        .from("ingredientes_produto")
        .select("insumo_id, quantidade_utilizada")
        .eq("produto_id", produto.id);

      if (erroReceita) throw erroReceita;

      // 3. Atualiza o estoque sequencialmente
      if (receita && receita.length > 0) {
        for (const item of receita) {
          const { data: ins } = await supabase
            .from("insumos")
            .select("quantidade_atual")
            .eq("id", item.insumo_id)
            .single();

          if (ins) {
            await supabase
              .from("insumos")
              .update({ quantidade_atual: ins.quantidade_atual - item.quantidade_utilizada })
              .eq("id", item.insumo_id);
          }
        }
      }

      // 4. Sincronização Final
      await Promise.all([recarregarIns(), recarregarVendas(), recarregarProd()]);
      mostrarToast(`Venda de ${produto.nome} realizada! 🧁`);
    } catch (error) {
      console.error("Erro na venda:", error);
      mostrarToast("Erro ao vender: " + error.message, "erro");
    }
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
              for (const item of receita) {
                const { data: ins } = await supabase
                  .from("insumos")
                  .select("quantidade_atual")
                  .eq("id", item.insumo_id)
                  .single();
                if (ins) {
                  await supabase
                    .from("insumos")
                    .update({ quantidade_atual: ins.quantidade_atual + item.quantidade_utilizada })
                    .eq("id", item.insumo_id);
                }
              }
            }
          }
          await supabase.from("vendas").delete().eq("id", idVenda);
          await Promise.all([recarregarVendas(), recarregarIns()]);
          mostrarToast("Venda excluída e estoque devolvido!");
          setModal((prev) => ({ ...prev, show: false }));
        } catch (e) {
          mostrarToast("Erro ao excluir", "erro");
        }
      },
    });
  };

  // ... (Mantenha as funções handleAbrirEdicao, handleAbrirEdicaoProduto e handleEditarVenda que você já tem)

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
          
          {aba === "vendas" && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
              {/* Header de Vendas igual ao seu original */}
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
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Terminal Ativo</p>
                  </div>
                </div>
                <button onClick={() => recarregarVendas()} className="...">🔄 Sincronizar Cloud</button>
              </header>

              {/* Cards de métricas do dia */}
              <div className="relative p-12 rounded-[4rem] bg-slate-900 text-white shadow-2xl overflow-hidden group border border-white/5">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]"></div>
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
                  <div className="text-center lg:text-right space-y-2">
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em]">Pedidos Concluídos</p>
                    <p className="text-7xl font-black italic text-emerald-400">{vendas?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Grid de Produtos para Venda */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {produtos.map((p) => (
                  <div key={p.id} className={`group relative p-8 rounded-[3.5rem] border-2 transition-all duration-500 hover:-translate-y-2 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <div className="flex flex-col items-center text-center mb-10">
                      <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl mb-6 ${darkMode ? "bg-slate-800" : "bg-pink-50/50"}`}>🧁</div>
                      <h3 className="font-black text-2xl tracking-tight mb-2">{p.nome}</h3>
                      <div className="px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-500 font-black text-xl">
                        R$ {parseFloat(p.preco_venda).toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {["Dinheiro", "PIX", "Débito", "Crédito"].map((metodo) => (
                        <button key={metodo} onClick={() => handleVendaManual(p, metodo)} className="...">
                          {metodo}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <ListaVendas vendas={vendas} loading={loadVendas} darkMode={darkMode} onEditar={handleEditarVenda} onExcluir={handleExcluirVenda} />
            </div>
          )}

          {aba === "produtos" && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {/* Conteúdo de Produtos que já tínhamos */}
               <Produtos produtos={produtos} loading={loadProd} insumos={insumos} funcaoEditar={handleAbrirEdicaoProduto} darkMode={darkMode} />
            </div>
          )}

          {aba === "estoque" && (
             <div className="space-y-8 animate-in fade-in duration-500">
                <Estoque insumos={insumos} loading={loadIns} funcaoExcluir={excluirInsumo} funcaoEditar={handleAbrirEdicao} darkMode={darkMode} />
             </div>
          )}

          {aba === "relatorios" && <Relatorios darkMode={darkMode} />}
        </div>

        {/* Toasts e Modais de Confirmação */}
        {toast.show && <div className="..."> {toast.mensagem} </div>}
        {modal.show && <div className="..."> {modal.titulo} </div>}
      </main>
    </div>
  );
}

export default App;