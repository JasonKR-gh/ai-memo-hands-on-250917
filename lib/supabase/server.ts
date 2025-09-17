import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { clientEnv } from '@/lib/env'

export async function createClient() {
    const cookieStore = await cookies()

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

    console.log('Creating Supabase server client with URL:', supabaseUrl.substring(0, 30) + '...')

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
            }
        }
    })
}
