import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_NUMBER = "584123230188";

export function useWhatsappSoporte() {
  const [numero, setNumero] = useState<string>(DEFAULT_NUMBER);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("admin_settings" as any)
        .select("value")
        .eq("key", "whatsapp_soporte_numero")
        .maybeSingle();
      const value = (data as any)?.value as string | undefined;
      if (mounted && value) setNumero(value.replace(/\D/g, ""));
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const buildLink = (mensaje?: string) => {
    const base = `https://wa.me/${numero}`;
    return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
  };

  return { numero, buildLink };
}
