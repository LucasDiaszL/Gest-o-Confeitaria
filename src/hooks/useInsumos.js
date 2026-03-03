import { useState, useEffect } from "react";
import { getInsumos, createInsumo, deleteInsumo } from "../services/insumos";

export function useInsumos() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [termoBusca, setTermoBusca] = useState("");

  // Filtra os insumos em tempo real conforme você digita
  const insumosFiltrados = insumos.filter((ins) =>
    ins.nome.toLowerCase().includes(termoBusca.toLowerCase()),
  );

  const carregarInsumos = async () => {
    try {
      setLoading(true);
      const data = await getInsumos();
      setInsumos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adicionarInsumo = async (novoInsumo) => {
    try {
      // carrega o { nome, quantidade_atual, unidade_medida, preco }
      // vindo do FormNovoInsumo 
      await createInsumo(novoInsumo);
      await carregarInsumos();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const excluirInsumo = async (id) => {
    try {
      await deleteInsumo(id);
      await carregarInsumos();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    carregarInsumos();
  }, []);

  return {
    insumos: insumosFiltrados, // Retornamos a lista já filtrada
    setTermoBusca, // Função para o input de busca usar
    termoBusca,
    loading,
    error,
    adicionarInsumo,
    excluirInsumo,
    recarregar: carregarInsumos,
  };
}
