// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  BlobReader,
  BlobWriter,
  TextReader,
  ZipWriter,
} from "https://deno.land/x/zipjs@v2.7.45/index.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Sections used to group files inside each policy folder
type SectionKey = "titular" | "empresa" | "accionistas" | "vehiculo" | "poliza";

const SECTION_LABEL: Record<SectionKey, string> = {
  titular: "01-Titular",
  empresa: "02-Empresa",
  accionistas: "03-Accionistas",
  vehiculo: "04-Vehiculo",
  poliza: "05-Poliza",
};

// Document field map: groups + ordering + which formularios it applies to.
// `multi: true` means the column may contain multiple URLs separated by \n.
type DocDef = {
  field: string;
  key: string;
  label: string;
  section: SectionKey;
  order: number;
  multi?: boolean;
  appliesTo?: Array<"natural" | "juridico" | "rcv">; // omit = all
};

const DOCUMENT_FIELDS: DocDef[] = [
  // Titular (Natural)
  { field: "cedula_identidad_url", key: "cedula_identidad", label: "cedula-identidad", section: "titular", order: 1, appliesTo: ["natural", "rcv"] },
  { field: "licencia_conducir_url", key: "licencia_conducir", label: "licencia-conducir", section: "titular", order: 2, appliesTo: ["natural", "rcv"] },
  { field: "certificado_medico_url", key: "certificado_medico", label: "certificado-medico", section: "titular", order: 3, appliesTo: ["natural", "rcv"] },
  { field: "rif_url", key: "rif_titular", label: "rif-titular", section: "titular", order: 4, appliesTo: ["natural", "rcv"] },

  // Empresa (Jurídico)
  { field: "rif_empresa_url", key: "rif_empresa", label: "rif-empresa", section: "empresa", order: 1, appliesTo: ["juridico"] },
  { field: "acta_constitutiva_url", key: "acta_constitutiva", label: "acta-constitutiva", section: "empresa", order: 2, appliesTo: ["juridico"] },
  { field: "acta_asamblea_url", key: "acta_asamblea", label: "acta-asamblea", section: "empresa", order: 3, appliesTo: ["juridico"] },
  { field: "declaracion_islr_url", key: "declaracion_islr", label: "declaracion-islr", section: "empresa", order: 4, appliesTo: ["juridico"] },
  { field: "referencia_bancaria_url", key: "referencia_bancaria", label: "referencia-bancaria", section: "empresa", order: 5, appliesTo: ["juridico"] },

  // Accionistas (Jurídico, multi)
  { field: "cedula_accionistas_url", key: "cedula_accionistas", label: "cedula-accionista", section: "accionistas", order: 1, multi: true, appliesTo: ["juridico"] },
  { field: "rif_accionistas_url", key: "rif_accionistas", label: "rif-accionista", section: "accionistas", order: 2, multi: true, appliesTo: ["juridico"] },

  // Vehículo
  { field: "factura_compra_vehiculo_url", key: "factura_compra", label: "factura-compra", section: "vehiculo", order: 1 },
  { field: "certificado_origen_vehiculo_url", key: "certificado_origen", label: "certificado-origen", section: "vehiculo", order: 2 },

  // Póliza emitida
  { field: "url_poliza_monday", key: "poliza_emitida", label: "poliza-emitida", section: "poliza", order: 1 },
  { field: "url_carnet_monday", key: "carnet_asegurado", label: "carnet-asegurado", section: "poliza", order: 2 },
];

