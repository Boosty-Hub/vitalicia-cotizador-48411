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

    // Enviar al Email Principal (email_monday). Fallbacks solo si está vacío.
    const recipient = p.email_monday || p.c_email1 || p.email_alternativo_monday || p.c_email2;
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

    // Plantilla de correo basada en tablas + estilos inline (compatible con Gmail/Outlook/Apple Mail).
    const btn = (label: string, href: string, bg: string) => `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr><td align="center" bgcolor="${bg}" style="border-radius:8px;">
          <a href="${href}" target="_blank"
             style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">
            ${label}
          </a>
        </td></tr>
      </table>`;

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"></head>
    <body style="margin:0;padding:0;background-color:#eef1f6;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Tu carnet y factura de Seguros La Vitalicia${numPoliza ? ` — Póliza N° ${numPoliza}` : ""}.</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef1f6;padding:24px 12px;">
        <tr><td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(12,29,49,0.08);">
            <!-- Header -->
            <tr><td bgcolor="#0c1d31" style="padding:28px 32px;border-bottom:4px solid #c9a24b;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;letter-spacing:0.5px;color:#ffffff;">SEGUROS LA VITALICIA</span><br>
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#c9a24b;letter-spacing:1px;">VITAL PARA TI</span>
            </td></tr>
            <!-- Body -->
            <tr><td style="padding:32px;font-family:Arial,Helvetica,sans-serif;color:#0f1a2b;">
              <p style="margin:0 0 16px;font-size:16px;">Estimado/a <strong>${nombre}</strong>,</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3a4658;">
                Adjuntamos en formato PDF el <strong>carnet</strong> y la <strong>factura</strong> de su póliza.
                También puede consultarlos en línea con los botones de abajo.
              </p>
              ${numPoliza ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:#f4f6f9;border-radius:10px;">
                <tr><td style="padding:16px 20px;font-family:Arial,Helvetica,sans-serif;">
                  <span style="font-size:12px;color:#7a869a;text-transform:uppercase;letter-spacing:1px;">N° de Póliza</span><br>
                  <span style="font-size:20px;font-weight:bold;color:#0c1d31;">${numPoliza}</span>
                </td></tr>
              </table>` : ""}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td align="center" style="padding:4px;">${btn("Ver carnet", carnetLink, "#1d4ed8")}</td>
                <td align="center" style="padding:4px;">${btn("Ver factura", facturaLink, "#0c1d31")}</td>
              </tr></table>
            </td></tr>
            <!-- Footer -->
            <tr><td bgcolor="#f4f6f9" style="padding:20px 32px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7a869a;line-height:1.6;border-top:1px solid #e2e7ef;">
              Gracias por confiar en <strong style="color:#0c1d31;">Seguros La Vitalicia</strong>.<br>
              Este es un correo automático; si tiene dudas, responda a este mensaje o contacte a su asesor.
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;

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
