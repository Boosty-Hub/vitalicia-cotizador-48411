import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Bike,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  History,
  Building2,
  User,
  Calendar,
  Hash,
  Palette,
  Gauge,
  FileText,
  ExternalLink,
  Loader2,
  Info,
} from "lucide-react";
import { PolicyDetailsDialog } from "@/components/admin/PolicyDetailsDialog";

interface MotoBera {
  id: string;
  fecha?: string | null;
  marca?: string | null;
  cod_modelo?: string | null;
  modelo?: string | null;
  anio_modelo?: number | null;
  placa?: string | null;
  transmision?: string | null;
  serial_chasis?: string | null;
  serial_motor?: string | null;
  cod_color?: string | null;
  color?: string | null;
  precio_venta_tienda?: number | null;
  precio_base_venta_tienda?: number | null;
  precio_venta_sugerido?: number | null;
  precio_base_venta_sugerido?: number | null;
  es_duplicado?: boolean | null;
  created_at?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moto: MotoBera | null;
}

const formatPrice = (n?: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(n);

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("es-VE", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return d;
  }
};

// Framer Motion variants
const tabContentVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const listItem = {
  initial: { opacity: 0, x: -10 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: "easeOut" },
  }),
};

interface FieldProps {
  icon?: React.ReactNode;
  label: string;
  value?: string | number | null;
  required?: boolean;
  hint?: string;
}

