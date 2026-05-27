import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOGO_URL = "https://seguroslavitalicia.com/logo-vitalicia.png";

const esc = (v: any) => {
  if (v === null || v === undefined || v === "") return "&nbsp;";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

const fmtDate = (v: any) => {
  if (!v) return "&nbsp;";
  const s = String(v);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]} · ${m[2]} · ${m[1]}`;
  return esc(s);
};

const addYearFmt = (v: any) => {
  if (!v) return "&nbsp;";
  const s = String(v);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return esc(s);
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  d.setFullYear(d.getFullYear() + 1);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd} · ${mm} · ${yy}`;
};

function buildHtml(p: any, verifyUrl: string): string {
  const isJur = p.formulario === "juridico";
  const titular = isJur
    ? (p.razon_social_juridico_monday || "")
    : `${p.nombre_titular_monday || ""} ${p.apellidos_titular_monday || ""}`.trim();
  const cedRif = isJur
    ? p.nro_documento_juridico_monday || ""
    : p.nro_documento_natural_monday || "";

  const numPoliza = p.numero_poliza_monday || "PENDIENTE";
  const marca = p.s_marca || "";
  const modelo = p.s_modelo || p.version_modelo_monday || "";
  const placa = p.c_placa || p.placa_monday || "";
  const anio = p.n_anio || p.año_monday || "";
  const color = p.s_color || p.color_bera_monday || "";
  const serialCarroceria = p.c_carroceria || p.serial_carroceria_monday || "";
  const desde = (p.desde || p.f_fchdesde || new Date().toISOString().slice(0, 10)).slice(0, 10);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=230x230&margin=0&data=${encodeURIComponent(verifyUrl)}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Carnet RCV — Póliza ${esc(numPoliza)}</title>
<style>
:root{--ink:#0f1a2b;--ink-soft:#4a5366;--line:#1a2a44;--line-soft:#cfd5df;--bg:#e7e8e4;--paper:#fff;--band:#0b3b6f;--band-deep:#062448;--accent:#c8102e;--gold:#c9a24a;}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:radial-gradient(1200px 600px at 50% -100px,#f0f1ed 0%,var(--bg) 60%);font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:var(--ink);min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:40px 20px;gap:28px}
.stage{display:flex;gap:32px;flex-wrap:wrap;justify-content:center}
.card{width:540px;height:340px;background:var(--paper);border-radius:14px;box-shadow:0 1px 0 rgba(255,255,255,.6) inset,0 2px 4px rgba(0,0,0,.06),0 18px 40px -12px rgba(11,59,111,.25),0 30px 60px -20px rgba(0,0,0,.18);position:relative;overflow:hidden;color:var(--ink)}
.front .topbar{position:relative;height:76px;background:#fff;color:var(--ink);padding:10px 20px;display:flex;align-items:center;gap:14px;overflow:hidden;border-bottom:2px solid var(--gold)}
.front .logo-img{height:54px;width:auto;display:block;position:relative;z-index:1}
.doctype{margin-left:auto;text-align:right;position:relative;z-index:1}
.doctype .kicker{font-size:8px;letter-spacing:2.4px;text-transform:uppercase;color:var(--ink-soft)}
.doctype .name{font-size:13px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;margin-top:3px;color:var(--band)}
.doctype .badge{display:inline-block;margin-top:5px;border:1px solid var(--band);color:var(--band);font-size:9px;letter-spacing:2px;padding:2px 8px;border-radius:2px;text-transform:uppercase;font-weight:700}
.titleband{background:#06203f;color:#fff;padding:6px 20px;font-size:9.5px;letter-spacing:2.2px;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid var(--gold)}
.titleband .left{font-weight:600}
.titleband .right{font-family:"SF Mono",Menlo,Consolas,monospace;font-size:11px;letter-spacing:1.5px;color:var(--gold);font-weight:700}
.body{padding:10px 20px 0 20px;display:grid;grid-template-columns:1.05fr 1fr;gap:7px 18px}
.field{display:flex;flex-direction:column;gap:0;min-width:0}
.field .lbl{font-size:6.8px;letter-spacing:1.4px;text-transform:uppercase;color:var(--ink-soft);font-weight:600}
.field .val{font-size:11.5px;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.field.mono .val{font-family:"SF Mono",Menlo,Consolas,monospace;font-size:10.5px;letter-spacing:.3px}
.field.big .val{font-size:14px}
.field.span-2{grid-column:span 2}
.section-tag{grid-column:1/-1;display:flex;align-items:center;gap:8px;margin-top:1px;margin-bottom:-3px}
.section-tag .dot{width:5px;height:5px;background:var(--accent);border-radius:50%}
.section-tag .label{font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--band);font-weight:700}
.section-tag .rule{flex:1;height:1px;background:linear-gradient(to right,var(--line-soft),transparent)}
.vigencia{position:absolute;left:20px;right:20px;bottom:10px;display:flex;justify-content:space-between;align-items:center;background:#f6f8fb;border:1px solid var(--line-soft);border-left:3px solid var(--gold);border-radius:4px;padding:5px 12px}
.vigencia .vlabel{font-size:9px;letter-spacing:1.6px;text-transform:uppercase;color:var(--ink-soft);font-weight:700}
.vigencia .vdates{display:flex;align-items:center;gap:12px}
.vigencia .vdates .d{display:flex;flex-direction:column;align-items:flex-end}
.vigencia .vdates .d .k{font-size:9px;letter-spacing:1.3px;text-transform:uppercase;color:var(--ink-soft)}
.vigencia .vdates .d .v{font-size:10.5px;font-weight:700;color:var(--band)}
.vigencia .arrow{color:var(--gold);font-weight:800;font-size:14px}
.back{background:linear-gradient(160deg,var(--band-deep) 0%,var(--band) 60%,#0a4d8a 100%);color:#fff}
.back::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.03) 0 2px,transparent 2px 14px);pointer-events:none}
.back .reverso-head{position:relative;z-index:2;padding:22px 26px 0 26px;display:grid;grid-template-columns:1fr 1fr;gap:18px}
.back .reverso-head .blk:last-child{padding-right:64px}
.back .blk .k{font-size:7.5px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.55);font-weight:600}
.back .blk .v{font-size:13px;font-weight:700;color:#fff;margin-top:3px;font-family:"SF Mono",Menlo,Consolas,monospace;letter-spacing:.5px}
.back .contact{position:relative;z-index:2;margin-top:18px;padding:0 26px;display:grid;grid-template-columns:1fr 125px;gap:14px;align-items:start}
.back .contact .info{display:grid;grid-template-columns:1fr;gap:6px}
.back .contact .qr{background:#fff;padding:5px;border-radius:4px;border:1px solid rgba(255,255,255,.4);display:flex;flex-direction:column;align-items:center}
.back .contact .qr img{width:115px;height:115px;display:block}
.back .contact .qr .caption{font-size:8px;letter-spacing:1.3px;text-transform:uppercase;color:var(--band-deep);font-weight:700;margin-top:3px}
.back .contact .row{display:flex;align-items:center;gap:10px;font-size:11px;color:rgba(255,255,255,.92)}
.back .contact .row .ico{width:18px;height:18px;border:1px solid rgba(255,255,255,.5);border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;color:var(--gold);font-weight:800;flex-shrink:0}
.back .contact .row .lbl{color:rgba(255,255,255,.55);font-size:7.5px;letter-spacing:1.6px;text-transform:uppercase;min-width:56px}
.back .contact .row .v{font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:.3px}
.back .legal{position:absolute;left:26px;right:26px;bottom:16px;border-top:1px solid rgba(255,255,255,.18);padding-top:10px;display:flex;justify-content:space-between;align-items:flex-end;color:rgba(255,255,255,.7);font-size:8.5px;line-height:1.3}
.back .legal .left{max-width:60%;font-size:8px}
.back .legal .left .kicker{font-size:7px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:2px}
.back .legal .right{text-align:right}
.back .legal .right .kicker{font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:2px}
.back .legal .right .v{font-family:"SF Mono",Menlo,Consolas,monospace;color:#fff;font-size:10px;letter-spacing:1px}
.back .corner{position:absolute;right:0;top:0;width:70px;height:70px;background:var(--gold);clip-path:polygon(100% 0,100% 100%,0 0);z-index:1}
.back .corner-label{position:absolute;top:12px;right:10px;z-index:3;color:var(--band-deep);font-size:7px;font-weight:800;letter-spacing:1.6px;transform:rotate(45deg);transform-origin:100% 0;width:22px;text-align:left;padding:11px}
.caption{font-size:11px;color:var(--ink-soft);letter-spacing:1.6px;text-transform:uppercase;text-align:center;margin-top:8px;font-weight:600}
.card-wrap{display:flex;flex-direction:column;align-items:center}
@media print{body{background:#fff;padding:0}.caption{display:none}}
</style>
</head>
<body>
<div class="stage">
  <div class="card-wrap">
    <div class="card front">
      <div class="topbar">
        <img class="logo-img" src="${LOGO_URL}" alt="Seguros La Vitalicia" />
        <div class="doctype">
          <div class="kicker">Carnet de Cobertura</div>
          <div class="name">Póliza RCV</div>
          <div class="badge">Vehículos Terrestres</div>
        </div>
      </div>
      <div class="titleband">
        <span class="left">Responsabilidad Civil · Vehículos</span>
        <span class="right">N° ${esc(numPoliza)}</span>
      </div>
      <div class="body">
        <div class="section-tag"><span class="dot"></span><span class="label">${isJur ? "Tomador" : "Asegurado"}</span><span class="rule"></span></div>
        <div class="field span-2 big">
          <span class="lbl" style="font-size:8px">${isJur ? "Razón Social" : "Nombre y Apellido"}</span>
          <span class="val">${esc(titular.toUpperCase())}</span>
        </div>
        <div class="field mono">
          <span class="lbl" style="font-size:8px">${isJur ? "RIF" : "Cédula de Identidad"}</span>
          <span class="val">${esc(cedRif)}</span>
        </div>
        <div class="field mono">
          <span class="lbl" style="font-size:8px">Póliza N°</span>
          <span class="val">${esc(numPoliza)}</span>
        </div>
        <div class="section-tag"><span class="dot"></span><span class="label">Vehículo</span><span class="rule"></span></div>
        <div class="field"><span class="lbl" style="font-size:8px">Marca</span><span class="val">${esc(marca)}</span></div>
        <div class="field"><span class="lbl" style="font-size:8px">Modelo</span><span class="val">${esc(modelo)}</span></div>
        <div class="field mono"><span class="lbl" style="font-size:8px">Placa</span><span class="val">${esc(placa)}</span></div>
        <div class="field"><span class="lbl" style="font-size:8px">Año · Color</span><span class="val">${esc(anio)} · ${esc(color)}</span></div>
        <div class="field mono span-2"><span class="lbl" style="font-size:8px">Serial de Carrocería</span><span class="val">${esc(serialCarroceria)}</span></div>
      </div>
      <div class="vigencia">
        <span class="vlabel">Vigencia</span>
        <div class="vdates">
          <div class="d"><span class="k">Desde</span><span class="v">${fmtDate(desde)}</span></div>
          <span class="arrow">→</span>
          <div class="d"><span class="k">Hasta</span><span class="v">${addYearFmt(desde)}</span></div>
        </div>
      </div>
    </div>
    <div class="caption">Anverso</div>
  </div>

  <div class="card-wrap">
    <div class="card back">
      <div class="corner"></div>
      <div class="corner-label">RCV</div>
      <div class="reverso-head">
        <div class="blk"><div class="k">RIF de la Empresa</div><div class="v">J-31020536-1</div></div>
        <div class="blk" style="text-align:right;"><div class="k">Inscripción SUDEASEG</div><div class="v">ES-000020</div></div>
      </div>
      <div class="contact">
        <div class="info">
          <div class="row"><span class="ico">☎</span><span class="lbl">Atención</span><span class="v">0412 · 765 · 4927</span></div>
          <div class="row"><span class="ico">@</span><span class="lbl">Email</span><span class="v">atencionalcliente@lavitalicia.com.ve</span></div>
          <div class="row"><span class="ico">⌂</span><span class="lbl">Web</span><span class="v">www.lavitalicia.com.ve</span></div>
        </div>
        <div class="qr">
          <img src="${qrSrc}" alt="QR póliza ${esc(numPoliza)}" />
          <span class="caption">Verificar</span>
        </div>
      </div>
      <div class="legal">
        <div class="left">
          <div class="kicker">Aviso</div>
          Este carnet acredita la cobertura RCV vigente del vehículo identificado al frente. Presentar ante autoridades competentes cuando le sea requerido.
        </div>
        <div class="right">
          <div class="kicker">Póliza</div>
          <div class="v">N° ${esc(numPoliza)}</div>
        </div>
      </div>
    </div>
    <div class="caption">Reverso</div>
  </div>
</div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { polizaId } = await req.json();
    if (!polizaId) {
      return new Response(JSON.stringify({ error: "polizaId requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: poliza, error: fetchErr } = await supabase
      .from("polizas_activas")
      .select("*")
      .eq("id", polizaId)
      .single();

    if (fetchErr || !poliza) {
      return new Response(JSON.stringify({ error: "Póliza no encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // QR apunta a la factura si existe, si no a la URL pública del carnet/póliza
    const path = `carnets/${polizaId}.html`;
    const { data: pubPre } = supabase.storage.from("poliza-documentos").getPublicUrl(path);
    const verifyUrl = poliza.factura_poliza_url || pubPre.publicUrl;

    const html = buildHtml(poliza, verifyUrl);

    const { error: uploadErr } = await supabase.storage
      .from("poliza-documentos")
      .upload(path, new Blob([html], { type: "text/html; charset=utf-8" }), {
        upsert: true,
        contentType: "text/html; charset=utf-8",
      });

    if (uploadErr) throw uploadErr;

    const { data: pub } = supabase.storage.from("poliza-documentos").getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    const { error: updateErr } = await supabase
      .from("polizas_activas")
      .update({ carnet_poliza_url: publicUrl })
      .eq("id", polizaId);

    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-carnet-poliza error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
