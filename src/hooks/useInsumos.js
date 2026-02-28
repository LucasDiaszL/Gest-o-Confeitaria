import { useState, useEffect } from 'react';
import { getInsumos, createInsumo, deleteInsumo } from '../services/insumos';

export function useInsumos() { // Este export aqui está correto (nível superior)
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Removi o 'export' daqui debaixo:
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

  // Removi o 'export' daqui debaixo também:
  const adicionarInsumo = async (novoInsumo) => {
    try {
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
    await carregarInsumos(); // Atualiza a lista na hora
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

  useEffect(() => {
    carregarInsumos();
  }, []);

  // Você já está "exportando" elas aqui no retorno do Hook:
  return { insumos, loading, error, adicionarInsumo, excluirInsumo, recarregar: carregarInsumos };
}