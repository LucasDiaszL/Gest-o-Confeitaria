import { supabase } from './supabaseClient';

// Busca os ingredientes de um produto específico
export const getIngredientesProduto = async (produtoId) => {
  const { data, error } = await supabase
    .from('ingredientes_produto')
    .select(`
      id,
      quantidade_necessaria,
      insumo_id,
      insumos (
        nome,
        unidade_medida
      )
    `)
    .eq('produto_id', produtoId);
  
  if (error) throw error;
  return data;
};

// Adiciona um ingrediente à receita do produto
export const addIngredienteReceita = async (item) => {
  const { data, error } = await supabase
    .from('ingredientes_produto')
    .insert([item])
    .select();
  
  if (error) throw error;
  return data;
};