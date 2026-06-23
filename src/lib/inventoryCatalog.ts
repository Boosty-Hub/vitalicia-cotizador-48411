/**
 * Catálogos de inventario (board_cod_*) cargados una sola vez para normalizar
 * los datos de las cargas masivas de Excel ANTES de guardarlos.
 *
 * Objetivo: que marca / modelo / versión / color queden con la descripción
 * EXACTA del catálogo (y, en BERA, con su código RMS resuelto), para que la
 * activación de póliza los mapee bien y RMS los acepte. Antes se guardaba el
 * texto crudo del Excel y diferencias de mayúsculas/espacios rompían el mapeo.
 */
import { supabase } from "@/integrations/supabase/client";

/** Normaliza para comparar: colapsa espacios internos, recorta y pasa a mayúsculas. */
export function normKey(s: string | null | undefined): string {
  return (s ?? "").replace(/\s+/g, " ").trim().toUpperCase();
}

export interface CatalogHit {
  code: string;
  desc: string;
}

export interface InventoryCatalogs {
  marcaByKey: Map<string, CatalogHit>;
  /** clave: `${cdMarca}||${normKey(desc)}` */
  modeloByMarcaKey: Map<string, CatalogHit>;
  /** clave: normKey(desc) — fallback cuando no hay marca resuelta */
  modeloByKey: Map<string, CatalogHit>;
  colorByKey: Map<string, CatalogHit>;
  /** clave: `${cdMarca}||${normKey(desc)}` */
  versionByMarcaKey: Map<string, CatalogHit>;
  versionByKey: Map<string, CatalogHit>;
}

export async function loadInventoryCatalogs(): Promise<InventoryCatalogs> {
  const [marcas, modelos, colores, versiones] = await Promise.all([
    supabase.from("board_cod_marca").select("cd_marca, descripcion"),
    supabase.from("board_cod_modelo").select("cd_marca, cd_modelo, descripcion"),
    supabase.from("board_cod_color").select("cd_valdet, descripcion"),
    supabase.from("board_cod_version_moto").select("cd_marca, cd_version, descripcion"),
  ]);

  const marcaByKey = new Map<string, CatalogHit>();
  for (const r of marcas.data ?? []) {
    const desc = r.descripcion ?? "";
    const k = normKey(desc);
    if (k && !marcaByKey.has(k)) marcaByKey.set(k, { code: String(r.cd_marca ?? ""), desc });
  }

  const modeloByMarcaKey = new Map<string, CatalogHit>();
  const modeloByKey = new Map<string, CatalogHit>();
  for (const r of modelos.data ?? []) {
    const desc = r.descripcion ?? "";
    const k = normKey(desc);
    if (!k) continue;
    const cdMarca = String(r.cd_marca ?? "");
    const hit: CatalogHit = { code: String(r.cd_modelo ?? ""), desc };
    const mk = `${cdMarca}||${k}`;
    if (!modeloByMarcaKey.has(mk)) modeloByMarcaKey.set(mk, hit);
    if (!modeloByKey.has(k)) modeloByKey.set(k, hit);
  }

  const colorByKey = new Map<string, CatalogHit>();
  for (const r of colores.data ?? []) {
    const desc = r.descripcion ?? "";
    const k = normKey(desc);
    if (k && !colorByKey.has(k)) colorByKey.set(k, { code: String(r.cd_valdet ?? ""), desc });
  }

  const versionByMarcaKey = new Map<string, CatalogHit>();
  const versionByKey = new Map<string, CatalogHit>();
  for (const r of versiones.data ?? []) {
    const desc = r.descripcion ?? "";
    const k = normKey(desc);
    if (!k) continue;
    const cdMarca = String(r.cd_marca ?? "");
    const hit: CatalogHit = { code: String(r.cd_version ?? ""), desc };
    const mk = `${cdMarca}||${k}`;
    if (!versionByMarcaKey.has(mk)) versionByMarcaKey.set(mk, hit);
    if (!versionByKey.has(k)) versionByKey.set(k, hit);
  }

  return { marcaByKey, modeloByMarcaKey, modeloByKey, colorByKey, versionByMarcaKey, versionByKey };
}

export function lookupMarca(cat: InventoryCatalogs, raw: string | null | undefined): CatalogHit | null {
  return cat.marcaByKey.get(normKey(raw)) ?? null;
}

export function lookupModelo(
  cat: InventoryCatalogs,
  raw: string | null | undefined,
  cdMarca?: string,
): CatalogHit | null {
  const k = normKey(raw);
  if (!k) return null;
  // Con marca resuelta, buscar SOLO dentro de esa marca (evita tomar el código de
  // un modelo homónimo de otra marca). Sin marca resuelta, fallback global.
  if (cdMarca) return cat.modeloByMarcaKey.get(`${cdMarca}||${k}`) ?? null;
  return cat.modeloByKey.get(k) ?? null;
}

export function lookupColor(cat: InventoryCatalogs, raw: string | null | undefined): CatalogHit | null {
  return cat.colorByKey.get(normKey(raw)) ?? null;
}

export function lookupVersion(
  cat: InventoryCatalogs,
  raw: string | null | undefined,
  cdMarca?: string,
): CatalogHit | null {
  const k = normKey(raw);
  if (!k) return null;
  // Con marca resuelta, buscar SOLO dentro de esa marca; sin marca, fallback global.
  if (cdMarca) return cat.versionByMarcaKey.get(`${cdMarca}||${k}`) ?? null;
  return cat.versionByKey.get(k) ?? null;
}
