import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building2, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Accesos rápidos a las funciones principales</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
      </div>
    </div>
  );
}
