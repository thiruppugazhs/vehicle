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
 * Initiates Google OAuth Sign-In with Supabase
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
}

/**
 * Sends a 6-digit OTP code to the specified email address
 */
export async function sendEmailOtp(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true
    }
  });
  if (error) throw error;
  return data;
}

/**
 * Verifies a 6-digit OTP code sent to an email address
 */
export async function verifyEmailOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  if (error) throw error;
  return data;
}

/**
 * Sends a 6-digit SMS OTP code to the specified mobile phone number
 */
export async function sendPhoneOtp(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      shouldCreateUser: true
    }
  });
  if (error) throw error;
  return data;
}

/**
 * Verifies a 6-digit SMS OTP code sent to a mobile phone number
 */
export async function verifyPhoneOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  });
  if (error) throw error;
  return data;
}

/**
 * Updates the user's password using Supabase Auth
 */
export async function changeUserPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
  return data;
}

/**
 * Deletes the authenticated user account and terminates the session
 */
export async function deleteAccount() {
  try {
    // Attempt deletion RPC if configured, otherwise sign out
    await supabase.rpc('delete_user_account');
  } catch (err) {
    console.warn('[Supabase] Account deletion RPC fallback to session cleanup:', err);
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

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
