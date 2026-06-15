import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Search, Trash2, ChevronLeft, ChevronRight, FileDown, Loader2, RefreshCw, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/integrations/supabase/types";
import { PolicyStatusBadge, getPolizaStatus } from "@/components/admin/PolicyStatusBadge";
import { PolicyDetailsDialog } from "@/components/admin/PolicyDetailsDialog";
import { refreshPolizaConfig } from "@/utils/refreshPolizaConfig";

type Poliza = Database["public"]["Tables"]["polizas_activas"]["Row"];

// Filtro de estado por pestaña, aplicado en la consulta (server-side) para que la paginación
// sea correcta. Coincide con la lógica de getPolizaStatus:
//  - activas: tiene número de póliza y no está en error
//  - pendientes: sin número de póliza y sin error (Nuevo registro / Pendiente revisión analista)
//  - errores: api_status = 'error'
const applyStatusFilter = (query: any, status: string) => {
  if (status === "activas") {
    return query.not("numero_poliza_monday", "is", null).or("api_status.is.null,api_status.neq.error");
  }
  if (status === "pendientes") {
    return query.is("numero_poliza_monday", null).or("api_status.is.null,api_status.neq.error");
  }
  if (status === "errores") {
    return query.eq("api_status", "error");
  }
  return query;
};

