import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://epnkoxnepauxkluqewib.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwbmtveG5lcGF1eGtsdXFld2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczOTU2NTEsImV4cCI6MjEwMjk3MTY1MX0.bnYLqzTFPrtoQjJjq4tRh2-ETfPymWJR32JBWNJVtnE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Real-time table change listener using Supabase Realtime Channels
 */
export function subscribeToSupabaseTable<T>(
  tableName: string,
  onUpdate: (payload: { eventType: string; new: T; old: T }) => void
): RealtimeChannel {
  return supabase
    .channel(`public:${tableName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      (payload) => {
        onUpdate({
          eventType: payload.eventType,
          new: payload.new as T,
          old: payload.old as T,
        });
      }
    )
    .subscribe();
}

/**
 * Uploads a vehicle image or document to the Supabase 'fleet-assets' storage bucket
 */
export async function uploadToSupabaseStorage(
  file: File,
  folder: 'vehicles' | 'documents' | 'invoices' = 'vehicles'
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage
      .from('fleet-assets')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('fleet-assets').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    console.warn('Supabase storage upload error:', err);
    return null;
  }
}

/**
 * Saves a device token to Supabase for push notifications
 */
export async function registerDeviceTokenInSupabase(
  userId: string,
  organizationId: string,
  token: string,
  platform: 'web' | 'android' | 'ios' = 'web'
): Promise<void> {
  try {
    await supabase.from('fleet_device_tokens').upsert(
      {
        user_id: userId,
        organization_id: organizationId,
        fcm_token: token,
        platform,
        active: true,
        last_active: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform,device_id' }
    );
  } catch (err) {
    console.warn('Failed to register device token in Supabase:', err);
  }
}
