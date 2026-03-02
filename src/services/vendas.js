// src/services/vendas.js
import { supabase } from './supabaseClient';

export const registrarVenda = async (produtoId, quantidade, metodoPagamento) => {
  try {
    // Note que removemos o 'data' para sumir o aviso do VS Code
    const { error } = await supabase.rpc('registrar_venda_completa', {
      p_produto_id: produtoId,
      p_quantidade_vendida: parseInt(quantidade),
      p_metodo_pagamento: metodoPagamento
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar:", error.message);
    return { success: false, error: error.message };
  }
};