import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('tu-proyecto') && 
  !supabaseAnonKey.includes('tu-anon-public-key')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Faltan las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env. ' +
    'Sin ellas no es posible iniciar sesión.'
  );
}

// Tipo de flujo de autenticación presente en la URL al cargar la app
// ('invite' cuando el atleta llega desde el email de invitación, 'recovery' al restablecer contraseña).
// Se captura antes de que el cliente de Supabase consuma y limpie el hash de la URL.
export const initialAuthFlowType = (() => {
  try {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    return hashParams.get('type');
  } catch {
    return null;
  }
})();

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Sesión segura estándar con JWT firmado y refresh token
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

