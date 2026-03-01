import { supabase } from './supabaseClient';

export const registrarVenda = async (produtoId, quantidadeVendida) => {
  try {
    // Chamamos a função SQL que criamos acima
    const { error } = await supabase.rpc('baixar_estoque_venda', {
      p_produto_id: produtoId,
      p_quantidade_vendida: quantidadeVendida
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Erro na venda:", error);
    return { success: false, error: error.message };
  }
};