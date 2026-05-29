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

function App() {

  // AUTH
  const {
    user,
    role,
    loading: authLoading,
  } = useAuth();

  // MFA
  const [mfaVerified, setMfaVerified] =
    useState(false);

  const [mfaLoading, setMfaLoading] =
    useState(true);

  // ESTADOS
  const [aba, setAba] =
    useState("vendas");

  const [showForm, setShowForm] =
    useState(false);

  const [insumoParaEditar,
    setInsumoParaEditar] =
    useState(null);

  const [produtoParaEditar,
    setProdutoParaEditar] =
    useState(null);

  const [sidebarCollapsed,
    setSidebarCollapsed] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(false);

  const [toast, setToast] =
    useState({
      show: false,
      mensagem: "",
      tipo: "sucesso",
    });

  // REDIRECIONAMENTO
  useEffect(() => {

    if (user && role) {

      setAba(
        role === "admin"
          ? "vendas"
          : "agenda"
      );
    }

  }, [user, role]);

  // VERIFICA MFA
  useEffect(() => {

    const checkMFA = async () => {

      // SEM USUÁRIO
      if (!user) {

        setMfaVerified(false);
        setMfaLoading(false);

        return;
      }

      try {

        const { data } =
          await supabase.auth.mfa
            .getAuthenticatorAssuranceLevel();

        // MFA COMPLETO
        if (
          data.currentLevel === "aal2"
        ) {

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

  // HOOKS
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

  // TOAST
  const mostrarToast = (
    mensagem,
    tipo = "sucesso"
  ) => {

    setToast({
      show: true,
      mensagem,
      tipo,
    });

    setTimeout(() => {

      setToast({
        show: false,
        mensagem: "",
        tipo: "sucesso",
      });

    }, 3000);
  };

  // LOADING
  if (authLoading || mfaLoading) {

    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
          darkMode
            ? "bg-slate-950"
            : "bg-[#FDF8F9]"
        }`}
      >

        <div className="w-10 h-10 border-4 border-slate-200 border-t-pink-500 rounded-full animate-spin"></div>

      </div>
    );
  }

  // BLOQUEIA SEM MFA
  if (!user || !mfaVerified) {

    return <Login />;
  }

  // ======================
  // SISTEMA PROTEGIDO
  // ======================

  return (

    <div
      className={`min-h-screen flex font-sans transition-colors duration-500 ${
        darkMode
          ? "bg-slate-950 text-slate-100"
          : "bg-[#FDF8F9] text-slate-800"
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

      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${
          sidebarCollapsed
            ? "ml-20"
            : "ml-64"
        }`}
      >

        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">

          {/* VENDAS */}
          {aba === "vendas" && (

            <div className="space-y-10">

              <header className="flex justify-between items-end">

                <h2 className="text-5xl font-black italic bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
                  Frente de Caixa
                </h2>

                <button
                  onClick={() =>
                    recarregarVendas()
                  }
                  className={`px-6 py-3 rounded-xl border-2 font-black text-xs transition-all ${
                    darkMode
                      ? "bg-slate-900 border-slate-800 text-slate-300 hover:border-pink-500"
                      : "bg-white border-slate-100 text-slate-500 hover:border-pink-200"
                  }`}
                >
                  🔄 Sincronizar Cloud
                </button>

              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                {produtos.map((p) => (

                  <div
                    key={p.id}
                    className={`p-8 rounded-[3.5rem] border-2 transition-all hover:-translate-y-2 ${
                      darkMode
                        ? "bg-slate-900 border-slate-800"
                        : "bg-white border-slate-100 shadow-sm"
                    }`}
                  >

                    <div className="flex flex-col items-center text-center mb-10">

                      <div
                        className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl mb-6 shadow-inner ${
                          darkMode
                            ? "bg-slate-800"
                            : "bg-pink-50/50"
                        }`}
                      >
                        🧁
                      </div>

                      <h3 className="font-black text-2xl tracking-tight mb-2">
                        {p.nome}
                      </h3>

                      <div className="px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-500 font-black text-xl">
                        R$ {" "}
                        {parseFloat(
                          p.preco_venda
                        )
                          .toFixed(2)
                          .replace(".", ",")}
                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-3">

                      {[
                        "Dinheiro",
                        "PIX",
                        "Débito",
                        "Crédito",
                      ].map((metodo) => (

                        <button
                          key={metodo}
                          className={`py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            darkMode
                              ? "bg-slate-800 text-slate-400 hover:bg-pink-500"
                              : "bg-slate-50 text-slate-500 hover:bg-pink-500"
                          } hover:text-white active:scale-90`}
                        >
                          {metodo}
                        </button>

                      ))}

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

          {/* ESTOQUE */}
          {aba === "estoque" && (

            <Estoque
              insumos={insumos}
              loading={loadIns}
              funcaoExcluir={excluirInsumo}
              funcaoEditar={setInsumoParaEditar}
              darkMode={darkMode}
              recarregarIns={recarregarIns}
            />

          )}

          {/* PRODUTOS */}
          {aba === "produtos" && (

            <Produtos
              produtos={produtos}
              loading={loadProd}
              insumos={insumos}
              funcaoEditar={setProdutoParaEditar}
              darkMode={darkMode}
            />

          )}

          {/* RELATÓRIOS */}
          {aba === "relatorios" && (

            role === "admin"
              ? (
                <Relatorios
                  darkMode={darkMode}
                />
              )
              : (
                <div className="p-20 text-center italic opacity-40 font-bold">
                  🚫 Acesso exclusivo à administração.
                </div>
              )
          )}

          {/* AGENDA */}
          {aba === "agenda" && (

            <Agenda
              darkMode={darkMode}
              produtos={produtos}
              recarregarVendas={recarregarVendas}
            />

          )}

        </div>

        {/* TOAST */}
        {toast.show && (

          <div
            className={`fixed bottom-10 right-10 p-4 px-8 rounded-[2rem] shadow-2xl z-[150] font-black text-white ${
              toast.tipo === "sucesso"
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          >
            {toast.tipo === "sucesso"
              ? "✅ "
              : "❌ "}

            {toast.mensagem}

          </div>

        )}

      </main>

    </div>
  );
}

export default App;