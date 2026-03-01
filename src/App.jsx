import { useState } from "react";
import { Estoque } from "./pages/Estoque";
import { Produtos } from "./pages/Produtos"; // Novo
import { FormNovoInsumo } from "./components/FormNovoInsumo";
import { FormNovoProduto } from "./components/FormNovoProduto"; // Novo
import { useInsumos } from "./hooks/useInsumos";
import { useProdutos } from "./hooks/useProdutos"; // Novo
import { registrarVenda } from './services/vendas';

function App() {
  const [aba, setAba] = useState("vendas");
  const [showForm, setShowForm] = useState(false);

  // Hooks centralizados para sincronização em tempo real
  const {
    insumos,
    loading: loadIns,
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
        {/* ABA VENDAS */}
        {aba === "vendas" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
              <h2 className="text-3xl font-black text-slate-900">
                Frente de Caixa
              </h2>
              <p className="text-slate-500">
                Selecione o produto para registrar a venda e baixar o estoque.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {produtos.map((p) => (
                <button
                  key={p.id}
                  onClick={async () => {
                    if (confirm(`Confirmar venda de 1 unidade de ${p.nome}?`)) {
                      const res = await registrarVenda(p.id, 1);
                      if (res.success) {
                        alert("Venda realizada! Estoque atualizado.");
                        recarregarIns(); // Atualiza a lista de estoque no fundo
                      }
                    }
                  }}
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-pink-50 hover:border-pink-200 hover:shadow-md transition-all flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl bg-pink-50 p-3 rounded-2xl group-hover:bg-pink-500 group-hover:rotate-12 transition-all">
                      🧁
                    </span>
                    <div className="text-left">
                      <h3 className="font-black text-slate-800">{p.nome}</h3>
                      <p className="text-pink-500 font-bold">
                        R$ {parseFloat(p.preco_venda).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase">
                    Vender
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ABA PRODUTOS */}
        {aba === "produtos" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">
                  Vitrine de Produtos
                </h2>
                <p className="text-slate-500">Seus doces prontos para venda.</p>
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

        {/* ABA ESTOQUE */}
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
