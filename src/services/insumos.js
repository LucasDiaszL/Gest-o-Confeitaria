import { supabase } from './supabaseClient';

// Busca todos os insumos
export const getInsumos = async () => {
  const { data, error } = await supabase
    .from('insumos')
    .select('*')
    .order('nome', { ascending: true });
  
  if (error) throw error;
  return data;
};

// Cria ou Soma Insumos (Lógica de Upsert manual)
export const createInsumo = async (novoInsumo) => {
  // 1. Procura se já existe um insumo com esse nome
  const { data: existente } = await supabase
    .from('insumos')
    .select('*')
    .ilike('nome', novoInsumo.nome)
    .single();

  if (existente) {
    // 2. Se existir, soma a quantidade e ATUALIZA o preço com o valor novo
    const novaQuantidade = existente.quantidade_atual + novoInsumo.quantidade_atual;
    
    const { data, error } = await supabase
      .from('insumos')
      .update({ 
        quantidade_atual: novaQuantidade,
        preco: novoInsumo.preco // Atualiza para o preço da compra mais recente
      })
      .eq('id', existente.id)
      .select();
    
    if (error) throw error;
    return data;
  } else {
    // 3. Se não existir, insere um novo registro (já leva o preco no objeto novoInsumo)
    const { data, error } = await supabase
      .from('insumos')
      .insert([novoInsumo])
      .select();
    
    if (error) throw error;
    return data;
  }
};

// Deletar Insumo
export const deleteInsumo = async (id) => {
  const { error } = await supabase
    .from('insumos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};