export default function AdminPolizasPage() {
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormulario, setFilterFormulario] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState({ all: 0, activas: 0, pendientes: 0, errores: 0 });
  const [selectedPoliza, setSelectedPoliza] = useState<Poliza | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [polizaToDelete, setPolizaToDelete] = useState<string | null>(null);
  const [processingPolizaId, setProcessingPolizaId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [realtimeNonce, setRealtimeNonce] = useState(0);
  const pageSize = 10;

  const searchOr = searchTerm
    ? `nombre_titular_monday.ilike.%${searchTerm}%,apellidos_titular_monday.ilike.%${searchTerm}%,nro_documento_natural_monday.ilike.%${searchTerm}%,placa_monday.ilike.%${searchTerm}%,numero_poliza_monday.ilike.%${searchTerm}%`
    : "";

  const toggleSelected = (id: string) => {
    const ns = new Set(selectedIds);
    ns.has(id) ? ns.delete(id) : ns.add(id);
    setSelectedIds(ns);
  };
  const toggleAllPage = () => {
    if (polizas.every((p) => selectedIds.has(p.id))) {
      const ns = new Set(selectedIds);
      polizas.forEach((p) => ns.delete(p.id));
      setSelectedIds(ns);
    } else {
      const ns = new Set(selectedIds);
      polizas.forEach((p) => ns.add(p.id));
      setSelectedIds(ns);
    }
  };

  const downloadDocs = async (ids: string[]) => {
    if (ids.length === 0) return;
    if (ids.length > 100) {
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
        body: JSON.stringify({ polizaIds: ids, onlyNotDownloaded: false }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error || `HTTP ${resp.status}`);
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `descargas-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "✅ Descarga lista" });
    } catch (e: any) {
      toast({ title: "Error en descarga", description: e.message, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchPolizas();
  }, [currentPage, searchTerm, filterFormulario, filterStatus, realtimeNonce]);

  // Conteos por estado para las pestañas (respetan la búsqueda y el tipo seleccionados).
  useEffect(() => {
    const fetchCounts = async () => {
      const build = () => {
        let q = supabase.from("polizas_activas").select("id", { count: "exact", head: true });
        if (searchOr) q = q.or(searchOr);
        if (filterFormulario !== "all") q = q.eq("formulario", filterFormulario);
        return q;
      };
      try {
        const [all, activas, pendientes, errores] = await Promise.all([
          build(),
          applyStatusFilter(build(), "activas"),
          applyStatusFilter(build(), "pendientes"),
          applyStatusFilter(build(), "errores"),
        ]);
        setCounts({
          all: all.count || 0,
          activas: activas.count || 0,
          pendientes: pendientes.count || 0,
          errores: errores.count || 0,
        });
      } catch (e) {
        /* los conteos son informativos: si fallan, no rompemos la tabla */
      }
    };
    fetchCounts();
  }, [searchTerm, filterFormulario, realtimeNonce]);

  // Toast en tiempo real por cada nuevo registro insertado en polizas_activas.
  useEffect(() => {
    const channel = supabase
      .channel("polizas-nuevos-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "polizas_activas" },
        (payload) => {
          const p = payload.new as any;
          const titular = `${p?.nombre_titular_monday || ""} ${p?.apellidos_titular_monday || ""}`.trim();
          toast({
            title: "🆕 Nuevo registro",
            description: [titular, p?.placa_monday].filter(Boolean).join(" · ") || "Se registró una nueva póliza",
          });
          setRealtimeNonce((n) => n + 1);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPolizas = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("polizas_activas")
        .select("*", { count: "exact" });

      if (searchOr) query = query.or(searchOr);
      if (filterFormulario !== "all") query = query.eq("formulario", filterFormulario);
      query = applyStatusFilter(query, filterStatus);

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setPolizas(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching polizas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las pólizas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!polizaToDelete) return;

    try {
      const { error } = await supabase
        .from("polizas_activas")
        .delete()
        .eq("id", polizaToDelete);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Póliza eliminada correctamente",
      });
      fetchPolizas();
    } catch (error) {
      console.error("Error deleting poliza:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la póliza",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setPolizaToDelete(null);
    }
  };

  // Reprocesar póliza: actualiza configuración y llama a RMS API
  const handleReprocess = async (poliza: Poliza) => {
    if (processingPolizaId) return;

    setProcessingPolizaId(poliza.id);

    try {
      toast({
        title: "Actualizando configuración...",
        description: "Obteniendo datos actualizados de las tablas de configuración",
      });

      const refreshResult = await refreshPolizaConfig({
        id: poliza.id,
        s_marca: poliza.s_marca,
        s_modelo: poliza.s_modelo,
        s_color: poliza.s_color,
        año_monday: poliza.año_monday,
        formulario: poliza.formulario,
        placa_monday: poliza.placa_monday,
      });

      if (!refreshResult.success) {
        toast({
          title: "Error al actualizar configuración",
          description: refreshResult.error,
          variant: "destructive",
        });
        return;
      }

      if (Object.keys(refreshResult.updatedFields).length > 0) {
        toast({
          title: "Configuración actualizada",
          description: `Se actualizaron ${Object.keys(refreshResult.updatedFields).length} campos`,
        });
      }

      const { data: updatedPoliza, error: fetchError } = await supabase
        .from('polizas_activas')
        .select('*')
        .eq('id', poliza.id)
        .single();

      if (fetchError || !updatedPoliza) {
        throw new Error('No se pudo obtener la póliza actualizada');
      }

      toast({
        title: "Procesando con RMS...",
        description: "Enviando datos para obtener número de póliza",
      });

      const { data: rmsResult, error: rmsError } = await supabase.functions.invoke('rms-create-policy', {
        body: {
          polizaId: poliza.id,
          formData: {
            ...updatedPoliza,
            n_suma: updatedPoliza.n_suma,
            c_cd_marca: updatedPoliza.c_cd_marca,
            c_cd_modelo: updatedPoliza.c_cd_modelo,
            c_cd_version: updatedPoliza.c_cd_version,
            c_cd_color: updatedPoliza.c_cd_color,
            n_nu_centuria: updatedPoliza.n_nu_centuria,
            c_cd_versionseguro: updatedPoliza.c_cd_versionseguro,
            c_cd_subversionseguro: updatedPoliza.c_cd_subversionseguro,
          },
          tipoFormulario: poliza.formulario || 'natural'
        }
      });

      if (rmsError) {
        console.error('Error llamando a RMS:', rmsError);

        await supabase
          .from('polizas_activas')
          .update({
            api_status: 'error',
            api_message: rmsError.message || 'Error al procesar con RMS',
          })
          .eq('id', poliza.id);

        toast({
          title: "Error al procesar",
          description: rmsError.message || 'Error al comunicarse con RMS',
          variant: "destructive",
        });
        return;
      }

      if (!rmsResult?.success) {
        toast({
          title: "Error de RMS",
          description: rmsResult?.error || 'La API de RMS retornó un error',
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "¡Póliza procesada exitosamente!",
        description: `Número de póliza: ${rmsResult.numeroPoliza}`,
      });

      fetchPolizas();

    } catch (error) {
      console.error('Error en handleReprocess:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive",
      });
    } finally {
      setProcessingPolizaId(null);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Titular",
      "Documento",
      "Placa",
      "Marca",
      "Modelo",
      "Póliza",
      "Vencimiento",
      "Tipo",
    ];
    const rows = polizas.map((p) => [
      `${p.nombre_titular_monday || ""} ${p.apellidos_titular_monday || ""}`,
      p.nro_documento_natural_monday || "",
      p.placa_monday || "",
      p.s_marca || "",
      p.s_modelo || "",
      p.numero_poliza_monday || "",
      p.fecha_de_vencimiento_monday || "",
      p.formulario || "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `polizas_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const openDetailDialog = (poliza: Poliza) => {
    setSelectedPoliza(poliza);
    setShowDetailDialog(true);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const TabCount = ({ n }: { n: number }) => (
    <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
      {n}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar: búsqueda + tipo (pestañas) + acciones */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, cédula, placa..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Tabs
            value={filterFormulario}
            onValueChange={(value) => {
              setFilterFormulario(value);
              setCurrentPage(1);
            }}
          >
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="natural">Naturales</TabsTrigger>
              <TabsTrigger value="juridico">Jurídicas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button onClick={() => downloadDocs(Array.from(selectedIds))} disabled={downloading} className="gap-2">
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Descargar ({selectedIds.size})
            </Button>
          )}
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Pestañas de estado */}
      <Tabs
        value={filterStatus}
        onValueChange={(value) => {
          setFilterStatus(value);
          setCurrentPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">Todas<TabCount n={counts.all} /></TabsTrigger>
          <TabsTrigger value="activas">Activas<TabCount n={counts.activas} /></TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes<TabCount n={counts.pendientes} /></TabsTrigger>
          <TabsTrigger value="errores" className="data-[state=active]:text-destructive">
            Errores<TabCount n={counts.errores} />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={polizas.length > 0 && polizas.every((p) => selectedIds.has(p.id))}
                    onCheckedChange={toggleAllPage}
                  />
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Póliza</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {polizas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No se encontraron pólizas
                  </TableCell>
                </TableRow>
              ) : (
                polizas.map((poliza) => {
                  const { status, message } = getPolizaStatus(poliza);
                  const isProcessing = processingPolizaId === poliza.id;

                  return (
                    <TableRow
                      key={poliza.id}
                      onClick={() => openDetailDialog(poliza)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(poliza.id)}
                          onCheckedChange={() => toggleSelected(poliza.id)}
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <PolicyStatusBadge
                          status={isProcessing ? 'processing' : status}
                          message={message}
                          onClick={status === 'error' || status === 'pending' ? () => handleReprocess(poliza) : undefined}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {poliza.nombre_titular_monday} {poliza.apellidos_titular_monday}
                      </TableCell>
                      <TableCell>{poliza.nro_documento_natural_monday || poliza.nro_documento_juridico_monday}</TableCell>
                      <TableCell>{poliza.placa_monday}</TableCell>
                      <TableCell>
                        {poliza.s_marca} {poliza.s_modelo}
                      </TableCell>
                      <TableCell>{poliza.numero_poliza_monday || '-'}</TableCell>
                      <TableCell>{poliza.fecha_de_vencimiento_monday}</TableCell>
                      <TableCell>
                        <Badge variant={poliza.formulario === "natural" ? "default" : "secondary"}>
                          {poliza.formulario === "natural" ? "Natural" : "Jurídico"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          {(status === 'error' || status === 'pending') && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReprocess(poliza)}
                              disabled={isProcessing}
                              title="Reprocesar póliza"
                            >
                              <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadDocs([poliza.id])}
                            disabled={downloading}
                            title="Descargar documentos de esta póliza"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setPolizaToDelete(poliza.id);
                              setShowDeleteDialog(true);
                            }}
                            className="text-destructive hover:text-destructive"
                            title="Eliminar póliza"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} a{" "}
          {Math.min(currentPage * pageSize, totalCount)} de {totalCount} registros
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Policy Details Dialog */}
      <PolicyDetailsDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        policy={selectedPoliza}
        allowEdit={true}
        onPolicyUpdated={fetchPolizas}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar póliza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La póliza será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
