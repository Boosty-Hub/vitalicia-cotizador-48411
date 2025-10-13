import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  ArrowRight, 
  Shield, 
  Flame, 
  Zap, 
  Phone,
  CheckCircle,
  Wrench,
  AlertTriangle,
  Droplets,
  Users,
  Car,
  Building,
  FileText
} from "lucide-react";

const HogarPage = () => {
  const navigate = useNavigate();
  const planes = [
    {
      nombre: "Edificación",
      precio: "$6.25/mes",
      descripcion: "Protección para la estructura de tu hogar",
      caracteristicas: [
        "Edificación",
        "Vidrios y cristales",
        "Daños por agua / inundación",
        "Equipos electrónicos"
      ],
      color: "bg-blue-50 border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      nombre: "Contenido",
      precio: "$6.25/mes",
      descripcion: "Cobertura para tus bienes y pertenencias",
      caracteristicas: [
        "Contenido",
        "Vidrios y cristales",
        "Daños por agua / inundación",
        "Equipos electrónicos"
      ],
      color: "bg-green-50 border-green-200",
      buttonColor: "bg-green-600 hover:bg-green-700"
    },
    {
      nombre: "Edificación + Contenido",
      precio: "$6.25/mes",
      descripcion: "Protección integral para tu hogar",
      caracteristicas: [
        "Edificación",
        "Contenido",
        "Incendio y Extensión de Cobertura",
        "Terremoto o Temblor de Tierra",
        "Motín, Disturbios y Daños Maliciosos",
        "Daños por Agua / Gastos Exploración",
        "Inundación / Deslave",
        "RC Familiar y Vecinos",
        "Equipos Electrónicos",
        "Robo, Asalto o Atraco",
        "Hurto",
        "RC Locativo"
      ],
      color: "bg-orange-50 border-orange-200",
      buttonColor: "bg-orange-600 hover:bg-orange-700",
      popular: true
    }
  ];

  const beneficios = [
    {
      icon: <Wrench className="w-8 h-8 text-blue-600" />,
      titulo: "Gestiones Sencillas y Rápidas",
      descripcion: "Proceso de contratación y gestión de siniestros simplificado"
    },
    {
      icon: <Home className="w-8 h-8 text-green-600" />,
      titulo: "Asistencia Domiciliaria Incluida",
      descripcion: "Servicios de reparación y mantenimiento en tu hogar"
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-600" />,
      titulo: "Protección Integral",
      descripcion: "Cobertura completa que se adapta a tus necesidades"
    },
    {
      icon: <Phone className="w-8 h-8 text-purple-600" />,
      titulo: "Atención 24/7",
      descripcion: "Soporte y asistencia las 24 horas del día"
    }
  ];

  const coberturas = [
    {
      icon: <Flame className="w-6 h-6 text-red-600" />,
      titulo: "Incendio y Rayo",
      descripcion: "Protección contra incendios, rayos, explosiones y humo"
    },
    {
      icon: <Droplets className="w-6 h-6 text-blue-600" />,
      titulo: "Daños por Agua",
      descripcion: "Cobertura por daños causados por agua e inundaciones"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      titulo: "Terremoto y Temblor",
      descripcion: "Protección contra daños por movimientos sísmicos"
    },
    {
      icon: <Users className="w-6 h-6 text-green-600" />,
      titulo: "Motín y Disturbios",
      descripcion: "Cobertura por daños causados por disturbios civiles"
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-600" />,
      titulo: "Equipos Electrónicos",
      descripcion: "Protección para electrodomésticos y equipos electrónicos"
    },
    {
      icon: <Car className="w-6 h-6 text-indigo-600" />,
      titulo: "Robo y Hurto",
      descripcion: "Cobertura por robo, asalto, atraco y hurto de bienes"
    }
  ];

  const requisitos = [
    "Nombre y número de cédula o RIF del cliente",
    "Ubicación o dirección exacta del riesgo",
    "Descripción detallada de los bienes a asegurar",
    "Valor de reposición de edificación y contenido"
  ];

  return (
    <div className="min-h-screen bg-background">
      <MegaMenuHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Home className="w-16 h-16 text-white mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Combinado Residencial
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl mb-6 font-semibold">
              Asegura tu hogar y todo lo que has logrado
            </h2>
            
            <p className="text-xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
              Un plan de cobertura hecho para ti. Con opciones flexibles, puedes proteger tu propiedad, 
              tus bienes y disfrutar de la tranquilidad de estar cubierto ante cualquier situación inesperada.
            </p>
            
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-4 bg-white text-orange-700 hover:bg-white/90"
            >
              Cotizar mi Hogar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">¿Por qué elegir nuestro Combinado Residencial?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Una solución integral que se adapta a tus necesidades, protegiendo tus bienes con coberturas amplias y flexibles
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
            <h2 className="text-3xl font-bold mb-4">Planes de Combinado Residencial</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Elige la cobertura que mejor se adapte a las necesidades de tu hogar
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {planes.map((plan, index) => (
              <Card key={index} className={`relative ${plan.color} hover:shadow-xl transition-all duration-300 h-full`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-600">
                    Más Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold">{plan.nombre}</CardTitle>
                  <div className="text-2xl font-bold text-primary mt-2">{plan.precio}</div>
                  <CardDescription className="text-sm mt-2">{plan.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {plan.caracteristicas.map((caracteristica, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.buttonColor} text-white mt-4`}>
                    Cotizar {plan.nombre}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coberturas Detalladas */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Coberturas Disponibles</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Protección completa para tu hogar y tus bienes más preciados
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {coberturas.map((cobertura, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {cobertura.icon}
                    <CardTitle className="text-lg">{cobertura.titulo}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{cobertura.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bienes Asegurables */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Bienes Asegurables</h2>
              <p className="text-gray-600">
                Conoce qué puedes proteger con nuestro seguro combinado residencial
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Building className="w-6 h-6 text-blue-600" />
                    <CardTitle className="text-xl">Edificación</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">• Estructura del inmueble</p>
                  <p className="text-sm">• Instalaciones fijas</p>
                  <p className="text-sm">• Mejoras y ampliaciones</p>
                  <p className="text-sm">• Piscinas y jardines</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Home className="w-6 h-6 text-green-600" />
                    <CardTitle className="text-xl">Contenido</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">• Muebles y enseres</p>
                  <p className="text-sm">• Electrodomésticos</p>
                  <p className="text-sm">• Equipos electrónicos</p>
                  <p className="text-sm">• Objetos personales</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Requisitos */}
      <section className="py-16 bg-yellow-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <FileText className="w-8 h-8 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-bold text-yellow-800">Requisitos para Cotizar</h2>
            </div>
            
            <Card className="border-yellow-200">
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {requisitos.map((requisito, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{requisito}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para proteger tu hogar?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Obtén tu cotización personalizada y asegura lo que más valoras
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-orange-600" onClick={() => navigate('/nueva-poliza')}>
              Cotizar Ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
              Hablar con un Asesor
              <Phone className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HogarPage;
