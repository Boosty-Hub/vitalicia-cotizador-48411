import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary via-primary-dark to-secondary relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-secondary-light rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            ¿Listo para Proteger lo que Más Valoras?
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto px-4">
            Únete a más de 50,000 venezolanos que ya confían en La Vitalicia. 
            Obtén tu cotización en 2 minutos y comienza a proteger tu futuro hoy mismo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Button
              size="lg"
              onClick={() => {
                const cotizador = document.getElementById('cotizador');
                if (cotizador) {
                  cotizador.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white text-primary hover:bg-gray-100 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto group"
            >
              Cotizar Ahora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'tel:02125550123'}
              className="border-2 border-white text-white hover:bg-white hover:text-primary px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg bg-transparent backdrop-blur-sm transition-all duration-300 w-full sm:w-auto group"
            >
              <Phone className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              Llamar Ahora
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 sm:mt-12 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-white/80 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Sin Compromiso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Cotización Gratis</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
