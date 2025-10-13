import { AdvancedHealthQuoter } from "@/components/quoters/AdvancedHealthQuoter";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CotizarSaludPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <MegaMenuHeader />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-4 sm:mb-6 text-primary hover:text-primary-dark transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver al inicio</span>
            <span className="sm:hidden">Volver</span>
          </Button>
          
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              Cotización de Seguro de Salud
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Completa el formulario para obtener tu cotización personalizada
            </p>
          </div>
          
          <AdvancedHealthQuoter />
        </div>
      </div>
    </div>
  );
};

export default CotizarSaludPage;