function sanitize(name: string | null | undefined): string {
  if (!name) return "sin-nombre";
  return String(name)
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function getExtFromUrl(url: string, fallback = "bin"): string {
  try {
    const u = new URL(url);
    const path = u.pathname.split("/").pop() || "";
    const m = path.match(/\.([a-zA-Z0-9]{1,6})$/);
    return m ? m[1].toLowerCase() : fallback;
  } catch {
    return fallback;
  }
}

function splitUrls(value: string | null | undefined): string[] {
  if (!value) return [];
  return String(value)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && /^https?:\/\//i.test(s));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Sesión inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const { data: roleOk, error: roleErr } = await userClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleErr || roleOk !== true) {
      return new Response(JSON.stringify({ error: "Solo administradores" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const polizaIds: string[] = Array.isArray(body?.polizaIds) ? body.polizaIds : [];
    const onlyNotDownloaded: boolean = !!body?.onlyNotDownloaded;

    if (polizaIds.length === 0) {
      return new Response(JSON.stringify({ error: "Sin pólizas seleccionadas" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (polizaIds.length > 100) {
      return new Response(
        JSON.stringify({
          error: "Máximo 100 pólizas por descarga. Por favor divide en lotes.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const fields = DOCUMENT_FIELDS.map((d) => d.field).join(",");
    const { data: polizas, error: polErr } = await admin
      .from("polizas_activas")
      .select(
        `id, nombre_titular_monday, apellidos_titular_monday, razon_social_juridico_monday, nro_documento_natural_monday, nro_documento_juridico_monday, placa_monday, numero_poliza_monday, formulario, ${fields}`,
      )
      .in("id", polizaIds);

    if (polErr) throw polErr;
    if (!polizas || polizas.length === 0) {
      return new Response(JSON.stringify({ error: "No se encontraron pólizas" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let existing: Set<string> = new Set();
    if (onlyNotDownloaded) {
      const { data: ex } = await admin
        .from("admin_document_downloads")
        .select("poliza_id, document_type")
        .eq("admin_user_id", userId)
        .in("poliza_id", polizaIds);
      for (const r of ex || []) {
        existing.add(`${r.poliza_id}::${r.document_type}`);
      }
    }

    const zipBlobWriter = new BlobWriter("application/zip");
    const zip = new ZipWriter(zipBlobWriter);

    const summaryRows: string[] = [
      ["Titular", "Documento", "Placa", "Poliza", "Tipo", "Archivos"]
        .map((c) => `"${c}"`)
        .join(","),
    ];
    const errors: string[] = [];
    const trackingInserts: Array<{
      admin_user_id: string;
      poliza_id: string;
      document_type: string;
    }> = [];

    let totalFiles = 0;

    for (const p of polizas) {
      const formulario = (p.formulario || "natural") as "natural" | "juridico" | "rcv";

      const titular =
        formulario === "juridico"
          ? p.razon_social_juridico_monday ||
            `${p.nombre_titular_monday || ""} ${p.apellidos_titular_monday || ""}`.trim()
          : `${p.nombre_titular_monday || ""} ${p.apellidos_titular_monday || ""}`.trim();
      const documento =
        p.nro_documento_juridico_monday || p.nro_documento_natural_monday || "sin-doc";
      const placa = p.placa_monday || "sin-placa";
      const folder = sanitize(`${documento} - ${titular} - ${placa}`);

      const includedFiles: string[] = [];

      for (const def of DOCUMENT_FIELDS) {
        // Skip docs that don't apply to this formulario
        if (def.appliesTo && !def.appliesTo.includes(formulario)) continue;

        const raw = (p as any)[def.field] as string | null;
        const urls = def.multi ? splitUrls(raw) : raw ? [raw] : [];
        if (urls.length === 0) continue;

        // For tracking we mark the doc type once per poliza (not per file)
        const trackKey = `${p.id}::${def.key}`;
        if (onlyNotDownloaded && existing.has(trackKey)) continue;

        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          try {
            const resp = await fetch(url);
            if (!resp.ok) {
              errors.push(`${folder}/${def.label}: HTTP ${resp.status}`);
              continue;
            }
            const blob = await resp.blob();
            const ext = getExtFromUrl(url, "bin");
            const suffix = urls.length > 1 ? `-${String(i + 1).padStart(2, "0")}` : "";
            const fileName = `${String(def.order).padStart(2, "0")}-${def.label}${suffix}.${ext}`;
            const sectionFolder = SECTION_LABEL[def.section];

            await zip.add(
              `${folder}/${sectionFolder}/${fileName}`,
              new BlobReader(blob),
            );
            includedFiles.push(`${sectionFolder}/${fileName}`);
            totalFiles++;
          } catch (e) {
            errors.push(`${folder}/${def.label}: ${(e as Error).message}`);
          }
        }

        trackingInserts.push({
          admin_user_id: userId,
          poliza_id: p.id,
          document_type: def.key,
        });
      }

      summaryRows.push(
        [
          titular,
          documento,
          placa,
          p.numero_poliza_monday || "",
          formulario,
          includedFiles.join(" | "),
        ]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(","),
      );
    }

    const csv = "\uFEFF" + summaryRows.join("\n");
    await zip.add("_resumen.csv", new TextReader(csv));

    if (errors.length > 0) {
      await zip.add("_errores.txt", new TextReader(errors.join("\n")));
    }

    const zipBlob = await zip.close();

    if (trackingInserts.length > 0) {
      const { error: trackErr } = await admin
        .from("admin_document_downloads")
        .insert(trackingInserts);
      if (trackErr) {
        console.error("Tracking insert error:", trackErr);
      }
    }

    const today = new Date().toISOString().split("T")[0];
    return new Response(zipBlob, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="descargas-${today}.zip"`,
        "X-Files-Count": String(totalFiles),
        "X-Errors-Count": String(errors.length),
      },
    });
  } catch (e) {
    console.error("download-poliza-documents error:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message || "Error interno" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
