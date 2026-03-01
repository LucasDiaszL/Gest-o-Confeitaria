import { supabase } from './supabaseClient';

// Busca todos os produtos cadastrados
export const getProdutos = async () => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('nome', { ascending: true });
  
  if (error) throw error;
  return data;
};

// Cadastra um novo produto (ex: Bolo de Pote)
export const createProduto = async (novoProduto) => {
  const { data, error } = await supabase
    .from('produtos')
    .insert([novoProduto])
    .select();
  
  if (error) throw error;
  return data;
};

// Deleta um produto
export const deleteProduto = async (id) => {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};