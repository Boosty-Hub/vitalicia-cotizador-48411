import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Constant-time comparison so a wrong secret can't be guessed via response timing.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const expectedSecret = Deno.env.get("TEST_LOGIN_SECRET");
    const testEmail = Deno.env.get("TEST_LOGIN_EMAIL");
    const testPassword = Deno.env.get("TEST_LOGIN_PASSWORD");

    // Fail closed: if the feature isn't configured server-side, it stays off.
    if (!expectedSecret || !testEmail || !testPassword) {
      return new Response(
        JSON.stringify({ error: "Acceso rápido no disponible" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { secret }: { secret?: string } = await req.json().catch(() => ({}));

    if (!secret || !safeEqual(secret, expectedSecret)) {
      return new Response(
        JSON.stringify({ error: "Acceso denegado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sign in server-side with the dedicated test account. These credentials only
    // exist as function env vars — they are never shipped to the browser bundle.
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await authClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error || !data.session) {
      console.error("test-login sign-in failed:", error?.message);
      return new Response(
        JSON.stringify({ error: "No se pudo iniciar sesión de prueba" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return only the session tokens; the client rehydrates via setSession.
    return new Response(
      JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in test-login:", error?.message);
    return new Response(
      JSON.stringify({ error: "Error inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
