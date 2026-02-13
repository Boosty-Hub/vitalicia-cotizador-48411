import { useState, useCallback, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DuplicatePlatesHandler, DuplicatePlate } from "@/components/admin/DuplicatePlatesHandler";
import { UnknownModelsHandler, UnknownModel } from "@/components/admin/UnknownModelsHandler";
import { ColumnMappingDialog, ColumnMappingResult } from "@/components/admin/ColumnMappingDialog";

interface MotoEmpire {
  fecha: string;
  marca: string;
  modelo: string;
  version: string;
  anio: number;
  transmision: string;
  placa: string;
  serial_motor: string;
  serial_carroceria: string;
  color: string;
}

// Columnas exactas requeridas en el orden de la plantilla
const REQUIRED_COLUMNS = [
  "FECHA",
  "MARCA",
  "MODELO",
  "VERSION",
  "ANHO",
  "TRANSMISION",
  "PLACA",
  "SERIAL MOTOR",
  "SERIAL CARROCERIA",
  "COLOR",
];

const COLUMN_MAPPING: Record<string, keyof MotoEmpire> = {
  "FECHA": "fecha",
  "MARCA": "marca",
  "MODELO": "modelo",
  "VERSION": "version",
  "ANHO": "anio",
  "TRANSMISION": "transmision",
  "PLACA": "placa",
  "SERIAL MOTOR": "serial_motor",
  "SERIAL CARROCERIA": "serial_carroceria",
  "COLOR": "color",
};

