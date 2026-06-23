import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RMS_URL_FALLBACK = "https://api.rms40.com/api-qa/form_motos";

/** Resuelve el endpoint RMS activo según el modo guardado en admin_settings. */
async function resolveRms(supabase: any): Promise<{ url: string; modo: string }> {
  try {
    const { data } = await supabase
      .from("admin_settings")
      .select("key,value")
      .in("key", ["modo_sistema", "rms_url_dev", "rms_url_prod"]);
    const map: Record<string, string> = {};
    for (const row of (data || [])) map[row.key] = row.value;
    const modo = (map["modo_sistema"] || "produccion").toLowerCase();
    const raw = modo === "produccion"
      ? (map["rms_url_prod"] || map["rms_url_dev"])
      : map["rms_url_dev"];
    return { url: raw && raw.trim() ? raw.trim() : RMS_URL_FALLBACK, modo };
  } catch (_e) {
    return { url: RMS_URL_FALLBACK, modo: "produccion" };
  }
}

/**
 * Payload de prueba: el ejemplo documentado por RMS SIN n_suma. Provoca un
 * rolled_back garantizado (no crea ninguna póliza) pero atraviesa la capa de
 * auth web → sirve para confirmar conectividad + credenciales sin ensuciar QA.
 */
function buildPingPayload() {
  const stamp = Date.now().toString().slice(-6);
  return {
    f_fchdesde: "2025-02-14",
    c_placa: `TEST${stamp}`,
    c_carroceria: `TESTCONNECTION${stamp}`,
    c_cd_nacionalidad: "V",
    n_cedrif: "999922838",
    n_correlativo: "0",
    cd_sexo: "M",
    f_fecnac: "1990-01-01",
    cd_edocivil: "S",
    c_nombre: "TEST",
    c_apellido: "CONEXION",
    c_razonsocial: "",
    c_cd_pais: "001",
    c_cd_estado: "001",
    c_cd_ciudad: "001",
    c_cd_municipio: "001",
    c_direccion: "TEST",
    c_cd_telef1: "0412",
    c_numtelef1: "0000000",
    c_email1: "test@test.com",
    c_email2: "",
    c_cd_actividad: "0000",
    c_cd_ocupacion: "00003",
    n_ingresoanualnac: "1000.00",
    cd_moneda: "DL",
    c_cd_marca: "329",
    c_cd_modelo: "0015",
    c_cd_version: "0013",
    n_nu_centuria: "2024",
    c_motor: "TEST",
    c_cd_color: "0005",
    c_cd_versionseguro: "BERA2025",
    c_cd_subversionseguro: "BERA2025",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- Guard: solo admins autenticados ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ ok: false, error: "No autorizado" }, 401);

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ ok: false, error: "No autorizado" }, 401);

    const { data: isAdmin } = await userClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ ok: false, error: "Requiere rol admin" }, 403);

    // --- Credenciales RMS (Function Secrets, nunca DB/browser) ---
    const RMS_API_KEY = Deno.env.get("RMS_API_KEY");
    const RMS_API_USER = Deno.env.get("RMS_API_USER");
    const RMS_API_PASSWORD = Deno.env.get("RMS_API_PASSWORD");
    if (!RMS_API_KEY || !RMS_API_USER || !RMS_API_PASSWORD) {
      return json({
        ok: true,
        connected: false,
        reason: "config",
        message: "Faltan credenciales RMS (RMS_API_KEY / RMS_API_USER / RMS_API_PASSWORD) en los secretos de Supabase.",
      });
    }

    const service = createClient(supabaseUrl, supabaseServiceKey);
    const { url, modo } = await resolveRms(service);
    const basicAuth = btoa(`${RMS_API_USER}:${RMS_API_PASSWORD}`);

    const started = Date.now();
    let resp: Response;
    try {
      resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": RMS_API_KEY,
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify(buildPingPayload()),
        signal: AbortSignal.timeout(20000),
      });
    } catch (netErr: unknown) {
      const msg = netErr instanceof Error ? netErr.message : String(netErr);
      return json({
        ok: true,
        connected: false,
        reason: "network",
        modo,
        url,
        message: `No se pudo conectar al endpoint RMS: ${msg}`,
      });
    }
    const elapsedMs = Date.now() - started;

    const httpStatus = resp.status;
    let apiStatus: string | null = null;
    let apiMessage = "";
    let raw = "";
    try {
      raw = await resp.text();
      const parsed = JSON.parse(raw);
      apiStatus = parsed.status ?? null;
      apiMessage = parsed.message ?? "";
    } catch (_e) {
      apiMessage = raw.slice(0, 300);
    }

    // Auth válida si atravesamos la capa web (no 401/403) y obtuvimos JSON de la app.
    if (httpStatus === 401 || httpStatus === 403) {
      return json({
        ok: true, connected: false, reason: "auth", httpStatus, modo, url, elapsedMs,
        message: "Credenciales rechazadas por el endpoint (auth básica / API key inválida).",
      });
    }

    const reachedApp = httpStatus === 200 && apiStatus !== null;
    return json({
      ok: true,
      connected: reachedApp,
      reason: reachedApp ? "ok" : "unexpected",
      httpStatus,
      apiStatus,
      apiMessage,
      modo,
      url,
      elapsedMs,
      message: reachedApp
        ? `Conexión OK — auth válida y el API respondió (status="${apiStatus}").`
        : `Respuesta inesperada del endpoint (HTTP ${httpStatus}).`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return json({ ok: false, error: msg }, 500);
  }
});
