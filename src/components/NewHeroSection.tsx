import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, Award, Heart, Car, Plane, Home, Building } from "lucide-react";

export const NewHeroSection = () => {
  const scrollToCotizador = () => {
    const element = document.getElementById('cotizador');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Main Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-16 h-16 text-white mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Seguros La Vitalicia
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              Tu póliza a un clic. Protegemos lo que más valoras y aseguramos tu tranquilidad.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={scrollToCotizador}
                className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90 transition-all duration-300 transform hover:scale-105"
              >
                Cotizar Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary transition-all duration-300"
              >
                Conocer Más
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Users className="w-12 h-12 text-secondary" />
                </div>
                <h3 className="text-3xl font-bold mb-2">50,000+</h3>
                <p className="text-white/80">Familias Protegidas</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Award className="w-12 h-12 text-secondary" />
                </div>
                <h3 className="text-3xl font-bold mb-2">25 Años</h3>
                <p className="text-white/80">de Experiencia</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Shield className="w-12 h-12 text-secondary" />
                </div>
                <h3 className="text-3xl font-bold mb-2">99.8%</h3>
                <p className="text-white/80">Satisfacción</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Las pólizas de seguro que estás buscando
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              En Seguros La Vitalicia tenemos más de 25 años asegurando lo que te importa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Salud */}
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Cuida a quienes quieres</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Cuenta con la protección que indemniza los gastos relacionados con tratamientos médicos, 
                hospitalización y/o intervención quirúrgica para toda la familia.
              </p>
              <p className="text-sm text-primary font-semibold mb-4">Desde $45/mes</p>
              <Button variant="outline" className="w-full" onClick={scrollToCotizador}>
                Cotizar ahora
              </Button>
            </div>

            {/* Auto */}
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Llega más lejos</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Cuenta con la póliza que te ayuda a proteger tu auto y sus ocupantes, 
                frente a pérdidas parciales, totales y responsabilidad civil.
              </p>
              <p className="text-sm text-primary font-semibold mb-4">Desde $35/año</p>
              <Button variant="outline" className="w-full">
                Conoce más
              </Button>
            </div>

            {/* Viajes */}
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Plane className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Viaja tranquilo</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Asistencia médica internacional, cobertura de equipaje, cancelación de viaje 
                y repatriación sanitaria para tus aventuras.
              </p>
              <p className="text-sm text-primary font-semibold mb-4">Desde $25/viaje</p>
              <Button variant="outline" className="w-full">
                Conoce más
              </Button>
            </div>

            {/* Hogar */}
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <Home className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Amparamos tu hogar</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Protegemos el espacio donde crecen tus sueños. Cobertura amplia para 
                tu casa, apartamento y todos tus bienes.
              </p>
              <p className="text-sm text-primary font-semibold mb-4">Desde $8/mes</p>
              <Button variant="outline" className="w-full">
                Conoce más
              </Button>
            </div>

            {/* Vida */}
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Cuidamos de los tuyos</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Resguarda el futuro económico de tu familia cuando ya no estés. 
                Protégelos aún sin estar presente.
              </p>
              <p className="text-sm text-primary font-semibold mb-4">Desde $12/mes</p>
              <Button variant="outline" className="w-full">
                Conoce más
              </Button>
            </div>

            {/* Empresas */}
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <Building className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Respaldamos tu empresa</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Protegemos tu negocio frente a las adversidades para que sigas generando 
                progreso. Amplio portafolio empresarial.
              </p>
              <p className="text-sm text-primary font-semibold mb-4">Cotización personalizada</p>
              <Button variant="outline" className="w-full">
                Conoce más
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¡Tu salud merece lo mejor!
            </h2>
            <h3 className="text-2xl font-semibold mb-6">Pólizas de Salud</h3>
            <p className="text-xl mb-8 text-white/90">
              Encuentra la cobertura que se adapta a lo que necesitas, con opciones de pago 
              en cómodas cuotas y asistencia médica 24/7.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={scrollToCotizador}
              className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90"
            >
              Cotiza aquí
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};
