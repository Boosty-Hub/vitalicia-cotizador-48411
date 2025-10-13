import { VehicleQuoter } from "@/components/quoters/VehicleQuoter";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CotizarVehiculoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <MegaMenuHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6 text-primary hover:text-primary-dark transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cotización de Seguro de Vehículo
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Obtén la mejor cobertura para tu vehículo en minutos
            </p>
          </div>
          
          <VehicleQuoter />
        </div>
      </div>
    </div>
  );
};

export default CotizarVehiculoPage;
