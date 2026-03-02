import { supabase } from './supabaseClient';

export const registrarVenda = async (produtoId, quantidade, ) => {
  // Chamada do RPC com os nomes das variáveis do SQL
  const { data, error } = await supabase.rpc('registrar_venda_completa', {
    p_produto_id: produtoId,
    p_quantidade: quantidade
  });

  if (error) {
    console.error("Erro ao registrar venda:", error.message);
    return { success: false, error };
  }
  return { success: true, data };
};