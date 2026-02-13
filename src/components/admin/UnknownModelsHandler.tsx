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
  allowCreation: boolean;
}

export function UnknownModelsHandler({
  open,
  onOpenChange,
  unknownModels,
  onOmitAll,
  onModelsCreated,
  brandName,
  allowCreation,
}: UnknownModelsHandlerProps) {
  const [action, setAction] = useState<"omit" | "create">("omit");
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [modelCodes, setModelCodes] = useState<Record<string, { cd_modelo: string; cd_marca: string }>>({});

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

    // Validate that all selected models have codes filled
    for (const modelo of selectedModels) {
      const codes = modelCodes[modelo];
      if (!codes?.cd_modelo?.trim() || !codes?.cd_marca?.trim()) {
        toast({
          title: "Campos incompletos",
          description: `Complete el Código Modelo y Código Marca para "${modelo}"`,
          variant: "destructive",
        });
        return;
      }
    }

    setCreating(true);
    const createdModels: string[] = [];
    const errors: string[] = [];

    for (const model of unknownModels.filter(m => selectedModels.has(m.modelo))) {
      const trimmedModelo = model.modelo.trim();
      const codes = modelCodes[trimmedModelo];

      const { error } = await supabase.from("board_cod_modelo").insert({
        cd_marca: codes.cd_marca.trim(),
        cd_modelo: codes.cd_modelo.trim(),
        descripcion: trimmedModelo,
      });

      if (error) {
        console.error("Error creating model:", error);
        if (error.code === "42501") {
          errors.push(`${trimmedModelo}: Sin permisos para crear modelos`);
        } else if (error.code === "23505") {
          errors.push(`${trimmedModelo}: Ya existe`);
          createdModels.push(trimmedModelo);
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
    }

    if (createdModels.length > 0) {
      onModelsCreated(createdModels);
      onOpenChange(false);
      setSelectedModels(new Set());
      setModelCodes({});
    } else if (errors.length > 0) {
      toast({
        title: "No se pudo crear ningún modelo",
        description: "Puede intentar de nuevo o elegir 'Omitir todos' para continuar sin estos registros.",
      });
    }
  };

  const handleClose = () => {
    // When closing/canceling, treat as omit so flow can continue
    onOmitAll();
    onOpenChange(false);
    setSelectedModels(new Set());
    setAction("omit");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Modelos No Registrados
          </DialogTitle>
          <DialogDescription>
            Se encontraron <span className="font-semibold text-foreground">{unknownModels.length}</span> modelo(s) 
            que no existen en el sistema. {allowCreation ? "Seleccione qué hacer con ellos." : "Estos registros serán omitidos. Debe crear los modelos primero en Configuraciones → Modelos."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary badge */}
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {unknownModels.reduce((sum, m) => sum + m.count, 0)} registros afectados
          </Badge>

          {/* Action selection - only show create option if allowed */}
          <div className={cn("grid gap-2", allowCreation ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
            <Button
              variant={action === "omit" ? "default" : "outline"}
              onClick={() => setAction("omit")}
              className="justify-start gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Omitir todos
            </Button>
            {allowCreation && (
              <Button
                variant={action === "create" ? "default" : "outline"}
                onClick={() => setAction("create")}
                className="justify-start gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear modelos
              </Button>
            )}
          </div>

          {/* Explanation text */}
          <p className="text-sm text-muted-foreground">
            {action === "omit" && "No se cargarán los registros con modelos desconocidos. Puede registrar los modelos primero en Configuraciones → Modelos."}
            {action === "create" && "Se crearán los modelos seleccionados. Debe llenar el Código Modelo y Código Marca para cada uno."}
          </p>

          {/* Models list */}
          {action === "create" && allowCreation && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Seleccione los modelos a crear:
                </span>
                <Button variant="ghost" size="sm" onClick={toggleAll}>
                  {selectedModels.size === unknownModels.length ? "Deseleccionar todo" : "Seleccionar todo"}
                </Button>
              </div>
              <ScrollArea className="h-[300px] border rounded-md p-2">
                <div className="space-y-1">
                  {unknownModels.map((model) => (
                    <div
                      key={model.modelo}
                      className={cn(
                        "p-3 rounded-md border border-border transition-colors",
                        selectedModels.has(model.modelo) && "bg-primary/5 border-primary/30"
                      )}
                    >
                      <label className="flex items-center gap-3 cursor-pointer">
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
                      {selectedModels.has(model.modelo) && (
                        <div className="mt-3 grid grid-cols-2 gap-3 pl-8">
                          <div className="space-y-1">
                            <Label className="text-xs">Código Marca *</Label>
                            <Input
                              placeholder="Ej: 280"
                              value={modelCodes[model.modelo]?.cd_marca || ""}
                              onChange={(e) => setModelCodes(prev => ({
                                ...prev,
                                [model.modelo]: { ...prev[model.modelo], cd_marca: e.target.value, cd_modelo: prev[model.modelo]?.cd_modelo || "" }
                              }))}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Código Modelo *</Label>
                            <Input
                              placeholder="Ej: 0045"
                              value={modelCodes[model.modelo]?.cd_modelo || ""}
                              onChange={(e) => setModelCodes(prev => ({
                                ...prev,
                                [model.modelo]: { ...prev[model.modelo], cd_modelo: e.target.value, cd_marca: prev[model.modelo]?.cd_marca || "" }
                              }))}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
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

          {/* When omit action, show the list of models that won't be loaded */}
          {action === "omit" && (
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="space-y-1">
                {unknownModels.map((model) => (
                  <div key={model.modelo} className="flex items-center justify-between p-2 rounded-md">
                    <div>
                      <span className="font-medium text-sm">{model.modelo}</span>
                      <span className="text-xs text-muted-foreground ml-2">({model.marca})</span>
                    </div>
                    <Badge variant="outline" className="text-xs text-destructive">
                      {model.count} no se cargarán
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
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
