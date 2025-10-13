import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { InsuranceSelector } from "@/components/InsuranceSelector";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  ArrowRight, 
  Shield, 
  Users, 
  Clock, 
  Phone,
  CheckCircle,
  Star,
  Stethoscope,
  Building,
  UserCheck,
  Hospital,
  Baby,
  Plane,
  CreditCard,
  FileText
} from "lucide-react";

const SaludPage = () => {
  const navigate = useNavigate();

  const irACotizacion = () => {
    navigate('/nueva-poliza');
  };

  const planes = [
    {
      name: "Plan Básico",
      precio: "$45",
      cobertura: "$30,000",
      descripcion: "Protección esencial para ti y tu familia",
      beneficios: [
        "Consultas médicas generales",
        "Hospitalización básica",
        "Medicamentos esenciales",
        "Emergencias 24/7"
      ],
      popular: false
    },
    {
      name: "Plan Intermedio",
      precio: "$75",
      cobertura: "$50,000",
      descripcion: "Cobertura ampliada con especialistas",
      beneficios: [
        "Todo lo del Plan Básico",
        "Consultas con especialistas",
        "Exámenes diagnósticos",
        "Medicina preventiva",
        "Cobertura dental básica"
      ],
      popular: true
    },
    {
      name: "Plan Premium",
      precio: "$120",
      cobertura: "$100,000",
      descripcion: "Máxima protección y beneficios exclusivos",
      beneficios: [
        "Todo lo del Plan Intermedio",
        "Cirugías complejas",
        "Tratamientos oncológicos",
        "Habitación privada",
        "Cobertura internacional de emergencia"
      ],
      popular: false
    }
  ];

  const beneficios = [
    {
      icon: Hospital,
      titulo: "Red de Clínicas",
      descripcion: "Contamos con una amplia y variada Red de Clínicas afiliadas con alcance nacional, consúltala desde nuestra web o la aplicación móvil."
    },
    {
      icon: Baby,
      titulo: "Maternidad",
      descripcion: "Si tienes un nacimiento múltiple y adquiriste la cobertura de maternidad contarás con un incremento del 50% de la suma asegurada contratada."
    },
    {
      icon: Users,
      titulo: "Cobertura para menores de edad",
      descripcion: "Como titulares de la póliza con todos los beneficios de nuestra póliza Salud. Aplica para Salud Individual en moneda extranjera."
    },
    {
      icon: Plane,
      titulo: "Cobertura de Asistencia en Viaje",
      descripcion: "Sin deducible, incluye gastos médicos por accidente o enfermedad en el exterior, coberturas para las personas, el equipaje y los efectos personales."
    },
    {
      icon: Shield,
      titulo: "Cobertura Básica y de Exceso para Covid-19",
      descripcion: "Están cubiertos los gastos generados por tratamiento médico, servicios hospitalarios, medicamentos y equipos especiales."
    },
    {
      icon: CreditCard,
      titulo: "Métodos de pago",
      descripcion: "Puedes pagar la prima semestral, cuatrimestral y trimestral con múltiples opciones de pago disponibles."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <MegaMenuHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Heart className="w-16 h-16 text-white mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Pólizas de Salud
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl mb-6 font-semibold">
              Protege tu salud y la de los tuyos en todo momento
            </h2>
            
            <p className="text-xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
              Las pólizas de Salud de Seguros La Vitalicia, cuidan de ti y los tuyos con sólido respaldo, 
              a través de coberturas para gastos médicos (tratamientos médicos, hospitalización y/o intervención quirúrgica), 
              asistencia en viaje y más.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={irACotizacion}
                className="text-lg px-8 py-4 bg-white text-red-700 hover:bg-white/90"
              >
                Cotizar Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-red-700"
              >
                Ver Beneficios
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cuida lo que más importa */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cuida lo que más importa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestras pólizas de Salud te brindan la tranquilidad que necesitas para cuidar de ti y tu familia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {planes.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-red-500 shadow-xl' : 'shadow-lg'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-red-500 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-red-600">
                      {plan.precio}<span className="text-sm text-gray-500">/mes</span>
                    </div>
                    <p className="text-sm text-gray-600">Cobertura hasta {plan.cobertura}</p>
                  </div>
                  <CardDescription>{plan.descripcion}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.beneficios.map((beneficio, bIndex) => (
                      <li key={bIndex} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={plan.popular ? "default" : "outline"} 
                    className="w-full"
                    onClick={irACotizacion}
                  >
                    Cotizar {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Las pólizas de salud y sus beneficios */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Las pólizas de salud y sus beneficios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre todos los beneficios que tenemos para ti y tu familia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {beneficios.map((beneficio, index) => (
              <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                      <beneficio.icon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{beneficio.titulo}</h3>
                  </div>
                  <p className="text-gray-600">{beneficio.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios adicionales */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Es fácil solicitar nuestros servicios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gestiona tu póliza de salud de manera rápida y sencilla
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <FileText className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Carta Aval</h3>
              <p className="text-sm text-gray-600 mb-4">Solicita tu carta aval en línea</p>
              <Button variant="outline" size="sm" className="w-full">
                Solicitar
              </Button>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CreditCard className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Reembolso</h3>
              <p className="text-sm text-gray-600 mb-4">Solicita el reembolso de gastos</p>
              <Button variant="outline" size="sm" className="w-full">
                Solicitar
              </Button>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Hospital className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Buscar Clínicas</h3>
              <p className="text-sm text-gray-600 mb-4">Encuentra clínicas afiliadas</p>
              <Button variant="outline" size="sm" className="w-full">
                Buscar
              </Button>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <Phone className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Emergencias</h3>
              <p className="text-sm text-gray-600 mb-4">Línea de emergencias 24/7</p>
              <Button variant="outline" size="sm" className="w-full">
                <Phone className="w-4 h-4 mr-1" />
                Llamar
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para proteger tu salud?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Obtén tu cotización personalizada en menos de 3 minutos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={irACotizacion}
                className="text-lg px-8 py-4 bg-white text-red-700 hover:bg-white/90"
              >
                Cotizar Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-red-700"
              >
                <Phone className="mr-2 w-5 h-5" />
                Hablar con Asesor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">Seguros La Vitalicia</h4>
              <p className="text-sm text-gray-400">
                25 años protegiendo a las familias venezolanas con los mejores seguros del mercado.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Productos</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="/salud" className="text-gray-400 hover:text-white">Seguro de Salud</a></li>
                <li><a href="/auto" className="text-gray-400 hover:text-white">Seguro de Vehículo</a></li>
                <li><a href="/viajes" className="text-gray-400 hover:text-white">Seguro de Viaje</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Atención al Cliente</h5>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-400">0212-555-0123</li>
                <li className="text-gray-400">info@seguroslavitalicia.com</li>
                <li className="text-gray-400">Lun - Vie: 8AM - 6PM</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Términos y Condiciones</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Política de Privacidad</a></li>
                <li className="text-gray-400">SUDEASEG: TVP-001234</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 Seguros La Vitalicia. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SaludPage;
