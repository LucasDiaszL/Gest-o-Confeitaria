import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yahwicfbojloaezjtbkv.supabase.co'
const supabaseKey = 'sb_publishable_G3udZDYZXeceyUgFdCzWBA_BfeST7_4'

export const supabase = createClient(supabaseUrl, supabaseKey)