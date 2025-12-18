import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Email inválido"),
});

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Correo enviado",
          description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al enviar el correo",
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
          <CardTitle className="text-2xl font-bold">
            {emailSent ? "Correo Enviado" : "Recuperar Contraseña"}
          </CardTitle>
          <CardDescription>
            {emailSent
              ? "Hemos enviado un enlace a tu correo electrónico"
              : "Ingresa tu correo para recibir un enlace de recuperación"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Revisa tu bandeja de entrada (y spam) en <strong>{email}</strong>.
                El enlace expira en 1 hora.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                Enviar a otro correo
              </Button>
            </div>
          ) : (
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
                  className={error ? "border-destructive" : ""}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace de recuperación"
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => navigate("/admin/login")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
