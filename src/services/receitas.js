import { supabase } from "./supabaseClient";

// 1. BUSCAR INGREDIENTES DA RECEITA
export const getItensReceita = async (produtoId) => {
  const { data, error } = await supabase
    .from("ingredientes_produto")
    .select(`
      id,
      quantidade_utilizada,
      insumos (*)
    `) 
    .eq("produto_id", produtoId);

  if (error) {
    console.error("Erro no Supabase:", error.message);
    return [];
  }
  return data;
};
// 2. ADICIONAR INGREDIENTE NA RECEITA
export const addItemReceita = async (item) => {
  const { data, error } = await supabase
    .from("ingredientes_produto")
    .insert([
      {
        produto_id: item.produto_id,
        insumo_id: item.insumo_id,
        quantidade_utilizada: item.quantidade_utilizada,
      },
    ])
    .select();

  if (error) {
    console.error("Erro ao inserir item na receita:", error);
    throw error;
  }
  return data[0];
};

// 3. REMOVER INGREDIENTE
export const deleteItemReceita = async (id) => {
  const { error } = await supabase
    .from("ingredientes_produto")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar item da receita:", error);
    throw error;
  }
  return true;
};
