import { createBrowserClient } from '@supabase/ssr'
import { clientEnv } from '@/lib/env'

export function createClient() {
    const supabaseUrl = clientEnv.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
        console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
    }

    if (!supabaseAnonKey) {
        console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
    }

    console.log('Creating Supabase client with URL:', supabaseUrl.substring(0, 30) + '...')

    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
