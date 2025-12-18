import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building2, ArrowRight, Upload, ExternalLink } from "lucide-react";

export default function AdminDashboardPage() {
  const cargaBeraUrl = `${window.location.origin}/carga-bera`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(cargaBeraUrl);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Accesos rápidos a las funciones principales</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Activar Póliza Natural</CardTitle>
                <CardDescription>Registro de pólizas para personas naturales</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/activar-poliza-natural">
                Ir a Activación
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-secondary/50">
                <Building2 className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle>Activar Póliza Jurídica</CardTitle>
                <CardDescription>Registro de pólizas para personas jurídicas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/activar-poliza-juridica">
                Ir a Activación
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-dashed border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Carga BERA (Fábricas)</CardTitle>
                <CardDescription>Página pública para carga de motos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-2 bg-muted rounded text-xs font-mono truncate">
              {cargaBeraUrl}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1">
                Copiar URL
              </Button>
              <Button asChild size="sm" className="flex-1">
                <a href="/carga-bera" target="_blank" rel="noopener noreferrer">
                  Abrir
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
