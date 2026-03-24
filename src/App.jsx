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
    aoConfirmar: null
  });

  const { insumos, loading: loadIns, recarregar: recarregarIns, excluirInsumo } = useInsumos();
  const { produtos, loading: loadProd, recarregar: recarregarProd } = useProdutos();
  const { vendas, loading: loadVendas, recarregar: recarregarVendas } = useVendas();

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

      // 3. Atualiza o estoque de forma sequencial para evitar conflitos
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

      // 4. Sincronização Final: Aguarda o banco confirmar TUDO antes de atualizar a tela
      await Promise.all([
        recarregarIns(),
        recarregarVendas(),
        recarregarProd() // Importante recarregar produtos também se houver dependência
      ]);

      mostrarToast("Venda realizada com sucesso! 🧁"); 
    } catch (error) {
      console.error("Erro na venda:", error);
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
          const { error } = await supabase.from("vendas").update({ total: parseFloat(novoValor), metodo_pagamento: novoMetodo }).eq("id", idVenda);
          if (error) throw error;
          await recarregarVendas();
          mostrarToast("Venda atualizada!");
          setModal(prev => ({ ...prev, show: false }));
        } catch (e) { mostrarToast("Erro ao editar", "erro"); }
      }
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
            const { data: receita } = await supabase.from("ingredientes_produto").select("insumo_id, quantidade_utilizada").eq("produto_id", idProduto);
            if (receita) {
              const promessas = receita.map(async (item) => {
                const { data: ins } = await supabase.from("insumos").select("quantidade_atual").eq("id", item.insumo_id).single();
                if (ins) return supabase.from("insumos").update({ quantidade_atual: ins.quantidade_atual + item.quantidade_utilizada }).eq("id", item.insumo_id);
              });
              await Promise.all(promessas);
            }
          }
          await supabase.from("vendas").delete().eq("id", idVenda);
          await Promise.all([recarregarVendas(), recarregarIns()]);
          mostrarToast("Venda excluída!");
          setModal(prev => ({ ...prev, show: false }));
        } catch (e) { mostrarToast("Erro ao excluir", "erro"); }
      }
    });
  };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-[#FDF8F9] text-slate-800"}`}>
      <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} abaAtiva={aba} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} insumos={insumos} setAbaAtiva={(n) => { setAba(n); setShowForm(false); setInsumoParaEditar(null); setProdutoParaEditar(null); }} />

      <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">
          {aba === "vendas" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <header className="flex justify-between items-center">
                <h2 className="text-4xl font-black">Frente de Caixa</h2>
                <button onClick={() => recarregarVendas()} className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border font-black text-pink-500">🔄 Atualizar</button>
              </header>
              <div className="p-10 rounded-[3rem] bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                <div><p className="text-xs opacity-50 uppercase font-black">Hoje</p><h3 className="text-6xl font-black italic">R$ {vendas?.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0).toFixed(2).replace(".", ",")}</h3></div>
                <div className="text-right"><p className="text-xs opacity-50 uppercase font-black">Pedidos</p><p className="text-5xl font-black">{vendas?.length || 0}</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {produtos.map((p) => (
                  <div key={p.id} className={`p-6 rounded-[2.5rem] border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-50"}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <span className={`text-3xl p-3 rounded-2xl ${darkMode ? "bg-slate-800" : "bg-pink-50"}`}>🧁</span>
                      <div><h3 className="font-black text-lg">{p.nome}</h3><p className="text-pink-500 font-bold text-xl">R$ {parseFloat(p.preco_venda).toFixed(2).replace(".", ",")}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {["Dinheiro", "PIX", "Débito", "Crédito"].map((m) => (
                        <button key={m} onClick={() => handleVendaManual(p, m)} className="py-3 rounded-xl text-[10px] font-black uppercase bg-slate-50 dark:bg-slate-800 hover:bg-pink-500 hover:text-white transition-all">{m}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <ListaVendas vendas={vendas} loading={loadVendas} darkMode={darkMode} onEditar={handleEditarVenda} onExcluir={handleExcluirVenda} />
            </div>
          )}

          {/* ABA PRODUTOS COM BOTÃO REATIVADO */}
          {aba === "produtos" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header className="flex justify-between items-end">
                <h2 className="text-4xl font-black">Produtos</h2>
                <button onClick={() => { setShowForm(!showForm); if (showForm) setProdutoParaEditar(null); }} className={`px-8 py-4 rounded-[1.5rem] font-black shadow-lg transition-all ${showForm ? "bg-pink-100 text-pink-600" : "bg-slate-900 text-white"}`}>
                  {showForm ? "✕ Fechar" : "+ Novo Produto"}
                </button>
              </header>
              {showForm && <FormNovoProduto darkMode={darkMode} produtoParaEditar={produtoParaEditar} onSucesso={() => { recarregarProd(); setShowForm(false); setProdutoParaEditar(null); mostrarToast("Produto guardado!"); }} />}
              <Produtos produtos={produtos} loading={loadProd} insumos={insumos} funcaoEditar={handleAbrirEdicaoProduto} darkMode={darkMode} />
            </div>
          )}

          {/* ABA ESTOQUE COM BOTÃO REATIVADO */}
          {aba === "estoque" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header className="flex justify-between items-end">
                <h2 className="text-4xl font-black">Estoque</h2>
                <button onClick={() => { setShowForm(!showForm); if (showForm) setInsumoParaEditar(null); }} className={`px-8 py-4 rounded-[1.5rem] font-black shadow-lg transition-all ${showForm ? "bg-pink-100 text-pink-600" : "bg-slate-900 text-white"}`}>
                  {showForm ? "✕ Fechar" : "+ Adicionar Insumo"}
                </button>
              </header>
              {showForm && <FormNovoInsumo darkMode={darkMode} insumoParaEditar={insumoParaEditar} onSucesso={() => { recarregarIns(); setShowForm(false); setInsumoParaEditar(null); mostrarToast("Estoque atualizado!"); }} />}
              <Estoque insumos={insumos} loading={loadIns} funcaoExcluir={excluirInsumo} funcaoEditar={handleAbrirEdicao} darkMode={darkMode} />
            </div>
          )}

          {aba === "relatorios" && <Relatorios darkMode={darkMode} />}
        </div>

        {/* FEEDBACK VISUAL */}
        {toast.show && (
          <div className={`fixed bottom-10 right-10 p-4 px-6 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-bottom-5 font-black text-white ${toast.tipo === "sucesso" ? "bg-emerald-500" : "bg-red-500"}`}>
            {toast.tipo === "sucesso" ? "✅ " : "❌ "}{toast.mensagem}
          </div>
        )}

        {/* MODAL PERSONALIZADO */}
        {modal.show && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl ${darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-800"}`}>
              <h3 className="text-2xl font-black mb-2">{modal.titulo}</h3>
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