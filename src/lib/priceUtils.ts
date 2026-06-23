/**
 * Utility functions for price formatting and validation
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * Formats a price value to have maximum 2 decimal places
 * @param value - The price value (string or number)
 * @returns Formatted price string with max 2 decimals
 */
export function formatPriceToTwoDecimals(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "0";
  }
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return "0";
  }
  
  // Round to 2 decimal places and convert to string
  return Number(numValue.toFixed(2)).toString();
}

/**
 * Parses a price from any format and returns a number with max 2 decimals
 * @param value - The price value to parse
 * @returns Number with max 2 decimal places
 */
export function parsePriceToNumber(value: any): number {
  if (!value) return 0;
  
  if (typeof value === "number") {
    return Math.round(value * 100) / 100;
  }
  
  // Remove $ and commas, then parse
  const cleaned = String(value).replace(/[$,]/g, "").trim();
  const num = parseFloat(cleaned);

  if (isNaN(num)) return 0;

  return Math.round(num * 100) / 100;
}

/**
 * Busca el precio de venta de un modelo EMPIRE en `precios_empire`.
 *
 * Prioriza la coincidencia EXACTA del modelo para evitar el bug del match difuso:
 * con `modelo ILIKE '%HORSE 150%'` el modelo "HORSE 150" agarraba el precio de
 * "NEW HORSE 150" (otra moto). Orden de búsqueda:
 *   1. modelo EXACTO (ilike sin comodín)
 *   2. name EXACTO
 *   3. modelo PARCIAL (`%modelo%`) — solo como último recurso
 * Dentro de cada intento toma el registro más reciente (created_at desc) que
 * cumpla `created_at <= fechaComparison` (si se pasa).
 *
 * @returns el precio crudo (string) o null si no hay coincidencia.
 */
export async function fetchPrecioEmpire(
  modelo: string | null | undefined,
  opts?: { fechaComparison?: string },
): Promise<string | null> {
  const m = (modelo || "").trim();
  if (!m) return null;

  const run = async (column: "modelo" | "name", pattern: string): Promise<string | null> => {
    let q = supabase
      .from("precios_empire")
      .select('precio_venta, "precio venta", created_at, modelo, name')
      .ilike(column, pattern)
      .order("created_at", { ascending: false })
      .limit(1);
    if (opts?.fechaComparison) q = q.lte("created_at", opts.fechaComparison);
    const { data, error } = await q.maybeSingle();
    if (error || !data) return null;
    return data.precio_venta || data["precio venta"] || null;
  };

  return (await run("modelo", m)) ?? (await run("name", m)) ?? (await run("modelo", `%${m}%`));
}
