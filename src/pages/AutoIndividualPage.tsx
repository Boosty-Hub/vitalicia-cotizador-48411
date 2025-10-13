import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { useNavigate } from "react-router-dom";
import { 
  Car, 
  ArrowRight, 
  Shield, 
  Wrench, 
  Phone, 
  MapPin,
  CheckCircle,
  AlertTriangle,
  Users,
  Truck,
  Heart
} from "lucide-react";

const AutoIndividualPage = () => {
  const navigate = useNavigate();
  const planes = [
    {
      nombre: "Responsabilidad Civil Básica",
      precio: "Desde $35/año",
      descripcion: "Protección esencial para cumplir con la ley",
      caracteristicas: [
        "Responsabilidad Civil Básica",
        "Emergencia Vial",
        "Asistencia Legal y Defensa Penal",
        "Cobertura mínima requerida por ley"
      ],
      color: "bg-blue-50 border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      tipo: "basico"
    },
    {
      nombre: "Auto Access",
      precio: "Desde $120/año",
      descripcion: "Pago Único por Robo o Hurto",
      caracteristicas: [
        "Protección contra robo o hurto del vehículo",
        "Asistencia en viajes a nivel nacional",
        "Cobertura por daños a bienes y personas (RCV básica)",
        "Emergencia vial 24/7"
      ],
      color: "bg-green-50 border-green-200",
      buttonColor: "bg-green-600 hover:bg-green-700",
      tipo: "access"
    },
    {
      nombre: "Auto Premium Classic",
      precio: "Desde $280/año",
      descripcion: "Pérdida Total CLASSIC",
      caracteristicas: [
        "Cobertura por pérdida total",
        "Motín pérdida total",
        "Pérdida catastrófica",
        "Responsabilidad civil básica",
        "Protección contra robo, hurto y choque"
      ],
      color: "bg-orange-50 border-orange-200",
      buttonColor: "bg-orange-600 hover:bg-orange-700",
      tipo: "premium",
      popular: true
    },
    {
      nombre: "Auto Premium Plus",
      precio: "Desde $420/año",
      descripcion: "Pérdida Total PLUS",
      caracteristicas: [
        "Pérdida parcial: cobertura para 1 evento parcial",
        "Pérdida total completa",
        "Motín pérdida total",
        "Pérdida catastrófica",
        "Cobertura: robo, hurto y choque"
      ],
      color: "bg-purple-50 border-purple-200",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      tipo: "plus"
    },
    {
      nombre: "Auto Elite",
      precio: "Desde $650/año",
      descripcion: "Cobertura Amplia",
      caracteristicas: [
        "Pérdida parcial: cobertura ilimitada",
        "Pérdida total completa",
        "RCV Básica y exceso de límite",
        "Muerte, incapacidad y gastos médicos",
        "Asistencia en viajes nacional",
        "Servicio de grúa e inspección"
      ],
      color: "bg-indigo-50 border-indigo-200",
      buttonColor: "bg-indigo-600 hover:bg-indigo-700",
      tipo: "elite"
    }
  ];

  const coberturas = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      titulo: "Responsabilidad Civil",
      descripcion: "Protección por daños a terceros, tanto bienes como personas"
    },
    {
      icon: <Car className="w-8 h-8 text-green-600" />,
      titulo: "Robo y Hurto",
      descripcion: "Cobertura completa en caso de robo o hurto de tu vehículo"
    },
    {
      icon: <Wrench className="w-8 h-8 text-orange-600" />,
      titulo: "Emergencia Vial",
      descripcion: "Asistencia mecánica y eléctrica las 24 horas del día"
    },
    {
      icon: <Truck className="w-8 h-8 text-red-600" />,
      titulo: "Servicio de Grúa",
      descripcion: "Remolque a nivel nacional cuando lo necesites"
    },
    {
      icon: <MapPin className="w-8 h-8 text-purple-600" />,
      titulo: "Asistencia en Viajes",
      descripcion: "Apoyo completo durante tus viajes por todo el país"
    },
    {
      icon: <Heart className="w-8 h-8 text-pink-600" />,
      titulo: "Gastos Médicos",
      descripcion: "Cobertura por lesiones en accidentes de tránsito"
    }
  ];

  const tiposCobertura = [
    {
      titulo: "Responsabilidad Civil Básico",
      descripcion: "Cumple con los requisitos mínimos legales",
      incluye: ["Daños a terceros", "Asistencia legal", "Emergencia vial"]
    },
    {
      titulo: "Responsabilidad Civil Plus",
      descripcion: "Mayor protección con límites ampliados",
      incluye: ["Exceso de límite", "Mayor cobertura", "Defensa penal ampliada"]
    },
    {
      titulo: "Pago Único por robo o hurto",
      descripcion: "Protección específica contra robo",
      incluye: ["Robo total", "Hurto de partes", "Asistencia vial"]
    },
    {
      titulo: "Pérdida Total Classic",
      descripcion: "Cobertura por pérdida total del vehículo",
      incluye: ["Choque total", "Incendio", "Eventos catastróficos"]
    },
    {
      titulo: "Pérdida Total Plus",
      descripcion: "Incluye un evento de pérdida parcial",
      incluye: ["Todo lo anterior", "1 evento parcial", "Reparaciones menores"]
    },
    {
      titulo: "Cobertura Amplia",
      descripcion: "Protección completa e ilimitada",
      incluye: ["Pérdida parcial ilimitada", "Cobertura total", "Servicios premium"]
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
              <Car className="w-16 h-16 text-white mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Seguros de Auto
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl mb-6 font-semibold">
              Protege tu tranquilidad en cada recorrido
            </h2>
            
            <p className="text-xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
              Coberturas que se ajustan a tus necesidades. Elige entre planes de Responsabilidad Civil 
              o Casco y prepárate para cualquier imprevisto en el camino.
            </p>
            
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-4 bg-white text-blue-700 hover:bg-white/90"
            >
              Cotizar mi Auto
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Planes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Planes de Seguro de Auto</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Desde protección básica hasta cobertura completa, tenemos el plan perfecto para ti
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {planes.map((plan, index) => (
              <Card key={index} className={`relative ${plan.color} hover:shadow-xl transition-all duration-300 h-full`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-600">
                    Más Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold">{plan.nombre}</CardTitle>
                  <CardDescription className="text-sm">{plan.descripcion}</CardDescription>
                  <div className="text-2xl font-bold text-primary mt-3">{plan.precio}</div>
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
                    Cotizar {plan.tipo}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coberturas Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Coberturas Disponibles</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Protección integral para tu vehículo y tu tranquilidad
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coberturas.map((cobertura, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {cobertura.icon}
                  </div>
                  <CardTitle className="text-xl">{cobertura.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{cobertura.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tipos de Cobertura Detallados */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tipos de Cobertura</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conoce en detalle cada tipo de protección que ofrecemos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {tiposCobertura.map((tipo, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700">{tipo.titulo}</CardTitle>
                  <CardDescription>{tipo.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tipo.incluye.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Información Importante */}
      <section className="py-16 bg-yellow-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-bold text-yellow-800">Información Importante</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-yellow-800">Requisitos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">• Vehículo con antigüedad máxima según el plan</p>
                  <p className="text-sm">• Licencia de conducir vigente</p>
                  <p className="text-sm">• Documentos del vehículo al día</p>
                  <p className="text-sm">• Inspección técnica vehicular</p>
                </CardContent>
              </Card>
              
              <Card className="border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-yellow-800">Proceso de Cotización</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">• Completa el formulario online</p>
                  <p className="text-sm">• Recibe tu cotización inmediata</p>
                  <p className="text-sm">• Elige tu plan preferido</p>
                  <p className="text-sm">• Activa tu póliza en minutos</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para proteger tu vehículo?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Obtén tu cotización personalizada en menos de 3 minutos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-blue-600" onClick={() => navigate('/nueva-poliza')}>
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

export default AutoIndividualPage;