function Field({ icon, label, value, required, hint }: FieldProps) {
  const empty = value == null || value === "" || value === "0000";
  const inconsistent = required && empty;

  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative rounded-lg border p-3 transition-colors ${
        inconsistent
          ? "border-destructive/40 bg-destructive/5"
          : empty
            ? "border-muted bg-muted/30"
            : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        <span>{label}</span>
        {required && (
          <span className="text-destructive" title="Requerido por RMS">*</span>
        )}
      </div>
      <p className={`text-sm font-medium break-words ${empty ? "text-muted-foreground italic" : ""}`}>
        {empty ? "Sin dato" : String(value)}
      </p>
      {inconsistent && (
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
      {hint && empty && (
        <p className="text-[10px] text-destructive/80 mt-1">{hint}</p>
      )}
    </motion.div>
  );
}

export function MotoDetailsDialog({ open, onOpenChange, moto }: Props) {
  const [tab, setTab] = useState("datos");
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [policyOpen, setPolicyOpen] = useState(false);

  useEffect(() => {
    if (!open) setTab("datos");
  }, [open]);

  useEffect(() => {
    if (!open || !moto?.placa) return;
    let cancelled = false;
    (async () => {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from("polizas_activas")
        .select("*")
        .ilike("placa_monday", moto.placa!)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        if (error) console.error("history fetch", error);
        setHistory(data || []);
        setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, moto?.placa]);

  // Inconsistency checks
  const issues = useMemo(() => {
    if (!moto) return [] as { level: "error" | "warn"; msg: string }[];
    const out: { level: "error" | "warn"; msg: string }[] = [];
    if (!moto.placa) out.push({ level: "error", msg: "Falta la placa" });
    if (!moto.serial_chasis) out.push({ level: "error", msg: "Falta el serial de chasis (requerido por RMS)" });
    if (!moto.serial_motor) out.push({ level: "error", msg: "Falta el serial de motor (requerido por RMS)" });
    if (!moto.cod_modelo || moto.cod_modelo === "0000")
      out.push({ level: "error", msg: "Código de modelo no resuelto (RMS: 0000)" });
    if (!moto.cod_color || moto.cod_color === "0000")
      out.push({ level: "warn", msg: "Código de color no resuelto" });
    if (!moto.anio_modelo) out.push({ level: "error", msg: "Falta el año del modelo" });
    if (!moto.modelo) out.push({ level: "warn", msg: "Falta el nombre del modelo" });
    if (!moto.color) out.push({ level: "warn", msg: "Falta el color descriptivo" });
    if (moto.es_duplicado) out.push({ level: "warn", msg: "Placa marcada como duplicada en inventario" });
    return out;
  }, [moto]);

  const rmsReady = issues.filter((i) => i.level === "error").length === 0;

  if (!moto) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
          {/* Hero header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-primary text-primary-foreground p-6 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 0px, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.4) 0px, transparent 40%)",
                backgroundSize: "200% 200%",
              }}
            />
            <DialogHeader className="relative">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="bg-white/15 backdrop-blur rounded-xl p-3"
                  >
                    <Bike className="h-7 w-7" />
                  </motion.div>
                  <div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">
                      {moto.marca || "BERA"} {moto.modelo || ""}
                    </DialogTitle>
                    <DialogDescription className="text-primary-foreground/90 font-mono text-base mt-1">
                      Placa: {moto.placa || "—"} · Año {moto.anio_modelo || "—"}
                    </DialogDescription>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {rmsReady ? (
                    <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white border-0 gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Listo para RMS
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> {issues.filter((i) => i.level === "error").length} problemas
                    </Badge>
                  )}
                </motion.div>
              </div>
            </DialogHeader>
          </motion.div>

          {/* Inconsistencies banner */}
          <AnimatePresence>
            {issues.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mx-6 mt-4 rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/60 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Datos inconsistentes detectados
                  </div>
                  <ul className="space-y-1">
                    {issues.map((iss, i) => (
                      <motion.li
                        key={i}
                        custom={i}
                        variants={listItem}
                        initial="initial"
                        animate="animate"
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            iss.level === "error" ? "bg-destructive" : "bg-amber-500"
                          }`}
                        />
                        <span
                          className={
                            iss.level === "error"
                              ? "text-destructive"
                              : "text-amber-800 dark:text-amber-300"
                          }
                        >
                          {iss.msg}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Tabs value={tab} onValueChange={setTab} className="px-6 pt-4 pb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="datos" className="gap-1.5">
                <Info className="h-3.5 w-3.5" /> Datos
              </TabsTrigger>
              <TabsTrigger value="rms" className="gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> RMS
              </TabsTrigger>
              <TabsTrigger value="historico" className="gap-1.5">
                <History className="h-3.5 w-3.5" /> Histórico
                {history.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                    {history.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[55vh] mt-4 pr-3">
              <AnimatePresence mode="wait">
                {tab === "datos" && (
                  <motion.div
                    key="datos"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Field icon={<Bike className="h-3 w-3" />} label="Marca" value={moto.marca} required />
                      <Field icon={<Hash className="h-3 w-3" />} label="Modelo" value={moto.modelo} required />
                      <Field icon={<Calendar className="h-3 w-3" />} label="Año" value={moto.anio_modelo} required />
                      <Field icon={<Hash className="h-3 w-3" />} label="Placa" value={moto.placa} required />
                      <Field icon={<Gauge className="h-3 w-3" />} label="Transmisión" value={moto.transmision} />
                      <Field icon={<Palette className="h-3 w-3" />} label="Color" value={moto.color} />
                      <Field icon={<Hash className="h-3 w-3" />} label="Serial Chasis" value={moto.serial_chasis} required hint="RMS rechazará el envío" />
                      <Field icon={<Hash className="h-3 w-3" />} label="Serial Motor" value={moto.serial_motor} required hint="RMS rechazará el envío" />
                      <Field icon={<Calendar className="h-3 w-3" />} label="Fecha ingreso" value={moto.fecha} />
                    </div>

                    <div className="mt-5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Precios
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Field label="Venta tienda" value={formatPrice(moto.precio_venta_tienda)} />
                        <Field label="Base venta tienda" value={formatPrice(moto.precio_base_venta_tienda)} />
                        <Field label="Venta sugerido" value={formatPrice(moto.precio_venta_sugerido)} />
                        <Field label="Base sugerido" value={formatPrice(moto.precio_base_venta_sugerido)} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {tab === "rms" && (
                  <motion.div
                    key="rms"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="mb-3 text-xs text-muted-foreground">
                      Campos exactos que se envían a la API de RMS al activar una póliza para esta moto.
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Field label="c_cd_marca" value={"—"} required hint="Se resuelve al activar la póliza" />
                      <Field label="c_cd_modelo" value={moto.cod_modelo} required hint="Debe existir en board_cod_modelo" />
                      <Field label="c_cd_color" value={moto.cod_color} required />
                      <Field label="n_nu_centuria (año)" value={moto.anio_modelo} required />
                      <Field label="c_placa" value={moto.placa} required />
                      <Field label="n_serialcontrato (chasis)" value={moto.serial_chasis} required />
                      <Field label="c_motor" value={moto.serial_motor} required />
                      <Field label="c_carroceria" value={moto.serial_chasis} required />
                      <Field label="c_cd_pais" value={"001"} />
                      <Field label="cd_moneda" value={"DL"} />
                      <Field label="s_marca (descriptivo)" value={moto.marca} />
                      <Field label="s_modelo (descriptivo)" value={moto.modelo} />
                    </div>
                  </motion.div>
                )}

                {tab === "historico" && (
                  <motion.div
                    key="historico"
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-10 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Cargando histórico…
                      </div>
                    ) : history.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 border border-dashed rounded-lg"
                      >
                        <History className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Sin asignaciones registradas. Esta moto aún no ha sido vinculada a una póliza.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="relative pl-6">
                        {/* timeline line */}
                        <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                        <div className="space-y-3">
                          {history.map((h, i) => {
                            const isJuridico = h.formulario === "juridico" || h.razon_social_juridico_monday;
                            const titular = isJuridico
                              ? h.razon_social_juridico_monday || "Persona Jurídica"
                              : `${h.nombre_titular_monday || ""} ${h.apellidos_titular_monday || ""}`.trim() ||
                                "Persona Natural";
                            const docId = isJuridico
                              ? h.nro_documento_juridico_monday
                              : h.nro_documento_natural_monday;
                            const status = h.api_status || h.estado_principal_monday || "—";
                            const statusColor =
                              status === "success" || status === "Activa"
                                ? "bg-emerald-500"
                                : status === "error"
                                  ? "bg-destructive"
                                  : "bg-amber-500";

                            return (
                              <motion.div
                                key={h.id}
                                custom={i}
                                variants={listItem}
                                initial="initial"
                                animate="animate"
                                whileHover={{ x: 4 }}
                                className="relative"
                              >
                                <div
                                  className={`absolute -left-[18px] top-3 h-3 w-3 rounded-full ring-4 ring-background ${statusColor}`}
                                />
                                <Card
                                  className="p-3 cursor-pointer hover:shadow-medium transition-shadow"
                                  onClick={() => {
                                    setSelectedPolicy(h);
                                    setPolicyOpen(true);
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        {isJuridico ? (
                                          <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                        ) : (
                                          <User className="h-3.5 w-3.5 text-primary shrink-0" />
                                        )}
                                        <p className="font-medium text-sm truncate">{titular}</p>
                                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                          {isJuridico ? "Jurídica" : "Natural"}
                                        </Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground space-y-0.5">
                                        <p className="font-mono">{docId || "Sin documento"}</p>
                                        <p className="flex items-center gap-2">
                                          <Calendar className="h-3 w-3" />
                                          {formatDate(h.created_at)}
                                        </p>
                                        {h.numero_poliza_monday && (
                                          <p className="flex items-center gap-2">
                                            <FileText className="h-3 w-3" />
                                            Póliza: {h.numero_poliza_monday}
                                          </p>
                                        )}
                                        {h.api_message && (
                                          <p className="text-[11px] italic text-muted-foreground/80 line-clamp-1">
                                            {h.api_message}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] capitalize"
                                      >
                                        {status}
                                      </Badge>
                                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                  </div>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      <PolicyDetailsDialog
        open={policyOpen}
        onOpenChange={setPolicyOpen}
        policy={selectedPolicy}
      />
    </>
  );
}
