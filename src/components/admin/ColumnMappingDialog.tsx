import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  XCircle,
  Wand2,
  Link2,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColumnMappingResult {
  /** Maps expected column name -> uploaded column name (or "__AUTO__" for auto-generated) */
  mapping: Record<string, string>;
}

interface ColumnMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expectedColumns: string[];
  uploadedColumns: string[];
  /** Column names that can be auto-generated if missing (e.g. "#" for row numbers) */
  autoGeneratableColumns?: string[];
  /** Label for context, e.g. "EMPIRE" or "BERA" */
  templateName: string;
  onConfirm: (result: ColumnMappingResult) => void;
}

const IGNORE_VALUE = "__IGNORE__";
const AUTO_VALUE = "__AUTO__";

/** Simple similarity: Levenshtein-ish + includes check */
function similarity(a: string, b: string): number {
  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();
  if (la === lb) return 1;
  if (la.includes(lb) || lb.includes(la)) return 0.7;
  // Check if removing accents helps
  const na = la.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const nb = lb.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (na === nb) return 0.95;
  if (na.includes(nb) || nb.includes(na)) return 0.65;
  // Word overlap
  const wordsA = new Set(na.split(/\s+/));
  const wordsB = new Set(nb.split(/\s+/));
  const intersection = [...wordsA].filter(w => wordsB.has(w));
  if (intersection.length > 0) {
    return 0.4 + (intersection.length / Math.max(wordsA.size, wordsB.size)) * 0.4;
  }
  return 0;
}

