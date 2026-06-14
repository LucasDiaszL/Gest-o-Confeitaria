import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Estoque } from "./pages/Estoque";
import { Produtos } from "./pages/Produtos";
import { Relatorios } from "./pages/Relatorios";
import Agenda from "./pages/Agenda";
import { Login } from "./pages/Login";
import { useAuth } from "./hooks/useAuth";
import { ListaVendas } from "./components/ListaVendas";
import { FormNovoInsumo } from "./components/FormNovoInsumo";
import { FormNovoProduto } from "./components/FormNovoProduto";
import { useInsumos } from "./hooks/useInsumos";
import { useProdutos } from "./hooks/useProdutos";
import { useVendas } from "./hooks/useVendas";
import { supabase } from "./services/supabaseClient";

// ==========================================
// 1. APP PRINCIPAL: ORQUESTRA A AUTENTICAÇÃO E MFA
// ==========================================
export default function App() {
  const normalizar = (texto) =>
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const { user, role, loading: authLoading } = useAuth();
  const [mfaVerified, setMfaVerified] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);

  // VERIFICA MFA
  useEffect(() => {
    const checkMFA = async () => {
      if (!user) {
        setMfaVerified(false);
        setMfaLoading(false);
        return;
      }
      try {
        const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (data.currentLevel === "aal2") {
          setMfaVerified(true);
        } else {
          setMfaVerified(false);
        }
      } catch {
        setMfaVerified(false);
      } finally {
        setMfaLoading(false);
      }
    };
    checkMFA();
  }, [user]);

  // LOADING DA SESSÃO E MFA
  if (authLoading || mfaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-500 bg-[#FDF8F9] dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // BLOQUEIA SEM MFA OU USER
  if (!user || !mfaVerified) {
    return <Login />;
  }

  // SE PASSOU NA SEGURANÇA, MONTA O SISTEMA!
  return <ConteudoSistema user={user} role={role} />;
}

// ==========================================
// 2. CONTEÚDO SISTEMA: ONDE OS DADOS E LÓGICAS VIVEM
// ==========================================
function ConteudoSistema({ user, role }) {
  // --- ESTADOS DA APLICAÇÃO ---
  const [aba, setAba] = useState("vendas");
  const [showForm, setShowForm] = useState(false);
  const [insumoParaEditar, setInsumoParaEditar] = useState(null);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // ESTADO DA BARRA DE PESQUISA (RESGATADO!)
  const [buscaProduto, setBuscaProduto] = useState("");

  const [toast, setToast] = useState({
    show: false,
    mensagem: "",
    tipo: "sucesso",
  });

  // --- REDIRECIONAMENTO AUTOMÁTICO POR PERFIL ---
  useEffect(() => {
    if (user && role) {
      setAba(role === "admin" ? "vendas" : "agenda");
    }
  }, [user, role]);

  // --- HOOKS DE DADOS ---
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
      const { error: erroPerda } = await supabase.from("perdas").insert([
        {
          insumo_id: insumo.id,
          quantidade_perdida: quantidade,
          motivo: motivo,
          custo_prejuizo: prejuizoCalculado,
        },
      ]);
      if (erroPerda) throw erroPerda;

      const { error: erroEstoque } = await supabase
        .from("insumos")
        .update({
          quantidade_atual: Number(insumo.quantidade_atual) - quantidade,
        })
        .eq("id", insumo.id);

      if (erroEstoque) throw erroEstoque;
      await recarregarIns();
      mostrarToast(`Perda registrada: ${insumo.nome} 🗑️`);
    } catch (error) {
      mostrarToast("Erro ao registrar perda", "erro");
    }
  };

  // --- LÓGICA DE VENDA MANUAL BLINDADA (RESGATADA!) ---
  const handleVendaManual = async (produto, metodo) => {
    try {
      // 1. BUSCAR A FICHA TÉCNICA (RECEITA) DO PRODUTO
      const { data: receita, error: erroReceita } = await supabase
        .from("ingredientes_produto")
        .select("insumo_id, quantidade_utilizada")
        .eq("produto_id", produto.id);

      if (erroReceita) throw erroReceita;

      // 2. VALIDAÇÃO DE FICHA TÉCNICA VAZIA 🛑
      if (!receita || receita.length === 0) {
        mostrarToast(`Cadastre a ficha técnica de "${produto.nome}" antes de vender! 📋`, "erro");
        return; 
      }

      // 3. VALIDAÇÃO DE ESTOQUE DOS INSUMOS 🛑
      for (const item of receita) {
        const insumoNoEstoque = insumos.find((i) => i.id === item.insumo_id);
        if (!insumoNoEstoque || Number(insumoNoEstoque.quantidade_atual) < Number(item.quantidade_utilizada)) {
          const nomeInsumo = insumoNoEstoque ? insumoNoEstoque.nome : "Insumo não encontrado";
          mostrarToast(`Sem estoque suficiente de: ${nomeInsumo} 🚫`, "erro");
          return; 
        }
      }

      // 4. SE TEM RECEITA E TEM ESTOQUE, REGISTRA A VENDA ✅
      const { error: erroVenda } = await supabase.from("vendas").insert([
        {
          produto_id: produto.id,
          quantidade: 1,
          metodo_pagamento: metodo,
          total: produto.preco_venda,
        },
      ]);
      if (erroVenda) throw erroVenda;

      // 5. FAZ A BAIXA AUTOMÁTICA DOS INSUMOS UTILIZADOS
      for (const item of receita) {
        const insumoNoEstoque = insumos.find((i) => i.id === item.insumo_id);
        if (insumoNoEstoque) {
          await supabase
            .from("insumos")
            .update({
              quantidade_atual: Number(insumoNoEstoque.quantidade_atual) - Number(item.quantidade_utilizada),
            })
            .eq("id", item.insumo_id);
        }
      }

      await Promise.all([recarregarIns(), recarregarVendas()]);
      mostrarToast(`Vendido: ${produto.nome} 🧁`, "sucesso");
    } catch (error) {
      mostrarToast("Erro na venda", "erro");
    }
  };

  // --- NAVEGAÇÃO E EDIÇÃO ---
  const handleAbrirEdicao = (ins) => {
    setInsumoParaEditar(ins);
    setAba("estoque");
    setShowForm(true);
  };
  const handleAbrirEdicaoProduto = (prod) => {
    setProdutoParaEditar(prod);
    setAba("produtos");
    setShowForm(true);
  };

  // --- FUNÇÕES AUXILIARES DE UX (RESGATADAS!) ---
  
  // 1. Filtra os produtos baseados na barra de pesquisa
  const produtosFiltrados = produtos?.filter((p) =>
    p.nome.toLowerCase().includes(buscaProduto.toLowerCase())
  ) || [];

  // 2. Define emojis dinâmicos pelo nome do doce
  const getEmojiProduto = (nome) => {
    const n = nome.toLowerCase();
    if (n.includes("cenoura")) return "🥕";
    if (n.includes("chocolate") || n.includes("brigadeiro")) return "🍫";
    if (n.includes("morango") || n.includes("red velvet")) return "🍓";
    if (n.includes("limão") || n.includes("limao")) return "🍋";
    if (n.includes("pote")) return "🍯";
    if (n.includes("festa") || n.includes("aniversário")) return "🎂";
    return "🧁"; 
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
        insumos={insumos}
        userRole={role}
        setAbaAtiva={(n) => {
          setAba(n);
          setShowForm(false);
          setInsumoParaEditar(null);
          setProdutoParaEditar(null);
        }}
      />

      <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">
          
          {/* 💰 ABA VENDAS */}
          {aba === "vendas" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              
              <header className="flex justify-between items-end">
                <h2 className="text-5xl font-black italic bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
                  Frente de Caixa
                </h2>
                <button
                  onClick={() => recarregarVendas()}
                  className={`px-6 py-3 rounded-xl border-2 font-black text-xs transition-all ${
                    darkMode
                      ? "bg-slate-900 border-slate-800 text-slate-300 hover:border-pink-500"
                      : "bg-white border-slate-100 text-slate-500 hover:border-pink-200"
                  }`}
                >
                  🔄 Sincronizar Cloud
                </button>
              </header>

              {/* CARD FINANCEIRO */}
              <div className="p-8 rounded-[3rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em] mb-2">
                      Faturamento de Hoje
                    </p>
                    <h3 className="text-6xl font-black tracking-tighter italic">
                      R${" "}
                      {vendas
                        ?.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0)
                        .toFixed(2)
                        .replace(".", ",")}
                    </h3>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em] mb-2">
                      Pedidos
                    </p>
                    <p className="text-6xl font-black text-emerald-400 italic">
                      {vendas?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* BARRA DE PESQUISA (RESGATADA) */}
              <div className="relative w-full mb-8">
                <input
                  data-testid="buscar-produto"
                  type="text"
                  placeholder="Buscar doce por nome..."
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  className={`w-full p-5 pl-14 rounded-3xl border-2 font-black tracking-tight focus:outline-none focus:border-pink-500 transition-colors shadow-sm ${
                    darkMode 
                      ? "bg-slate-900 border-slate-800 text-white placeholder-slate-600" 
                      : "bg-white border-slate-100 text-slate-800 placeholder-slate-300"
                  }`}
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl opacity-40">
                  🔍
                </span>
              </div>

              {/* TÍTULO DA SEÇÃO DE VENDAS */}
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-2xl font-black italic tracking-tighter">
                  Catálogo de Doces
                </h3>
                <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-500 font-black text-[10px] uppercase tracking-widest">
                  {produtosFiltrados.length} itens
                </span>
              </div>

              {/* GRELHA DE PRODUTOS FILTRADOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {produtosFiltrados.length > 0 ? (
                  produtosFiltrados.map((p) => (
                    <div
                      key={p.id}
                      className={`p-8 rounded-[3.5rem] border-2 transition-all hover:-translate-y-2 ${
                        darkMode
                          ? "bg-slate-900 border-slate-800"
                          : "bg-white border-slate-100 shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center mb-10">
                        {/* EMOJI DINÂMICO AQUI 👇 */}
                        <div
                          className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl mb-6 shadow-inner ${
                            darkMode ? "bg-slate-800" : "bg-pink-50/50"
                          }`}
                        >
                          {getEmojiProduto(p.nome)}
                        </div>
                        <h3 className="font-black text-2xl tracking-tight mb-2">
                          {p.nome}
                        </h3>
                        <div className="px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-500 font-black text-xl">
                          R$ {parseFloat(p.preco_venda).toFixed(2).replace(".", ",")}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {["Dinheiro", "PIX", "Débito", "Crédito"].map((metodo) => (
                          <button
  key={metodo}
  data-testid={`btn-${normalizar(metodo)}`}
  onClick={() => handleVendaManual(p, metodo)}
  className={`py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest transition-all ${
    darkMode
      ? "bg-slate-800 text-slate-300 hover:bg-pink-500 hover:text-white"
      : "bg-slate-100 text-slate-700 hover:bg-pink-500 hover:text-white"
  } active:scale-90`}
>
  {metodo}
</button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-10 text-center opacity-40 font-bold italic">
                    Nenhum doce encontrado com esse nome... 😢
                  </div>
                )}
              </div>
              
              <ListaVendas vendas={vendas} loading={loadVendas} darkMode={darkMode} />
            </div>
          )}

          {/* 📦 ABA ESTOQUE (COM TÍTULO NOVO) */}
          {aba === "estoque" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header className="flex justify-between items-end">
                <h2 className="text-5xl font-black italic bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
                  Estoque
                </h2>
                {role === "admin" && (
                  <button onClick={() => { setShowForm(true); setInsumoParaEditar(null); }} className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-pink-500 transition-all shadow-lg">
                    + Novo Insumo
                  </button>
                )}
              </header>
              {showForm && role === "admin" && (
                <FormNovoInsumo darkMode={darkMode} insumoParaEditar={insumoParaEditar} onSucesso={() => { recarregarIns(); setShowForm(false); }} onCancelar={() => setShowForm(false)} />
              )}
              <Estoque insumos={insumos} loading={loadIns} funcaoExcluir={excluirInsumo} funcaoEditar={handleAbrirEdicao} darkMode={darkMode} registrarPerdaInsumo={handleRegistrarPerdaInsumo} recarregarIns={recarregarIns} />
            </div>
          )}

          {/* 🍰 ABA PRODUTOS (COM TÍTULO NOVO) */}
          {aba === "produtos" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header className="flex justify-between items-end">
                <h2 className="text-5xl font-black italic bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
                  Produtos
                </h2>
                {role === "admin" && (
                  <button onClick={() => { setShowForm(true); setProdutoParaEditar(null); }} className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-pink-500 transition-all shadow-lg">
                    + Novo Produto
                  </button>
                )}
              </header>
              {showForm && role === "admin" && (
                <FormNovoProduto darkMode={darkMode} produtoParaEditar={produtoParaEditar} onSucesso={() => { recarregarProd(); setShowForm(false); }} onCancelar={() => setShowForm(false)} />
              )}
              <Produtos produtos={produtos} loading={loadProd} insumos={insumos} funcaoEditar={handleAbrirEdicaoProduto} darkMode={darkMode} />
            </div>
          )}

          {/* 📊 ABA RELATÓRIOS */}
          {aba === "relatorios" && (
             role === "admin" ? <Relatorios darkMode={darkMode} /> : <div className="p-20 text-center italic opacity-40 font-bold">🚫 Acesso exclusivo à administração.</div>
          )}

          {/* 📅 ABA AGENDA */}
          {aba === "agenda" && (
            <Agenda darkMode={darkMode} produtos={produtos} recarregarVendas={recarregarVendas} />
          )}
        </div>

        {/* NOTIFICAÇÃO TOAST */}
        {toast.show && (
          <div className={`fixed bottom-10 right-10 p-4 px-8 rounded-[2rem] shadow-2xl z-[150] font-black text-white ${toast.tipo === "sucesso" ? "bg-emerald-500" : "bg-red-500"}`}>
            {toast.tipo === "sucesso" ? "✅ " : "❌ "} {toast.mensagem}
          </div>
        )}
      </main>
    </div>
  );
}