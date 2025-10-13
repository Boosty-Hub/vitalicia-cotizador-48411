import { Button } from "@/components/ui/button";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { useNavigate } from "react-router-dom";
import { Car, ArrowRight } from "lucide-react";

const AutoPage = () => {
  const navigate = useNavigate();

  const irACotizacion = () => {
    navigate('/cotizar-vehiculo');
  };

  return (
    <div className="min-h-screen bg-background">
      <MegaMenuHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Car className="w-16 h-16 text-white mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Seguro de Auto
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl mb-6 font-semibold">
              Llega más lejos con la protección que necesitas
            </h2>
            
            <p className="text-xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
              Cuenta con la póliza que te ayuda a proteger tu auto y sus ocupantes, 
              frente a pérdidas parciales, totales y responsabilidad civil.
            </p>
            
            <Button 
              size="lg" 
              variant="secondary"
              onClick={irACotizacion}
              className="text-lg px-8 py-4 bg-white text-blue-700 hover:bg-white/90"
            >
              Cotizar Auto
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Próximamente</h2>
            <p className="text-gray-600">Esta página está en construcción. Pronto tendrás acceso a toda la información sobre nuestros seguros de auto.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AutoPage;
