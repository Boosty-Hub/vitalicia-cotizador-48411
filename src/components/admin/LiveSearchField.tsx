import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface LiveSearchFieldProps {
  icon?: React.ReactNode;
  label: string;
  required?: boolean;
  hint?: string;
  /** Whether the parent dialog is in editing mode */
  editing?: boolean;
  /** Supabase table to search */
  table: "board_cod_marca" | "board_cod_modelo" | "board_cod_color" | "board_cod_version_moto";
  /** Column that holds the code we send to RMS */
  codeColumn: string;
  /** Column that holds the human description */
  descriptionColumn?: string;
  /** Optional equality filters (e.g. { cd_marca: "329" }) */
  filters?: Record<string, string | null | undefined>;
  /** Current values */
  code?: string | null;
  description?: string | null;
  /** Called when user picks a row */
  onSelect: (code: string, description: string) => void;
  /** Whether we should show the code badge next to the description */
  showCode?: boolean;
}

interface Row {
  code: string;
  description: string;
}

export function LiveSearchField({
  icon,
  label,
  required,
  hint,
  editing,
  table,
  codeColumn,
  descriptionColumn = "descripcion",
  filters,
  code,
  description,
  onSelect,
  showCode = true,
}: LiveSearchFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const reqIdRef = useRef(0);

  const empty = !code && !description;
  const inconsistent = required && (!code || code === "0000");
  const isEditing = !!editing;

  // Debounced fetch
  useEffect(() => {
    if (!open) return;
    const reqId = ++reqIdRef.current;
    const t = setTimeout(async () => {
      setLoading(true);
      let q = supabase
        .from(table)
        .select(`${codeColumn}, ${descriptionColumn}`)
        .order(descriptionColumn, { ascending: true })
        .limit(50);
      if (filters) {
        for (const [k, v] of Object.entries(filters)) {
          if (v) q = q.eq(k, v);
        }
      }
      if (query.trim()) {
        q = q.ilike(descriptionColumn, `%${query.trim()}%`);
      }
      const { data, error } = await q;
      if (reqId !== reqIdRef.current) return;
      if (error) {
        console.error("LiveSearchField fetch", error);
        setRows([]);
      } else {
        setRows(
          (data || []).map((r: any) => ({
            code: String(r[codeColumn] ?? ""),
            description: String(r[descriptionColumn] ?? ""),
          })),
        );
      }
      setLoading(false);
    }, 180);
    return () => clearTimeout(t);
  }, [open, query, table, codeColumn, descriptionColumn, JSON.stringify(filters)]);

  const displayValue = useMemo(() => {
    if (description) return description;
    if (code) return `Código ${code}`;
    return "Sin dato";
  }, [code, description]);

  return (
    <motion.div
      whileHover={!isEditing ? { scale: 1.015 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative rounded-lg border p-3 transition-colors",
        isEditing
          ? "border-primary/60 bg-primary/5 ring-2 ring-primary/20"
          : inconsistent
            ? "border-destructive/40 bg-destructive/5"
            : empty
              ? "border-muted bg-muted/30"
              : "border-border bg-card",
      )}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        <span>{label}</span>
        {required && (
          <span className="text-destructive" title="Requerido por RMS">
            *
          </span>
        )}
        {showCode && code && (
          <Badge variant="outline" className="ml-auto h-4 px-1.5 text-[10px] font-mono">
            {code}
          </Badge>
        )}
      </div>

      {isEditing ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-8 w-full justify-between text-sm font-normal"
            >
              <span className={cn("truncate", empty && "text-muted-foreground italic")}>
                {displayValue}
              </span>
              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[--radix-popover-trigger-width] min-w-[280px]" align="start">
            <Command shouldFilter={false}>
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput
                  placeholder={`Buscar ${label.toLowerCase()}...`}
                  value={query}
                  onValueChange={setQuery}
                  className="h-9 border-0 focus:ring-0"
                />
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin opacity-50" />}
              </div>
              <CommandList>
                <CommandEmpty>
                  {loading ? "Buscando..." : "Sin resultados."}
                </CommandEmpty>
                <CommandGroup>
                  {rows.map((r) => (
                    <CommandItem
                      key={`${r.code}-${r.description}`}
                      value={`${r.code} ${r.description}`}
                      onSelect={() => {
                        onSelect(r.code, r.description);
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-2"
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5",
                          code === r.code ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <Badge variant="outline" className="font-mono text-[10px] h-4 px-1.5">
                        {r.code}
                      </Badge>
                      <span className="truncate">{r.description}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
        <p className={cn("text-sm font-medium break-words", empty && "text-muted-foreground italic")}>
          {displayValue}
        </p>
      )}

      {inconsistent && !isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-1.5 -right-1.5"
        >
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-destructive opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
          </span>
        </motion.div>
      )}
      {hint && empty && !isEditing && (
        <p className="text-[10px] text-destructive/80 mt-1">{hint}</p>
      )}
    </motion.div>
  );
}
