import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

export interface DuplicateRow {
  id: string;
  placa: string | null;
  marca: string | null;
  [key: string]: unknown;
}

export interface DuplicateColumnsConfig {
  yearKey: string;
  yearLabel: string;
  serialKey: string;
  serialLabel: string;
  modelOf: (row: DuplicateRow) => string;
}

export interface DuplicateWarningDialogProps {
  variant: "bera" | "empire";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: DuplicateRow[];
  totalCount: number;
  columns: DuplicateColumnsConfig;
  onViewDuplicates: () => void;
}

export function DuplicateWarningDialog({
  open,
  onOpenChange,
  rows,
  totalCount,
  columns,
  onViewDuplicates,
}: DuplicateWarningDialogProps) {
  const extraCount = totalCount - rows.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Duplicados detectados
          </DialogTitle>
          <DialogDescription>
            Se encontraron <strong>{totalCount}</strong> registro{totalCount !== 1 ? "s" : ""} marcado{totalCount !== 1 ? "s" : ""} como duplicado{totalCount !== 1 ? "s" : ""} en el inventario.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>{columns.yearLabel}</TableHead>
                <TableHead>{columns.serialLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono">{row.placa ?? "—"}</TableCell>
                  <TableCell>{row.marca ?? "—"}</TableCell>
                  <TableCell>{columns.modelOf(row)}</TableCell>
                  <TableCell>{String(row[columns.yearKey] ?? "—")}</TableCell>
                  <TableCell className="font-mono text-xs">{String(row[columns.serialKey] ?? "—")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {extraCount > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            hay {extraCount} más no mostrado{extraCount !== 1 ? "s" : ""}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={onViewDuplicates}
          >
            Ver duplicados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
