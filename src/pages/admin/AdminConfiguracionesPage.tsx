import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Search, Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";

// Table configurations
const tableConfigs: Record<string, { 
  tableName: string; 
  displayName: string;
  columns: { key: string; label: string; editable?: boolean }[];
}> = {
  paises: {
    tableName: "board_cod_pais",
    displayName: "Países",
    columns: [
      { key: "cd_pais", label: "Código", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  estados: {
    tableName: "board_cod_estado",
    displayName: "Estados",
    columns: [
      { key: "cd_estado", label: "Código Estado", editable: true },
      { key: "cd_pais", label: "Código País", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  ciudades: {
    tableName: "board_cod_ciudad",
    displayName: "Ciudades",
    columns: [
      { key: "cd_ciudad", label: "Código Ciudad", editable: true },
      { key: "cd_estado", label: "Código Estado", editable: true },
      { key: "cd_pais", label: "Código País", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  municipios: {
    tableName: "board_cod_municipio",
    displayName: "Municipios",
    columns: [
      { key: "cd_municipio", label: "Código Municipio", editable: true },
      { key: "cd_ciudad", label: "Código Ciudad", editable: true },
      { key: "cd_estado", label: "Código Estado", editable: true },
      { key: "cd_pais", label: "Código País", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  marcas: {
    tableName: "board_cod_marca",
    displayName: "Marcas",
    columns: [
      { key: "cd_marca", label: "Código", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  modelos: {
    tableName: "board_cod_modelo",
    displayName: "Modelos",
    columns: [
      { key: "cd_modelo", label: "Código Modelo", editable: true },
      { key: "cd_marca", label: "Código Marca", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  colores: {
    tableName: "board_cod_color",
    displayName: "Colores",
    columns: [
      { key: "cd_valdet", label: "Código", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  "tipos-vehiculo": {
    tableName: "board_cod_tipo_veh",
    displayName: "Tipos de Vehículo",
    columns: [
      { key: "cd_valdet", label: "Código", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  "versiones-moto": {
    tableName: "board_cod_version_moto",
    displayName: "Versiones de Moto",
    columns: [
      { key: "cd_version", label: "Código Versión", editable: true },
      { key: "cd_modelo", label: "Código Modelo", editable: true },
      { key: "cd_marca", label: "Código Marca", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  "precios-empire": {
    tableName: "precios_empire",
    displayName: "Precios EMPIRE",
    columns: [
      { key: "marca", label: "Marca", editable: true },
      { key: "modelo", label: "Modelo", editable: true },
      { key: "precio_venta", label: "Precio Venta", editable: true },
      { key: "estado", label: "Estado", editable: true },
    ],
  },
  sexos: {
    tableName: "board_cod_sexo",
    displayName: "Sexos",
    columns: [
      { key: "cd_valdet", label: "Código", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  "estados-civiles": {
    tableName: "board_cod_edo_civil",
    displayName: "Estados Civiles",
    columns: [
      { key: "cd_valdet", label: "Código", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  nacionalidades: {
    tableName: "codigo_nacionalidad",
    displayName: "Nacionalidades",
    columns: [
      { key: "cd_valdet", label: "Código", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  "actividades-economicas": {
    tableName: "cod_act_economica",
    displayName: "Actividades Económicas",
    columns: [
      { key: "cd_actividad", label: "Código", editable: true },
      { key: "descripcion", label: "Descripción", editable: true },
    ],
  },
  "codigos-telefonicos": {
    tableName: "board_cod_tlf",
    displayName: "Códigos Telefónicos",
    columns: [
      { key: "cd_valdet", label: "Código", editable: true },
      { key: "s_descripcion", label: "Descripción", editable: true },
    ],
  },
  "versiones-api": {
    tableName: "board_cod_version_api",
    displayName: "Versiones API",
    columns: [
      { key: "cd_version_seguro", label: "Versión Seguro", editable: true },
      { key: "cd_subversion_seguro", label: "Subversión", editable: true },
      { key: "n_centuria", label: "Centuria", editable: true },
    ],
  },
};

export default function AdminConfiguracionesPage() {
  const { tabla } = useParams<{ tabla: string }>();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const pageSize = 10;

  const config = tabla ? tableConfigs[tabla] : null;

  useEffect(() => {
    if (config) {
      fetchData();
    }
  }, [tabla, currentPage, searchTerm]);

  const fetchData = async () => {
    if (!config) return;
    
    setLoading(true);
    try {
      const selectColumns = config.columns.map(c => c.key).join(", ");
      let query = supabase
        .from(config.tableName as any)
        .select(`id, ${selectColumns}, created_at`, { count: "exact" });

      // Apply search filter on descripcion or s_descripcion
      if (searchTerm) {
        const descColumn = config.columns.find(c => c.key === "descripcion" || c.key === "s_descripcion");
        if (descColumn) {
          query = query.ilike(descColumn.key, `%${searchTerm}%`);
        }
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: result, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setData(result || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    const initialData: Record<string, string> = {};
    config?.columns.forEach(col => {
      initialData[col.key] = "";
    });
    setFormData(initialData);
    setShowEditDialog(true);
  };

  const handleEdit = (item: any) => {
    setIsCreating(false);
    setEditingItem(item);
    const itemData: Record<string, string> = {};
    config?.columns.forEach(col => {
      itemData[col.key] = item[col.key] || "";
    });
    setFormData(itemData);
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      if (isCreating) {
        const { error } = await supabase
          .from(config.tableName as any)
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Registro creado correctamente",
        });
      } else {
        const { error } = await supabase
          .from(config.tableName as any)
          .update(formData)
          .eq("id", editingItem.id);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Registro actualizado correctamente",
        });
      }

      setShowEditDialog(false);
      fetchData();
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el registro",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!config || !editingItem) return;

    try {
      const { error } = await supabase
        .from(config.tableName as any)
        .delete()
        .eq("id", editingItem.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Registro eliminado correctamente",
      });
      setShowDeleteDialog(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (!tabla) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Configuraciones
          </h2>
          <p className="text-muted-foreground">
            Selecciona una tabla del menú lateral para administrar
          </p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Tabla no encontrada
          </h2>
          <p className="text-muted-foreground">
            La tabla "{tabla}" no existe en la configuración
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{config.displayName}</h2>
          <p className="text-sm text-muted-foreground">Tabla: {config.tableName}</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Registro
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10"
        />
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
                {config.columns.map((col) => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={config.columns.length + 1}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No se encontraron registros
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    {config.columns.map((col) => (
                      <TableCell key={col.key}>{item[col.key]}</TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingItem(item);
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
      {totalPages > 1 && (
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
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Crear Registro" : "Editar Registro"}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? "Complete los campos para crear un nuevo registro"
                : "Modifique los campos que desee actualizar"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {config.columns
              .filter((col) => col.editable !== false)
              .map((col) => (
                <div key={col.key} className="space-y-2">
                  <Label htmlFor={col.key}>{col.label}</Label>
                  <Input
                    id={col.key}
                    value={formData[col.key] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [col.key]: e.target.value })
                    }
                  />
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {isCreating ? "Crear" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro será eliminado
              permanentemente.
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
