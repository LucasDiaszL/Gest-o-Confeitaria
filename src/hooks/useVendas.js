import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export function useVendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarVendas = useCallback(async () => {
    try {
      setLoading(true);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Início do dia atual

      const { data, error } = await supabase
        .from('vendas')
        .select('*, produtos(nome)')
        .gte('criado_em', hoje.toISOString()) 
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setVendas(data || []);
    } catch (err) {
      console.error("Erro:", err.message);
      setVendas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarVendas();
  }, [carregarVendas]);

  return { vendas, loading, recarregar: carregarVendas };
}