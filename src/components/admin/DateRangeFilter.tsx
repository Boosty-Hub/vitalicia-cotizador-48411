import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, subDays, startOfYear, endOfYear } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DateRangeValue = { from: Date; to: Date; label: string };

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
}

const PRESETS = [
  { key: "today", label: "Hoy", get: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { key: "7d", label: "Últimos 7 días", get: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
  { key: "30d", label: "Últimos 30 días", get: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
  { key: "month", label: "Este mes", get: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { key: "year", label: "Este año", get: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
  { key: "all", label: "Todo", get: () => ({ from: new Date(2020, 0, 1), to: endOfDay(new Date()) }) },
];

export function getDefaultDateRange(): DateRangeValue {
  const p = PRESETS.find((x) => x.key === "month")!;
  const r = p.get();
  return { ...r, label: p.label };
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>({ from: value.from, to: value.to });

  const applyPreset = (key: string) => {
    const p = PRESETS.find((x) => x.key === key)!;
    const r = p.get();
    onChange({ ...r, label: p.label });
    setRange({ from: r.from, to: r.to });
    setOpen(false);
  };

  const applyCustom = () => {
    if (range?.from && range?.to) {
      onChange({
        from: startOfDay(range.from),
        to: endOfDay(range.to),
        label: `${format(range.from, "dd MMM", { locale: es })} - ${format(range.to, "dd MMM yyyy", { locale: es })}`,
      });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start text-left font-normal min-w-[240px]")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{value.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex" align="start">
        <div className="flex flex-col border-r border-border p-2 gap-1 bg-muted/30">
          {PRESETS.map((p) => (
            <Button
              key={p.key}
              variant={value.label === p.label ? "default" : "ghost"}
              size="sm"
              className="justify-start font-normal"
              onClick={() => applyPreset(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-col">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            locale={es}
            defaultMonth={value.from}
          />
          <div className="flex justify-end gap-2 p-2 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={applyCustom} disabled={!range?.from || !range?.to}>
              Aplicar rango
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