export default function AdminCargaEmpirePage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<MotoEmpire[]>([]);
  const [allProcessedData, setAllProcessedData] = useState<MotoEmpire[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [duplicatePlates, setDuplicatePlates] = useState<DuplicatePlate[]>([]);
  const [duplicatesAction, setDuplicatesAction] = useState<{
    platesToAdd: Set<string>;
    platesToReplace: Set<string>;
  }>({ platesToAdd: new Set(), platesToReplace: new Set() });
  const [invalidCount, setInvalidCount] = useState(0);
  const [invalidData, setInvalidData] = useState<MotoEmpire[]>([]);
  const [allowModelCreation, setAllowModelCreation] = useState(false);
  const [showUnknownModelsDialog, setShowUnknownModelsDialog] = useState(false);
  const [unknownModels, setUnknownModels] = useState<UnknownModel[]>([]);
  const [unknownModelsData, setUnknownModelsData] = useState<MotoEmpire[]>([]);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [pendingExcelData, setPendingExcelData] = useState<any[][] | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewTab, setPreviewTab] = useState<"unicos" | "duplicados" | "omitidos">("unicos");
  const pageSize = 20;

  // Fetch admin setting for model creation
  useEffect(() => {
    const fetchSetting = async () => {
      const { data } = await supabase
        .from("admin_settings" as any)
        .select("value")
        .eq("key", "allow_model_creation_on_upload")
        .maybeSingle();
      setAllowModelCreation((data as any)?.value === "true");
    };
    fetchSetting();
  }, []);

  const parseExcelDate = (value: any): string => {
    if (!value) return "";
    
    if (typeof value === "string") {
      const parts = value.split("/");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
      return value;
    }
    
    if (typeof value === "number") {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
      }
    }
    
    return String(value);
  };

  const processExcel = useCallback(async (selectedFile: File) => {
    setLoading(true);
    setFile(selectedFile);
    setDuplicatePlates([]);
    setDuplicatesAction({ platesToAdd: new Set(), platesToReplace: new Set() });
    setUnknownModels([]);
    setUnknownModelsData([]);
    
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

      const headers = (jsonData[0] as string[]).map(h => h?.trim()?.toUpperCase());
      
      // Validar que las columnas sean exactamente las requeridas
      const normalizedHeaders = headers.filter(h => h);
      const missingColumns = REQUIRED_COLUMNS.filter(col => !normalizedHeaders.includes(col));
      const extraColumns = normalizedHeaders.filter(col => !REQUIRED_COLUMNS.includes(col));
      
      if (missingColumns.length > 0 || extraColumns.length > 0) {
        // Show mapping dialog instead of error toast
        setUploadedHeaders(normalizedHeaders);
        setPendingExcelData(jsonData);
        setPendingFile(selectedFile);
        setShowMappingDialog(true);
        setLoading(false);
        return;
      }
      
      processWithMapping(headers, jsonData, COLUMN_MAPPING);
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

  const handleMappingConfirm = useCallback(async (result: ColumnMappingResult) => {
    if (!pendingExcelData) return;
    setLoading(true);
    try {
      const headers = (pendingExcelData[0] as string[]).map(h => h?.trim()?.toUpperCase());
      // Build custom COLUMN_MAPPING from user's mapping
      const customMapping: Record<string, keyof MotoEmpire> = {};
      for (const [expectedCol, uploadedCol] of Object.entries(result.mapping)) {
        if (uploadedCol && uploadedCol !== "__AUTO__" && uploadedCol !== "__IGNORE__") {
          const targetKey = COLUMN_MAPPING[expectedCol];
          if (targetKey) {
            customMapping[uploadedCol.toUpperCase()] = targetKey;
          }
        }
      }
      processWithMapping(headers, pendingExcelData, customMapping);
    } catch (error) {
      console.error("Error processing with mapping:", error);
      toast({ title: "Error", description: "No se pudo procesar el archivo", variant: "destructive" });
    } finally {
      setLoading(false);
      setPendingExcelData(null);
      setPendingFile(null);
    }
  }, [pendingExcelData]);

  const processWithMapping = useCallback(async (headers: string[], jsonData: any[][], columnMapping: Record<string, keyof MotoEmpire>) => {
      const rows = jsonData.slice(1);
      
      const processedData: MotoEmpire[] = rows
        .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ""))
        .map((row) => {
          const item: Partial<MotoEmpire> = {};
          
          headers.forEach((header, index) => {
            const mappedKey = columnMapping[header];
            if (mappedKey && row[index] !== undefined && row[index] !== null) {
              const value = row[index];
              
              if (mappedKey === "fecha") {
                (item as any)[mappedKey] = parseExcelDate(value);
              } else if (mappedKey === "anio") {
                (item as any)[mappedKey] = parseInt(String(value)) || 0;
              } else {
                (item as any)[mappedKey] = String(value).trim();
              }
            }
          });
          
          return item as MotoEmpire;
        })
        .filter(item => item.placa || item.serial_carroceria);

      // Separar registros válidos de los que no tienen modelo
      const withModelData = processedData.filter(item => item.modelo && item.modelo.trim() !== "");
      const invalidModelData = processedData.filter(item => !item.modelo || item.modelo.trim() === "");
      setInvalidCount(invalidModelData.length);
      setInvalidData(invalidModelData);

      // Verificar qué modelos existen en board_cod_modelo
      const uniqueModelsInFile = [...new Set(withModelData.map(item => item.modelo.trim().toUpperCase()))];
      
      const { data: existingModels, error: modelsError } = await supabase
        .from("board_cod_modelo")
        .select("descripcion")
        .in("descripcion", uniqueModelsInFile.map(m => m.toUpperCase()));

      const existingModelNames = new Set(
        (existingModels || []).map((m: { descripcion: string }) => m.descripcion?.toUpperCase())
      );

      // También verificar con descripción en minúsculas para ser más flexible
      const { data: existingModelsLower } = await supabase
        .from("board_cod_modelo")
        .select("descripcion");
      
      const existingModelNamesLower = new Set(
        (existingModelsLower || []).map((m: { descripcion: string }) => m.descripcion?.toUpperCase())
      );

      // Separar registros con modelos conocidos vs desconocidos
      const knownModelData = withModelData.filter(
        item => existingModelNamesLower.has(item.modelo.trim().toUpperCase())
      );
      const unknownModelData = withModelData.filter(
        item => !existingModelNamesLower.has(item.modelo.trim().toUpperCase())
      );

      // Agrupar modelos desconocidos por nombre
      const unknownModelsMap = new Map<string, UnknownModel>();
      for (const item of unknownModelData) {
        const key = item.modelo.trim().toUpperCase();
        if (unknownModelsMap.has(key)) {
          unknownModelsMap.get(key)!.count++;
        } else {
          unknownModelsMap.set(key, {
            modelo: item.modelo.trim(),
            marca: item.marca?.trim() || "EMPIRE",
            count: 1,
          });
        }
      }

      setUnknownModels(Array.from(unknownModelsMap.values()));
      setUnknownModelsData(unknownModelData);
      
      const validModelData = knownModelData;
      setAllProcessedData(withModelData);

      // Detectar duplicados dentro del lote
      const seenPlacas = new Map<string, MotoEmpire>();
      const batchDuplicates: DuplicatePlate[] = [];
      const uniqueInBatch: MotoEmpire[] = [];

      for (const item of validModelData) {
        const placaLower = item.placa?.toLowerCase();
        if (placaLower && seenPlacas.has(placaLower)) {
          batchDuplicates.push({
            placa: item.placa,
            modelo: item.modelo,
            marca: item.marca,
            existsInDb: false,
          });
        } else {
          if (placaLower) seenPlacas.set(placaLower, item);
          uniqueInBatch.push(item);
        }
      }

      // Verificar duplicados en la base de datos
      const allPlacas = uniqueInBatch
        .map(item => item.placa)
        .filter(Boolean) as string[];

      let dbDuplicates: DuplicatePlate[] = [];
      
      if (allPlacas.length > 0) {
        const { data: existingPlacas, error: checkError } = await supabase
          .rpc('check_empire_duplicates', { placas: allPlacas });
        
        if (!checkError && existingPlacas) {
          const existingPlacasSet = new Set(
            existingPlacas.map((r: { placa: string }) => r.placa?.toLowerCase())
          );
          
          dbDuplicates = uniqueInBatch
            .filter(item => existingPlacasSet.has(item.placa?.toLowerCase()))
            .map(item => ({
              placa: item.placa,
              modelo: item.modelo,
              marca: item.marca,
              existsInDb: true,
            }));
        }
      }

      const allDuplicates = [...dbDuplicates, ...batchDuplicates];
      const dbDuplicatePlacas = new Set(dbDuplicates.map(d => d.placa.toLowerCase()));
      
      // Filtrar los únicos (no duplicados en BD ni en lote)
      const uniqueData = uniqueInBatch.filter(
        item => !dbDuplicatePlacas.has(item.placa?.toLowerCase())
      );

      setData(uniqueData);
      setCurrentPage(1);

      // Always store duplicates so they can be shown after unknown models are handled
      setDuplicatePlates(allDuplicates);

      // Primero mostrar diálogo de modelos desconocidos si hay
      if (unknownModelsMap.size > 0) {
        setShowUnknownModelsDialog(true);
      }
      // Luego si hay duplicados, mostrar el diálogo
      else if (allDuplicates.length > 0) {
        setShowDuplicatesDialog(true);
      }
      
      // Mensajes informativos
      if (invalidModelData.length > 0) {
        toast({
          title: "Advertencia: Registros sin modelo",
          description: `${invalidModelData.length} registro(s) no tienen modelo y NO se cargarán.`,
          variant: "destructive",
        });
      }
      
      const totalValid = uniqueData.length;
      const totalDups = allDuplicates.length;
      const totalUnknown = unknownModelsMap.size;
      
      if (totalValid > 0 || totalDups > 0 || totalUnknown > 0) {
        toast({
          title: "Archivo procesado",
          description: `${totalValid} registros únicos${totalDups > 0 ? `, ${totalDups} duplicados` : ""}${totalUnknown > 0 ? `, ${totalUnknown} modelos desconocidos` : ""}${invalidModelData.length > 0 ? `, ${invalidModelData.length} sin modelo` : ""}`,
        });
      } else if (invalidModelData.length > 0) {
        toast({
          title: "No hay registros válidos",
          description: "Todos los registros carecen de modelo.",
          variant: "destructive",
        });
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
    if (data.length === 0 && duplicatesAction.platesToAdd.size === 0 && duplicatesAction.platesToReplace.size === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    const lote_carga = crypto.randomUUID();
    const batchSize = 100;
    
    try {
      // Combinar datos únicos + duplicados que el usuario eligió agregar
      const dataToUpload: MotoEmpire[] = [...data];
      
      // Agregar los duplicados seleccionados del allProcessedData
      if (duplicatesAction.platesToAdd.size > 0) {
        const dupsToAdd = allProcessedData.filter(
          item => duplicatesAction.platesToAdd.has(item.placa?.toLowerCase())
        );
        dataToUpload.push(...dupsToAdd);
      }

      // Eliminar registros a reemplazar de la BD (case-insensitive)
      if (duplicatesAction.platesToReplace.size > 0) {
        const placasToDelete = Array.from(duplicatesAction.platesToReplace);
        // Eliminar usando ilike para case-insensitive
        for (const placaDel of placasToDelete) {
          const { error: deleteError } = await supabase
            .from("bd_empire")
            .delete()
            .ilike("placa", placaDel);
          
          if (deleteError) {
            console.error("Error deleting record to replace:", placaDel, deleteError);
          }
        }
        
        // Agregar los nuevos registros de reemplazo (sin marcar como duplicados)
        const replacements = allProcessedData.filter(
          item => duplicatesAction.platesToReplace.has(item.placa?.toLowerCase())
        );
        dataToUpload.push(...replacements);
      }

      if (dataToUpload.length === 0) {
        toast({
          title: "Sin registros",
          description: "No hay registros para cargar",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      let uploadedCount = 0;
      let markedDuplicates = 0;
      
      for (let i = 0; i < dataToUpload.length; i += batchSize) {
        const batch = dataToUpload.slice(i, i + batchSize).map(item => {
          const isMarkedDuplicate = duplicatesAction.platesToAdd.has(item.placa?.toLowerCase());
          const isReplacement = duplicatesAction.platesToReplace.has(item.placa?.toLowerCase());
          if (isMarkedDuplicate) markedDuplicates++;
          
          return {
            ...item,
            lote_carga,
            es_duplicado: isMarkedDuplicate && !isReplacement,
          };
        });
        
        const { error } = await supabase.from("bd_empire").insert(batch);
        
        if (error) throw error;
        
        uploadedCount += batch.length;
        const progress = Math.round((uploadedCount / dataToUpload.length) * 100);
        setUploadProgress(progress);
      }
      
      let description = `Se cargaron ${uploadedCount} registros correctamente`;
      if (markedDuplicates > 0) {
        description += ` (${markedDuplicates} marcados como duplicados)`;
      }
      if (duplicatesAction.platesToReplace.size > 0) {
        description += `, ${duplicatesAction.platesToReplace.size} reemplazados`;
      }
      
      toast({
        title: "Carga exitosa",
        description,
      });
      
      setFile(null);
      setData([]);
      setAllProcessedData([]);
      setDuplicatePlates([]);
      setDuplicatesAction({ platesToAdd: new Set(), platesToReplace: new Set() });
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
    setAllProcessedData([]);
    setDuplicatePlates([]);
    setDuplicatesAction({ platesToAdd: new Set(), platesToReplace: new Set() });
    setUnknownModels([]);
    setUnknownModelsData([]);
    setInvalidData([]);
    setInvalidCount(0);
    setCurrentPage(1);
    setPreviewTab("unicos");
  };

  // Handlers para modelos desconocidos
  const handleOmitUnknownModels = () => {
    toast({
      title: "Modelos omitidos",
      description: `${unknownModelsData.length} registros con modelos desconocidos no se cargarán`,
    });
    setUnknownModels([]);
    setUnknownModelsData([]);
    // Después de omitir, mostrar duplicados si hay
    if (duplicatePlates.length > 0) {
      setShowDuplicatesDialog(true);
    } else if (data.length === 0) {
      handleClear();
    }
  };

  const handleModelsCreated = (createdModels: string[]) => {
    // Agregar los registros de modelos creados a los datos a cargar
    const createdModelsSet = new Set(createdModels.map(m => m.toUpperCase()));
    const newValidData = unknownModelsData.filter(
      item => createdModelsSet.has(item.modelo.trim().toUpperCase())
    );
    
    const remainingUnknown = unknownModels.filter(
      m => !createdModelsSet.has(m.modelo.trim().toUpperCase())
    );
    setUnknownModels(remainingUnknown);
    setUnknownModelsData(unknownModelsData.filter(
      item => !createdModelsSet.has(item.modelo.trim().toUpperCase())
    ));
    
    if (newValidData.length > 0) {
      setData(prev => [...prev, ...newValidData]);
      toast({
        title: "Registros agregados",
        description: `${newValidData.length} registros ahora se pueden cargar`,
      });
    }
    
    // Después de manejar modelos, mostrar duplicados si hay
    if (duplicatePlates.length > 0) {
      setShowDuplicatesDialog(true);
    } else if (data.length === 0 && newValidData.length === 0) {
      handleClear();
    }
  };

  // Handlers para el diálogo de duplicados
  const handleOmitAllDuplicates = () => {
    // No hacer nada, ya están filtrados de data
    toast({
      title: "Duplicados omitidos",
      description: `${duplicatePlates.length} placas duplicadas no se cargarán`,
    });
  };

  const handleAddDuplicatesAsMarked = (selectedPlates: string[]) => {
    const platesToAdd = new Set(selectedPlates.map(p => p.toLowerCase()));
    setDuplicatesAction(prev => ({ ...prev, platesToAdd }));
    
    toast({
      title: "Duplicados incluidos",
      description: `${selectedPlates.length} placas se agregarán marcadas como duplicados`,
    });
  };

  const handleReplaceDuplicates = async (selectedPlates: string[]) => {
    const platesToReplace = new Set(selectedPlates.map(p => p.toLowerCase()));
    setDuplicatesAction(prev => ({ ...prev, platesToReplace }));
    
    toast({
      title: "Registros a reemplazar",
      description: `${selectedPlates.length} registros serán reemplazados al cargar`,
    });
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([REQUIRED_COLUMNS]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_carga_empire.xlsx");
  };

  // Computed data for tabs
  const duplicateRecords = allProcessedData.filter(
    item => duplicatesAction.platesToAdd.has(item.placa?.toLowerCase()) || 
            duplicatesAction.platesToReplace.has(item.placa?.toLowerCase())
  );
  const omittedRecords = [
    ...unknownModelsData,
    ...invalidData,
    ...allProcessedData.filter(item => {
      const placaLower = item.placa?.toLowerCase();
      const isDuplicate = duplicatePlates.some(d => d.placa.toLowerCase() === placaLower);
      return isDuplicate && !duplicatesAction.platesToAdd.has(placaLower) && !duplicatesAction.platesToReplace.has(placaLower);
    }),
  ];

  const activeTabData = previewTab === "unicos" ? data : previewTab === "duplicados" ? duplicateRecords : omittedRecords;
  const totalPages = Math.ceil(activeTabData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = activeTabData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Portal de Carga EMPIRE</h1>
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
              <h2 className="text-2xl font-semibold text-foreground">Carga de Motos EMPIRE</h2>
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
                isDragging ? "border-orange-500 bg-orange-500/5" : "border-muted-foreground/25"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-orange-500/10 p-4 mb-4">
                    <FileSpreadsheet className="h-10 w-10 text-orange-500" />
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
                    id="file-upload-empire"
                  />
                  <label htmlFor="file-upload-empire">
                    <Button variant="default" className="gap-2 bg-orange-500 hover:bg-orange-600" asChild>
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
                  <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
                  <p className="text-muted-foreground">Procesando archivo...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unknown Models Summary Card */}
          {!loading && unknownModels.length > 0 && (
            <Card className="border-blue-200 bg-blue-500/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        <span className="font-medium">{unknownModels.length}</span> modelo(s) no registrados 
                        <span className="text-muted-foreground ml-1">
                          ({unknownModelsData.length} registros afectados)
                        </span>
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowUnknownModelsDialog(true)}
                      >
                        Gestionar modelos
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Duplicates Summary Card */}
          {!loading && (duplicatePlates.length > 0 || invalidCount > 0) && (
            <Card className="border-amber-200 bg-amber-500/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    {duplicatePlates.length > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm">
                          <span className="font-medium">{duplicatePlates.length}</span> placas duplicadas detectadas
                          {duplicatesAction.platesToAdd.size > 0 && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {duplicatesAction.platesToAdd.size} se agregarán
                            </Badge>
                          )}
                          {duplicatesAction.platesToReplace.size > 0 && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {duplicatesAction.platesToReplace.size} se reemplazarán
                            </Badge>
                          )}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowDuplicatesDialog(true)}
                        >
                          Gestionar duplicados
                        </Button>
                      </div>
                    )}
                    {invalidCount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">{invalidCount}</span> registros sin modelo (no se cargarán)
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Section */}
          {!loading && (data.length > 0 || duplicatesAction.platesToAdd.size > 0 || duplicatesAction.platesToReplace.size > 0 || omittedRecords.length > 0) && (
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
                    <Button variant="ghost" size="icon" onClick={handleClear}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {/* Tabs */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant={previewTab === "unicos" ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setPreviewTab("unicos"); setCurrentPage(1); }}
                    >
                      Únicos ({data.length})
                    </Button>
                    <Button
                      variant={previewTab === "duplicados" ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setPreviewTab("duplicados"); setCurrentPage(1); }}
                      disabled={duplicateRecords.length === 0}
                    >
                      Duplicados ({duplicateRecords.length})
                    </Button>
                    <Button
                      variant={previewTab === "omitidos" ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setPreviewTab("omitidos"); setCurrentPage(1); }}
                      disabled={omittedRecords.length === 0}
                      className={previewTab === "omitidos" ? "bg-destructive hover:bg-destructive/90" : ""}
                    >
                      No se cargarán ({omittedRecords.length})
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-border overflow-auto max-h-[500px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Fecha</TableHead>
                          <TableHead className="whitespace-nowrap">Marca</TableHead>
                          <TableHead className="whitespace-nowrap">Modelo</TableHead>
                          <TableHead className="whitespace-nowrap">Versión</TableHead>
                          <TableHead className="whitespace-nowrap">Año</TableHead>
                          <TableHead className="whitespace-nowrap">Transmisión</TableHead>
                          <TableHead className="whitespace-nowrap">Placa</TableHead>
                          <TableHead className="whitespace-nowrap">Serial Motor</TableHead>
                          <TableHead className="whitespace-nowrap">Serial Carrocería</TableHead>
                          <TableHead className="whitespace-nowrap">Color</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="whitespace-nowrap">{item.fecha}</TableCell>
                            <TableCell>{item.marca}</TableCell>
                            <TableCell>{item.modelo}</TableCell>
                            <TableCell>{item.version}</TableCell>
                            <TableCell>{item.anio}</TableCell>
                            <TableCell>{item.transmision}</TableCell>
                            <TableCell className="font-mono">{item.placa}</TableCell>
                            <TableCell className="font-mono text-xs">{item.serial_motor}</TableCell>
                            <TableCell className="font-mono text-xs">{item.serial_carroceria}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.color}</Badge>
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
                        Mostrando {startIndex + 1} a {Math.min(startIndex + pageSize, activeTabData.length)} de{" "}
                        {activeTabData.length} registros
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
                <Button 
                  onClick={() => setShowConfirmDialog(true)} 
                  className="gap-2 bg-orange-500 hover:bg-orange-600"
                  disabled={data.length === 0 && duplicatesAction.platesToAdd.size === 0 && duplicatesAction.platesToReplace.size === 0}
                >
                  <Upload className="h-4 w-4" />
                  Cargar {data.length + duplicatesAction.platesToAdd.size + duplicatesAction.platesToReplace.size} Registros
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
                  ¿Estás seguro de que deseas cargar {data.length + duplicatesAction.platesToAdd.size + duplicatesAction.platesToReplace.size} registros a la base de datos BD_EMPIRE?
                  {duplicatesAction.platesToAdd.size > 0 && (
                    <span className="block mt-1">• {duplicatesAction.platesToAdd.size} se marcarán como duplicados</span>
                  )}
                  {duplicatesAction.platesToReplace.size > 0 && (
                    <span className="block mt-1">• {duplicatesAction.platesToReplace.size} reemplazarán registros existentes</span>
                  )}
                  <span className="block mt-2 font-medium">Esta acción no se puede deshacer.</span>
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
                <AlertDialogAction onClick={handleUpload} disabled={uploading} className="bg-orange-500 hover:bg-orange-600">
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

      {/* Duplicates Handler Dialog */}
      <DuplicatePlatesHandler
        open={showDuplicatesDialog}
        onOpenChange={setShowDuplicatesDialog}
        duplicates={duplicatePlates}
        onOmitAll={handleOmitAllDuplicates}
        onAddAsMarked={handleAddDuplicatesAsMarked}
        onReplace={handleReplaceDuplicates}
        brandName="EMPIRE"
      />

      {/* Unknown Models Handler Dialog */}
      <UnknownModelsHandler
        open={showUnknownModelsDialog}
        onOpenChange={setShowUnknownModelsDialog}
        unknownModels={unknownModels}
        onOmitAll={handleOmitUnknownModels}
        onModelsCreated={handleModelsCreated}
        brandName="EMPIRE"
        allowCreation={allowModelCreation}
      />

      {/* Column Mapping Dialog */}
      <ColumnMappingDialog
        open={showMappingDialog}
        onOpenChange={setShowMappingDialog}
        expectedColumns={REQUIRED_COLUMNS}
        uploadedColumns={uploadedHeaders}
        autoGeneratableColumns={[]}
        templateName="EMPIRE"
        onConfirm={handleMappingConfirm}
      />
    </div>
  );
}
