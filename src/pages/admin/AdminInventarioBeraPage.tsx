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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MotoBera {
  id: string;
  numero_fila: number | null;
  fecha: string | null;
  marca: string | null;
  cod_modelo: string | null;
  modelo: string | null;
  anio_modelo: number | null;
  placa: string | null;
  transmision: string | null;
  serial_chasis: string | null;
  serial_motor: string | null;
  cod_color: string | null;
  color: string | null;
  precio_venta_tienda: number | null;
  precio_base_venta_tienda: number | null;
  precio_venta_sugerido: number | null;
  precio_base_venta_sugerido: number | null;
  created_at: string;
}

const initialFormData = {
  fecha: "",
  marca: "BERA",
  cod_modelo: "",
  modelo: "",
  anio_modelo: new Date().getFullYear(),
  placa: "",
  transmision: "",
  serial_chasis: "",
  serial_motor: "",
  cod_color: "",
  color: "",
  precio_venta_tienda: 0,
  precio_base_venta_tienda: 0,
  precio_venta_sugerido: 0,
  precio_base_venta_sugerido: 0,
};

export default function AdminInventarioBeraPage() {
  const [data, setData] = useState<MotoBera[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const pageSize = 20;

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("bd_bera")
        .select("*", { count: "exact" });

      if (search) {
        query = query.or(
          `placa.ilike.%${search}%,serial_chasis.ilike.%${search}%,serial_motor.ilike.%${search}%,modelo.ilike.%${search}%,marca.ilike.%${search}%`
        );
      }

      const { data: result, error, count } = await query
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

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

  useEffect(() => {
    fetchData();
  }, [currentPage, search]);

  const handleAdd = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("bd_bera").insert({
        fecha: formData.fecha || null,
        marca: formData.marca,
        cod_modelo: formData.cod_modelo || null,
        modelo: formData.modelo || null,
        anio_modelo: formData.anio_modelo || null,
        placa: formData.placa || null,
        transmision: formData.transmision || null,
        serial_chasis: formData.serial_chasis || null,
        serial_motor: formData.serial_motor || null,
        cod_color: formData.cod_color || null,
        color: formData.color || null,
        precio_venta_tienda: formData.precio_venta_tienda || null,
        precio_base_venta_tienda: formData.precio_base_venta_tienda || null,
        precio_venta_sugerido: formData.precio_venta_sugerido || null,
        precio_base_venta_sugerido: formData.precio_base_venta_sugerido || null,
      });

      if (error) throw error;

      toast({
        title: "Registro agregado",
        description: "La moto se agregó correctamente",
      });

      setIsAddDialogOpen(false);
      setFormData(initialFormData);
      fetchData();
    } catch (error) {
      console.error("Error adding record:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el registro",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      const { error } = await supabase
        .from("bd_bera")
        .delete()
        .eq("id", selectedId);

      if (error) throw error;

      toast({
        title: "Registro eliminado",
        description: "La moto se eliminó correctamente",
      });

      setIsDeleteDialogOpen(false);
      setSelectedId(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatPrice = (price: number | null) => {
    if (!price) return "-";
    return `$${price.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Inventario BERA</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona el inventario de motos BERA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar Moto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Moto BERA</DialogTitle>
                <DialogDescription>
                  Ingresa los datos de la moto manualmente
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código Modelo</Label>
                  <Input
                    value={formData.cod_modelo}
                    onChange={(e) => setFormData({ ...formData, cod_modelo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Año del Modelo</Label>
                  <Input
                    type="number"
                    value={formData.anio_modelo}
                    onChange={(e) => setFormData({ ...formData, anio_modelo: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Placa</Label>
                  <Input
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transmisión</Label>
                  <Input
                    value={formData.transmision}
                    onChange={(e) => setFormData({ ...formData, transmision: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Serial Chasis</Label>
                  <Input
                    value={formData.serial_chasis}
                    onChange={(e) => setFormData({ ...formData, serial_chasis: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Serial Motor</Label>
                  <Input
                    value={formData.serial_motor}
                    onChange={(e) => setFormData({ ...formData, serial_motor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código Color</Label>
                  <Input
                    value={formData.cod_color}
                    onChange={(e) => setFormData({ ...formData, cod_color: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio Venta Tienda</Label>
                  <Input
                    type="number"
                    value={formData.precio_venta_tienda}
                    onChange={(e) => setFormData({ ...formData, precio_venta_tienda: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio Base Venta Tienda</Label>
                  <Input
                    type="number"
                    value={formData.precio_base_venta_tienda}
                    onChange={(e) => setFormData({ ...formData, precio_base_venta_tienda: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio Venta Sugerido</Label>
                  <Input
                    type="number"
                    value={formData.precio_venta_sugerido}
                    onChange={(e) => setFormData({ ...formData, precio_venta_sugerido: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio Base Venta Sugerido</Label>
                  <Input
                    type="number"
                    value={formData.precio_base_venta_sugerido}
                    onChange={(e) => setFormData({ ...formData, precio_base_venta_sugerido: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAdd} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, serial, modelo o marca..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Registros</CardTitle>
            <Badge variant="secondary">{totalCount} motos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Año</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>Serial Chasis</TableHead>
                      <TableHead>Serial Motor</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="text-right">Precio Venta</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No se encontraron registros
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="whitespace-nowrap">{item.fecha || "-"}</TableCell>
                          <TableCell>{item.marca || "-"}</TableCell>
                          <TableCell>{item.modelo || "-"}</TableCell>
                          <TableCell>{item.anio_modelo || "-"}</TableCell>
                          <TableCell className="font-mono">{item.placa || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">{item.serial_chasis || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">{item.serial_motor || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.color || "-"}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(item.precio_venta_tienda)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedId(item.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                    {Math.min(currentPage * pageSize, totalCount)} de {totalCount}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
