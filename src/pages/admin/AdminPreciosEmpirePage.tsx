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
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { Search, Plus, Loader2, ChevronLeft, ChevronRight, History, DollarSign, CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PrecioEmpire {
  id: string;
  marca: string | null;
  modelo: string | null;
  name: string | null;
  precio_venta: string | null;
  estado: string | null;
  created_at: string;
}

interface ModeloAgrupado {
  modelo: string;
  marca: string;
  precioActual: string;
  fechaUltimoPrecio: string;
  historial: PrecioEmpire[];
}

export default function AdminPreciosEmpirePage() {
  const [data, setData] = useState<PrecioEmpire[]>([]);
  const [modelosAgrupados, setModelosAgrupados] = useState<ModeloAgrupado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewPriceDialog, setShowNewPriceDialog] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState<ModeloAgrupado | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [newPriceDate, setNewPriceDate] = useState<Date>(new Date());
  const [showNewModelDialog, setShowNewModelDialog] = useState(false);
  const [newModelData, setNewModelData] = useState({
    marca: "EMPIRE",
    modelo: "",
    precio_venta: "",
    estado: "Activo",
  });
  const [newModelDate, setNewModelDate] = useState<Date>(new Date());
  const pageSize = 10;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Agrupar datos por modelo
    const grouped = data.reduce((acc: Record<string, PrecioEmpire[]>, item) => {
      const key = item.modelo || item.name || "Sin modelo";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    // Convertir a array y ordenar por fecha
    const modelosArray: ModeloAgrupado[] = Object.entries(grouped).map(([modelo, precios]) => {
      // Ordenar precios por fecha descendente
      const preciosOrdenados = precios.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const ultimo = preciosOrdenados[0];
      
      return {
        modelo,
        marca: ultimo.marca || "EMPIRE",
        precioActual: ultimo.precio_venta || "0",
        fechaUltimoPrecio: ultimo.created_at,
        historial: preciosOrdenados,
      };
    });

    // Ordenar modelos alfabéticamente
    modelosArray.sort((a, b) => a.modelo.localeCompare(b.modelo));
    setModelosAgrupados(modelosArray);
  }, [data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from("precios_empire")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setData(result || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los precios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewPrice = (modelo: ModeloAgrupado) => {
    setSelectedModelo(modelo);
    setNewPrice("");
    setNewPriceDate(new Date());
    setShowNewPriceDialog(true);
  };

  const handleSaveNewPrice = async () => {
    if (!selectedModelo || !newPrice) return;

    try {
      const { error } = await supabase.from("precios_empire").insert([
        {
          marca: selectedModelo.marca,
          modelo: selectedModelo.modelo,
          name: selectedModelo.modelo,
          precio_venta: newPrice,
          estado: "Activo",
          created_at: newPriceDate.toISOString(),
        },
      ]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Nuevo precio registrado para ${selectedModelo.modelo}`,
      });
      setShowNewPriceDialog(false);
      fetchData();
    } catch (error) {
      console.error("Error saving price:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el nuevo precio",
        variant: "destructive",
      });
    }
  };

  const handleSaveNewModel = async () => {
    if (!newModelData.modelo || !newModelData.precio_venta) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("precios_empire").insert([
        {
          marca: newModelData.marca,
          modelo: newModelData.modelo,
          name: newModelData.modelo,
          precio_venta: newModelData.precio_venta,
          estado: newModelData.estado,
          created_at: newModelDate.toISOString(),
        },
      ]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Modelo ${newModelData.modelo} creado con precio inicial`,
      });
      setShowNewModelDialog(false);
      setNewModelData({ marca: "EMPIRE", modelo: "", precio_venta: "", estado: "Activo" });
      setNewModelDate(new Date());
      fetchData();
    } catch (error) {
      console.error("Error saving model:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el modelo",
        variant: "destructive",
      });
    }
  };

  // Filtrar modelos por búsqueda
  const modelosFiltrados = modelosAgrupados.filter(
    (m) =>
      m.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(modelosFiltrados.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedModelos = modelosFiltrados.slice(startIndex, startIndex + pageSize);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price: string | null) => {
    if (!price) return "$0";
    const num = parseFloat(price);
    return isNaN(num) ? price : `$${num.toLocaleString("es-VE")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Precios EMPIRE</h2>
          <p className="text-sm text-muted-foreground">
            Gestión de precios históricos por modelo de moto
          </p>
        </div>
        <Button onClick={() => setShowNewModelDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Modelo
        </Button>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> Los precios son históricos y no se pueden editar ni eliminar. 
            Para cambiar el precio de un modelo, agregue un nuevo registro de precio. 
            El sistema utilizará automáticamente el precio vigente según la fecha de compra de la póliza.
          </p>
        </CardContent>
      </Card>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por modelo o marca..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedModelos.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No se encontraron modelos
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {paginatedModelos.map((modelo) => (
                <AccordionItem
                  key={modelo.modelo}
                  value={modelo.modelo}
                  className="border rounded-lg bg-card px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <p className="font-medium text-foreground">{modelo.modelo}</p>
                          <p className="text-sm text-muted-foreground">{modelo.marca}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-primary text-lg">
                            {formatPrice(modelo.precioActual)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Desde: {formatDate(modelo.fechaUltimoPrecio)}
                          </p>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <History className="h-3 w-3" />
                          {modelo.historial.length}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm text-muted-foreground">
                          Historial de Precios
                        </h4>
                        <Button
                          size="sm"
                          onClick={() => handleAddNewPrice(modelo)}
                          className="gap-1"
                        >
                          <DollarSign className="h-4 w-4" />
                          Agregar Nuevo Precio
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Precio</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha de Registro</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {modelo.historial.map((precio, index) => (
                            <TableRow key={precio.id}>
                              <TableCell className="font-medium">
                                {formatPrice(precio.precio_venta)}
                                {index === 0 && (
                                  <Badge variant="default" className="ml-2">
                                    Actual
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{precio.estado || "-"}</TableCell>
                              <TableCell>{formatDate(precio.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(startIndex + pageSize, modelosFiltrados.length)} de{" "}
            {modelosFiltrados.length} modelos
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

      {/* Dialog para nuevo precio */}
      <Dialog open={showNewPriceDialog} onOpenChange={setShowNewPriceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Precio para {selectedModelo?.modelo}</DialogTitle>
            <DialogDescription>
              Ingrese el nuevo precio de venta y la fecha de vigencia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Precio Actual</Label>
              <p className="text-lg font-semibold text-muted-foreground">
                {formatPrice(selectedModelo?.precioActual || "0")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPrice">Nuevo Precio</Label>
              <Input
                id="newPrice"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Ingrese el nuevo precio"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Vigencia</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newPriceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newPriceDate ? format(newPriceDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newPriceDate}
                    onSelect={(date) => date && setNewPriceDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Seleccione la fecha desde la cual este precio entró en vigencia
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPriceDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNewPrice} disabled={!newPrice}>
              Guardar Precio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para nuevo modelo */}
      <Dialog open={showNewModelDialog} onOpenChange={setShowNewModelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Modelo</DialogTitle>
            <DialogDescription>
              Ingrese los datos del nuevo modelo de moto con su precio inicial.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={newModelData.marca}
                onChange={(e) => setNewModelData({ ...newModelData, marca: e.target.value })}
                placeholder="EMPIRE"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={newModelData.modelo}
                onChange={(e) => setNewModelData({ ...newModelData, modelo: e.target.value })}
                placeholder="Ej: NEW OWEN II 150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio">Precio de Venta *</Label>
              <Input
                id="precio"
                type="number"
                value={newModelData.precio_venta}
                onChange={(e) => setNewModelData({ ...newModelData, precio_venta: e.target.value })}
                placeholder="Ingrese el precio"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Vigencia</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newModelDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newModelDate ? format(newModelDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newModelDate}
                    onSelect={(date) => date && setNewModelDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Seleccione la fecha desde la cual este precio entró en vigencia
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={newModelData.estado}
                onChange={(e) => setNewModelData({ ...newModelData, estado: e.target.value })}
                placeholder="Activo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewModelDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveNewModel}
              disabled={!newModelData.modelo || !newModelData.precio_venta}
            >
              Crear Modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
