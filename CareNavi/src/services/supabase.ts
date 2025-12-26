
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 0,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'carenavi-react-native',
    },
  },
});

// Test connection to Supabase
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').select('count').limit(1);
    if (error) {
      console.log('Supabase connection: FAILED', error.message);
      return false;
    }
    console.log('Supabase connection: OK');
    return true;
  } catch (err) {
    console.log('Supabase connection: FAILED', err);
    return false;
  }
}
