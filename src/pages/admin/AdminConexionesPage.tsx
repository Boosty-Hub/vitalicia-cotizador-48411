import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Plug, Loader2, Save, FlaskConical, Rocket,
  CheckCircle2, XCircle, AlertTriangle, Play,
} from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: string;
}

type Modo = "desarrollo" | "produccion";

interface TestResult {
  connected: boolean;
  reason?: string;
  httpStatus?: number;
  apiStatus?: string | null;
  apiMessage?: string;
  message?: string;
  url?: string;
  modo?: string;
  elapsedMs?: number;
}

const KEYS = ["modo_sistema", "rms_url_dev", "rms_url_prod"] as const;

export default function AdminConexionesPage() {
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [urls, setUrls] = useState<{ rms_url_dev: string; rms_url_prod: string }>({
    rms_url_dev: "",
    rms_url_prod: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_settings")
      .select("id,key,value")
      .in("key", [...KEYS]);
    if (error) {
      toast({ title: "Error", description: "No se pudo cargar la configuración", variant: "destructive" });
    } else {
      const map: Record<string, Setting> = {};
      (data || []).forEach((s) => { map[s.key] = s; });
      setSettings(map);
      setUrls({
        rms_url_dev: map["rms_url_dev"]?.value ?? "",
        rms_url_prod: map["rms_url_prod"]?.value ?? "",
      });
    }
    setLoading(false);
  };

  const modo: Modo = (settings["modo_sistema"]?.value?.toLowerCase() as Modo) || "produccion";

  const setModo = async (next: Modo) => {
    if (next === modo) return;
    const row = settings["modo_sistema"];
    if (!row) {
      toast({ title: "Falta configurar", description: "El ajuste 'modo_sistema' no existe aún.", variant: "destructive" });
      return;
    }
    setSaving("modo_sistema");
    const { error } = await supabase.from("admin_settings").update({ value: next }).eq("id", row.id);
    if (error) {
      toast({ title: "Error", description: "No se pudo cambiar el modo", variant: "destructive" });
    } else {
      setSettings((p) => ({ ...p, modo_sistema: { ...row, value: next } }));
      toast({
        title: next === "desarrollo" ? "Modo Desarrollo activo" : "Modo Producción activo",
        description: next === "desarrollo"
          ? "La validación de documentos con IA queda OMITIDA."
          : "La validación de documentos con IA queda SIEMPRE activa.",
      });
    }
    setSaving(null);
  };

  const saveUrl = async (key: "rms_url_dev" | "rms_url_prod") => {
    const row = settings[key];
    if (!row) {
      toast({ title: "Falta configurar", description: `El ajuste '${key}' no existe aún.`, variant: "destructive" });
      return;
    }
    setSaving(key);
    const value = urls[key].trim();
    const { error } = await supabase.from("admin_settings").update({ value }).eq("id", row.id);
    if (error) {
      toast({ title: "Error", description: "No se pudo guardar la URL", variant: "destructive" });
    } else {
      setSettings((p) => ({ ...p, [key]: { ...row, value } }));
      toast({ title: "Guardado", description: "Endpoint actualizado" });
    }
    setSaving(null);
  };

  const probarConexion = async () => {
    setTesting(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("rms-test-connection", { body: {} });
    if (error) {
      setResult({ connected: false, message: error.message || "Error invocando la función de prueba." });
    } else {
      setResult(data as TestResult);
    }
    setTesting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeUrl = modo === "produccion"
    ? (urls.rms_url_prod || urls.rms_url_dev)
    : urls.rms_url_dev;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Plug className="h-6 w-6" />
          Conexiones
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Entorno del sistema y conexión con la aseguradora (RMS)
        </p>
      </div>

      {/* Modo del sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Modo del sistema
            <Badge variant={modo === "produccion" ? "default" : "secondary"}>
              {modo === "produccion" ? "Producción" : "Desarrollo"}
            </Badge>
          </CardTitle>
          <CardDescription>
            En <strong>Producción</strong> la documentación se valida con IA siempre. En{" "}
            <strong>Desarrollo</strong> la validación se omite y se puede cargar cualquier
            documento (para testear más fácil).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setModo("desarrollo")}
              disabled={saving === "modo_sistema"}
              className={[
                "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                modo === "desarrollo"
                  ? "border-primary bg-primary/10 text-primary shadow-soft"
                  : "border-border hover:bg-muted/50",
              ].join(" ")}
            >
              <FlaskConical className="h-5 w-5 flex-shrink-0" />
              <div>
                <div className="font-medium">Desarrollo</div>
                <div className="text-xs text-muted-foreground">Sin validación IA</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setModo("produccion")}
              disabled={saving === "modo_sistema"}
              className={[
                "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                modo === "produccion"
                  ? "border-primary bg-primary/10 text-primary shadow-soft"
                  : "border-border hover:bg-muted/50",
              ].join(" ")}
            >
              <Rocket className="h-5 w-5 flex-shrink-0" />
              <div>
                <div className="font-medium">Producción</div>
                <div className="text-xs text-muted-foreground">Valida siempre</div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Conexión RMS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conexión RMS (aseguradora)</CardTitle>
          <CardDescription>
            Endpoint por entorno. Las credenciales (usuario, contraseña, API key) viven como
            secretos del servidor y NO se editan desde aquí.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> Endpoint Desarrollo / QA
              {modo === "desarrollo" && <Badge variant="secondary">activo</Badge>}
            </Label>
            <div className="flex gap-2">
              <Input
                value={urls.rms_url_dev}
                onChange={(e) => setUrls((p) => ({ ...p, rms_url_dev: e.target.value }))}
                placeholder="https://api.rms40.com/api-qa/form_motos"
              />
              <Button
                onClick={() => saveUrl("rms_url_dev")}
                disabled={saving === "rms_url_dev" || urls.rms_url_dev === (settings["rms_url_dev"]?.value ?? "")}
              >
                {saving === "rms_url_dev" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Rocket className="h-4 w-4" /> Endpoint Producción
              {modo === "produccion" && <Badge>activo</Badge>}
            </Label>
            <div className="flex gap-2">
              <Input
                value={urls.rms_url_prod}
                onChange={(e) => setUrls((p) => ({ ...p, rms_url_prod: e.target.value }))}
                placeholder="(pendiente — aún no hay endpoint de producción)"
              />
              <Button
                onClick={() => saveUrl("rms_url_prod")}
                disabled={saving === "rms_url_prod" || urls.rms_url_prod === (settings["rms_url_prod"]?.value ?? "")}
              >
                {saving === "rms_url_prod" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">
                <div className="text-muted-foreground">Endpoint activo ({modo})</div>
                <div className="font-mono text-xs break-all">{activeUrl || "— sin configurar —"}</div>
              </div>
              <Button onClick={probarConexion} disabled={testing}>
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                <span className="ml-2">Probar conexión</span>
              </Button>
            </div>

            {result && (
              <div
                className={[
                  "rounded-md border p-3 text-sm flex gap-3",
                  result.connected
                    ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"
                    : "border-destructive/40 bg-destructive/10 text-destructive",
                ].join(" ")}
              >
                {result.connected
                  ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  : result.reason === "auth"
                    ? <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    : <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
                <div className="space-y-1">
                  <div className="font-medium">{result.message}</div>
                  {(result.httpStatus || result.apiMessage) && (
                    <div className="text-xs opacity-80">
                      {result.httpStatus ? `HTTP ${result.httpStatus}` : ""}
                      {result.elapsedMs ? ` · ${result.elapsedMs}ms` : ""}
                      {result.apiMessage ? ` · ${result.apiMessage}` : ""}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
