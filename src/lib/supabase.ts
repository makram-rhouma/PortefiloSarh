import { createClient } from '@supabase/supabase-js'

// Publishable key is a public client key; all writes are guarded by RLS on the database.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
if (!url || !key) console.warn('Supabase env vars missing: the site falls back to built-in content.')

export const supabase = createClient(url || 'https://invalid.supabase.co', key || 'missing', {
  auth: { persistSession: true, autoRefreshToken: true },
})
export const BUCKET = 'portfolio-media'
export const publicUrl = (path: string) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
