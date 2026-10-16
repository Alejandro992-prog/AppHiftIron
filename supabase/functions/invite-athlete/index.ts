// Supabase Edge Function (Deno Runtime)
declare const Deno: any;
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const APP_ORIGIN = Deno.env.get('APP_ORIGIN') || '*';
const corsHeaders = {
  'Access-Control-Allow-Origin': APP_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const InvitePayloadSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().trim().toLowerCase().email('Correo electrónico no válido').max(150),
  zone: z.enum(['traditional', 'competitors']),
  focus: z.string().trim().max(100).optional(),
}).strict();

Deno.serve(async (req) => {
  // Manejo de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Método no permitido' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Configuración interna incompleta en el servidor' }, 500);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Validar JWT del llamante (debe ser un Coach/Admin autenticado)
  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.replace(/^Bearer\s+/i, '');

  if (!jwt) {
    return jsonResponse({ error: 'No autenticado' }, 401);
  }

  const { data: { user }, error: authError } = await adminClient.auth.getUser(jwt);
  if (authError || !user) {
    return jsonResponse({ error: 'Sesión no válida o expirada' }, 401);
  }

  // 2. Validar privilegios de administrador en app_metadata o public.athletes
  let isCoachAdmin = user.app_metadata?.role === 'admin';
  if (!isCoachAdmin) {
    const { data: dbAthlete } = await adminClient
      .from('athletes')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (dbAthlete?.role === 'admin') {
      isCoachAdmin = true;
      // Autosanar app_metadata para futuras peticiones
      await adminClient.auth.admin.updateUserById(user.id, {
        app_metadata: { role: 'admin' }
      });
    }
  }

  if (!isCoachAdmin) {
    return jsonResponse({ error: 'Acceso denegado: solo el Head Coach puede invitar atletas' }, 403);
  }

  // 3. Validar payload recibido con Zod
  const rawBody = await req.json().catch(() => null);
  const parsed = InvitePayloadSchema.safeParse(rawBody);

  if (!parsed.success) {
    return jsonResponse({
      error: parsed.error.issues[0]?.message || 'Datos no válidos'
    }, 400);
  }

  const { name, email, zone, focus } = parsed.data;
  const isCompetitor = zone === 'competitors';
  const accessZones = isCompetitor ? ['competitors', 'traditional'] : ['traditional'];
  const membership = isCompetitor ? 'CrossFit Competitors' : 'Gimnasio Fitness';

  // 4. Invitar al usuario mediante el sistema oficial seguro de invitaciones de Supabase Auth
  // El atleta recibirá un enlace criptoseguro para elegir su propia contraseña
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { name },
    redirectTo: APP_ORIGIN !== '*' ? `${APP_ORIGIN}/` : undefined,
  });

  if (inviteError || !inviteData.user) {
    console.error('[invite-athlete error]:', inviteError);
    return jsonResponse({ error: 'No se pudo crear la invitación para este correo.' }, 400);
  }

  const newUserId = inviteData.user.id;

  // 5. Asignar zonas y membresía en app_metadata del servidor
  await adminClient.auth.admin.updateUserById(newUserId, {
    app_metadata: {
      access_zones: accessZones,
      membership: membership,
      role: 'athlete'
    }
  });

  // 6. Actualizar fila en public.athletes
  await adminClient
    .from('athletes')
    .update({
      access_zones: accessZones,
      membership: membership,
      focus: focus || (isCompetitor ? 'Halterofilia & WODs' : 'Hipertrofia & Fuerza')
    })
    .eq('id', newUserId);

  return jsonResponse({
    success: true,
    id: newUserId,
    email: email,
    name: name,
    zone: zone
  }, 201);
});
