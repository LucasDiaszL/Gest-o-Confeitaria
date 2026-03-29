import { supabase } from './supabaseClient';

// 1. Busca todos os insumos (Usando 'preco' sem acento conforme seu banco)
export const getInsumos = async () => {
  const { data, error } = await supabase
    .from('insumos')
    .select('id, nome, preco, unidade_medida, quantidade_atual, estoque_minimo, data_validade')
    .order('nome', { ascending: true });
  
  if (error) throw error;
  return data;
};

// 2. Cria ou Soma Insumos
export const createInsumo = async (novoInsumo) => {
  const { data: existente } = await supabase
    .from('insumos')
    .select('id, quantidade_atual')
    .eq('nome', novoInsumo.nome)
    .maybeSingle();

  if (existente) {
    const novaQuantidade = Number(existente.quantidade_atual) + Number(novoInsumo.quantidade_atual);
    const { data, error } = await supabase
      .from('insumos')
      .update({ 
        quantidade_atual: novaQuantidade,
        preco: novoInsumo.preco || novoInsumo.preço 
      })
      .eq('id', existente.id)
      .select();
    
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('insumos')
      .insert([novoInsumo])
      .select();
    
    if (error) throw error;
    return data;
  }
};

// 3. Deletar Insumo (ESTA É A FUNÇÃO QUE ESTAVA FALTANDO NO SEU ERRO)
export const deleteInsumo = async (id) => {
  const { error } = await supabase
    .from('insumos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};