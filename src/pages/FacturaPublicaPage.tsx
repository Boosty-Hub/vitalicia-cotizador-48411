import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const FacturaPublicaPage = () => {
  const { polizaId } = useParams();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!polizaId) return;
      try {
        const { data, error: qErr } = await supabase
          .from("polizas_activas")
          .select("factura_pdf_url, factura_poliza_url")
          .eq("id", polizaId)
          .maybeSingle();
        if (qErr) throw qErr;
        // Preferimos el PDF; factura_poliza_url queda como respaldo (ahora también apunta al PDF).
        let pdf = (data as any)?.factura_pdf_url || (data as any)?.factura_poliza_url || null;

        if (!pdf) {
          const { data: gen, error: gErr } = await supabase.functions.invoke(
            "generate-factura-poliza",
            { body: { polizaId } }
          );
          if (gErr) throw gErr;
          pdf = (gen as any)?.url;
        }
        if (!pdf) throw new Error("No se pudo obtener la factura");
        setUrl(pdf);
      } catch (e: any) {
        setError(e?.message || "Error cargando la factura");
      }
    };
    load();
  }, [polizaId]);

  useEffect(() => {
    document.title = "Factura - Seguros La Vitalicia";
  }, []);

  // Descarga forzada vía blob (funciona aunque el PDF esté en otro origen).
  const handleDownload = async () => {
    if (!url || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(`${url}?t=${Date.now()}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `factura-${polizaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", color: "#b91c1c" }}>
        {error}
      </div>
    );
  }

  if (!url) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", color: "#666" }}>
        Cargando factura...
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          padding: 8,
          background: "#f3f4f6",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            background: "#003399",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 6,
            border: 0,
            cursor: downloading ? "default" : "pointer",
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
          }}
        >
          {downloading ? "Descargando..." : "Descargar PDF"}
        </button>
      </div>
      <iframe
        title="Factura"
        src={`${url}#toolbar=1`}
        style={{ flex: 1, width: "100%", border: 0 }}
      />
    </div>
  );
};

export default FacturaPublicaPage;
