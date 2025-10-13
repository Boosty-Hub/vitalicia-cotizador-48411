import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  ArrowRight, 
  Shield, 
  Heart, 
  Phone,
  CheckCircle,
  Building,
  UserCheck,
  Hospital,
  Stethoscope,
  Clock,
  Globe,
  Truck,
  FileText
} from "lucide-react";

const SaludColectivaPage = () => {
  const navigate = useNavigate();
  const planes = [
    {
      nombre: "Básico Empresarial",
      precio: "Desde $25/empleado/mes",
      descripcion: "Cobertura esencial para equipos pequeños",
      caracteristicas: [
        "Consultas medicas generales",
        "Emergencias medicas",
        "Medicamentos basicos",
        "Examenes de laboratorio",
        "Red de clinicas afiliadas"
      ],
      color: "bg-blue-50 border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      nombre: "Premium Empresarial",
      precio: "Desde $45/empleado/mes",
      descripcion: "Cobertura completa para empresas medianas",
      caracteristicas: [
        "Todo lo del plan Basico",
        "Especialistas medicos",
        "Cirugias ambulatorias",
        "Hospitalizacion",
        "Maternidad y pediatria",
        "Medicina preventiva"
      ],
      color: "bg-green-50 border-green-200",
      buttonColor: "bg-green-600 hover:bg-green-700",
      popular: true
    },
    {
      nombre: "Elite Empresarial",
      precio: "Desde $75/empleado/mes",
      descripcion: "Cobertura premium para grandes corporaciones",
      caracteristicas: [
        "Todo lo del plan Premium",
        "Cirugias mayores",
        "Tratamientos especializados",
        "Medicina internacional",
        "Chequeos ejecutivos",
        "Telemedicina 24/7",
        "Cobertura familiar extendida"
      ],
      color: "bg-purple-50 border-purple-200",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  const beneficios = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      titulo: "Cobertura Grupal",
      descripcion: "Protege a todos tus empleados y sus familias con un solo plan"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      titulo: "Sin Examen Medico",
      descripcion: "Cobertura inmediata sin requisitos medicos previos para grupos"
    },
    {
      icon: <Hospital className="w-8 h-8 text-red-600" />,
      titulo: "Red Nacional",
      descripcion: "Acceso a la mejor red de hospitales y clinicas del pais"
    },
    {
      icon: <Truck className="w-8 h-8 text-orange-600" />,
      titulo: "Emergencias 24/7",
      descripcion: "Atencion de emergencia las 24 horas, todos los dias del ano"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <MegaMenuHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Building className="w-16 h-16 text-white mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Salud Colectiva
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl mb-6 font-semibold">
              Protege la salud de tu equipo de trabajo
            </h2>
            
            <p className="text-xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
              Ofrecemos planes de salud colectiva diseñados especialmente para empresas. 
              Cuida a tus empleados con coberturas médicas integrales y accesibles.
            </p>
            
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-4 bg-white text-blue-700 hover:bg-white/90"
            >
              Cotizar para mi Empresa
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">¿Por qué elegir nuestro Seguro de Salud Colectiva?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Diseñado especialmente para empresas que valoran el bienestar de sus empleados
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
            <h2 className="text-3xl font-bold mb-4">Planes de Salud Colectiva</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte al tamaño y necesidades de tu empresa
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {planes.map((plan, index) => (
              <Card key={index} className={`relative ${plan.color} hover:shadow-xl transition-all duration-300`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600">
                    Más Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">{plan.nombre}</CardTitle>
                  <CardDescription className="text-lg">{plan.descripcion}</CardDescription>
                  <div className="text-3xl font-bold text-primary mt-4">{plan.precio}</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.caracteristicas.map((caracteristica, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.buttonColor} text-white`}>
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
            <h2 className="text-3xl font-bold mb-4">Coberturas Incluidas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Protección integral para la salud de tus empleados
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-lg">Consultas Médicas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Consultas con médicos generales y especialistas en nuestra red de profesionales.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Hospital className="w-6 h-6 text-red-600" />
                  <CardTitle className="text-lg">Hospitalización</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Cobertura completa para internamiento en hospitales de nuestra red nacional.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Truck className="w-6 h-6 text-orange-600" />
                  <CardTitle className="text-lg">Emergencias</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Atención inmediata en casos de emergencia, disponible 24/7 en todo el país.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 text-pink-600" />
                  <CardTitle className="text-lg">Maternidad</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Cobertura completa para embarazo, parto y cuidados postnatales.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-green-600" />
                  <CardTitle className="text-lg">Medicina Preventiva</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Chequeos regulares y programas de prevención para mantener la salud.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Phone className="w-6 h-6 text-purple-600" />
                  <CardTitle className="text-lg">Telemedicina</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Consultas médicas virtuales disponibles las 24 horas del día.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para proteger a tu equipo?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Obtén una cotización personalizada para tu empresa en menos de 5 minutos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-blue-600" onClick={() => navigate('/nueva-cotizacion-empresa')}>
              Cotizar Ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Hablar con un Asesor
              <Phone className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SaludColectivaPage;
