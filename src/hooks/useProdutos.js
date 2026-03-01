import { useState, useEffect } from 'react';
import { getProdutos, createProduto, deleteProduto } from '../services/produtos';

export function useProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const data = await getProdutos();
      setProdutos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adicionarProduto = async (novoProduto) => {
    try {
      await createProduto(novoProduto);
      await carregarProdutos(); // Atualização sem F5 garantida
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const excluirProduto = async (id) => {
    try {
      await deleteProduto(id);
      await carregarProdutos();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  return { 
    produtos, 
    loading, 
    error, 
    adicionarProduto, 
    excluirProduto, 
    recarregar: carregarProdutos 
  };
}