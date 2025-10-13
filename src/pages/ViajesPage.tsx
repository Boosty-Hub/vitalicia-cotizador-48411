import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { useNavigate } from "react-router-dom";
import { 
  Plane, 
  ArrowRight, 
  Shield, 
  Heart, 
  Phone,
  CheckCircle,
  MapPin,
  Clock,
  Users,
  Globe,
  Luggage,
  CreditCard,
  Stethoscope
} from "lucide-react";

const ViajesPage = () => {
  const navigate = useNavigate();
  const irACotizacion = () => {
    navigate('/nueva-poliza');
  };
  const planes = [
    {
      nombre: "Access 30",
      cobertura: "USD 30,000",
      europa: "EU 30,000",
      precio: "Desde $45",
      descripcion: "Protección esencial para viajeros",
      caracteristicas: [
        "Cobertura médica hasta USD 30,000 para emergencias",
        "Condiciones preexistentes cubiertas",
        "Asistencia para cancelación y retrasos",
        "Indemnización por pérdida de equipaje",
        "Acceso a salas VIP en caso de retrasos",
        "Soporte global 24/7"
      ],
      color: "bg-blue-50 border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      nombre: "Premium 50",
      cobertura: "USD 50,000",
      precio: "Desde $75",
      descripcion: "Cobertura intermedia para mayor tranquilidad",
      caracteristicas: [
        "Cobertura médica hasta USD 50,000",
        "Emergencias y condiciones preexistentes",
        "Protección frente a cancelaciones y demoras",
        "Indemnización garantizada por equipaje",
        "Acceso a salas VIP en retrasos",
        "Soporte internacional las 24 horas"
      ],
      color: "bg-green-50 border-green-200",
      buttonColor: "bg-green-600 hover:bg-green-700",
      popular: true
    },
    {
      nombre: "Premium 75",
      cobertura: "USD 75,000",
      precio: "Desde $95",
      descripcion: "Protección avanzada para viajeros exigentes",
      caracteristicas: [
        "Cobertura médica hasta USD 75,000",
        "Emergencias y condiciones preexistentes",
        "Soluciones para cancelaciones y retrasos",
        "Indemnización por equipaje perdido o dañado",
        "Acceso a salas VIP en retrasos",
        "Asistencia permanente mundial"
      ],
      color: "bg-orange-50 border-orange-200",
      buttonColor: "bg-orange-600 hover:bg-orange-700"
    },
    {
      nombre: "Elite 100",
      cobertura: "USD 100,000",
      precio: "Desde $125",
      descripcion: "Máxima protección para cualquier destino",
      caracteristicas: [
        "Cobertura médica hasta USD 100,000",
        "Emergencias y condiciones preexistentes",
        "Cobertura completa frente a cancelaciones",
        "Indemnización premium por equipaje",
        "Acceso a salas VIP en retrasos",
        "Soporte global 24/7 premium"
      ],
      color: "bg-purple-50 border-purple-200",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  const beneficios = [
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      titulo: "Cobertura Médica",
      descripcion: "Atención médica de emergencia en cualquier parte del mundo"
    },
    {
      icon: <Luggage className="w-8 h-8 text-blue-600" />,
      titulo: "Protección de Equipaje",
      descripcion: "Indemnización por pérdida, daño o retraso de equipaje"
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      titulo: "Cancelación de Viaje",
      descripcion: "Reembolso por cancelaciones por causas cubiertas"
    },
    {
      icon: <Phone className="w-8 h-8 text-purple-600" />,
      titulo: "Asistencia 24/7",
      descripcion: "Soporte telefónico las 24 horas en cualquier lugar del mundo"
    }
  ];

  const caracteristicas = [
    {
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      titulo: "Contratación Global",
      descripcion: "Contrata tu póliza desde cualquier lugar del mundo con protección global"
    },
    {
      icon: <MapPin className="w-6 h-6 text-green-600" />,
      titulo: "Cobertura Internacional",
      descripcion: "La cobertura inicia al salir del país de origen con sello vigente en pasaporte"
    },
    {
      icon: <Users className="w-6 h-6 text-orange-600" />,
      titulo: "Todas las Edades",
      descripcion: "Disponible para todas las edades, incluyendo adultos mayores hasta 99 años"
    },
    {
      icon: <CreditCard className="w-6 h-6 text-purple-600" />,
      titulo: "Contratación Flexible",
      descripcion: "Opciones de pago flexibles y proceso de contratación sencillo"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <MegaMenuHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Plane className="w-16 h-16 text-white mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Seguro de Asistencia en Viajes
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl mb-6 font-semibold">
              Tu compañero de viaje perfecto
            </h2>
            
            <p className="text-xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
              Protege cada aventura, ya sea un viaje ocasional o múltiples escapadas al año. 
              Nuestra póliza se adapta a tus necesidades con coberturas flexibles y beneficios únicos.
            </p>
            
            <Button 
              size="lg" 
              variant="secondary"
              onClick={irACotizacion}
              className="text-lg px-8 py-4 bg-white text-green-700 hover:bg-white/90"
            >
              Cotizar mi Viaje
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">¿Por qué elegir nuestro Seguro de Viajes?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Protección integral para que disfrutes cada momento de tu viaje sin preocupaciones
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {beneficios.map((beneficio, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {beneficio.icon}
                  </div>
                  <CardTitle className="text-xl">{beneficio.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{beneficio.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Planes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Planes de Seguro de Viajes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tu destino y tipo de viaje
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {planes.map((plan, index) => (
              <Card key={index} className={`relative ${plan.color} hover:shadow-xl transition-all duration-300 h-full`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600">
                    Más Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold">{plan.nombre}</CardTitle>
                  <div className="text-2xl font-bold text-primary mt-2">{plan.cobertura}</div>
                  {plan.europa && (
                    <div className="text-lg text-gray-600">{plan.europa}</div>
                  )}
                  <CardDescription className="text-sm mt-2">{plan.descripcion}</CardDescription>
                  <div className="text-xl font-bold text-green-600 mt-3">{plan.precio}</div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {plan.caracteristicas.map((caracteristica, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs">{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.buttonColor} text-white mt-4`}
                    onClick={irACotizacion}
                  >
                    Cotizar {plan.nombre}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Características Especiales */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Características Especiales</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Beneficios únicos que hacen la diferencia en tu experiencia de viaje
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {caracteristicas.map((caracteristica, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {caracteristica.icon}
                    <CardTitle className="text-lg">{caracteristica.titulo}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{caracteristica.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coberturas Detalladas */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Coberturas Incluidas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Protección completa para todos los aspectos de tu viaje
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Stethoscope className="w-6 h-6 text-red-600" />
                  <CardTitle className="text-lg">Emergencias Médicas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Cobertura médica completa para emergencias y condiciones preexistentes durante tu viaje.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Luggage className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-lg">Equipaje y Pertenencias</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Indemnización por pérdida, daño o retraso de equipaje y pertenencias personales.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-green-600" />
                  <CardTitle className="text-lg">Cancelación y Retrasos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Protección financiera por cancelaciones de viaje y compensación por retrasos de vuelos.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <CardTitle className="text-lg">Acceso a Salas VIP</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Acceso gratuito a salas VIP en aeropuertos en caso de retrasos prolongados.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Phone className="w-6 h-6 text-orange-600" />
                  <CardTitle className="text-lg">Asistencia 24/7</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Soporte telefónico las 24 horas en cualquier parte del mundo en tu idioma.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-indigo-600" />
                  <CardTitle className="text-lg">Cobertura Mundial</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Protección válida en cualquier país del mundo, incluyendo Europa y Estados Unidos.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para tu próxima aventura?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Obtén tu seguro de viaje en minutos y viaja con total tranquilidad
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-green-600"
              onClick={irACotizacion}
            >
              Cotizar Ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              Hablar con un Asesor
              <Phone className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ViajesPage;
