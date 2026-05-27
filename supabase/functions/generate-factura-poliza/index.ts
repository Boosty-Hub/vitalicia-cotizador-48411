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
  // try parse YYYY-MM-DD or ISO
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return esc(s);
};

const addYear = (v: any) => {
  if (!v) return "&nbsp;";
  const s = String(v);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return esc(s);
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  d.setFullYear(d.getFullYear() + 1);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}-${mm}-${yy}`;
};

const fmtNum = (v: any) => {
  if (v === null || v === undefined || v === "") return "0.00";
  const n = Number(v);
  if (isNaN(n)) return esc(v);
  return n.toFixed(2);
};

function buildHtml(p: any): string {
  const isJur = p.formulario === "juridico";
  const tomador = isJur
    ? p.razon_social_juridico_monday || p.razon_social_juridico_monday || ""
    : `${p.nombre_titular_monday || ""} ${p.apellidos_titular_monday || ""}`.trim();
  const cedRif = isJur
    ? p.nro_documento_juridico_monday || ""
    : p.nro_documento_natural_monday || "";
  const tel = `${p.codigo_telefonico_titular_monday || ""} ${p.numero_telefonico_titular_monday || ""}`.trim();
  const direccion = p.direccion_monday || p.c_direccion || "";
  const ciudad = p.s_ciudad || p.ciudad_monday || "";
  const estado = p.s_estado || "";
  const municipio = p.s_municipio || p.municipio_monday || "";
  const zonaPostal = p.codigo_postal_monday || "";

  const coberturas: any[] = Array.isArray(p.api_coberturas) ? p.api_coberturas : [];
  let totalPrima = 0;
  const coberturasRows = coberturas
    .map((c: any) => {
      const rama = c.ramo || c.c_codramo || c.codigo || "";
      const cobNum = c.cobertura || c.c_codcob || "";
      const desc = c.descripcion || c.s_descob || c.nombre || "";
      const suma = c.suma_asegurada ?? c.n_sumaasegurada ?? c.n_suma ?? 0;
      const tasa = c.tasa ?? c.n_tasa ?? 0;
      const prima = Number(c.prima ?? c.n_primanetacob ?? c.n_prima ?? 0);
      totalPrima += isNaN(prima) ? 0 : prima;
      const label = [rama, cobNum].filter(Boolean).join(" - ") + (desc ? ` ${desc}` : "");
      return `<tr><td>${esc(label)}</td><td class="num">${fmtNum(suma)}</td><td class="num">${fmtNum(tasa)}</td><td class="num">${fmtNum(prima)}</td></tr>`;
    })
    .join("\n");

  const recibos: any[] = Array.isArray(p.api_recibos) ? p.api_recibos : [];
  const primerRecibo = recibos[0] || {};
  const igtfNum = Number(primerRecibo.n_igtf ?? primerRecibo.igtf ?? totalPrima * 0.03);
  const totalCobrarNum = Number(primerRecibo.n_totalcobrar ?? primerRecibo.total ?? totalPrima + igtfNum);
  const numRecibo = primerRecibo.n_numrecibo || primerRecibo.numero_recibo || "";
  const numFactura = primerRecibo.n_numfactura || primerRecibo.numero_factura || "";

  const fechaEmision = (p.desde || p.f_fchdesde || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const numPoliza = p.numero_poliza_monday || "PENDIENTE";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Cuadro Póliza Recibo — ${esc(numPoliza)}</title>
<style>
:root{--ink:#000;--brand:#133a8b;--line:#000;--paper:#fff;--bg:#d9d9d9;}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);font-family:Arial,Helvetica,sans-serif;color:var(--ink);font-size:9.5px;line-height:1.25}
.page{width:816px;min-height:1056px;margin:24px auto;background:var(--paper);padding:30px 36px 32px;box-shadow:0 1px 3px rgba(0,0,0,.1),0 12px 32px rgba(0,0,0,.08);position:relative}
.page::before{content:"";position:absolute;inset:0;background:url('${LOGO_URL}') no-repeat center 55%/520px auto;opacity:.05;pointer-events:none;z-index:0}
.page>*{position:relative;z-index:1}
.sheet{border:1.5px solid var(--line);padding:10px}
.top{display:grid;grid-template-columns:260px 1fr;align-items:center;gap:8px;padding:8px 14px;margin-bottom:4px}
.top .logo{width:240px;height:auto;display:block}
.top .title{text-align:center;padding-right:40px}
.top .title .t1{font-size:14px;font-weight:700;letter-spacing:.5px;color:var(--brand);margin-bottom:2px}
.top .title .t2{font-size:11px;font-weight:700;color:var(--brand);letter-spacing:.5px}
.mov-bar{display:grid;grid-template-columns:1.2fr 1fr 1fr;border:1px solid var(--line);margin-top:4px}
.mov-bar .cell{padding:5px 8px;border-right:1px solid var(--line);display:flex;align-items:center;gap:8px}
.mov-bar .cell:last-child{border-right:0}
.mov-bar .label{font-weight:700;font-size:9px;letter-spacing:.3px}
.mov-bar .value{font-weight:700;font-size:10.5px}
.section{margin-top:6px;border:1px solid var(--line)}
.section-head{background:var(--brand);color:#fff;padding:3px 8px;font-size:9.5px;font-weight:700;letter-spacing:.8px}
.grid{width:100%;border-collapse:collapse}
.grid td{border-top:1px solid var(--line);border-right:1px solid var(--line);padding:3px 6px;vertical-align:middle;line-height:1.2}
.grid tr:first-child td{border-top:0}
.grid td:last-child{border-right:0}
.grid .lbl{font-weight:700;font-size:9px;color:#000;white-space:nowrap;background:#fafafa;width:1%}
.grid .val{font-size:10px;font-weight:400;color:#000}
.grid .val.strong{font-weight:700}
.cob{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
.cob thead th{background:#f0f0f0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);border-right:1px solid var(--line);padding:4px 8px;font-size:9px;font-weight:700;text-align:left;text-transform:uppercase;letter-spacing:.3px}
.cob thead th:last-child{border-right:0}
.cob thead th.num{text-align:right}
.cob tbody td{padding:3px 8px;font-size:10px;border-right:1px solid var(--line);border-bottom:1px solid #ddd}
.cob tbody td:last-child{border-right:0}
.cob tbody td.num{text-align:right}
.cob tfoot td{padding:4px 8px;font-size:10px;border-top:1px solid var(--line);border-right:1px solid var(--line);font-weight:700}
.cob tfoot td:last-child{border-right:0}
.cob tfoot td.num{text-align:right}
.cob tfoot td.lbl{text-align:right}
.cob tfoot tr.total td{border-top:2px solid var(--line);font-size:11px}
.cobro{width:100%;border-collapse:collapse;margin-top:3px}
.cobro th{background:#f0f0f0;border:1px solid var(--line);padding:4px 6px;font-size:9px;font-weight:700;text-align:center;letter-spacing:.3px}
.cobro td{border:1px solid var(--line);height:28px;padding:4px 6px}
.firmas{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:26px;margin-bottom:14px;align-items:end}
.firma{text-align:center;display:flex;flex-direction:column;justify-content:flex-end}
.firma .line{border-top:1px solid #000;margin:0 30px 4px;padding-top:4px}
.firma .lbl{font-size:9px;font-weight:600}
.firma .sig-logo{display:flex;justify-content:center;margin-bottom:2px;height:38px}
.firma .sig-logo img{height:38px;width:auto}
.legal{margin-top:10px;font-size:7.5px;line-height:1.4;text-align:justify;color:#000}
.legal p{margin:0 0 4px}
.footer{margin-top:8px;border-top:1px solid #000;padding-top:6px;font-size:7.5px;color:#000;text-align:center;line-height:1.4}
.tag-emision{display:inline-block;border:1px solid #000;padding:1px 8px;font-size:9.5px;font-weight:700;letter-spacing:1px;background:#fff}
.swatch{display:inline-block;width:10px;height:10px;background:#1a4fa0;border:1px solid #000;vertical-align:-1px;margin-right:4px}
@media print{body{background:#fff}.page{box-shadow:none;margin:0}}
</style>
</head>
<body>
<div class="page"><div class="sheet">
<div class="top">
  <img class="logo" src="${LOGO_URL}" alt="Seguros La Vitalicia" />
  <div class="title">
    <div class="t1">CUADRO PÓLIZA RECIBO</div>
    <div class="t2">SEGURO DE VEHÍCULO TERRESTRES</div>
  </div>
</div>

<div class="mov-bar">
  <div class="cell"><span class="label">TIPO DE MOVIMIENTO:</span><span class="tag-emision">EMISIÓN</span></div>
  <div class="cell"><span class="label">FECHA:</span><span class="value">${fmtDate(fechaEmision)}</span></div>
  <div class="cell"><span class="label">N° PÓLIZA:</span><span class="value">${esc(numPoliza)}</span></div>
</div>

<div class="section">
  <div class="section-head">DATOS GENERALES</div>
  <table class="grid"><tbody>
    <tr><td class="lbl">TOMADOR:</td><td class="val strong" colspan="3">${esc(tomador)}</td><td class="lbl" colspan="2">CÉDULA/RIF:</td><td class="val strong" colspan="2">${esc(cedRif)}</td></tr>
    <tr><td class="lbl">DIRECCIÓN COBRO:</td><td class="val" colspan="3">${esc(direccion)}</td><td class="lbl" colspan="2">TELÉFONO:</td><td class="val" colspan="2">${esc(tel)}</td></tr>
    <tr><td class="lbl">CIUDAD:</td><td class="val">${esc(ciudad)}</td><td class="lbl">ESTADO:</td><td class="val">${esc(estado)}</td><td class="lbl">MUNICIPIO:</td><td class="val">${esc(municipio)}</td><td class="lbl">ZONA POSTAL:</td><td class="val">${esc(zonaPostal)}</td></tr>
    <tr><td class="lbl">ASEGURADO:</td><td class="val strong" colspan="3">${esc(tomador)}</td><td class="lbl" colspan="2">CÉDULA/RIF:</td><td class="val strong" colspan="2">${esc(cedRif)}</td></tr>
    <tr><td class="lbl">DIRECCIÓN HAB.:</td><td class="val" colspan="3">${esc(direccion)}</td><td class="lbl" colspan="2">TELÉFONO:</td><td class="val" colspan="2">${esc(tel)}</td></tr>
    <tr><td class="lbl">CIUDAD:</td><td class="val">${esc(ciudad)}</td><td class="lbl">ESTADO:</td><td class="val">${esc(estado)}</td><td class="lbl">MUNICIPIO:</td><td class="val">${esc(municipio)}</td><td class="lbl">ZONA POSTAL:</td><td class="val">${esc(zonaPostal)}</td></tr>
    <tr><td class="lbl">BNF. PREFERENCIA:</td><td class="val" colspan="7">&nbsp;</td></tr>
  </tbody></table>
</div>

<div class="section">
  <div class="section-head">DATOS DE LA PÓLIZA Y DEL RECIBO</div>
  <table class="grid"><tbody>
    <tr>
      <td class="lbl" style="width:90px;">N° PÓLIZA:</td><td class="val strong" style="width:120px;">${esc(numPoliza)}</td>
      <td class="lbl" style="width:90px;">N° RECIBO:</td><td class="val strong" style="width:120px;">${esc(numRecibo)}</td>
      <td class="lbl" style="width:130px;background:var(--brand);color:#fff;">VIGENCIA DE LA POLIZA</td>
      <td class="lbl" style="width:55px;">DESDE:</td><td class="val">${fmtDate(fechaEmision)}</td>
    </tr>
    <tr>
      <td class="lbl">N° FACTURA:</td><td class="val strong">${esc(numFactura)}</td>
      <td class="lbl">CERTIFICADO:</td><td class="val">${esc(p.n_serialcertif || "")}</td>
      <td class="lbl">&nbsp;</td>
      <td class="lbl">HASTA:</td><td class="val">${addYear(fechaEmision)}</td>
    </tr>
    <tr>
      <td class="lbl">SUCURSAL EMISIÓN:</td><td class="val" colspan="2">OFICINA PRINCIPAL CARACAS</td>
      <td class="lbl">FREQ. PAGO:</td><td class="val">ANUAL</td>
      <td class="lbl" colspan="2" style="background:var(--brand);color:#fff;">VIGENCIA DEL RECIBO</td>
    </tr>
    <tr>
      <td class="lbl">SUC. SUSCRIPTORA:</td><td class="val" colspan="2">OFICINA PRINCIPAL CARACAS</td>
      <td class="lbl">DESDE:</td><td class="val">${fmtDate(fechaEmision)}</td>
      <td class="lbl">HASTA:</td><td class="val">${addYear(fechaEmision)}</td>
    </tr>
    <tr>
      <td class="lbl">INTERMEDIARIO:</td><td class="val" colspan="3">0001 - SEGUROS LA VITALICIA, C.A.</td>
      <td class="lbl">% PARTIC.:</td><td class="val">100</td>
      <td class="lbl"><span style="background:var(--brand);color:#fff;padding:0 6px;">MONEDA: DL</span></td>
    </tr>
  </tbody></table>
</div>

<div class="section">
  <div class="section-head">DATOS PARTICULARES DEL VEHÍCULO</div>
  <table class="grid"><tbody>
    <tr><td class="lbl">MARCA:</td><td class="val strong">${esc(p.s_marca)}</td><td class="lbl">TIPO VEHÍCULO:</td><td class="val">MOTOCICLETAS</td></tr>
    <tr><td class="lbl">MODELO:</td><td class="val">${esc(p.s_modelo)}</td><td class="lbl">USO:</td><td class="val">NO POSEE / NO APLICA</td></tr>
    <tr><td class="lbl">VERSIÓN:</td><td class="val">${esc(p.s_version || p.s_modelo)}</td><td class="lbl">COLOR:</td><td class="val"><span class="swatch"></span>${esc(p.s_color)}</td></tr>
    <tr><td class="lbl">SER. CARROCERIA:</td><td class="val">${esc(p.c_carroceria || p.serial_carroceria_monday)}</td><td class="lbl">TRANSMISIÓN:</td><td class="val">${esc(p.transmision_empire_monday || "0")}</td></tr>
    <tr><td class="lbl">SERIAL MOTOR:</td><td class="val">${esc(p.c_motor || p.serial_motor_monday)}</td><td class="lbl">CAP. PASAJE:</td><td class="val">&nbsp;</td></tr>
    <tr><td class="lbl">PLACA:</td><td class="val">${esc(p.c_placa || p.placa_monday)}</td><td class="lbl">CAP. CARGA:</td><td class="val">0</td></tr>
    <tr><td class="lbl">AÑO:</td><td class="val">${esc(p.n_anio || p.año_monday)}</td><td class="lbl">&nbsp;</td><td class="val">&nbsp;</td></tr>
  </tbody></table>
</div>

<div class="section">
  <div class="section-head">DETALLE DEL RAMO - COBERTURAS</div>
  <table class="cob">
    <thead><tr><th style="width:56%">RAMO - COBERTURAS</th><th class="num" style="width:18%">SUMA ASEGURADA</th><th class="num" style="width:12%">TASA</th><th class="num" style="width:14%">PRIMA</th></tr></thead>
    <tbody>
      ${coberturasRows || '<tr><td colspan="4" style="text-align:center;color:#777">Sin coberturas registradas</td></tr>'}
    </tbody>
    <tfoot>
      <tr><td class="lbl" colspan="3">TOTAL:</td><td class="num">${fmtNum(totalPrima)}</td></tr>
      <tr><td class="lbl" colspan="3">TOTAL IGTF (3%):</td><td class="num">${fmtNum(igtfNum)}</td></tr>
      <tr class="total"><td class="lbl" colspan="3">__ EN MONEDA: DL __ TOTAL A COBRAR:</td><td class="num">${fmtNum(totalCobrarNum)}</td></tr>
    </tfoot>
  </table>
</div>

<div style="margin-top:6px;font-size:9px;font-weight:700;letter-spacing:.3px;">FORMAN PARTE DE LA POLIZA LAS CLAUSULAS Y ANEXOS</div>
<table class="cobro">
  <thead><tr><th>FECHA DE COBRO</th><th>DEL COBRADOR</th><th>N° DE CHEQUE</th><th>BANCO</th></tr></thead>
  <tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody>
</table>

<div class="firmas">
  <div class="firma"><div class="line"></div><div class="lbl">Firma del Asegurado / Tomador</div></div>
  <div class="firma"><div class="sig-logo"><img src="${LOGO_URL}" alt="Seguros La Vitalicia" /></div><div class="line"></div><div class="lbl">Firma por La Empresa</div></div>
</div>
</div>

<div class="legal">
  <p>Yo, <strong>${esc(tomador)}</strong> portador de la cédula de identidad n° ${esc(cedRif)}. El arriba identificado como asegurado propuesto, como solicitante de la póliza o en representación de este, al presionar enviar en la página web www.lavitalicia.com.ve, declaro que la información aquí suministrada es exacta, sin omisión alguna de detalle, hecho o circunstancia, con el propósito de aminorar el riesgo, en el entendido que esta servirá de base a Seguros La Vitalicia, S.A. para la emisión de la póliza.</p>
  <p>Doy fé que el dinero utilizado para el pago de la prima proviene de una fuente lícita y por lo tanto, no tiene relación alguna con dinero, capitales, bienes, haberes, valores o títulos producto de las actividades o acciones derivadas de operaciones ilícitas previstas en las Normas sobre Administración de Riesgo de Legitimación de Capitales, Financiamiento al Terrorismo y Financiamiento de la Proliferación de Armas de Destrucción Masiva en la Actividad Aseguradora.</p>
  <p>El Asegurador coloca a disposición del Tomador este Cuadro Póliza Recibo, junto con las Condiciones Generales, las Condiciones Particulares, los Anexos, si los hubiere, en la página web de La Vitalicia www.lavitalicia.com.ve</p>
  <p>El Tomador, Asegurado o Beneficiario de la Póliza, que sienta vulneración de sus Derechos, y requieran presentar cualquier denuncia, queja, reclamo solicitud escrita; surgida con ocasión de este contrato de seguros, puede acudir a la Oficina de la Defensoría del Asegurado de la Superintendencia de la Actividad Aseguradora, o comunicarlo a través de la página web www.sudeaseg.com.ve.</p>
</div>

<div class="footer">
  <div><strong>Seguros La Vitalicia, S.A.</strong> Inscrita ante el Registro Mercantil Primero de la Circunscripción Judicial del Distrito Capital y Estado Miranda, en fecha 13 de junio del 2001, Bajo el No.30, Tomo 106.A-PRO.</div>
  <div>Aprobado por la Superintendencia de la Actividad Aseguradora mediante Oficio Nro. ____________________ de fecha ____________</div>
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
      console.error("Error fetching poliza:", fetchErr);
      return new Response(JSON.stringify({ error: "Póliza no encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = buildHtml(poliza);
    const path = `facturas/${polizaId}.html`;

    const { error: uploadErr } = await supabase.storage
      .from("poliza-documentos")
      .upload(path, new Blob([html], { type: "text/html; charset=utf-8" }), {
        upsert: true,
        contentType: "text/html; charset=utf-8",
      });

    if (uploadErr) {
      console.error("Upload error:", uploadErr);
      throw uploadErr;
    }

    const { data: pub } = supabase.storage.from("poliza-documentos").getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    const { error: updateErr } = await supabase
      .from("polizas_activas")
      .update({ factura_poliza_url: publicUrl })
      .eq("id", polizaId);

    if (updateErr) {
      console.error("Update error:", updateErr);
      throw updateErr;
    }

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-factura-poliza error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
