import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const FacturaPublicaPage = () => {
  const { polizaId } = useParams();
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!polizaId) return;
      try {
        const { data, error: qErr } = await supabase
          .from("polizas_activas")
          .select("factura_poliza_url")
          .eq("id", polizaId)
          .maybeSingle();
        if (qErr) throw qErr;
        let url = (data as any)?.factura_poliza_url as string | null;

        if (!url) {
          const { data: gen, error: gErr } = await supabase.functions.invoke(
            "generate-factura-poliza",
            { body: { polizaId } }
          );
          if (gErr) throw gErr;
          url = (gen as any)?.url;
        }
        if (!url) throw new Error("No se pudo obtener la factura");

        const res = await fetch(`${url}?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setHtml(await res.text());
      } catch (e: any) {
        setError(e?.message || "Error cargando la factura");
      }
    };
    load();
  }, [polizaId]);

  useEffect(() => {
    document.title = "Factura - Seguros La Vitalicia";
  }, []);

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", color: "#b91c1c" }}>
        {error}
      </div>
    );
  }

  if (!html) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", color: "#666" }}>
        Cargando factura...
      </div>
    );
  }

  return (
    <iframe
      title="Factura"
      srcDoc={html}
      style={{ width: "100vw", height: "100vh", border: 0 }}
    />
  );
};

export default FacturaPublicaPage;
