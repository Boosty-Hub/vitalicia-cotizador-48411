import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
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

  if (msg.includes("failed to fetch") || msg.includes("name_not_resolved")) {
    return "No se pudo conectar con Supabase (ERR_NAME_NOT_RESOLVED). Revisa tu DNS/VPN o bloqueadores de red e intenta de nuevo.";
  }
  if (msg.includes("timeout") || msg.includes("aborted")) {
    return "La conexión con Supabase está tardando demasiado. Verifica tu red/VPN e intenta nuevamente.";
  }

  // Supabase suele responder 400 en /token con códigos como email_not_confirmed
  if (msg.includes("email_not_confirmed") || (msg.includes("email") && msg.includes("not confirmed"))) {
    return "Tu correo aún no está confirmado. Revisa tu bandeja de entrada o pídele a un administrador que lo confirme en Supabase.";
  }

  if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
    return "Credenciales inválidas. Verifica el correo/contraseña. Si el usuario es nuevo, primero debe confirmar el correo.";
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
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAdminAuth();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { error } = await supabase.from("board_cod_pais").select("id").limit(1);
        if (cancelled) return;
        setSupabaseHealth(error ? "error" : "ok");
      } catch {
        if (cancelled) return;
        setSupabaseHealth("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);


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
        </CardHeader>
        <CardContent>
          {supabaseHealth === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Sin conexión con Supabase</AlertTitle>
              <AlertDescription>
                Tu red/DNS no está pudiendo resolver o alcanzar el servidor de Supabase.
                Prueba desactivar VPN/AdBlock o usar otra red.
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
