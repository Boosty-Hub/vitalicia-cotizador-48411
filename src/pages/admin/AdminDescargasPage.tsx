import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Search, Download, Loader2, FolderDown, RefreshCw, FileCheck2, FileX2, FileMinus,
} from "lucide-react";

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<string>("all");
  const [estado, setEstado] = useState<string>("all"); // all | not_downloaded | downloaded
  const [downloadedMap, setDownloadedMap] = useState<Map<string, Set<string>>>(new Map());
  const [history, setHistory] = useState<Array<{ downloaded_at: string; count: number }>>([]);

  useEffect(() => {
    fetchData();
  }, [tipo]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("polizas_activas")
        .select(
          `id, nombre_titular_monday, apellidos_titular_monday, razon_social_juridico_monday, nro_documento_natural_monday, nro_documento_juridico_monday, placa_monday, numero_poliza_monday, formulario, created_at, ${DOC_DEFS.map(d => d.field).join(",")}`,
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (tipo !== "all") q = q.eq("formulario", tipo);
      const { data, error } = await q;
      if (error) throw error;
      setPolizas(data || []);

      // Load this admin's downloads
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
        }

        // History: group by day (last 10 days with downloads)
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

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const toggleOne = (id: string) => {
    const ns = new Set(selected);
    ns.has(id) ? ns.delete(id) : ns.add(id);
    setSelected(ns);
  };

  const totalDocsSelected = useMemo(() => {
    let n = 0;
    for (const id of selected) {
      const p = polizas.find((x) => x.id === id);
      if (!p) continue;
      n += DOC_DEFS.filter((d) => p[d.field]).length;
    }
    return n;
  }, [selected, polizas]);

  const handleDownload = async (onlyNotDownloaded: boolean, ids?: string[]) => {
    const polizaIds = ids ?? Array.from(selected);
    if (polizaIds.length === 0) {
      toast({ title: "Selecciona al menos una póliza", variant: "destructive" });
      return;
    }
    if (polizaIds.length > 100) {
      toast({ title: "Máximo 100 pólizas por descarga", variant: "destructive" });
      return;
    }
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

  return (
    <div className="space-y-6 pb-32">
      <div className="flex items-center gap-3">
        <FolderDown className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold text-foreground">Descarga de Documentos</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, cédula, placa, póliza..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="natural">Natural</SelectItem>
              <SelectItem value="juridico">Jurídico</SelectItem>
            </SelectContent>
          </Select>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="not_downloaded">No descargados por mí</SelectItem>
              <SelectItem value="downloaded">Descargados por mí</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Checkbox
              checked={filtered.length > 0 && selected.size === filtered.length}
              onCheckedChange={toggleAll}
            />
            <span className="text-sm text-muted-foreground">
              {selected.size} de {filtered.length} seleccionadas
            </span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Sin resultados</div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((p) => {
                const dl = downloadedMap.get(p.id) || new Set();
                const titular = p.formulario === "juridico"
                  ? (p.razon_social_juridico_monday || `${p.nombre_titular_monday || ""} ${p.apellidos_titular_monday || ""}`)
                  : `${p.nombre_titular_monday || ""} ${p.apellidos_titular_monday || ""}`;
                return (
                  <div key={p.id} className="flex items-start gap-3 p-4 hover:bg-muted/30">
                    <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleOne(p.id)} />
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
                    <Button size="sm" variant="outline" onClick={() => handleDownload(false, [p.id])} disabled={downloading}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
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

      {/* Sticky bottom action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg p-4 z-50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">{selected.size}</strong> pólizas · <strong className="text-foreground">{totalDocsSelected}</strong> documentos
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelected(new Set())} disabled={downloading}>
                Limpiar
              </Button>
              <Button variant="outline" onClick={() => handleDownload(true)} disabled={downloading}>
                {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Solo nuevos (ZIP)
              </Button>
              <Button onClick={() => handleDownload(false)} disabled={downloading}>
                {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Descargar todo (ZIP)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
