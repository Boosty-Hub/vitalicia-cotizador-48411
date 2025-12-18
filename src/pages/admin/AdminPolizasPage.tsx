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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, FileDown, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Poliza = {
  id: string;
  nombre_titular_monday: string | null;
  apellidos_titular_monday: string | null;
  nro_documento_natural_monday: string | null;
  placa_monday: string | null;
  s_marca: string | null;
  s_modelo: string | null;
  poliza_monday: string | null;
  numero_poliza_monday: string | null;
  fecha_de_vencimiento_monday: string | null;
  created_at: string;
  formulario: string | null;
};

export default function AdminPolizasPage() {
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormulario, setFilterFormulario] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPoliza, setSelectedPoliza] = useState<Poliza | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [polizaToDelete, setPolizaToDelete] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    fetchPolizas();
  }, [currentPage, searchTerm, filterFormulario]);

  const fetchPolizas = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("polizas_activas")
        .select("*", { count: "exact" });

      // Apply search filter
      if (searchTerm) {
        query = query.or(
          `nombre_titular_monday.ilike.%${searchTerm}%,apellidos_titular_monday.ilike.%${searchTerm}%,nro_documento_natural_monday.ilike.%${searchTerm}%,placa_monday.ilike.%${searchTerm}%,numero_poliza_monday.ilike.%${searchTerm}%`
        );
      }

      // Apply formulario filter
      if (filterFormulario !== "all") {
        query = query.eq("formulario", filterFormulario);
      }

      // Apply pagination
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

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
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
          <Select
            value={filterFormulario}
            onValueChange={(value) => {
              setFilterFormulario(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de póliza" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="natural">Persona Natural</SelectItem>
              <SelectItem value="juridico">Persona Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No se encontraron pólizas
                  </TableCell>
                </TableRow>
              ) : (
                polizas.map((poliza) => (
                  <TableRow key={poliza.id}>
                    <TableCell className="font-medium">
                      {poliza.nombre_titular_monday} {poliza.apellidos_titular_monday}
                    </TableCell>
                    <TableCell>{poliza.nro_documento_natural_monday}</TableCell>
                    <TableCell>{poliza.placa_monday}</TableCell>
                    <TableCell>
                      {poliza.s_marca} {poliza.s_modelo}
                    </TableCell>
                    <TableCell>{poliza.numero_poliza_monday}</TableCell>
                    <TableCell>{poliza.fecha_de_vencimiento_monday}</TableCell>
                    <TableCell>
                      <Badge variant={poliza.formulario === "natural" ? "default" : "secondary"}>
                        {poliza.formulario === "natural" ? "Natural" : "Jurídico"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPoliza(poliza);
                            setShowDetailDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setPolizaToDelete(poliza.id);
                            setShowDeleteDialog(true);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
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
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Detalle de Póliza</DialogTitle>
            <DialogDescription>
              Información completa de la póliza seleccionada
            </DialogDescription>
          </DialogHeader>
          {selectedPoliza && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Titular</p>
                  <p className="font-medium">
                    {selectedPoliza.nombre_titular_monday} {selectedPoliza.apellidos_titular_monday}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Documento</p>
                  <p className="font-medium">{selectedPoliza.nro_documento_natural_monday}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Placa</p>
                  <p className="font-medium">{selectedPoliza.placa_monday}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Vehículo</p>
                  <p className="font-medium">
                    {selectedPoliza.s_marca} {selectedPoliza.s_modelo}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Número de Póliza</p>
                  <p className="font-medium">{selectedPoliza.numero_poliza_monday}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Vencimiento</p>
                  <p className="font-medium">{selectedPoliza.fecha_de_vencimiento_monday}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Tipo</p>
                  <Badge variant={selectedPoliza.formulario === "natural" ? "default" : "secondary"}>
                    {selectedPoliza.formulario === "natural" ? "Persona Natural" : "Persona Jurídica"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Fecha de Creación</p>
                  <p className="font-medium">
                    {new Date(selectedPoliza.created_at).toLocaleDateString("es-VE")}
                  </p>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

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
