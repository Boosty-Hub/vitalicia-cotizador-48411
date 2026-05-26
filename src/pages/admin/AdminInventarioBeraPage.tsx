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
  RefreshCw,
  Download,
  Eye,
  Pencil
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InventoryPolicyBadge as PolicyStatusBadge } from "@/components/admin/InventoryPolicyBadge";
import { PolicyDetailsDialog } from "@/components/admin/PolicyDetailsDialog";

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
  es_duplicado: boolean | null;
  created_at: string;
}

interface PolicyInfo {
  hasPolicy: boolean;
  isActive: boolean;
  policyData: any | null;
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
  const [filterDuplicados, setFilterDuplicados] = useState<"todos" | "duplicados" | "unicos">("todos");
  const [filterPoliza, setFilterPoliza] = useState<"todos" | "con_poliza" | "sin_poliza">("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [policyMap, setPolicyMap] = useState<Record<string, PolicyInfo>>({});
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const pageSize = 20;

  const fetchPoliciesForPlates = async (plates: string[]) => {
    const validPlates = plates.filter(p => p);
    if (validPlates.length === 0) return {};

    const { data: policies, error } = await supabase
      .from("polizas_activas")
      .select("*")
      .in("placa_monday", validPlates.map(p => p.toUpperCase()));

    if (error) {
      console.error("Error fetching policies:", error);
      return {};
    }

    const map: Record<string, PolicyInfo> = {};
    for (const plate of validPlates) {
      const policy = policies?.find(p => 
        p.placa_monday?.toUpperCase() === plate.toUpperCase()
      );
      
      if (policy) {
        const isActive = policy.estado_principal_monday !== "Vencida" && 
                        policy.estado_principal_monday !== "Cancelada";
        map[plate.toUpperCase()] = {
          hasPolicy: true,
          isActive,
          policyData: policy
        };
      } else {
        map[plate.toUpperCase()] = {
          hasPolicy: false,
          isActive: false,
          policyData: null
        };
      }
    }
    return map;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // If filtering by policy status, we need to get all plates with policies first
      let platesWithPolicy: string[] = [];
      if (filterPoliza !== "todos") {
        const { data: policies } = await supabase
          .from("polizas_activas")
          .select("placa_monday")
          .not("placa_monday", "is", null);
        
        platesWithPolicy = (policies || [])
          .map(p => p.placa_monday?.toUpperCase())
          .filter(Boolean) as string[];
      }

      let query = supabase
        .from("bd_bera")
        .select("*", { count: "exact" });

      if (search) {
        query = query.or(
          `placa.ilike.%${search}%,serial_chasis.ilike.%${search}%,serial_motor.ilike.%${search}%,modelo.ilike.%${search}%,marca.ilike.%${search}%`
        );
      }

      if (filterDuplicados === "duplicados") {
        query = query.eq("es_duplicado", true);
      } else if (filterDuplicados === "unicos") {
        query = query.or("es_duplicado.eq.false,es_duplicado.is.null");
      }

      // Apply policy filter at database level
      if (filterPoliza === "con_poliza" && platesWithPolicy.length > 0) {
        query = query.in("placa", platesWithPolicy);
      } else if (filterPoliza === "sin_poliza") {
        if (platesWithPolicy.length > 0) {
          // Get plates NOT in the policy list
          query = query.or(`placa.is.null,placa.not.in.(${platesWithPolicy.join(",")})`);
        }
      }

      const { data: result, error, count } = await query
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) throw error;

      // Fetch policy status for displayed plates
      const plates = (result || []).map(item => item.placa).filter(Boolean) as string[];
      const policies = await fetchPoliciesForPlates(plates);
      setPolicyMap(policies);

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
  }, [currentPage, search, filterDuplicados, filterPoliza]);

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

  const openEditDialog = (item: MotoBera) => {
    setEditingId(item.id);
    setFormData({
      fecha: item.fecha || "",
      marca: item.marca || "BERA",
      cod_modelo: item.cod_modelo || "",
      modelo: item.modelo || "",
      anio_modelo: item.anio_modelo || new Date().getFullYear(),
      placa: item.placa || "",
      transmision: item.transmision || "",
      serial_chasis: item.serial_chasis || "",
      serial_motor: item.serial_motor || "",
      cod_color: item.cod_color || "",
      color: item.color || "",
      precio_venta_tienda: item.precio_venta_tienda || 0,
      precio_base_venta_tienda: item.precio_base_venta_tienda || 0,
      precio_venta_sugerido: item.precio_venta_sugerido || 0,
      precio_base_venta_sugerido: item.precio_base_venta_sugerido || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("bd_bera")
        .update({
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
        })
        .eq("id", editingId);

      if (error) throw error;

      toast({ title: "Registro actualizado", description: "Los cambios se guardaron correctamente" });
      setIsEditDialogOpen(false);
      setEditingId(null);
      setFormData(initialFormData);
      fetchData();
    } catch (error) {
      console.error("Error updating record:", error);
      toast({ title: "Error", description: "No se pudo actualizar el registro", variant: "destructive" });
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

  const getPolicyInfo = (placa: string | null): PolicyInfo => {
    if (!placa) return { hasPolicy: false, isActive: false, policyData: null };
    return policyMap[placa.toUpperCase()] || { hasPolicy: false, isActive: false, policyData: null };
  };

  const handleViewPolicy = (placa: string | null) => {
    if (!placa) return;
    const policyInfo = getPolicyInfo(placa);
    if (policyInfo.policyData) {
      setSelectedPolicy(policyInfo.policyData);
      setIsPolicyDialogOpen(true);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      toast({ title: "Descargando...", description: "Preparando archivo CSV" });
      
      const { data: allData, error } = await supabase
        .from("bd_bera")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!allData || allData.length === 0) {
        toast({ title: "Sin datos", description: "No hay registros para exportar", variant: "destructive" });
        return;
      }

      const headers = ["Fecha", "Marca", "Cod Modelo", "Modelo", "Año", "Placa", "Transmisión", "Serial Chasis", "Serial Motor", "Cod Color", "Color", "Precio Venta Tienda", "Precio Base Venta Tienda", "Precio Venta Sugerido", "Precio Base Venta Sugerido", "Duplicado"];
      const rows = allData.map(item => [
        item.fecha || "",
        item.marca || "",
        item.cod_modelo || "",
        item.modelo || "",
        item.anio_modelo || "",
        item.placa || "",
        item.transmision || "",
        item.serial_chasis || "",
        item.serial_motor || "",
        item.cod_color || "",
        item.color || "",
        item.precio_venta_tienda || "",
        item.precio_base_venta_tienda || "",
        item.precio_venta_sugerido || "",
        item.precio_base_venta_sugerido || "",
        item.es_duplicado ? "Sí" : "No"
      ]);

      const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventario_bera_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({ title: "Descarga completada", description: `${allData.length} registros exportados` });
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast({ title: "Error", description: "No se pudo descargar el archivo", variant: "destructive" });
    }
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
          <Button variant="outline" size="icon" onClick={handleDownloadCSV} title="Descargar CSV">
            <Download className="h-4 w-4" />
          </Button>
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

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
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
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Duplicados:</span>
              <Button
                variant={filterDuplicados === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterDuplicados("todos");
                  setCurrentPage(1);
                }}
              >
                Todos
              </Button>
              <Button
                variant={filterDuplicados === "duplicados" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterDuplicados("duplicados");
                  setCurrentPage(1);
                }}
                className={filterDuplicados === "duplicados" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                Duplicados
              </Button>
              <Button
                variant={filterDuplicados === "unicos" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterDuplicados("unicos");
                  setCurrentPage(1);
                }}
                className={filterDuplicados === "unicos" ? "bg-green-500 hover:bg-green-600" : ""}
              >
                Únicos
              </Button>
            </div>
            <div className="w-px bg-border h-8 mx-2" />
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Póliza:</span>
              <Button
                variant={filterPoliza === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterPoliza("todos");
                  setCurrentPage(1);
                }}
              >
                Todos
              </Button>
              <Button
                variant={filterPoliza === "con_poliza" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterPoliza("con_poliza");
                  setCurrentPage(1);
                }}
                className={filterPoliza === "con_poliza" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
              >
                Con póliza
              </Button>
              <Button
                variant={filterPoliza === "sin_poliza" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterPoliza("sin_poliza");
                  setCurrentPage(1);
                }}
                className={filterPoliza === "sin_poliza" ? "bg-slate-500 hover:bg-slate-600" : ""}
              >
                Sin póliza
              </Button>
            </div>
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
                      <TableHead>Estado</TableHead>
                      <TableHead>Póliza</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Año</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>Serial Motor</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Precio Venta</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                          No se encontraron registros
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.map((item) => {
                        const policyInfo = getPolicyInfo(item.placa);
                        return (
                          <TableRow 
                            key={item.id} 
                            className={
                              item.es_duplicado 
                                ? "bg-yellow-50 dark:bg-yellow-950/20" 
                                : policyInfo.hasPolicy 
                                  ? "bg-emerald-50/50 dark:bg-emerald-950/20" 
                                  : ""
                            }
                          >
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
                            <TableCell>
                              <PolicyStatusBadge
                                hasPolicy={policyInfo.hasPolicy}
                                isActive={policyInfo.isActive}
                                onClick={() => handleViewPolicy(item.placa)}
                              />
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{item.fecha || "-"}</TableCell>
                            <TableCell>{item.marca || "-"}</TableCell>
                            <TableCell>{item.modelo || "-"}</TableCell>
                            <TableCell>{item.anio_modelo || "-"}</TableCell>
                            <TableCell className="font-mono">{item.placa || "-"}</TableCell>
                            <TableCell className="font-mono text-xs">{item.serial_motor || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.color || "-"}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{formatPrice(item.precio_venta_tienda)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {policyInfo.hasPolicy && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                                    onClick={() => handleViewPolicy(item.placa)}
                                    title="Ver póliza"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                {!policyInfo.hasPolicy && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-primary hover:text-primary"
                                      onClick={() => openEditDialog(item)}
                                      title="Editar registro"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => {
                                        setSelectedId(item.id);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                      title="Eliminar registro"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { setEditingId(null); setFormData(initialFormData); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Moto BERA</DialogTitle>
            <DialogDescription>Modifica los datos del registro</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2"><Label>Fecha</Label><Input type="date" value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} /></div>
            <div className="space-y-2"><Label>Marca</Label><Input value={formData.marca} onChange={(e) => setFormData({ ...formData, marca: e.target.value })} /></div>
            <div className="space-y-2"><Label>Código Modelo</Label><Input value={formData.cod_modelo} onChange={(e) => setFormData({ ...formData, cod_modelo: e.target.value })} /></div>
            <div className="space-y-2"><Label>Modelo</Label><Input value={formData.modelo} onChange={(e) => setFormData({ ...formData, modelo: e.target.value })} /></div>
            <div className="space-y-2"><Label>Año del Modelo</Label><Input type="number" value={formData.anio_modelo} onChange={(e) => setFormData({ ...formData, anio_modelo: parseInt(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Placa</Label><Input value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value })} /></div>
            <div className="space-y-2"><Label>Transmisión</Label><Input value={formData.transmision} onChange={(e) => setFormData({ ...formData, transmision: e.target.value })} /></div>
            <div className="space-y-2"><Label>Serial Chasis</Label><Input value={formData.serial_chasis} onChange={(e) => setFormData({ ...formData, serial_chasis: e.target.value })} /></div>
            <div className="space-y-2"><Label>Serial Motor</Label><Input value={formData.serial_motor} onChange={(e) => setFormData({ ...formData, serial_motor: e.target.value })} /></div>
            <div className="space-y-2"><Label>Código Color</Label><Input value={formData.cod_color} onChange={(e) => setFormData({ ...formData, cod_color: e.target.value })} /></div>
            <div className="space-y-2"><Label>Color</Label><Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} /></div>
            <div className="space-y-2"><Label>Precio Venta Tienda</Label><Input type="number" value={formData.precio_venta_tienda} onChange={(e) => setFormData({ ...formData, precio_venta_tienda: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Precio Base Venta Tienda</Label><Input type="number" value={formData.precio_base_venta_tienda} onChange={(e) => setFormData({ ...formData, precio_base_venta_tienda: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Precio Venta Sugerido</Label><Input type="number" value={formData.precio_venta_sugerido} onChange={(e) => setFormData({ ...formData, precio_venta_sugerido: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Precio Base Venta Sugerido</Label><Input type="number" value={formData.precio_base_venta_sugerido} onChange={(e) => setFormData({ ...formData, precio_base_venta_sugerido: parseFloat(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Policy Details Dialog */}
      <PolicyDetailsDialog
        open={isPolicyDialogOpen}
        onOpenChange={setIsPolicyDialogOpen}
        policy={selectedPolicy}
      />
    </div>
  );
}
