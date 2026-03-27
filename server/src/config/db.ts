import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase URL and Anon Key are required');
}

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Admin client with service role key — bypasses RLS for server-side operations
export const supabaseAdmin = createClient(
    env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY
);

export const connectDB = async () => {
    try {
        console.log('Using Supabase client for database connection');
    } catch (error: any) {
        console.error('Supabase connection error:', error);
    }
};
