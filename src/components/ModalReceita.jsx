import { useState, useEffect } from "react";
import {
  getItensReceita,
  addItemReceita,
  deleteItemReceita,
} from "../services/receitas";

export function ModalReceita({ produto, insumos, onClose }) {
  const [itens, setItens] = useState([]);
  const [insumoSelecionado, setInsumoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const dados = await getItensReceita(produto.id);
      setItens(dados || []);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (produto?.id) carregarDados();
  }, [produto?.id]);

  const handleAdicionar = async () => {
    if (!insumoSelecionado || !quantidade) return;

    try {
      await addItemReceita({
        produto_id: produto.id,
        insumo_id: insumoSelecionado,
        // 👇 Nome correto restaurado aqui! 👇
        quantidade_utilizada: parseFloat(quantidade),
      });
      setInsumoSelecionado("");
      setQuantidade("");
      carregarDados();
    } catch (error) {
      console.error("Erro ao adicionar:", error);
    }
  };

  const handleRemover = async (id) => {
    if (confirm("Remover este item?")) {
      await deleteItemReceita(id);
      carregarDados();
    }
  };

  // 👇 CÁLCULO DE CUSTO REAL COM O NOME CORRETO 👇
  const custoTotal = itens.reduce((acc, item) => {
    const preco = Number(item.insumos?.preco) || 0; // MUDADO DE preco_pago PARA preco
    const qtd = Number(item.quantidade_utilizada) || 0;
    return acc + preco * qtd;
  }, 0);

  const lucro = Number(produto.preco_venda) - custoTotal;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 leading-tight">
              Receita: {produto.nome}
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              Gestão de Lucro Real
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-100 p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
          >
            ✕
          </button>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-pink-50 p-5 rounded-[2rem] border border-pink-100">
            <p className="text-[9px] font-black text-pink-400 uppercase mb-1">
              Custo Produção
            </p>
            <p className="text-2xl font-black text-pink-600">
              R$ {custoTotal.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <div
            className={`p-5 rounded-[2rem] border ${lucro > 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}
          >
            <p
              className={`text-[9px] font-black uppercase mb-1 ${lucro > 0 ? "text-green-400" : "text-red-400"}`}
            >
              Lucro por Unid.
            </p>
            <p
              className={`text-2xl font-black ${lucro > 0 ? "text-green-600" : "text-red-600"}`}
            >
              R$ {lucro.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-xs font-black text-slate-400 uppercase px-2 mb-4">
            Ingredientes Escalados
          </h4>
          <div className="space-y-3">
            {carregando ? (
              <div className="text-center py-4 text-slate-300 animate-pulse font-bold uppercase text-[10px]">
                Sincronizando...
              </div>
            ) : itens.length > 0 ? (
              itens.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl group border border-transparent hover:border-pink-100 transition-all"
                >
                  <div>
                    <p className="font-black text-slate-700 text-sm capitalize">
                      {item.insumos?.nome}
                    </p>
                    {/* 👇 O NOME CORRETO NA LISTA TAMBÉM 👇 */}
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {item.quantidade_utilizada} {item.insumos?.unidade_medida}{" "}
                      — R${" "}
                      {(
                        Number(item.insumos?.preco_pago || 0) *
                        Number(item.quantidade_utilizada)
                      )
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemover(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 text-[10px] font-bold uppercase">
                Nenhum ingrediente na lista
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2.5rem] space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={insumoSelecionado}
              onChange={(e) => setInsumoSelecionado(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-800 text-white border-none text-xs font-bold focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Ingrediente...</option>
              {insumos.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.nome}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Qtd"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-800 text-white border-none text-xs font-bold focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <button
            onClick={handleAdicionar}
            className="w-full bg-pink-500 text-white p-4 rounded-2xl font-black text-sm hover:bg-pink-600 active:scale-95 transition-all"
          >
            Confirmar na Receita
          </button>
        </div>
      </div>
    </div>
  );
}
