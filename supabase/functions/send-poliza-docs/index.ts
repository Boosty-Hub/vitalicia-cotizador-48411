import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PUBLIC_BASE = "https://seguroslavitalicia.com";

async function urlToBase64(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`No se pudo descargar el PDF (${r.status})`);
  const bytes = new Uint8Array(await r.arrayBuffer());
  let bin = "";
  const CH = 8192;
  for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode(...bytes.subarray(i, i + CH));
  return btoa(bin);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { polizaId } = await req.json();
    if (!polizaId) throw new Error("Falta polizaId");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: p, error } = await supabase
      .from("polizas_activas")
      .select("*")
      .eq("id", polizaId)
      .single();
    if (error || !p) throw new Error("Póliza no encontrada");

    const carnetPdf = p.carnet_pdf_url;
    const facturaPdf = p.factura_pdf_url;
    if (!carnetPdf || !facturaPdf) {
      throw new Error("Faltan los PDF del carnet y/o la factura. Renderizalos y guardalos primero.");
    }

    const recipient = p.c_email1 || p.email_monday || p.email_alternativo_monday || p.c_email2;
    if (!recipient) throw new Error("El registro no tiene email de destino.");

    const nombre =
      `${p.nombre_titular_monday || ""} ${p.apellidos_titular_monday || ""}`.trim() ||
      p.razon_social_juridico_monday ||
      "Cliente";
    const numPoliza = p.numero_poliza_monday || "";
    const carnetLink = `${PUBLIC_BASE}/carnet/${polizaId}`;
    const facturaLink = `${PUBLIC_BASE}/factura/${polizaId}`;

    const [carnetB64, facturaB64] = await Promise.all([
      urlToBase64(carnetPdf),
      urlToBase64(facturaPdf),
    ]);

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#0f1a2b;line-height:1.5">
        <h2 style="color:#003399;margin:0 0 12px">Seguros La Vitalicia</h2>
        <p>Estimado/a <b>${nombre}</b>,</p>
        <p>Adjuntamos el <b>carnet</b> y la <b>factura</b> de su póliza ${
          numPoliza ? `N° <b>${numPoliza}</b>` : ""
        } en formato PDF.</p>
        <p>También puede consultarlos en línea:</p>
        <ul>
          <li>Carnet: <a href="${carnetLink}">${carnetLink}</a></li>
          <li>Factura: <a href="${facturaLink}">${facturaLink}</a></li>
        </ul>
        <p style="color:#4a5366;font-size:13px">Gracias por confiar en Seguros La Vitalicia.</p>
      </div>`;

    const from = Deno.env.get("EMAIL_FROM") || "Seguros La Vitalicia <onboarding@resend.dev>";
    const resKey = Deno.env.get("RESEND_API_KEY");
    if (!resKey) throw new Error("RESEND_API_KEY no configurada");

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: `Carnet y Factura - Póliza ${numPoliza}`.trim(),
        html,
        attachments: [
          { filename: `carnet-${numPoliza || polizaId}.pdf`, content: carnetB64 },
          { filename: `factura-${numPoliza || polizaId}.pdf`, content: facturaB64 },
        ],
      }),
    });
    const resData = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(`Resend: ${resData?.message || resp.statusText}`);

    return new Response(JSON.stringify({ success: true, message: `Enviado a ${recipient}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String((e as any)?.message || e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
