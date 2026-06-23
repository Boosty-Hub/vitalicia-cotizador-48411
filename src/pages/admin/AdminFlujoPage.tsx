import { motion } from "framer-motion";
import {
  UserPlus,
  Building2,
  Search,
  ClipboardList,
  ShieldCheck,
  ShieldX,
  Database,
  Send,
  FileText,
  Mail,
  Download,
  Clock,
  UserCheck,
  ChevronDown,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Módulo visual que explica el flujo del sistema de activación de pólizas,
 * de principio a fin, para Persona Natural y Persona Jurídica.
 */

type ActorKey = "cliente" | "sistema" | "servidor" | "rms" | "analista" | "resultado" | "error";

const ACTORS: Record<ActorKey, { label: string; dot: string; box: string; icon: string }> = {
  cliente: {
    label: "Cliente",
    dot: "bg-blue-500",
    box: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40",
    icon: "text-blue-600 dark:text-blue-400",
  },
  sistema: {
    label: "Sistema / App",
    dot: "bg-slate-500",
    box: "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50",
    icon: "text-slate-600 dark:text-slate-300",
  },
  servidor: {
    label: "Servidor",
    dot: "bg-violet-500",
    box: "border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/40",
    icon: "text-violet-600 dark:text-violet-400",
  },
  rms: {
    label: "Aseguradora (RMS)",
    dot: "bg-orange-500",
    box: "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/40",
    icon: "text-orange-600 dark:text-orange-400",
  },
  analista: {
    label: "Analista",
    dot: "bg-amber-500",
    box: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
    icon: "text-amber-600 dark:text-amber-400",
  },
  resultado: {
    label: "Resultado",
    dot: "bg-emerald-500",
    box: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    label: "Error",
    dot: "bg-red-500",
    box: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
    icon: "text-red-600 dark:text-red-400",
  },
};

type Step = {
  actor: ActorKey;
  icon: LucideIcon;
  title: string;
  desc: string;
};

type FlowItem = Step | { branch: [Step, Step] };

const isBranch = (i: FlowItem): i is { branch: [Step, Step] } => "branch" in i;

const NATURAL: FlowItem[] = [
  { actor: "cliente", icon: UserPlus, title: "1. Inicia la activación", desc: "Entra a /activar-poliza-rcv y elige «Persona Natural»." },
  { actor: "sistema", icon: Search, title: "2. Valida la placa", desc: "Busca en pólizas activas y en el inventario (BERA / EMPIRE)." },
  { actor: "cliente", icon: ClipboardList, title: "3. Completa el formulario", desc: "Datos del asegurado, vehículo y beneficiario (pasos 2–4)." },
  { actor: "sistema", icon: ShieldCheck, title: "4. Carga y valida documentos", desc: "Cédula, RIF, licencia, etc. Validados con IA en tiempo real (se omite en modo Desarrollo, configurable en Conexiones)." },
  { actor: "sistema", icon: Database, title: "5. Guarda la póliza", desc: "INSERT en polizas_activas con estado «Nuevo registro»." },
  { actor: "servidor", icon: Send, title: "6. Llama a la aseguradora", desc: "Edge Function rms-create-policy → API RMS (endpoint según modo Desarrollo/Producción)." },
  {
    branch: [
      { actor: "resultado", icon: ShieldCheck, title: "Éxito → «Activa»", desc: "RMS asigna el número de póliza." },
      { actor: "error", icon: ShieldX, title: "Error → «Error API»", desc: "Queda lista para reprocesar desde el panel." },
    ],
  },
  { actor: "servidor", icon: FileText, title: "7. Genera los PDF", desc: "Factura y carnet renderizados automáticamente en el servidor." },
  { actor: "servidor", icon: Mail, title: "8. Envía el correo", desc: "Documentos PDF enviados automáticamente al cliente." },
  { actor: "cliente", icon: Download, title: "9. Descarga sus documentos", desc: "Factura y carnet en /factura/:id y /carnet/:id." },
];

const JURIDICA: FlowItem[] = [
  { actor: "cliente", icon: Building2, title: "1. Inicia la activación", desc: "Entra a /activar-poliza-rcv y elige «Persona Jurídica»." },
  { actor: "sistema", icon: Search, title: "2. Valida la placa", desc: "Igual que natural: inventario BERA / EMPIRE." },
  { actor: "cliente", icon: ClipboardList, title: "3. Completa el formulario", desc: "Empresa, representante legal, vehículo y accionistas (pasos 2–6)." },
  { actor: "sistema", icon: ShieldCheck, title: "4. Carga documentos de empresa", desc: "RIF, acta constitutiva, ISLR, referencia bancaria, accionistas." },
  { actor: "sistema", icon: Database, title: "5. Guarda la póliza", desc: "INSERT con estado «Pendiente revisión analista»." },
  { actor: "sistema", icon: Clock, title: "6. Queda en espera", desc: "NO se llama a RMS: la póliza espera revisión." },
  { actor: "analista", icon: UserCheck, title: "7. El analista revisa y aprueba", desc: "Verifica los documentos y activa la póliza en el panel." },
  { actor: "servidor", icon: FileText, title: "8. Genera los PDF", desc: "Al aprobar: factura y carnet automáticos en el servidor." },
  { actor: "servidor", icon: Mail, title: "9. Envía el correo", desc: "Documentos PDF enviados automáticamente al cliente." },
  { actor: "cliente", icon: Download, title: "10. Descarga sus documentos", desc: "Factura y carnet públicos para descargar." },
];

function NodeBox({ step, delay = 0 }: { step: Step; delay?: number }) {
  const a = ACTORS[step.actor];
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay }}
      className={cn("rounded-xl border p-4 shadow-sm", a.box)}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/70 dark:bg-black/20", a.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn("inline-block h-2 w-2 rounded-full", a.dot)} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{a.label}</span>
          </div>
          <h4 className="mt-0.5 font-semibold leading-tight text-foreground">{step.title}</h4>
          <p className="mt-0.5 text-sm text-muted-foreground">{step.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center py-1">
      <ChevronDown className="h-5 w-5 text-muted-foreground/40" />
    </div>
  );
}

