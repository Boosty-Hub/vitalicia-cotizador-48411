import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Search, Download, Loader2, FolderDown, RefreshCw, FileCheck2, FileX2, FileMinus,
  Sparkles, Package,
} from "lucide-react";
import { DateRangeFilter, getDefaultDateRange, type DateRangeValue } from "@/components/admin/DateRangeFilter";

const DOC_DEFS = [
  { field: "cedula_identidad_url", key: "cedula_identidad", label: "Cédula" },
  { field: "licencia_conducir_url", key: "licencia_conducir", label: "Licencia" },
  { field: "certificado_medico_url", key: "certificado_medico", label: "Cert. Médico" },
  { field: "certificado_origen_vehiculo_url", key: "certificado_origen", label: "Origen" },
  { field: "factura_compra_vehiculo_url", key: "factura_compra", label: "Factura" },
  { field: "rif_url", key: "rif", label: "RIF" },
  { field: "acta_asamblea_url", key: "acta_asamblea", label: "Acta Asamblea" },
  { field: "acta_constitutiva_url", key: "acta_constitutiva", label: "Acta Const." },
  { field: "declaracion_islr_url", key: "declaracion_islr", label: "ISLR" },
  { field: "referencia_bancaria_url", key: "referencia_bancaria", label: "Ref. Bancaria" },
  { field: "cedula_accionistas_url", key: "cedula_accionistas", label: "Céd. Accion." },
  { field: "rif_accionistas_url", key: "rif_accionistas", label: "RIF Accion." },
  { field: "rif_empresa_url", key: "rif_empresa", label: "RIF Empresa" },
] as const;

type Poliza = Record<string, any>;

