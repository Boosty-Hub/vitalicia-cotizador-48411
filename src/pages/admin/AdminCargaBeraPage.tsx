import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
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
import { 
  Upload, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

interface MotoBera {
  numero_fila: number;
  fecha: string;
  marca: string;
  cod_modelo: string;
  modelo: string;
  anio_modelo: number;
  placa: string;
  transmision: string;
  serial_chasis: string;
  serial_motor: string;
  cod_color: string;
  color: string;
  precio_venta_tienda: number;
  precio_base_venta_tienda: number;
  precio_venta_sugerido: number;
  precio_base_venta_sugerido: number;
}

// Columnas exactas requeridas en el orden de la plantilla
const REQUIRED_COLUMNS = [
  "#",
  "FECHA",
  "MARCA",
  "COD MODELO",
  "MODELO",
  "AÑO DEL MODELO",
  "PLACA",
  "TRANSMISION",
  "SERIAL CHASIS",
  "SERIAL MOTOR",
  "COD COLOR",
  "COLOR",
  "PRECIO VENTA TIENDA",
  "PRECIO BASE VENTA TIENDA",
  "PRECIO VENTA SUGERIDO",
  "PRECIO BASE VENTA SUGERIDO",
];

const COLUMN_MAPPING: Record<string, keyof MotoBera> = {
  "#": "numero_fila",
  "FECHA": "fecha",
  "MARCA": "marca",
  "COD MODELO": "cod_modelo",
  "MODELO": "modelo",
  "AÑO DEL MODELO": "anio_modelo",
  "PLACA": "placa",
  "TRANSMISION": "transmision",
  "SERIAL CHASIS": "serial_chasis",
  "SERIAL MOTOR": "serial_motor",
  "COD COLOR": "cod_color",
  "COLOR": "color",
  "PRECIO VENTA TIENDA": "precio_venta_tienda",
  "PRECIO BASE VENTA TIENDA": "precio_base_venta_tienda",
  "PRECIO VENTA SUGERIDO": "precio_venta_sugerido",
  "PRECIO BASE VENTA SUGERIDO": "precio_base_venta_sugerido",
};

export default function AdminCargaBeraPage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<MotoBera[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const pageSize = 20;

  const parseExcelDate = (value: any): string => {
    if (!value) return "";
    
    // If it's already a string in DD/MM/YYYY format
    if (typeof value === "string") {
      const parts = value.split("/");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
      return value;
    }
    
    // If it's an Excel serial date number
    if (typeof value === "number") {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
      }
    }
    
    return String(value);
  };

  const parsePrice = (value: any): number => {
    if (!value) return 0;
    
    let num: number;
    if (typeof value === "number") {
      num = value;
    } else {
      // Remove $ and commas, then parse
      const cleaned = String(value).replace(/[$,]/g, "").trim();
      num = parseFloat(cleaned);
    }
    
    if (isNaN(num)) return 0;
    
    // Round to 2 decimal places to prevent excessive decimals
    return Math.round(num * 100) / 100;
  };

  const processExcel = useCallback(async (selectedFile: File) => {
    setLoading(true);
    setFile(selectedFile);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length < 2) {
        toast({
          title: "Error",
          description: "El archivo no contiene datos",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // First row is headers
      const headers = (jsonData[0] as string[]).map(h => h?.trim());
      
      // Validar que las columnas sean exactamente las requeridas
      const normalizedHeaders = headers.filter(h => h); // Remove empty headers
      const missingColumns = REQUIRED_COLUMNS.filter(col => !normalizedHeaders.includes(col));
      const extraColumns = normalizedHeaders.filter(col => !REQUIRED_COLUMNS.includes(col));
      
      if (missingColumns.length > 0 || extraColumns.length > 0) {
        let errorMsg = "El archivo no tiene el formato correcto de la plantilla BERA.";
        if (missingColumns.length > 0) {
          errorMsg += ` Columnas faltantes: ${missingColumns.join(", ")}.`;
        }
        if (extraColumns.length > 0) {
          errorMsg += ` Columnas no reconocidas: ${extraColumns.join(", ")}.`;
        }
        toast({
          title: "Formato de plantilla incorrecto",
          description: errorMsg,
          variant: "destructive",
        });
        setFile(null);
        setLoading(false);
        return;
      }
      
      const rows = jsonData.slice(1);
      
      const allProcessedData: MotoBera[] = rows
        .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ""))
        .map((row) => {
          const item: Partial<MotoBera> = {};
          
          headers.forEach((header, index) => {
            const mappedKey = COLUMN_MAPPING[header?.trim()];
            if (mappedKey && row[index] !== undefined && row[index] !== null) {
              const value = row[index];
              
              if (mappedKey === "fecha") {
                (item as any)[mappedKey] = parseExcelDate(value);
              } else if (mappedKey === "anio_modelo" || mappedKey === "numero_fila") {
                (item as any)[mappedKey] = parseInt(String(value)) || 0;
              } else if (
                mappedKey === "precio_venta_tienda" ||
                mappedKey === "precio_base_venta_tienda" ||
                mappedKey === "precio_venta_sugerido" ||
                mappedKey === "precio_base_venta_sugerido"
              ) {
                (item as any)[mappedKey] = parsePrice(value);
              } else {
                (item as any)[mappedKey] = String(value).trim();
              }
            }
          });
          
          return item as MotoBera;
        })
        .filter(item => item.placa || item.serial_chasis);

      // Separar registros válidos de los que no tienen modelo
      const validData = allProcessedData.filter(item => item.modelo && item.modelo.trim() !== "");
      const invalidData = allProcessedData.filter(item => !item.modelo || item.modelo.trim() === "");

      setData(validData);
      setCurrentPage(1);
      
      if (invalidData.length > 0) {
        toast({
          title: "Advertencia: Registros sin modelo",
          description: `${invalidData.length} registro(s) no tienen modelo y NO se cargarán. Agregue el modelo y vuelva a cargar el archivo.`,
          variant: "destructive",
        });
      }
      
      if (validData.length > 0) {
        toast({
          title: "Archivo procesado",
          description: `Se encontraron ${validData.length} registros válidos para cargar${invalidData.length > 0 ? ` (${invalidData.length} omitidos sin modelo)` : ""}`,
        });
      } else if (invalidData.length > 0) {
        toast({
          title: "No hay registros válidos",
          description: "Todos los registros carecen de modelo. Agregue los modelos y reintente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing Excel:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar el archivo Excel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processExcel(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))) {
      processExcel(droppedFile);
    } else {
      toast({
        title: "Formato no válido",
        description: "Por favor sube un archivo Excel (.xlsx o .xls)",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (data.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    const lote_carga = crypto.randomUUID();
    const batchSize = 100;
    
    try {
      // Obtener todas las placas del lote a cargar
      const allPlacas = data
        .map(item => item.placa)
        .filter(Boolean) as string[];
      
      // Verificar duplicados usando la función de base de datos (bypass RLS)
      const { data: existingPlacas, error: checkError } = await supabase
        .rpc('check_bera_duplicates', { placas: allPlacas });
      
      if (checkError) {
        console.error("Error checking duplicates:", checkError);
      }
      
      // Crear set de placas existentes
      const existingPlacasSet = new Set(
        (existingPlacas || []).map((r: { placa: string }) => r.placa?.toLowerCase())
      );
      
      // También detectar duplicados dentro del mismo lote
      const lotePlacas = new Set<string>();
      
      let duplicateCount = 0;
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize).map(item => {
          const placaLower = item.placa?.toLowerCase();
          
          // Verificar si es duplicado (en BD existente o en el mismo lote)
          const esDuplicado = placaLower && (
            existingPlacasSet.has(placaLower) || lotePlacas.has(placaLower)
          );
          
          if (esDuplicado) duplicateCount++;
          
          // Agregar al set del lote actual
          if (placaLower) lotePlacas.add(placaLower);
          
          return {
            ...item,
            lote_carga,
            es_duplicado: esDuplicado || false,
          };
        });
        
        const { error } = await supabase.from("bd_bera").insert(batch);
        
        if (error) throw error;
        
        const progress = Math.round(((i + batch.length) / data.length) * 100);
        setUploadProgress(progress);
      }
      
      toast({
        title: "Carga exitosa",
        description: duplicateCount > 0 
          ? `Se cargaron ${data.length} registros (${duplicateCount} marcados como duplicados)`
          : `Se cargaron ${data.length} registros correctamente`,
      });
      
      // Reset state
      setFile(null);
      setData([]);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error uploading:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClear = () => {
    setFile(null);
    setData([]);
    setCurrentPage(1);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([REQUIRED_COLUMNS]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_carga_bera.xlsx");
  };

  // Pagination
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Portal de Carga BERA</h1>
              <p className="text-xs text-muted-foreground">Sistema de registro de motos</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Carga de Motos BERA</h2>
              <p className="text-sm text-muted-foreground">
                Sube el archivo Excel de la fábrica para cargar las motos a la base de datos
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="gap-2">
              <Download className="h-4 w-4" />
              Descargar Plantilla
            </Button>
          </div>

      {/* Upload Zone */}
      {!file && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                Arrastra tu archivo Excel aquí
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                o haz clic para seleccionar un archivo (.xlsx, .xls)
              </p>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="default" className="gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Seleccionar Archivo
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Procesando archivo...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {!loading && data.length > 0 && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Vista Previa
                  </CardTitle>
                  <CardDescription>
                    Archivo: {file?.name}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {data.length} registros
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={handleClear}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-auto max-h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="whitespace-nowrap">#</TableHead>
                      <TableHead className="whitespace-nowrap">Fecha</TableHead>
                      <TableHead className="whitespace-nowrap">Marca</TableHead>
                      <TableHead className="whitespace-nowrap">Modelo</TableHead>
                      <TableHead className="whitespace-nowrap">Año</TableHead>
                      <TableHead className="whitespace-nowrap">Placa</TableHead>
                      <TableHead className="whitespace-nowrap">Transmisión</TableHead>
                      <TableHead className="whitespace-nowrap">Serial Chasis</TableHead>
                      <TableHead className="whitespace-nowrap">Serial Motor</TableHead>
                      <TableHead className="whitespace-nowrap">Color</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Precio Venta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.numero_fila}</TableCell>
                        <TableCell className="whitespace-nowrap">{item.fecha}</TableCell>
                        <TableCell>{item.marca}</TableCell>
                        <TableCell>{item.modelo}</TableCell>
                        <TableCell>{item.anio_modelo}</TableCell>
                        <TableCell className="font-mono">{item.placa}</TableCell>
                        <TableCell>{item.transmision}</TableCell>
                        <TableCell className="font-mono text-xs">{item.serial_chasis}</TableCell>
                        <TableCell className="font-mono text-xs">{item.serial_motor}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.color}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(item.precio_venta_tienda)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + pageSize, data.length)} de{" "}
                    {data.length} registros
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
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleClear}>
              Cancelar
            </Button>
            <Button onClick={() => setShowConfirmDialog(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Cargar {data.length} Registros
            </Button>
          </div>
        </>
      )}

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Carga</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cargar {data.length} registros a la base de datos BD_BERA?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {uploading && (
            <div className="py-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center mt-2">
                Cargando... {uploadProgress}%
              </p>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={uploading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                "Confirmar Carga"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </main>
    </div>
  );
}
