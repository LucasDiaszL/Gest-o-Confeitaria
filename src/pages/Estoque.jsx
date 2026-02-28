import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export function Estoque() {
  const [insumos, setInsumos] = useState([])
  const [loading, setLoading] = useState(true)

  async function buscarEstoque() {
  try {
    setLoading(true); // Garante que o loading comece antes da busca
    const { data, error } = await supabase
      .from('insumos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    setInsumos(data || []);
  } catch (error) {
    console.error('Erro ao buscar:', error.message);
  } finally {
    setLoading(false); // Só desliga o loading quando tudo terminar
  }
}

  useEffect(() => {
    buscarEstoque()
  }, [])

  if (loading) return <p className="text-pink-500">Carregando estoque...</p>

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-pink-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-pink-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-pink-800 uppercase">Insumo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-pink-800 uppercase">Quantidade</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-pink-800 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {insumos.map((item) => (
            <tr key={item.id} className="hover:bg-pink-50/30 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-700">{item.nome}</td>
              <td className="px-6 py-4 text-gray-600">{item.quantidade_atual} {item.unidade_medida}</td>
              <td className="px-6 py-4">
                {item.quantidade_atual <= item.estoque_minimo ? (
                  <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">Repor Urgente</span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">OK</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}