import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export function useVendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarVendas = async () => {
    try {
      setLoading(true);
      // Busca as vendas ordenando pela data mais recente
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setVendas(data || []);
    } catch (err) {
      console.error("Erro ao carregar vendas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, []);

  return { vendas, loading, recarregar: carregarVendas };
}