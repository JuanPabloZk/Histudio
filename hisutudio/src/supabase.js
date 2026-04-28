import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://fxiopziixtmnepsgoowl.supabase.co'
const SUPABASE_KEY  = 'sb_publishable_x4YNAbF6Z8NUw3FpQ2oZ7g_y1qvbPvV'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})

// ── Helpers de progresso ──────────────────────────────────────────────────────

/** Carrega todo o progresso do usuário logado */
export async function loadProgress(userId) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('loadProgress error:', error)
    return null
  }

  // Se ainda não existe linha (primeiro acesso), cria
  if (!data) {
    const { data: newRow } = await supabase
      .from('user_progress')
      .insert({ id: userId })
      .select()
      .single()
    return newRow
  }

  return data
}

/** Salva um campo específico do progresso (patch parcial) */
export async function saveField(userId, field, value) {
  if (!userId) return
  const { error } = await supabase
    .from('user_progress')
    .update({ [field]: value })
    .eq('id', userId)

  if (error) console.error(`saveField(${field}) error:`, error)
}

/** Salva múltiplos campos de uma vez */
export async function saveFields(userId, fields) {
  if (!userId) return
  const { error } = await supabase
    .from('user_progress')
    .update(fields)
    .eq('id', userId)

  if (error) console.error('saveFields error:', error)
}
