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

interface MotoEmpire {
  id: string;
  fecha: string | null;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  transmision: string | null;
  placa: string | null;
  serial_motor: string | null;
  serial_carroceria: string | null;
  color: string | null;
  es_duplicado: boolean | null;
  created_at: string;
}

const initialFormData = {
  fecha: "",
  marca: "EMPIRE",
  modelo: "",
  version: "",
  anio: new Date().getFullYear(),
  transmision: "",
  placa: "",
  serial_motor: "",
  serial_carroceria: "",
  color: "",
};

export default function AdminInventarioEmpirePage() {
  const [data, setData] = useState<MotoEmpire[]>([]);
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
        .from("bd_empire")
        .select("*", { count: "exact" });

      if (search) {
        query = query.or(
          `placa.ilike.%${search}%,serial_carroceria.ilike.%${search}%,serial_motor.ilike.%${search}%,modelo.ilike.%${search}%,marca.ilike.%${search}%,version.ilike.%${search}%`
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
      const { error } = await supabase.from("bd_empire").insert({
        fecha: formData.fecha || null,
        marca: formData.marca,
        modelo: formData.modelo || null,
        version: formData.version || null,
        anio: formData.anio || null,
        transmision: formData.transmision || null,
        placa: formData.placa || null,
        serial_motor: formData.serial_motor || null,
        serial_carroceria: formData.serial_carroceria || null,
        color: formData.color || null,
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
        .from("bd_empire")
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Inventario EMPIRE</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona el inventario de motos EMPIRE
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4" />
                Agregar Moto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Agregar Moto EMPIRE</DialogTitle>
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
                  <Label>Modelo</Label>
                  <Input
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Versión</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Año</Label>
                  <Input
                    type="number"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) || 0 })}
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
                  <Label>Placa</Label>
                  <Input
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
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
                  <Label>Serial Carrocería</Label>
                  <Input
                    value={formData.serial_carroceria}
                    onChange={(e) => setFormData({ ...formData, serial_carroceria: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAdd} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
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
              placeholder="Buscar por placa, serial, modelo, versión o marca..."
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
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">
              {totalCount} motos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Versión</TableHead>
                      <TableHead>Año</TableHead>
                      <TableHead>Transmisión</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>Serial Motor</TableHead>
                      <TableHead>Serial Carrocería</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                          No se encontraron registros
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.map((item) => (
                        <TableRow key={item.id} className={item.es_duplicado ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}>
                          <TableCell>
                            {item.es_duplicado ? (
                              <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-600">
                                Duplicado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Único
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{item.fecha || "-"}</TableCell>
                          <TableCell>{item.marca || "-"}</TableCell>
                          <TableCell>{item.modelo || "-"}</TableCell>
                          <TableCell>{item.version || "-"}</TableCell>
                          <TableCell>{item.anio || "-"}</TableCell>
                          <TableCell>{item.transmision || "-"}</TableCell>
                          <TableCell className="font-mono">{item.placa || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">{item.serial_motor || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">{item.serial_carroceria || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.color || "-"}</Badge>
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
