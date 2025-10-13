import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { HeroSlider } from "@/components/HeroSlider";
import { InsuranceSelector } from "@/components/InsuranceSelector";
import { BenefitsSection } from "@/components/BenefitsSection";
import { StatsSection } from "@/components/StatsSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <MegaMenuHeader />
      <HeroSlider />
      <InsuranceSelector />
      <BenefitsSection />
      <StatsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      
      {/* Footer - Mobile Optimized */}
      <footer className="bg-foreground text-background py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Seguros La Vitalicia</h4>
              <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                25 años protegiendo a las familias venezolanas con los mejores seguros del mercado.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Productos</h5>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Seguro de Salud</a></li>
                <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Seguro de Vehículo</a></li>
                <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Seguro de Viaje</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Atención al Cliente</h5>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="opacity-80">0212-555-0123</li>
                <li className="opacity-80 break-all">info@seguroslavitalicia.com</li>
                <li className="opacity-80">Lun - Vie: 8AM - 6PM</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Legal</h5>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Términos y Condiciones</a></li>
                <li><a href="#" className="opacity-80 hover:opacity-100 transition-opacity">Política de Privacidad</a></li>
                <li className="opacity-80">SUDEASEG: TVP-001234</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm opacity-80">
            © 2024 Seguros La Vitalicia. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
