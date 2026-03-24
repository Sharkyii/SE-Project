import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase URL and Anon Key are required');
}

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export const connectDB = async () => {
    try {
        console.log('Using Supabase client for database connection');
        // We don't necessarily NEED to pre-create tables with the SDK if the user already has them,
        // but if they want the same 'auto-create' logic, it would need to be done via RPC or SQL editor.
        // For simplicity with the SDK, we assume tables are managed in Supabase dashboard.
    } catch (error: any) {
        console.error('Supabase connection error:', error);
    }
};
