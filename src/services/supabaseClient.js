import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Este log vai te ajudar a testar (remova depois)
console.log("URL do Supabase:", supabaseUrl); 

export const supabase = createClient(supabaseUrl, supabaseKey)