function FlowColumn({
  title,
  subtitle,
  items,
  accent,
}: {
  title: string;
  subtitle: string;
  items: FlowItem[];
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-5">
        <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold text-white", accent)}>
          {title}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div>
        {items.map((item, i) => (
          <div key={i}>
            {i > 0 && <Arrow />}
            {isBranch(item) ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <NodeBox step={item.branch[0]} delay={i * 0.02} />
                <NodeBox step={item.branch[1]} delay={i * 0.02 + 0.05} />
              </div>
            ) : (
              <NodeBox step={item} delay={i * 0.02} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminFlujoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Workflow className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Flujo del Sistema</h1>
          <p className="text-muted-foreground">
            Cómo se procesa una póliza de principio a fin, según el tipo de cliente.
          </p>
        </div>
      </div>

      {/* Leyenda de actores */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3">
        {(Object.keys(ACTORS) as ActorKey[]).map((k) => (
          <div key={k} className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs">
            <span className={cn("inline-block h-2.5 w-2.5 rounded-full", ACTORS[k].dot)} />
            <span className="font-medium text-foreground">{ACTORS[k].label}</span>
          </div>
        ))}
      </div>

      {/* Dos columnas: Natural y Jurídica */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FlowColumn
          title="Persona Natural"
          subtitle="Activación automática: el sistema llama a la aseguradora y emite los documentos sin intervención humana."
          items={NATURAL}
          accent="bg-blue-600"
        />
        <FlowColumn
          title="Persona Jurídica"
          subtitle="Activación asistida: un analista revisa y aprueba; al aprobar, se emiten los documentos automáticamente."
          items={JURIDICA}
          accent="bg-violet-600"
        />
      </div>
    </div>
  );
}