export default function AdminDescargasPage() {
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<string>("all");
  const [estado, setEstado] = useState<string>("not_downloaded"); // default: solo nuevos
  const [dateRange, setDateRange] = useState<DateRangeValue>(getDefaultDateRange());
  const [downloadedMap, setDownloadedMap] = useState<Map<string, Set<string>>>(new Map());
  const [history, setHistory] = useState<Array<{ downloaded_at: string; count: number }>>([]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, dateRange.from, dateRange.to]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("polizas_activas")
        .select(
          `id, nombre_titular_monday, apellidos_titular_monday, razon_social_juridico_monday, nro_documento_natural_monday, nro_documento_juridico_monday, placa_monday, numero_poliza_monday, formulario, created_at, ${DOC_DEFS.map(d => d.field).join(",")}`,
        )
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString())
        .order("created_at", { ascending: false })
        .limit(500);
      if (tipo !== "all") q = q.eq("formulario", tipo);
      const { data, error } = await q;
      if (error) throw error;
      setPolizas(data || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const ids = (data || []).map((p: any) => p.id);
        if (ids.length > 0) {
          const { data: dl } = await supabase
            .from("admin_document_downloads")
            .select("poliza_id, document_type")
            .eq("admin_user_id", user.id)
            .in("poliza_id", ids);
          const m = new Map<string, Set<string>>();
          for (const r of dl || []) {
            if (!m.has(r.poliza_id)) m.set(r.poliza_id, new Set());
            m.get(r.poliza_id)!.add(r.document_type);
          }
          setDownloadedMap(m);
        } else {
          setDownloadedMap(new Map());
        }

        const { data: hist } = await supabase
          .from("admin_document_downloads")
          .select("downloaded_at")
          .eq("admin_user_id", user.id)
          .order("downloaded_at", { ascending: false })
          .limit(500);
        if (hist) {
          const grouped = new Map<string, number>();
          for (const h of hist) {
            const d = new Date(h.downloaded_at).toISOString().split("T")[0];
            grouped.set(d, (grouped.get(d) || 0) + 1);
          }
          setHistory(
            Array.from(grouped.entries()).slice(0, 10).map(([downloaded_at, count]) => ({ downloaded_at, count })),
          );
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron cargar las pólizas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Filtrado completo: search + estado descarga
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return polizas.filter((p) => {
      if (s) {
        const hay = [
          p.nombre_titular_monday, p.apellidos_titular_monday, p.razon_social_juridico_monday,
          p.nro_documento_natural_monday, p.nro_documento_juridico_monday, p.placa_monday, p.numero_poliza_monday,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(s)) return false;
      }
      if (estado !== "all") {
        const existing = DOC_DEFS.filter((d) => p[d.field]).map((d) => d.key);
        const dl = downloadedMap.get(p.id) || new Set();
        const allDownloaded = existing.length > 0 && existing.every((k) => dl.has(k));
        if (estado === "downloaded" && !allDownloaded) return false;
        if (estado === "not_downloaded" && allDownloaded) return false;
      }
      return true;
    });
  }, [polizas, search, estado, downloadedMap]);

  // Pólizas que realmente tienen documentos
  const withDocs = useMemo(
    () => filtered.filter((p) => DOC_DEFS.some((d) => p[d.field])),
    [filtered],
  );

  const totalDocsToDownload = useMemo(() => {
    let n = 0;
    for (const p of withDocs) {
      const dl = downloadedMap.get(p.id) || new Set();
      for (const d of DOC_DEFS) {
        if (!p[d.field]) continue;
        if (estado === "not_downloaded" && dl.has(d.key)) continue;
        n++;
      }
    }
    return n;
  }, [withDocs, downloadedMap, estado]);

  const handleDownloadAll = async () => {
    if (withDocs.length === 0) {
      toast({ title: "No hay documentos para descargar", variant: "destructive" });
      return;
    }
    if (withDocs.length > 100) {
      toast({
        title: "Demasiadas pólizas",
        description: `Hay ${withDocs.length} pólizas. Reduce el rango o filtra para descargar máximo 100 a la vez.`,
        variant: "destructive",
      });
      return;
    }
    await runDownload(withDocs.map((p) => p.id), estado === "not_downloaded");
  };

  const handleDownloadOne = async (id: string) => {
    await runDownload([id], false);
  };

  const runDownload = async (polizaIds: string[], onlyNotDownloaded: boolean) => {
    setDownloading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const resp = await fetch(`${supabaseUrl}/functions/v1/download-poliza-documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ polizaIds, onlyNotDownloaded }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${resp.status}`);
      }
      const blob = await resp.blob();
      const filesCount = resp.headers.get("X-Files-Count") || "?";
      const errCount = resp.headers.get("X-Errors-Count") || "0";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `descargas-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "✅ Descarga lista",
        description: `${filesCount} archivos · ${errCount} errores`,
      });
      fetchData();
    } catch (e: any) {
      toast({ title: "Error en descarga", description: e.message, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const isOnlyNew = estado === "not_downloaded";
  const downloadLabel = isOnlyNew
    ? `Descargar ${withDocs.length} póliza${withDocs.length === 1 ? "" : "s"} nuevas`
    : `Descargar ${withDocs.length} póliza${withDocs.length === 1 ? "" : "s"}`;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <FolderDown className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold text-foreground">Descarga de Documentos</h1>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cédula, placa, póliza..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
                <SelectItem value="juridico">Jurídico</SelectItem>
              </SelectContent>
            </Select>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger className="w-[210px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="not_downloaded">⭐ Solo nuevos (no descargados)</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="downloaded">Ya descargados por mí</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchData} disabled={loading} title="Recargar">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Resumen + acción principal */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              {isOnlyNew ? (
                <Sparkles className="h-4 w-4 text-primary" />
              ) : (
                <Package className="h-4 w-4 text-primary" />
              )}
              <span className="text-foreground">
                <strong>{withDocs.length}</strong> póliza{withDocs.length === 1 ? "" : "s"} con documentos
                {totalDocsToDownload > 0 && (
                  <span className="text-muted-foreground"> · {totalDocsToDownload} archivos a descargar</span>
                )}
              </span>
            </div>
            <Button
              size="lg"
              onClick={handleDownloadAll}
              disabled={downloading || withDocs.length === 0}
              className="w-full sm:w-auto"
            >
              {downloading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Download className="h-5 w-5 mr-2" />
              )}
              {downloadLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderDown className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Sin resultados con los filtros actuales</p>
              <p className="text-xs mt-1">Prueba ampliar el rango de fechas o cambiar el estado</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((p) => {
                const dl = downloadedMap.get(p.id) || new Set();
                const titular = p.formulario === "juridico"
                  ? (p.razon_social_juridico_monday || `${p.nombre_titular_monday || ""} ${p.apellidos_titular_monday || ""}`)
                  : `${p.nombre_titular_monday || ""} ${p.apellidos_titular_monday || ""}`;
                const hasAnyDoc = DOC_DEFS.some((d) => p[d.field]);
                return (
                  <div key={p.id} className="flex items-start gap-3 p-4 hover:bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-medium text-foreground">{titular || "Sin nombre"}</span>
                        <Badge variant={p.formulario === "natural" ? "default" : "secondary"}>
                          {p.formulario === "natural" ? "Natural" : "Jurídico"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {p.nro_documento_juridico_monday || p.nro_documento_natural_monday || "—"} · {p.placa_monday || "—"} · {p.numero_poliza_monday || "Sin póliza"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {DOC_DEFS.map((d) => {
                          const exists = !!p[d.field];
                          const downloaded = dl.has(d.key);
                          let cls = "bg-muted text-muted-foreground";
                          let Icon = FileMinus;
                          if (exists && downloaded) { cls = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"; Icon = FileCheck2; }
                          else if (exists) { cls = "bg-blue-500/15 text-blue-700 dark:text-blue-300"; Icon = FileX2; }
                          return (
                            <span key={d.key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${cls}`}>
                              <Icon className="h-3 w-3" /> {d.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadOne(p.id)}
                      disabled={downloading || !hasAnyDoc}
                      title={hasAnyDoc ? "Descargar esta póliza" : "Sin documentos"}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Leyenda:</span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <FileCheck2 className="h-3 w-3" /> Descargado
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300">
              <FileX2 className="h-3 w-3" /> Pendiente
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-muted-foreground">
              <FileMinus className="h-3 w-3" /> No cargado
            </span>
          </span>
        </CardContent>
      </Card>

      {/* Historial */}
      {history.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2 text-foreground">Mi historial reciente</h3>
            <div className="flex flex-wrap gap-2">
              {history.map((h) => (
                <Badge key={h.downloaded_at} variant="outline">
                  {h.downloaded_at} · {h.count} docs
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
