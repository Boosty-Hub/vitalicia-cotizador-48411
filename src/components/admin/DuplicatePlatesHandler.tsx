import { useState, useMemo } from "react";
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
import { AlertTriangle, Copy, Trash2, RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface DuplicatePlate {
  placa: string;
  modelo: string;
  marca: string;
  existsInDb: boolean; // true if exists in database, false if duplicate within batch
}

interface DuplicatePlatesHandlerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicates: DuplicatePlate[];
  onOmitAll: () => void;
  onAddAsMarked: (selectedPlates: string[]) => void;
  onReplace: (selectedPlates: string[]) => void;
  brandName: string; // "EMPIRE" or "BERA"
}

export function DuplicatePlatesHandler({
  open,
  onOpenChange,
  duplicates,
  onOmitAll,
  onAddAsMarked,
  onReplace,
  brandName,
}: DuplicatePlatesHandlerProps) {
  const [selectedPlates, setSelectedPlates] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<"omit" | "add" | "replace">("omit");
  const [searchQuery, setSearchQuery] = useState("");

  const dbDuplicates = duplicates.filter(d => d.existsInDb);
  const batchDuplicates = duplicates.filter(d => !d.existsInDb);

  const togglePlate = (placa: string) => {
    const newSet = new Set(selectedPlates);
    if (newSet.has(placa)) {
      newSet.delete(placa);
    } else {
      newSet.add(placa);
    }
    setSelectedPlates(newSet);
  };

  const toggleAll = () => {
    if (selectedPlates.size === duplicates.length) {
      setSelectedPlates(new Set());
    } else {
      setSelectedPlates(new Set(duplicates.map(d => d.placa)));
    }
  };

  const handleConfirm = () => {
    const selected = Array.from(selectedPlates);
    if (action === "omit") {
      onOmitAll();
    } else if (action === "add") {
      onAddAsMarked(selected.length > 0 ? selected : duplicates.map(d => d.placa));
    } else if (action === "replace") {
      onReplace(selected.length > 0 ? selected : duplicates.map(d => d.placa));
    }
    onOpenChange(false);
    setSelectedPlates(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Placas Duplicadas Detectadas
          </DialogTitle>
          <DialogDescription>
            Se encontraron <span className="font-semibold text-foreground">{duplicates.length}</span> placas 
            que ya existen. Seleccione qué hacer con ellas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary badges */}
          <div className="flex flex-wrap gap-2">
            {dbDuplicates.length > 0 && (
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                {dbDuplicates.length} en base de datos {brandName}
              </Badge>
            )}
            {batchDuplicates.length > 0 && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                {batchDuplicates.length} repetidas en este lote
              </Badge>
            )}
          </div>

          {/* Action selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant={action === "omit" ? "default" : "outline"}
              onClick={() => setAction("omit")}
              className="justify-start gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Omitir todas
            </Button>
            <Button
              variant={action === "add" ? "default" : "outline"}
              onClick={() => setAction("add")}
              className="justify-start gap-2"
            >
              <Copy className="h-4 w-4" />
              Agregar marcadas
            </Button>
            <Button
              variant={action === "replace" ? "default" : "outline"}
              onClick={() => setAction("replace")}
              className={cn(
                "justify-start gap-2",
                dbDuplicates.length === 0 && "opacity-50 cursor-not-allowed"
              )}
              disabled={dbDuplicates.length === 0}
            >
              <RefreshCw className="h-4 w-4" />
              Reemplazar
            </Button>
          </div>

          {/* Explanation text */}
          <p className="text-sm text-muted-foreground">
            {action === "omit" && "No se cargarán las placas duplicadas. Solo se cargarán los registros únicos."}
            {action === "add" && "Se cargarán las placas seleccionadas marcadas como 'duplicado'. Podrá verlas en el inventario."}
            {action === "replace" && "Se eliminarán los registros existentes en la BD y se cargarán los nuevos (solo aplica para duplicados en BD, no en lote)."}
          </p>

          {/* Plates list - only show for add/replace actions */}
          {(action === "add" || action === "replace") && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar placa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={toggleAll}>
                  {selectedPlates.size === duplicates.length ? "Deseleccionar" : "Seleccionar todo"}
                </Button>
              </div>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-1">
                  {duplicates
                    .filter(d => action === "replace" ? d.existsInDb : true)
                    .filter(d => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return d.placa.toLowerCase().includes(q) || d.marca.toLowerCase().includes(q) || d.modelo.toLowerCase().includes(q);
                    })
                    .map((dup) => (
                    <label
                      key={dup.placa}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedPlates.has(dup.placa) && "bg-primary/10"
                      )}
                    >
                      <Checkbox
                        checked={selectedPlates.has(dup.placa)}
                        onCheckedChange={() => togglePlate(dup.placa)}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <span className="font-mono font-medium">{dup.placa}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {dup.marca} {dup.modelo}
                          </span>
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          dup.existsInDb 
                            ? "bg-red-500/10 text-red-600" 
                            : "bg-amber-500/10 text-amber-600"
                        )}>
                          {dup.existsInDb ? "En BD" : "En lote"}
                        </Badge>
                      </div>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            {action === "omit" && "Omitir y continuar"}
            {action === "add" && `Agregar ${selectedPlates.size || duplicates.length} como duplicadas`}
            {action === "replace" && `Reemplazar ${selectedPlates.size || dbDuplicates.length} registros`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
