import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const testMode = searchParams.get("test") === "true";

  const handleDirectLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: "api@boosty.digital",
        password: "Pavicumo.2025",
      });
      if (authError || !data.user) {
        setError(authError?.message || "Error de login directo");
        setIsLoading(false);
        return;
      }
      const { data: hasAdminRole } = await supabase.rpc('has_role', {
        _user_id: data.user.id,
        _role: 'admin'
      });
      if (!hasAdminRole) {
        setError("No tienes permisos de administrador.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }
      toast({ title: "Bienvenido", description: "Login directo exitoso" });
      navigate("/admin");
    } catch (err) {
      setError("Error inesperado en login directo.");
      setIsLoading(false);
    }
  };

  // Limpiar toda la sesión local para romper loops de refresh
  const handleClearSession = () => {
    // Limpiar localStorage de Supabase
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('sb-'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    toast({
      title: "Sesión limpiada",
      description: "Se eliminaron los datos de sesión local. Intenta iniciar sesión nuevamente.",
    });
    
    // Recargar la página para reiniciar todo
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Por favor ingresa email y contraseña");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      // Login directo sin timeout wrapper - más simple
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.log("Auth error:", authError);
        
        // Mensajes de error amigables
        let errorMsg = authError.message;
        if (authError.message?.toLowerCase().includes("invalid login credentials")) {
          errorMsg = "Credenciales inválidas. Verifica tu correo y contraseña.";
        } else if (authError.message?.toLowerCase().includes("failed to fetch")) {
          errorMsg = "Error de conexión. Intenta limpiar la sesión con el botón de abajo.";
        } else if (authError.message?.toLowerCase().includes("email not confirmed")) {
          errorMsg = "Tu correo no está confirmado. Contacta al administrador.";
        }
        
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError("No se pudo obtener información del usuario");
        setIsLoading(false);
        return;
      }

      // Verificar rol de admin
      const { data: hasAdminRole, error: roleError } = await supabase.rpc('has_role', {
        _user_id: data.user.id,
        _role: 'admin'
      });

      if (roleError) {
        console.log("Role check error:", roleError);
        setError("Error verificando permisos. Intenta de nuevo.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      if (!hasAdminRole) {
        setError("No tienes permisos de administrador.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      // ¡Éxito!
      toast({
        title: "Bienvenido",
        description: "Has iniciado sesión correctamente",
      });
      navigate("/admin");

    } catch (err) {
      console.log("Unexpected error:", err);
      setError("Error inesperado. Intenta limpiar la sesión.");
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
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
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
                autoComplete="email"
              />
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
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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

            {testMode && (
              <Button
                type="button"
                variant="secondary"
                className="w-full mt-2"
                onClick={handleDirectLogin}
                disabled={isLoading}
              >
                Login Directo
              </Button>
            )}
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              ¿Problemas para entrar? Limpia la sesión local:
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearSession}
              className="w-full text-muted-foreground"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar sesión y reintentar
            </Button>
          </div>

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