import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] bg-gradient-hero flex items-center justify-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-secondary rounded-full blur-lg" />
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Tu <span className="text-secondary-light">Seguridad</span> es Nuestra{" "}
            <span className="text-secondary-light">Prioridad</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Cotiza y contrata seguros de salud, vehículos y viajes en menos de 3 minutos. 
            Rápido, fácil y confiable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => document.getElementById('cotizador')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Comenzar Cotización
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Conocer Más
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span className="text-sm">+50,000 clientes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span className="text-sm">25 años de experiencia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <span className="text-sm">Cotización en 2 minutos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};