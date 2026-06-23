import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

const TOGGLE_KEYS = ["allow_model_creation_on_upload"];
const TEXT_KEYS = ["whatsapp_soporte_numero"];
// Ajustes que se gestionan en el panel "Conexiones" — no mostrarlos aquí.
const CONEXIONES_KEYS = ["modo_sistema", "rms_url_dev", "rms_url_prod", "validar_docs_ia_dev"];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [textValues, setTextValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_settings" as any)
      .select("*")
      .order("created_at");

    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar las configuraciones", variant: "destructive" });
    } else {
      const list = (data as any[]) || [];
      setSettings(list);
      const tv: Record<string, string> = {};
      list.forEach((s: AdminSetting) => { tv[s.key] = s.value; });
      setTextValues(tv);
    }
    setLoading(false);
  };

  const toggleSetting = async (setting: AdminSetting) => {
    const newValue = setting.value === "true" ? "false" : "true";
    setUpdating(setting.key);
    const { error } = await supabase.from("admin_settings" as any).update({ value: newValue }).eq("id", setting.id);
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar", variant: "destructive" });
    } else {
      setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: newValue } : s));
      toast({ title: "Actualizado" });
    }
    setUpdating(null);
  };

  const saveTextSetting = async (setting: AdminSetting) => {
    const newValue = (textValues[setting.key] ?? "").trim();
    if (!newValue) {
      toast({ title: "Valor vacío", description: "Ingrese un valor", variant: "destructive" });
      return;
    }
    setUpdating(setting.key);
    const { error } = await supabase.from("admin_settings" as any).update({ value: newValue }).eq("id", setting.id);
    if (error) {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" });
    } else {
      setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: newValue } : s));
      toast({ title: "Guardado", description: "Configuración actualizada" });
    }
    setUpdating(null);
  };

  const settingLabels: Record<string, { title: string; description: string }> = {
    allow_model_creation_on_upload: {
      title: "Crear modelos desde carga de inventario",
      description: "Si está activado, al cargar un inventario con modelos desconocidos se permite crearlos directamente. Si está desactivado, los registros con modelos desconocidos se omiten automáticamente.",
    },
    whatsapp_soporte_numero: {
      title: "Número de WhatsApp de soporte",
      description: "Formato internacional sin '+', ej: 584123230188. Se usa para el enlace wa.me que aparece en los formularios cuando el usuario reporta diferencias en datos del vehículo.",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const toggleSettings = settings.filter(s => TOGGLE_KEYS.includes(s.key));
  const textSettings = settings.filter(s => TEXT_KEYS.includes(s.key));
  const otherSettings = settings.filter(s => !TOGGLE_KEYS.includes(s.key) && !TEXT_KEYS.includes(s.key) && !CONEXIONES_KEYS.includes(s.key));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configuración del Sistema
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Ajustes generales del panel administrativo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Carga de Inventario</CardTitle>
          <CardDescription>Opciones relacionadas con la carga de plantillas Excel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[...toggleSettings, ...otherSettings.filter(s => s.value === "true" || s.value === "false")].map((setting) => {
            const labels = settingLabels[setting.key];
            return (
              <div key={setting.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-medium">{labels?.title || setting.key}</Label>
                  <p className="text-sm text-muted-foreground">{labels?.description || setting.description}</p>
                </div>
                <Switch
                  checked={setting.value === "true"}
                  onCheckedChange={() => toggleSetting(setting)}
                  disabled={updating === setting.key}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {textSettings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Soporte y Contacto</CardTitle>
            <CardDescription>Datos de contacto utilizados en los formularios públicos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {textSettings.map((setting) => {
              const labels = settingLabels[setting.key];
              return (
                <div key={setting.id} className="space-y-2 p-4 rounded-lg border border-border">
                  <Label className="text-sm font-medium">{labels?.title || setting.key}</Label>
                  <p className="text-sm text-muted-foreground">{labels?.description || setting.description}</p>
                  <div className="flex gap-2 pt-2">
                    <Input
                      value={textValues[setting.key] ?? ""}
                      onChange={(e) => setTextValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                      placeholder="584123230188"
                    />
                    <Button
                      onClick={() => saveTextSetting(setting)}
                      disabled={updating === setting.key || textValues[setting.key] === setting.value}
                    >
                      {updating === setting.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span className="ml-2">Guardar</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {settings.length === 0 && (
        <p className="text-muted-foreground text-sm">No hay configuraciones disponibles</p>
      )}
    </div>
  );
}
