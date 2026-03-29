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

  // Hooks de Dados
  const { insumos, loading: loadIns, recarregar: recarregarIns, excluirInsumo } = useInsumos();
  const { produtos, loading: loadProd, recarregar: recarregarProd } = useProdutos();
  const { vendas, loading: loadVendas, recarregar: recarregarVendas } = useVendas();

  const mostrarToast = (mensagem, tipo = "sucesso") => {
    setToast({ show: true, mensagem, tipo });
    setTimeout(() => setToast({ show: false, mensagem: "", tipo: "sucesso" }), 3000);
  };

  // --- LÓGICA DE REGISTRO DE PERDA ---
  const handleRegistrarPerdaInsumo = async (insumo, quantidade, motivo) => {
    try {
      const prejuizoCalculado = Number(insumo.preco) * quantidade;
      const { error: erroPerda } = await supabase.from('perdas').insert([{
        insumo_id: insumo.id,
        quantidade_perdida: quantidade,
        motivo: motivo,
        custo_prejuizo: prejuizoCalculado
      }]);
      if (erroPerda) throw erroPerda;

      const { error: erroEstoque } = await supabase.from("insumos").update({ 
        quantidade_atual: Number(insumo.quantidade_atual) - quantidade 
      }).eq("id", insumo.id);

      if (erroEstoque) throw erroEstoque;
      await recarregarIns();
      mostrarToast(`Perda registrada: ${insumo.nome} 🗑️`);
    } catch (error) {
      mostrarToast("Erro ao registrar perda", "erro");
      throw error;
    }
  };

  // --- LÓGICA DE VENDA MANUAL (FRENTE DE CAIXA) ---
  const handleVendaManual = async (produto, metodo) => {
    try {
      const { error: erroVenda } = await supabase.from("vendas").insert([
        { produto_id: produto.id, quantidade: 1, metodo_pagamento: metodo, total: produto.preco_venda },
      ]);
      if (erroVenda) throw erroVenda;

      const { data: receita } = await supabase.from("ingredientes_produto").select("insumo_id, quantidade_utilizada").eq("produto_id", produto.id);

      if (receita) {
        for (const item of receita) {
          const { data: ins } = await supabase.from("insumos").select("quantidade_atual").eq("id", item.insumo_id).single();
          if (ins) {
            await supabase.from("insumos").update({ quantidade_atual: ins.quantidade_atual - item.quantidade_utilizada }).eq("id", item.insumo_id);
          }
        }
      }

      await Promise.all([recarregarIns(), recarregarVendas()]);
      mostrarToast(`Vendido: ${produto.nome} 🧁`);
    } catch (error) {
      mostrarToast("Erro na venda", "erro");
    }
  };

  // --- NAVEGAÇÃO E EDIÇÃO ---
  const handleAbrirEdicao = (ins) => { setInsumoParaEditar(ins); setAba("estoque"); setShowForm(true); };
  const handleAbrirEdicaoProduto = (prod) => { setProdutoParaEditar(prod); setAba("produtos"); setShowForm(true); };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-[#FDF8F9] text-slate-800"}`}>
      <Sidebar 
        darkMode={darkMode} setDarkMode={setDarkMode} 
        abaAtiva={aba} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} 
        setAbaAtiva={(n) => { setAba(n); setShowForm(false); setInsumoParaEditar(null); setProdutoParaEditar(null); }} 
      />

      <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">
          
          {/* 💰 ABA VENDAS (FRENTE DE CAIXA) */}
          {aba === "vendas" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <header className="flex justify-between items-end">
                <h2 className="text-5xl font-black italic bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">Frente de Caixa</h2>
                <button onClick={() => recarregarVendas()} className={`px-6 py-3 rounded-xl border-2 font-black text-xs transition-all ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300 hover:border-pink-500" : "bg-white border-slate-100 text-slate-500 hover:border-pink-200"}`}>🔄 Sincronizar Cloud</button>
              </header>

              <div className="p-12 rounded-[4rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="text-center md:text-left">
                      <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em] mb-2">Faturamento de Hoje</p>
                      <h3 className="text-7xl font-black tracking-tighter italic">R$ {vendas?.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0).toFixed(2).replace(".", ",")}</h3>
                   </div>
                   <div className="text-center md:text-right">
                      <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em] mb-2">Pedidos</p>
                      <p className="text-7xl font-black text-emerald-400 italic">{vendas?.length || 0}</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {produtos.map((p) => (
                  <div key={p.id} className={`p-8 rounded-[3.5rem] border-2 transition-all hover:-translate-y-2 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}>
                    <div className="flex flex-col items-center text-center mb-10">
                      <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl mb-6 shadow-inner ${darkMode ? "bg-slate-800" : "bg-pink-50/50"}`}>🧁</div>
                      <h3 className="font-black text-2xl tracking-tight mb-2">{p.nome}</h3>
                      <div className="px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-500 font-black text-xl">R$ {parseFloat(p.preco_venda).toFixed(2).replace(".", ",")}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {["Dinheiro", "PIX", "Débito", "Crédito"].map((metodo) => (
                        <button key={metodo} onClick={() => handleVendaManual(p, metodo)} className={`py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest transition-all ${darkMode ? "bg-slate-800 text-slate-400 hover:bg-pink-500" : "bg-slate-50 text-slate-500 hover:bg-pink-500"} hover:text-white active:scale-90`}>{metodo}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <ListaVendas vendas={vendas} loading={loadVendas} darkMode={darkMode} />
            </div>
          )}

          {/* 📦 ABA ESTOQUE */}
          {aba === "estoque" && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <header className="flex justify-between items-end">
                  <h2 className="text-4xl font-black italic tracking-tighter">Estoque</h2>
                  <button onClick={() => { setShowForm(true); setInsumoParaEditar(null); }} className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-pink-500 transition-all shadow-lg">+ Novo Insumo</button>
               </header>
               {showForm && (
                 <FormNovoInsumo darkMode={darkMode} insumoParaEditar={insumoParaEditar} onSucesso={() => { recarregarIns(); setShowForm(false); }} onCancelar={() => setShowForm(false)} />
               )}
               <Estoque 
                 insumos={insumos} loading={loadIns} 
                 funcaoExcluir={excluirInsumo} funcaoEditar={handleAbrirEdicao} 
                 darkMode={darkMode} registrarPerdaInsumo={handleRegistrarPerdaInsumo} recarregarIns={recarregarIns} 
               />
            </div>
          )}

          {/* 🍰 ABA PRODUTOS */}
          {aba === "produtos" && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <header className="flex justify-between items-end">
                  <h2 className="text-4xl font-black italic tracking-tighter">Produtos</h2>
                  <button onClick={() => { setShowForm(true); setProdutoParaEditar(null); }} className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-pink-500 transition-all shadow-lg">+ Novo Produto</button>
               </header>
               {showForm && (
                 <FormNovoProduto darkMode={darkMode} produtoParaEditar={produtoParaEditar} onSucesso={() => { recarregarProd(); setShowForm(false); }} onCancelar={() => setShowForm(false)} />
               )}
               <Produtos produtos={produtos} loading={loadProd} insumos={insumos} funcaoEditar={handleAbrirEdicaoProduto} darkMode={darkMode} />
            </div>
          )}

          {/* 📊 ABA RELATÓRIOS */}
          {aba === "relatorios" && <Relatorios darkMode={darkMode} />}
        </div>

        {/* NOTIFICAÇÃO TOAST */}
        {toast.show && (
          <div className={`fixed bottom-10 right-10 p-4 px-8 rounded-[2rem] shadow-2xl z-[150] font-black text-white animate-in slide-in-from-bottom-5 ${toast.tipo === "sucesso" ? "bg-emerald-500" : "bg-red-500"}`}>
            {toast.tipo === "sucesso" ? "✅ " : "❌ "}{toast.mensagem}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;