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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
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
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, FileDown, Loader2, Pencil, Save, X, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Database } from "@/integrations/supabase/types";

type Poliza = Database["public"]["Tables"]["polizas_activas"]["Row"];

export default function AdminPolizasPage() {
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormulario, setFilterFormulario] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPoliza, setSelectedPoliza] = useState<Poliza | null>(null);
  const [editedPoliza, setEditedPoliza] = useState<Poliza | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [polizaToDelete, setPolizaToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

      if (searchTerm) {
        query = query.or(
          `nombre_titular_monday.ilike.%${searchTerm}%,apellidos_titular_monday.ilike.%${searchTerm}%,nro_documento_natural_monday.ilike.%${searchTerm}%,placa_monday.ilike.%${searchTerm}%,numero_poliza_monday.ilike.%${searchTerm}%`
        );
      }

      if (filterFormulario !== "all") {
        query = query.eq("formulario", filterFormulario);
      }

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

  const handleSave = async () => {
    if (!editedPoliza) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("polizas_activas")
        .update(editedPoliza)
        .eq("id", editedPoliza.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Póliza actualizada correctamente",
      });
      
      setSelectedPoliza(editedPoliza);
      setIsEditing(false);
      fetchPolizas();
    } catch (error) {
      console.error("Error updating poliza:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la póliza",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof Poliza, value: string | null) => {
    if (!editedPoliza) return;
    setEditedPoliza({ ...editedPoliza, [field]: value });
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
    setEditedPoliza(poliza);
    setIsEditing(false);
    setShowDetailDialog(true);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const renderField = (label: string, field: keyof Poliza, type: "text" | "date" = "text") => {
    const value = isEditing ? editedPoliza?.[field] : selectedPoliza?.[field];
    
    if (isEditing) {
      return (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <Input
            type={type}
            value={value?.toString() || ""}
            onChange={(e) => handleFieldChange(field, e.target.value || null)}
            className="h-8 text-sm"
          />
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "-"}</p>
      </div>
    );
  };

  const renderDocumentLink = (label: string, url: string | null) => {
    if (!url) {
      return (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm text-muted-foreground italic">No cargado</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Ver documento <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  };

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
                    <TableCell>{poliza.nro_documento_natural_monday || poliza.nro_documento_juridico_monday}</TableCell>
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
                          onClick={() => openDetailDialog(poliza)}
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

      {/* Detail/Edit Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
        }
        setShowDetailDialog(open);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>
                  {isEditing ? "Editar Póliza" : "Detalle de Póliza"}
                </DialogTitle>
                <DialogDescription>
                  {selectedPoliza?.numero_poliza_monday || "Sin número de póliza"}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedPoliza(selectedPoliza);
                        setIsEditing(false);
                      }}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Guardar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {selectedPoliza && (
            <ScrollArea className="h-[70vh] pr-4">
              <Tabs defaultValue="titular" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="titular">Titular</TabsTrigger>
                  <TabsTrigger value="beneficiario">Beneficiario</TabsTrigger>
                  <TabsTrigger value="vehiculo">Vehículo</TabsTrigger>
                  <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos</TabsTrigger>
                  <TabsTrigger value="tecnico">Técnico</TabsTrigger>
                </TabsList>

                {/* Datos del Titular */}
                <TabsContent value="titular" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Información Personal</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("Nombre", "nombre_titular_monday")}
                      {renderField("Apellidos", "apellidos_titular_monday")}
                      {renderField("Tipo Identificación", "tipo_id_titular_monday")}
                      {renderField("Nro. Documento (Natural)", "nro_documento_natural_monday")}
                      {renderField("Nro. Documento (Jurídico)", "nro_documento_juridico_monday")}
                      {renderField("Razón Social", "razon_social_juridico_monday")}
                      {renderField("Sexo", "cd_sexo")}
                      {renderField("Sexo (Descripción)", "s_sexo")}
                      {renderField("Fecha Nacimiento", "fecha_nacimiento_titular_monday", "date")}
                      {renderField("Estado Civil", "cd_edocivil")}
                      {renderField("Estado Civil (Descripción)", "s_edocivil")}
                      {renderField("Nacionalidad", "c_cd_nacionalidad")}
                      {renderField("Nacionalidad (Descripción)", "s_nacionalidad")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("Código Telefónico", "codigo_telefonico_titular_monday")}
                      {renderField("Número Telefónico", "numero_telefonico_titular_monday")}
                      {renderField("Email Principal", "email_monday")}
                      {renderField("Email Alternativo", "email_alternativo_monday")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Datos API</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("c_nombre", "c_nombre")}
                      {renderField("c_apellido", "c_apellido")}
                      {renderField("n_cedrif", "n_cedrif")}
                      {renderField("f_fecnac", "f_fecnac", "date")}
                      {renderField("c_razonsocial", "c_razonsocial")}
                      {renderField("n_correlativo", "n_correlativo")}
                      {renderField("n_ingresoanualnac", "n_ingresoanualnac")}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Datos del Beneficiario/Apoderado */}
                <TabsContent value="beneficiario" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Datos del Apoderado</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("Nombre", "nombre_apoderado_monday")}
                      {renderField("Apellido", "apellido_apoderado_monday")}
                      {renderField("Nro. Documento", "numero_documento_apoderado_monday")}
                      {renderField("Fecha Nacimiento", "fecha_nacimiento_apoderado_monday", "date")}
                      {renderField("Estado Civil", "estado_civil_apoderado_monday")}
                      {renderField("Sexo", "sexo_apoderado_monday")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Datos API - Apoderado (AP)</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("c_nombreap", "c_nombreap")}
                      {renderField("c_apellidoap", "c_apellidoap")}
                      {renderField("n_cedrifap", "n_cedrifap")}
                      {renderField("f_fecnacap", "f_fecnacap", "date")}
                      {renderField("cd_sexoap", "cd_sexoap")}
                      {renderField("s_sexoap", "s_sexoap")}
                      {renderField("cd_edocivilap", "cd_edocivilap")}
                      {renderField("s_edocivilap", "s_edocivilap")}
                      {renderField("c_cd_nacionalidadap", "c_cd_nacionalidadap")}
                      {renderField("s_nacionalidadap", "s_nacionalidadap")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Datos API - Chofer (CH)</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("c_nombrech", "c_nombrech")}
                      {renderField("c_apellidoch", "c_apellidoch")}
                      {renderField("n_cedrifch", "n_cedrifch")}
                      {renderField("f_fecnacch", "f_fecnacch", "date")}
                      {renderField("cd_sexoch", "cd_sexoch")}
                      {renderField("s_sexoch", "s_sexoch")}
                      {renderField("cd_edocivilch", "cd_edocivilch")}
                      {renderField("s_edocivilch", "s_edocivilch")}
                      {renderField("c_cd_nacionalidadch", "c_cd_nacionalidadch")}
                      {renderField("s_nacionalidadch", "s_nacionalidadch")}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Datos del Vehículo */}
                <TabsContent value="vehiculo" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Información del Vehículo</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("Placa", "placa_monday")}
                      {renderField("Marca", "s_marca")}
                      {renderField("Código Marca", "c_cd_marca")}
                      {renderField("Modelo", "s_modelo")}
                      {renderField("Código Modelo", "c_cd_modelo")}
                      {renderField("Versión", "s_version")}
                      {renderField("Código Versión", "c_cd_version")}
                      {renderField("Año", "año_monday")}
                      {renderField("n_anio", "n_anio")}
                      {renderField("Color", "s_color")}
                      {renderField("Código Color", "c_cd_color")}
                      {renderField("Color BERA", "color_bera_monday")}
                      {renderField("Código Color Empire", "cod_color_empire_monday")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Datos Técnicos del Vehículo</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("Serial Carrocería", "serial_carroceria_monday")}
                      {renderField("c_carroceria", "c_carroceria")}
                      {renderField("c_placa", "c_placa")}
                      {renderField("Serial Motor", "serial_motor_monday")}
                      {renderField("c_motor", "c_motor")}
                      {renderField("Transmisión Empire", "transmision_empire_monday")}
                      {renderField("Versión Modelo", "version_modelo_monday")}
                      {renderField("Código Modelo Monday", "cod_modelo_monday")}
                      {renderField("n_nu_centuria", "n_nu_centuria")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Datos de Compra</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("Fecha Compra", "fecha_compra_monday", "date")}
                      {renderField("f_fechacompra", "f_fechacompra", "date")}
                      {renderField("Precio Venta Tienda", "precio_venta_tienda_monday")}
                      {renderField("n_suma", "n_suma")}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Datos de Ubicación */}
                <TabsContent value="ubicacion" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Dirección</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("País", "pais_monday")}
                      {renderField("Código País", "c_cd_pais")}
                      {renderField("s_pais", "s_pais")}
                      {renderField("Estado", "c_cd_estado")}
                      {renderField("s_estado", "s_estado")}
                      {renderField("Ciudad", "ciudad_monday")}
                      {renderField("Código Ciudad", "c_cd_ciudad")}
                      {renderField("s_ciudad", "s_ciudad")}
                      {renderField("Municipio", "municipio_monday")}
                      {renderField("Código Municipio", "c_cd_municipio")}
                      {renderField("s_municipio", "s_municipio")}
                      {renderField("Dirección", "direccion_monday")}
                      {renderField("c_direccion", "c_direccion")}
                      {renderField("Código Postal", "codigo_postal_monday")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Datos de Contacto API</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("c_cd_telef1", "c_cd_telef1")}
                      {renderField("s_telef1", "s_telef1")}
                      {renderField("c_numtelef1", "c_numtelef1")}
                      {renderField("c_email1", "c_email1")}
                      {renderField("c_email2", "c_email2")}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documentos */}
                <TabsContent value="documentos" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Documentos Cargados</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      {renderDocumentLink("Cédula de Identidad", selectedPoliza.cedula_identidad_url)}
                      {renderDocumentLink("Licencia de Conducir", selectedPoliza.licencia_conducir_url)}
                      {renderDocumentLink("Certificado Médico", selectedPoliza.certificado_medico_url)}
                      {renderDocumentLink("Certificado Origen Vehículo", selectedPoliza.certificado_origen_vehiculo_url)}
                      {renderDocumentLink("Factura Compra Vehículo", selectedPoliza.factura_compra_vehiculo_url)}
                      {renderDocumentLink("RIF", selectedPoliza.rif_url)}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Documentos de Póliza</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      {renderDocumentLink("URL Póliza", selectedPoliza.url_poliza_monday)}
                      {renderDocumentLink("URL Carnet", selectedPoliza.url_carnet_monday)}
                    </CardContent>
                  </Card>

                  {isEditing && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Editar URLs de Documentos</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4">
                        {renderField("URL Cédula Identidad", "cedula_identidad_url")}
                        {renderField("URL Licencia Conducir", "licencia_conducir_url")}
                        {renderField("URL Certificado Médico", "certificado_medico_url")}
                        {renderField("URL Cert. Origen Vehículo", "certificado_origen_vehiculo_url")}
                        {renderField("URL Factura Compra", "factura_compra_vehiculo_url")}
                        {renderField("URL RIF", "rif_url")}
                        {renderField("URL Póliza", "url_poliza_monday")}
                        {renderField("URL Carnet", "url_carnet_monday")}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Datos Técnicos */}
                <TabsContent value="tecnico" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Información de Póliza</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("Número de Póliza", "numero_poliza_monday")}
                      {renderField("Póliza Monday", "poliza_monday")}
                      {renderField("Fecha Inicio", "f_fchdesde", "date")}
                      {renderField("Fecha Vencimiento", "fecha_de_vencimiento_monday", "date")}
                      {renderField("Recordatorio Vencimiento", "recordatorio_de_vencimiento_monday")}
                      {renderField("Estado Principal", "estado_principal_monday")}
                      {renderField("Formulario", "formulario")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Configuración API</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      {renderField("API Monday", "api_monday")}
                      {renderField("Version API Monday", "version_api_monday")}
                      {renderField("Monday ID", "mondayid")}
                      {renderField("c_cd_versionseguro", "c_cd_versionseguro")}
                      {renderField("c_cd_subversionseguro", "c_cd_subversionseguro")}
                      {renderField("c_cd_actividad", "c_cd_actividad")}
                      {renderField("c_cd_ocupacion", "c_cd_ocupacion")}
                      {renderField("cd_moneda", "cd_moneda")}
                      {renderField("s_moneda", "s_moneda")}
                      {renderField("desde", "desde")}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Metadatos</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">ID</p>
                        <p className="text-sm font-mono">{selectedPoliza.id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Creado</p>
                        <p className="text-sm">{new Date(selectedPoliza.created_at).toLocaleString("es-VE")}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Actualizado</p>
                        <p className="text-sm">{new Date(selectedPoliza.updated_at).toLocaleString("es-VE")}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">User ID</p>
                        <p className="text-sm font-mono">{selectedPoliza.user_id || "-"}</p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <p className="text-xs text-muted-foreground">Lista Columnas</p>
                        <p className="text-sm font-mono text-xs break-all">
                          {selectedPoliza.listacolumnas ? selectedPoliza.listacolumnas.substring(0, 200) + "..." : "-"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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
