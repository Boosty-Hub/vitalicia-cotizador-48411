import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const formatAuthError = (message?: string) => {
  const msg = (message || "").toLowerCase();

  if (msg.includes("failed to fetch") || msg.includes("name_not_resolved") || msg.includes("networkerror")) {
    return "No se pudo conectar con Supabase. Revisa tu conexión a internet, DNS/VPN o bloqueadores de red e intenta de nuevo.";
  }
  if (msg.includes("timeout") || msg.includes("aborted")) {
    return "La conexión con Supabase está tardando demasiado. Verifica tu red/VPN e intenta nuevamente.";
  }

  if (msg.includes("email_not_confirmed") || (msg.includes("email") && msg.includes("not confirmed"))) {
    return "Tu correo aún no está confirmado. Revisa tu bandeja de entrada o pídele a un administrador que lo confirme en Supabase.";
  }

  if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
    return "Credenciales inválidas. Verifica el correo/contraseña.";
  }

  return message || "Credenciales inválidas";
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [supabaseHealth, setSupabaseHealth] = useState<"checking" | "ok" | "error">("checking");
  const [retryCount, setRetryCount] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAdminAuth();

  const checkSupabaseConnection = useCallback(async () => {
    setSupabaseHealth("checking");
    
    try {
      // Intentar conexión simple con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const { error } = await supabase
        .from("board_cod_pais")
        .select("id")
        .limit(1)
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);
      setSupabaseHealth(error ? "error" : "ok");
      
      if (!error) {
        toast({
          title: "Conexión establecida",
          description: "Supabase está disponible",
        });
      }
    } catch (err) {
      console.log("Error checking Supabase:", err);
      setSupabaseHealth("error");
    }
  }, [toast]);

  useEffect(() => {
    checkSupabaseConnection();
  }, [checkSupabaseConnection, retryCount]);

  const handleRetryConnection = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: formatAuthError(error.message),
        });
        // Si falla por red, actualizar el estado de salud
        if (error.message?.toLowerCase().includes("failed to fetch")) {
          setSupabaseHealth("error");
        }
      } else {
        toast({
          title: "Bienvenido",
          description: "Has iniciado sesión correctamente",
        });
        navigate("/admin");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al iniciar sesión",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Panel de Administración</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
          
          {/* Indicador de conexión */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {supabaseHealth === "checking" && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Verificando conexión...
              </span>
            )}
            {supabaseHealth === "ok" && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <Wifi className="h-3.5 w-3.5" />
                Conectado a Supabase
              </span>
            )}
            {supabaseHealth === "error" && (
              <span className="flex items-center gap-1.5 text-sm text-destructive">
                <WifiOff className="h-3.5 w-3.5" />
                Sin conexión
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {supabaseHealth === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                Sin conexión con Supabase
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p>
                  Tu red no está pudiendo alcanzar el servidor. Prueba:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Verificar tu conexión a internet</li>
                  <li>Desactivar VPN/AdBlock</li>
                  <li>Usar otra red (móvil vs WiFi)</li>
                </ul>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetryConnection}
                  className="w-full mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar conexión
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => navigate("/admin/forgot-password")}>
              ¿Olvidaste tu contraseña?
            </Button>
          </div>

          <div className="mt-2 text-center">
            <Button variant="link" onClick={() => navigate("/")}>
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
