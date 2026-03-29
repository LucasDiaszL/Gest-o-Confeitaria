import { useState, useEffect, useCallback } from "react";
// Importando exatamente os nomes exportados no arquivo de serviço
import { getInsumos, createInsumo, deleteInsumo } from "../services/insumos";

export function useInsumos() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termoBusca, setTermoBusca] = useState("");

  const carregarInsumos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInsumos();
      setInsumos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro no hook:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarInsumos();
  }, [carregarInsumos]);

  const adicionarInsumo = async (novoInsumo) => {
    try {
      // Ajuste para garantir que enviamos 'preco' sem acento para o serviço
      const payload = { ...novoInsumo, preco: novoInsumo.preço || novoInsumo.preco };
      delete payload.preço;

      await createInsumo(payload);
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

  const insumosFiltrados = insumos.filter((ins) =>
    ins.nome?.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return {
    insumos: insumosFiltrados,
    setTermoBusca,
    termoBusca,
    loading,
    error,
    adicionarInsumo,
    excluirInsumo,
    recarregar: carregarInsumos,
  };
}