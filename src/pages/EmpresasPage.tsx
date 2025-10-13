import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { 
  Building2, 
  ArrowRight, 
  Shield, 
  Flame, 
  Zap, 
  Phone,
  CheckCircle,
  Wrench,
  AlertTriangle,
  FileText,
  Users,
  Truck,
  DollarSign,
  Calculator,
  Clock,
  Target,
  Settings
} from "lucide-react";

const EmpresasPage = () => {
  const beneficios = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      titulo: "Cobertura Amplia",
      descripcion: "Protección frente a múltiples eventos: incendio, rayo, explosión, humo, remoción de escombros"
    },
    {
      icon: <Settings className="w-8 h-8 text-green-600" />,
      titulo: "Flexibilidad",
      descripcion: "Elige las coberturas opcionales que desees: robo, asalto, terremotos, daños por agua"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      titulo: "Asesoría Especializada",
      descripcion: "Asesoría profesional para agilizar cualquier trámite y evaluación de riesgos"
    },
    {
      icon: <Calculator className="w-8 h-8 text-orange-600" />,
      titulo: "Sistema Ágil",
      descripcion: "Cálculo rápido sobre modificaciones de valores asegurables cuando lo desees"
    },
    {
      icon: <Clock className="w-8 h-8 text-red-600" />,
      titulo: "Revalorización Automática",
      descripcion: "Al momento de renovar una póliza sin necesidad de inspección"
    },
    {
      icon: <Phone className="w-8 h-8 text-indigo-600" />,
      titulo: "Servicio de Asistencia",
      descripcion: "Asistencia a la empresa disponible las 24 horas del día"
    }
  ];

  const coberturasBasicas = [
    {
      icon: <Flame className="w-6 h-6 text-red-600" />,
      titulo: "Incendio",
      descripcion: "Protección contra incendios y sus consecuencias"
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      titulo: "Rayo o Relámpago",
      descripcion: "Daños causados por descargas eléctricas atmosféricas"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      titulo: "Explosión",
      descripcion: "Sea que cause incendio o no"
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      titulo: "Impacto de Vehículos",
      descripcion: "Daños por impacto de vehículos terrestres"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      titulo: "Huracán y Ventarrón",
      descripcion: "Protección contra fenómenos meteorológicos"
    },
    {
      icon: <Building2 className="w-6 h-6 text-purple-600" />,
      titulo: "Caída de Estructuras",
      descripcion: "Antenas, torres, postes, árboles y estructuras de terceros"
    }
  ];

  const coberturasOpcionales = [
    "Robo, asalto o atraco y daños al local",
    "Daños por agua",
    "Inundación",
    "Motín, disturbios laborales o daños maliciosos",
    "Terremoto o temblor de tierra",
    "Rotura de vidrios y anuncios",
    "Deterioro de bienes refrigerados o congelados",
    "Pérdida de renta",
    "Mercancía en tránsito",
    "Pérdidas Indirectas en exceso de la cobertura básica",
    "Gastos Adicionales hasta 10%",
    "Gastos por alquileres",
    "Gastos extraordinarios"
  ];

  const ramosTecnicos = [
    {
      titulo: "Ramos Técnicos de Ingeniería",
      descripcion: "Coberturas especializadas para proyectos de construcción e ingeniería"
    },
    {
      titulo: "Fidelidad, Dinero y Falsificación",
      descripcion: "Protección contra fraudes internos y externos"
    },
    {
      titulo: "Responsabilidad Civil Extracontractual",
      descripcion: "Cobertura por daños a terceros en el desarrollo de actividades"
    },
    {
      titulo: "Cobertura Básica para Predios y Operaciones",
      descripcion: "Protección integral para instalaciones y operaciones comerciales"
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
              <Building2 className="w-16 h-16 text-white mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Póliza de Seguro de Empresas
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl mb-6 font-semibold">
              Ampara tu compañía con protección integral
            </h2>
            
            <p className="text-xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
              Concéntrate en hacer tu negocio más productivo, rentable y sólido. 
              De lo que pueda alterar su funcionamiento nos encargamos nosotros.
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
            <h2 className="text-3xl font-bold mb-4">Conoce los beneficios de la póliza de Empresas de La Vitalicia</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Protección integral diseñada para empresas que buscan seguridad y tranquilidad operacional
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
            <h2 className="text-3xl font-bold mb-4">Protege tu negocio con nuestras Coberturas Básicas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              La Vitalicia indemnizará al asegurado las pérdidas o daños materiales causados a los bienes asegurados
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

          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-800">Cobertura Automática</h3>
                </div>
                <p className="text-blue-700">
                  Todas las coberturas básicas incluyen protección automática por 60 días consecutivos 
                  para nuevas adquisiciones y mejoras.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Coberturas Opcionales */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Descubre las coberturas opcionales de la Póliza de Empresas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Opcionalmente podrá contratar en su póliza de seguro para empresas las siguientes opciones
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {coberturasOpcionales.map((cobertura, index) => (
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

      {/* Ramos Técnicos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">También puedes añadir a tu póliza de Empresas estas Coberturas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Coberturas especializadas para necesidades específicas de tu empresa
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {ramosTecnicos.map((ramo, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700">{ramo.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{ramo.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">Modalidad Primera Pérdida</h3>
                </div>
                <p className="text-green-700">
                  También puedes suscribir este tipo de póliza bajo modalidad de Primera Pérdida 
                  con planes estructurados a un bajo costo que se adaptan a tus necesidades.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cuidar tu Empresa */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <DollarSign className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-blue-800">
              Cuidar tu Empresa, es cuidar años de esfuerzo y dedicación
            </h2>
            <p className="text-lg text-blue-700 mb-8 leading-relaxed">
              Tu empresa representa años de trabajo, inversión y sueños. Protégela con una póliza 
              que entiende la importancia de tu negocio y te brinda la tranquilidad que necesitas 
              para seguir creciendo.
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Adquiere tu póliza hoy
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* App de Asegurados */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Puedes manejar tu Póliza de Empresa desde un solo lugar</h2>
              <h3 className="text-xl font-semibold text-blue-700 mb-6">App de Asegurados</h3>
              <p className="text-gray-600">
                La Asistencia a tu empresa está disponible 24/7
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <span>Cómo declarar un siniestro de Empresa</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Proceso simplificado para reportar siniestros de manera rápida y eficiente.
                  </p>
                  <Button variant="outline" className="w-full">
                    Ver proceso
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Phone className="w-6 h-6 text-green-600" />
                    <span>Cómo solicitar Asistencia a la Empresa</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Servicios de asistencia disponibles las 24 horas para tu empresa.
                  </p>
                  <Button variant="outline" className="w-full">
                    Solicitar asistencia
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para proteger tu empresa?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Obtén una cotización personalizada para tu empresa y protege años de esfuerzo y dedicación
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-blue-600">
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

export default EmpresasPage;
