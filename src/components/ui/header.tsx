import { Shield } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Seguros La Vitalicia</h1>
            <p className="text-sm text-muted-foreground">Tu tranquilidad es nuestra prioridad</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#productos" className="text-muted-foreground hover:text-foreground transition-colors">
            Productos
          </a>
          <a href="#nosotros" className="text-muted-foreground hover:text-foreground transition-colors">
            Nosotros
          </a>
          <a href="#contacto" className="text-muted-foreground hover:text-foreground transition-colors">
            Contacto
          </a>
        </nav>
      </div>
    </header>
  );
};