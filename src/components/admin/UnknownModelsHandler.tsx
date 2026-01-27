import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Plus, Trash2, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface UnknownModel {
  modelo: string;
  marca: string;
  count: number; // Cantidad de registros con este modelo
}

interface UnknownModelsHandlerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unknownModels: UnknownModel[];
  onOmitAll: () => void;
  onModelsCreated: (createdModels: string[]) => void;
  brandName: "EMPIRE" | "BERA";
}

export function UnknownModelsHandler({
  open,
  onOpenChange,
  unknownModels,
  onOmitAll,
  onModelsCreated,
  brandName,
}: UnknownModelsHandlerProps) {
  const [action, setAction] = useState<"omit" | "create">("omit");
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  const toggleModel = (modelo: string) => {
    const newSet = new Set(selectedModels);
    if (newSet.has(modelo)) {
      newSet.delete(modelo);
    } else {
      newSet.add(modelo);
    }
    setSelectedModels(newSet);
  };

  const toggleAll = () => {
    if (selectedModels.size === unknownModels.length) {
      setSelectedModels(new Set());
    } else {
      setSelectedModels(new Set(unknownModels.map(m => m.modelo)));
    }
  };

  const totalAffectedRecords = unknownModels
    .filter(m => selectedModels.has(m.modelo))
    .reduce((sum, m) => sum + m.count, 0);

  const handleConfirm = async () => {
    if (action === "omit") {
      onOmitAll();
      onOpenChange(false);
      setSelectedModels(new Set());
      return;
    }

    // Crear los modelos seleccionados
    if (selectedModels.size === 0) {
      toast({
        title: "Seleccione modelos",
        description: "Debe seleccionar al menos un modelo para crear",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    const createdModels: string[] = [];
    const errors: string[] = [];

    for (const model of unknownModels.filter(m => selectedModels.has(m.modelo))) {
      const trimmedModelo = model.modelo.trim();
      const trimmedMarca = model.marca.trim();

      if (!trimmedModelo) {
        errors.push(`Modelo vacío para marca ${trimmedMarca}`);
        continue;
      }

      // Obtener el código de marca
      const { data: marcaData } = await supabase
        .from("board_cod_marca")
        .select("cd_marca")
        .ilike("descripcion", trimmedMarca)
        .maybeSingle();

      const cdMarca = marcaData?.cd_marca || trimmedMarca.substring(0, 3).toUpperCase();

      // Generar código de modelo único
      const cdModelo = `${trimmedModelo.substring(0, 6).toUpperCase().replace(/\s/g, "")}${Date.now().toString().slice(-4)}`;

      const { error } = await supabase.from("board_cod_modelo").insert({
        cd_marca: cdMarca,
        cd_modelo: cdModelo,
        descripcion: trimmedModelo,
      });

      if (error) {
        console.error("Error creating model:", error);
        if (error.code === "42501") {
          errors.push(`${trimmedModelo}: Sin permisos para crear modelos`);
        } else if (error.code === "23505") {
          errors.push(`${trimmedModelo}: Ya existe`);
          createdModels.push(trimmedModelo); // Considerarlo como existente
        } else {
          errors.push(`${trimmedModelo}: ${error.message}`);
        }
      } else {
        createdModels.push(trimmedModelo);
      }
    }

    setCreating(false);

    if (errors.length > 0) {
      toast({
        title: "Algunos modelos no se pudieron crear",
        description: errors.join(". "),
        variant: "destructive",
      });
    }

    if (createdModels.length > 0) {
      toast({
        title: "Modelos creados",
        description: `Se crearon ${createdModels.length} modelo(s) correctamente`,
      });
      onModelsCreated(createdModels);
    }

    onOpenChange(false);
    setSelectedModels(new Set());
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedModels(new Set());
    setAction("omit");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Modelos No Registrados
          </DialogTitle>
          <DialogDescription>
            Se encontraron <span className="font-semibold text-foreground">{unknownModels.length}</span> modelo(s) 
            que no existen en el sistema. Seleccione qué hacer con ellos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary badge */}
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
            {unknownModels.reduce((sum, m) => sum + m.count, 0)} registros afectados
          </Badge>

          {/* Action selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant={action === "omit" ? "default" : "outline"}
              onClick={() => setAction("omit")}
              className="justify-start gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Omitir todos
            </Button>
            <Button
              variant={action === "create" ? "default" : "outline"}
              onClick={() => setAction("create")}
              className="justify-start gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear modelos
            </Button>
          </div>

          {/* Explanation text */}
          <p className="text-sm text-muted-foreground">
            {action === "omit" && "No se cargarán los registros con modelos desconocidos. Puede registrar los modelos primero en Configuraciones → Modelos."}
            {action === "create" && "Se crearán los modelos seleccionados automáticamente y se permitirá cargar sus registros."}
          </p>

          {/* Models list - only show for create action */}
          {action === "create" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Seleccione los modelos a crear:
                </span>
                <Button variant="ghost" size="sm" onClick={toggleAll}>
                  {selectedModels.size === unknownModels.length ? "Deseleccionar todo" : "Seleccionar todo"}
                </Button>
              </div>
              <ScrollArea className="h-[250px] border rounded-md p-2">
                <div className="space-y-1">
                  {unknownModels.map((model) => (
                    <label
                      key={model.modelo}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedModels.has(model.modelo) && "bg-primary/10"
                      )}
                    >
                      <Checkbox
                        checked={selectedModels.has(model.modelo)}
                        onCheckedChange={() => toggleModel(model.modelo)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{model.modelo}</span>
                          <Badge variant="secondary" className="text-xs">
                            {model.count} registro(s)
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Marca: {model.marca}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </ScrollArea>
              
              {selectedModels.size > 0 && (
                <p className="text-sm text-muted-foreground">
                  Se crearán <span className="font-semibold">{selectedModels.size}</span> modelo(s) 
                  y se cargarán <span className="font-semibold">{totalAffectedRecords}</span> registro(s).
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={creating}>
            {creating ? (
              <>Creando...</>
            ) : action === "omit" ? (
              "Omitir y continuar"
            ) : (
              `Crear ${selectedModels.size || unknownModels.length} modelo(s)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
