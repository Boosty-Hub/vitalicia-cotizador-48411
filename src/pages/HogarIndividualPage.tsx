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
  Smartphone,
  FileText,
  Clock,
  DollarSign,
  Eye,
  Settings
} from "lucide-react";

const HogarIndividualPage = () => {
  const navigate = useNavigate();

  const beneficios = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      titulo: "Protección Amplia",
      descripcion: "Propiedades, bienes, equipos electrónicos, responsabilidad civil y accidentes personales"
    },
    {
      icon: <Settings className="w-8 h-8 text-green-600" />,
      titulo: "Flexibilidad",
      descripcion: "Elige las coberturas opcionales que desees: robo, terremoto, inundación y más"
    },
    {
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      titulo: "Proceso Simplificado",
      descripcion: "Llenado automático de solicitud y no requiere inventario de bienes"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-orange-600" />,
      titulo: "Incremento Automático",
      descripcion: "Incremento automático por inflación de la suma asegurada de la propiedad"
    },
    {
      icon: <Wrench className="w-8 h-8 text-red-600" />,
      titulo: "Asistencia al Hogar",
      descripcion: "Servicios de plomería, electricidad, cerrajería, seguridad y rotura de cristales"
    },
    {
      icon: <Clock className="w-8 h-8 text-indigo-600" />,
      titulo: "Servicio 24/7",
      descripcion: "Asistencia disponible las 24 horas, los 365 días del año"
    }
  ];

  const coberturasBasicas = [
    {
      icon: <Flame className="w-6 h-6 text-red-600" />,
      titulo: "Incendio y Explosión",
      descripcion: "Incendio, explosión, caída de aeronave u objetos desprendidos"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      titulo: "Motín y Disturbios",
      descripcion: "Motín, disturbios populares, disturbios laborales y daños maliciosos"
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      titulo: "Rayo",
      descripcion: "Rayo, sea que produzca incendio o no, humo y hollín"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      titulo: "Extensión de Cobertura",
      descripcion: "Huracán, ventarrón, tempestad, tornados, ciclón, impacto de vehículos"
    },
    {
      icon: <Droplets className="w-6 h-6 text-blue-600" />,
      titulo: "Daños por Agua",
      descripcion: "Derrames, anegamientos, filtraciones, goteras o vapor de agua"
    },
    {
      icon: <Building className="w-6 h-6 text-green-600" />,
      titulo: "Caída de Estructuras",
      descripción: "Antenas, cables, torres, postes, árboles, muros de terceros"
    }
  ];

  const coberturasComplementarias = [
    "Rotura accidental de accesorios sanitarios",
    "Pérdida o daños de jardines ornamentales",
    "Rotura accidental de bienes nuevos durante traslado",
    "Gastos de hospedaje o pago de alquiler",
    "Gastos de mudanza por desocupación",
    "Honorarios de arquitectos, topógrafos e ingenieros",
    "Gastos de demolición, remoción o limpieza",
    "Traslado de bienes incluyendo choque y vuelco",
    "Pérdidas de alimentos refrigerados por fallas eléctricas"
  ];

  const coberturasOpcionales = [
    {
      titulo: "Robo, asalto, atraco y hurto",
      descripcion: "Protección contra actos delictivos"
    },
    {
      titulo: "Terremoto o temblor de tierra",
      descripcion: "Cobertura por movimientos sísmicos"
    },
    {
      titulo: "Infidelidad de empleado doméstico",
      descripcion: "Protección contra actos deshonestos"
    },
    {
      titulo: "Rotura de vidrios, espejos y cristales",
      descripcion: "Reposición de elementos de vidrio"
    },
    {
      titulo: "Inundación",
      descripcion: "Daños por desbordamientos de agua"
    },
    {
      titulo: "Tarjetas de crédito o débito",
      descripcion: "Protección por uso fraudulento"
    },
    {
      titulo: "Daños internos a equipos electrónicos",
      descripcion: "Cobertura especializada para electrónicos"
    },
    {
      titulo: "Responsabilidad civil del hogar",
      descripcion: "Riesgo locativo y riesgo ante vecinos"
    },
    {
      titulo: "Accidentes personales",
      descripcion: "Muerte accidental, invalidez, gastos médicos y entierro"
    }
  ];

  const serviciosAsistencia = [
    {
      servicio: "Plomería",
      descripcion: "Reparaciones de tuberías, grifos y sistemas de agua"
    },
    {
      servicio: "Electricidad", 
      descripcion: "Problemas eléctricos y instalaciones"
    },
    {
      servicio: "Cerrajería",
      descripcion: "Apertura de puertas y reparación de cerraduras"
    },
    {
      servicio: "Seguridad",
      descripcion: "Servicios de seguridad para el hogar"
    },
    {
      servicio: "Rotura de vidrios",
      descripcion: "Reposición de vidrios y cristales"
    }
  ];

  const clausulasNoOnerosas = [
    "Valor de reposición a nuevo",
    "Restauración por daños a la edificación", 
    "Restitución automática de la suma asegurada",
    "Remoción temporal",
    "Portadores externos de datos"
  ];

  const appFuncionalidades = [
    "Consulta y paga tus pólizas",
    "Consulta Siniestros", 
    "Revisa estatus de tus trámites"
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
                Póliza de Seguro para el Hogar
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl mb-6 font-semibold">
              Tu casa protegida con La Vitalicia
            </h2>
            
            <p className="text-xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
              Ampara tu patrimonio y protégelo contra los imprevistos. 
              Protección amplia de propiedades, bienes, equipos electrónicos y responsabilidad civil.
            </p>
            
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-4 bg-white text-orange-700 hover:bg-white/90"
            >
              Solicitar Póliza de Hogar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Con la póliza de Hogar disfruta de los siguientes beneficios</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Protección integral diseñada para cuidar tu hogar y tu tranquilidad
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* Coberturas Básicas */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Conoce las coberturas básicas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Protección fundamental incluida en tu póliza de hogar
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {coberturasBasicas.map((cobertura, index) => (
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

      {/* Coberturas Complementarias */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Coberturas complementarias</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Incluidas en la cobertura básica sin costo adicional
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {coberturasComplementarias.map((cobertura, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{cobertura}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Coberturas Opcionales */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Coberturas opcionales</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Personaliza tu protección con coberturas adicionales
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {coberturasOpcionales.map((cobertura, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-700">{cobertura.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{cobertura.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Asistencia al Hogar */}
      <section className="py-16 bg-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-orange-800">Asistencia al Hogar</h2>
            <p className="text-orange-700 max-w-2xl mx-auto">
              Cobertura opcional que te ofrece servicios las 24 horas, los 365 días del año
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {serviciosAsistencia.map((servicio, index) => (
              <Card key={index} className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Wrench className="w-6 h-6 text-orange-600" />
                    <CardTitle className="text-lg">{servicio.servicio}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{servicio.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Card className="max-w-2xl mx-auto border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <Phone className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-orange-800 mb-2">
                  ¿Servicios de plomería, cerrajería, electricidad, rotura de vidrios y seguridad?
                </h3>
                <p className="text-orange-700 mb-4">
                  Protégete with la cobertura opcional de Asistencia al hogar
                </p>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Solicitar Asistencia
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cláusulas No Onerosas */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Más protección con la inclusión automática de cláusulas no onerosas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Beneficios adicionales incluidos automáticamente en tu póliza
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {clausulasNoOnerosas.map((clausula, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <span className="text-lg text-green-800 font-medium">{clausula}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* App Asegurados */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <Smartphone className="w-12 h-12 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Protege tu hogar en un clic</h2>
              <h3 className="text-xl font-semibold text-orange-700 mb-6">App Asegurados</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Funcionalidades disponibles:</h4>
                <ul className="space-y-3">
                  {appFuncionalidades.map((funcionalidad, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <span>{funcionalidad}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Smartphone className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Descarga la App</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Disponible para iOS y Android
                    </p>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      Descargar App
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Prevención */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Droplets className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">
              Los daños por lluvias pueden afectar tu hogar
            </h2>
            <p className="text-lg text-blue-700 mb-8 leading-relaxed">
              Sé prevenido, adquiere tu póliza hoy y protege tu patrimonio contra los imprevistos climáticos
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Adquiere tu póliza hoy
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para proteger tu hogar?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Solicita tu póliza de hogar hoy y ampara tu patrimonio contra los imprevistos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-orange-600">
              Solicitar Póliza
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
              Hablar con un Intermediario
              <Phone className="ml-2 w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-white/80 mt-6">
            Aprobada por la SUDEASEG bajo el código TVP-2025-0624
          </p>
        </div>
      </section>
    </div>
  );
};

export default HogarIndividualPage;