export function ColumnMappingDialog({
  open,
  onOpenChange,
  expectedColumns,
  uploadedColumns,
  autoGeneratableColumns = [],
  templateName,
  onConfirm,
}: ColumnMappingDialogProps) {
  // mapping: expectedCol -> uploadedCol | "__AUTO__" | "__IGNORE__" | ""
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Auto-match on open
  useEffect(() => {
    if (!open) return;
    const newMapping: Record<string, string> = {};
    const usedUploaded = new Set<string>();

    // Pass 1: exact matches (case-insensitive)
    for (const exp of expectedColumns) {
      const match = uploadedColumns.find(
        u => u.trim().toUpperCase() === exp.trim().toUpperCase() && !usedUploaded.has(u)
      );
      if (match) {
        newMapping[exp] = match;
        usedUploaded.add(match);
      }
    }

    // Pass 2: best similarity match for unmatched
    for (const exp of expectedColumns) {
      if (newMapping[exp]) continue;
      let bestScore = 0;
      let bestMatch = "";
      for (const up of uploadedColumns) {
        if (usedUploaded.has(up)) continue;
        const score = similarity(exp, up);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = up;
        }
      }
      if (bestScore >= 0.6 && bestMatch) {
        newMapping[exp] = bestMatch;
        usedUploaded.add(bestMatch);
      } else if (autoGeneratableColumns.includes(exp)) {
        newMapping[exp] = AUTO_VALUE;
      } else {
        newMapping[exp] = "";
      }
    }

    setMapping(newMapping);
  }, [open, expectedColumns, uploadedColumns, autoGeneratableColumns]);

  const stats = useMemo(() => {
    let matched = 0;
    let autoGen = 0;
    let unmatched = 0;
    for (const exp of expectedColumns) {
      const val = mapping[exp];
      if (val === AUTO_VALUE) autoGen++;
      else if (val && val !== IGNORE_VALUE) matched++;
      else unmatched++;
    }
    return { matched, autoGen, unmatched };
  }, [mapping, expectedColumns]);

  const unmappedUploaded = useMemo(() => {
    const used = new Set(Object.values(mapping).filter(v => v && v !== AUTO_VALUE && v !== IGNORE_VALUE));
    return uploadedColumns.filter(u => !used.has(u));
  }, [mapping, uploadedColumns]);

  const canConfirm = stats.unmatched === 0;

  const handleChange = (expectedCol: string, value: string) => {
    setMapping(prev => {
      const next = { ...prev };
      // If this uploaded col was already used by another expected col, clear it
      if (value && value !== AUTO_VALUE && value !== IGNORE_VALUE) {
        for (const key of Object.keys(next)) {
          if (next[key] === value && key !== expectedCol) {
            next[key] = "";
          }
        }
      }
      next[expectedCol] = value;
      return next;
    });
  };

  const handleAutoMatchAll = () => {
    // Re-trigger the auto-match
    const newMapping: Record<string, string> = {};
    const usedUploaded = new Set<string>();

    for (const exp of expectedColumns) {
      const match = uploadedColumns.find(
        u => u.trim().toUpperCase() === exp.trim().toUpperCase() && !usedUploaded.has(u)
      );
      if (match) {
        newMapping[exp] = match;
        usedUploaded.add(match);
      }
    }

    for (const exp of expectedColumns) {
      if (newMapping[exp]) continue;
      let bestScore = 0;
      let bestMatch = "";
      for (const up of uploadedColumns) {
        if (usedUploaded.has(up)) continue;
        const score = similarity(exp, up);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = up;
        }
      }
      if (bestScore >= 0.4 && bestMatch) {
        newMapping[exp] = bestMatch;
        usedUploaded.add(bestMatch);
      } else if (autoGeneratableColumns.includes(exp)) {
        newMapping[exp] = AUTO_VALUE;
      } else {
        newMapping[exp] = "";
      }
    }
    setMapping(newMapping);
  };

  const handleConfirm = () => {
    onConfirm({ mapping });
    onOpenChange(false);
  };

  const getStatusIcon = (expectedCol: string) => {
    const val = mapping[expectedCol];
    if (val === AUTO_VALUE) return <Zap className="h-4 w-4 text-amber-500" />;
    if (val && val !== IGNORE_VALUE) return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const getStatusBadge = (expectedCol: string) => {
    const val = mapping[expectedCol];
    if (val === AUTO_VALUE) {
      return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs">Auto-generado</Badge>;
    }
    if (val && val !== IGNORE_VALUE) {
      return <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 text-xs">Mapeado</Badge>;
    }
    return <Badge variant="destructive" className="text-xs">Sin mapear</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Mapeo de Columnas — {templateName}
          </DialogTitle>
          <DialogDescription>
            La plantilla cargada no coincide exactamente con el formato esperado. 
            Mapea cada columna esperada con la columna correspondiente de tu archivo.
          </DialogDescription>
        </DialogHeader>

        {/* Stats bar */}
        <div className="flex gap-3 text-sm flex-wrap">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>{stats.matched} mapeados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>{stats.autoGen} auto-generados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-destructive" />
            <span>{stats.unmatched} sin mapear</span>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={handleAutoMatchAll} className="gap-1.5 text-xs">
              <Wand2 className="h-3.5 w-3.5" />
              Auto-mapear
            </Button>
          </div>
        </div>

        {/* Mapping rows */}
        <ScrollArea className="flex-1 min-h-0 pr-3">
          <div className="space-y-2">
            {expectedColumns.map((exp) => (
              <div
                key={exp}
                className={cn(
                  "flex items-center gap-2 rounded-lg border p-3 transition-colors",
                  !mapping[exp] || mapping[exp] === IGNORE_VALUE
                    ? "border-destructive/30 bg-destructive/5"
                    : mapping[exp] === AUTO_VALUE
                    ? "border-amber-300 bg-amber-50/50"
                    : "border-emerald-300 bg-emerald-50/50"
                )}
              >
                {/* Status icon */}
                {getStatusIcon(exp)}

                {/* Expected column */}
                <div className="min-w-[160px] flex-shrink-0">
                  <span className="font-medium text-sm">{exp}</span>
                  {autoGeneratableColumns.includes(exp) && (
                    <span className="text-xs text-muted-foreground block">Opcional</span>
                  )}
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                {/* Mapping selector */}
                <div className="flex-1 min-w-0">
                  <Select
                    value={mapping[exp] || IGNORE_VALUE}
                    onValueChange={(val) => handleChange(exp, val === IGNORE_VALUE ? "" : val)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Seleccionar columna..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={IGNORE_VALUE}>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Unlink className="h-3.5 w-3.5" />
                          Sin mapear
                        </span>
                      </SelectItem>
                      {autoGeneratableColumns.includes(exp) && (
                        <SelectItem value={AUTO_VALUE}>
                          <span className="flex items-center gap-2 text-amber-600">
                            <Zap className="h-3.5 w-3.5" />
                            Auto-generar
                          </span>
                        </SelectItem>
                      )}
                      {uploadedColumns.map((up) => (
                        <SelectItem key={up} value={up}>
                          {up}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status badge */}
                <div className="flex-shrink-0">
                  {getStatusBadge(exp)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Unmapped uploaded columns */}
        {unmappedUploaded.length > 0 && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Columnas del archivo no utilizadas:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {unmappedUploaded.map((col) => (
                <Badge key={col} variant="secondary" className="text-xs">
                  {col}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            {canConfirm ? "Confirmar mapeo y continuar" : `Faltan ${stats.unmatched} columnas`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
