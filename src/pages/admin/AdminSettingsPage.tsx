import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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
      console.error("Error fetching settings:", error);
      toast({ title: "Error", description: "No se pudieron cargar las configuraciones", variant: "destructive" });
    } else {
      setSettings((data as any[]) || []);
    }
    setLoading(false);
  };

  const toggleSetting = async (setting: AdminSetting) => {
    const newValue = setting.value === "true" ? "false" : "true";
    setUpdating(setting.key);

    const { error } = await supabase
      .from("admin_settings" as any)
      .update({ value: newValue })
      .eq("id", setting.id);

    if (error) {
      console.error("Error updating setting:", error);
      toast({ title: "Error", description: "No se pudo actualizar la configuración", variant: "destructive" });
    } else {
      setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: newValue } : s));
      toast({ title: "Actualizado", description: `${setting.description || setting.key} ${newValue === "true" ? "activado" : "desactivado"}` });
    }
    setUpdating(null);
  };

  const settingLabels: Record<string, { title: string; description: string }> = {
    allow_model_creation_on_upload: {
      title: "Crear modelos desde carga de inventario",
      description: "Si está activado, al cargar un inventario con modelos desconocidos se permite crearlos directamente (requiere llenar código de marca y código de modelo). Si está desactivado, los registros con modelos desconocidos se omiten automáticamente.",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configuración del Sistema
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ajustes generales del panel administrativo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Carga de Inventario</CardTitle>
          <CardDescription>Opciones relacionadas con la carga de plantillas Excel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.map((setting) => {
            const labels = settingLabels[setting.key];
            return (
              <div key={setting.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-medium">
                    {labels?.title || setting.key}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {labels?.description || setting.description}
                  </p>
                </div>
                <Switch
                  checked={setting.value === "true"}
                  onCheckedChange={() => toggleSetting(setting)}
                  disabled={updating === setting.key}
                />
              </div>
            );
          })}
          {settings.length === 0 && (
            <p className="text-muted-foreground text-sm">No hay configuraciones disponibles</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
