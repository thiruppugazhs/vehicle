import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fyyobzkkkmyswfafyupo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_oLpH7SkGzKqgXPL493rRcA_SyP0KNtX';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

/**
 * Subscribes to real-time PostgreSQL database changes using Supabase Realtime (WebSockets)
 */
export function subscribeToTable<T>(
  tableName: string,
  organizationId: string,
  onUpdate: (payload: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: T; old: T }) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`public:${tableName}:${organizationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
        filter: `organization_id=eq.${organizationId}`
      },
      (payload) => {
        onUpdate({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as T,
          old: payload.old as T
        });
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Supabase Realtime] Subscribed to ${tableName} for org: ${organizationId}`);
      }
    });

  return channel;
}

/**
 * Helper to check connection health to Supabase
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('vehicles').select('id').limit(1);
    if (error && error.code !== 'PGRST205') {
      console.warn('[Supabase] Warning during connection check:', error.message);
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Connection error:', err);
    return false;
  }
}
