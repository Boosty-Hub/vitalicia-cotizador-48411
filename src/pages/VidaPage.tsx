import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { 
  Users, 
  ArrowRight, 
  Shield, 
  Heart, 
  Phone,
  CheckCircle,
  Brain,
  Smartphone,
  CreditCard,
  FileText,
  AlertTriangle,
  Clock,
  DollarSign,
  UserCheck
} from "lucide-react";

const VidaPage = () => {
  const tiposVida = [
    {
      nombre: "Vida Temporal Nivelado",
      descripcion: "Protección por un período determinado con prima fija",
      caracteristicas: [
        "Prima nivelada durante el período contratado",
        "Cobertura por muerte natural o accidental",
        "Renovable al vencimiento",
        "Ideal para proteger obligaciones financieras"
      ],
      color: "bg-blue-50 border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      nombre: "Vida Entera",
      descripcion: "Protección permanente con valor de rescate",
      caracteristicas: [
        "Cobertura de por vida",
        "Acumulación de valor en efectivo",
        "Prima nivelada",
        "Préstamos sobre la póliza"
      ],
      color: "bg-purple-50 border-purple-200",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      popular: true
    },
    {
      nombre: "Vida Universal",
      descripcion: "Flexibilidad en primas y beneficios",
      caracteristicas: [
        "Primas flexibles",
        "Beneficio de muerte ajustable",
        "Crecimiento con interés",
        "Transparencia en costos"
      ],
      color: "bg-green-50 border-green-200",
      buttonColor: "bg-green-600 hover:bg-green-700"
    }
  ];

  const beneficios = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      titulo: "Protección Amplia",
      descripcion: "Cobertura por muerte natural y accidental para mayor tranquilidad"
    },
    {
      icon: <Brain className="w-8 h-8 text-green-600" />,
      titulo: "Servicio de Psicología",
      descripcion: "Apoyo profesional de salud mental para contención emocional"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-purple-600" />,
      titulo: "Flexibilidad",
      descripcion: "Diseña la póliza que requieras en tiempo, coberturas y formas de pago"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      titulo: "Tranquilidad",
      descripcion: "Garantiza el futuro de tus hijos con apoyo económico asegurado"
    }
  ];

  const coberturasOpcionales = [
    {
      icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      titulo: "Muerte Accidental",
      descripcion: "Indemnización adicional por muerte del asegurado en caso de accidente"
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      titulo: "Gastos de Entierro",
      descripcion: "Se pagará al beneficiario la suma asegurada indicada para esta cobertura"
    },
    {
      icon: <Brain className="w-6 h-6 text-green-600" />,
      titulo: "Servicio Psicológico",
      descripcion: "Red de psicólogos disponible para apoyo emocional y contención"
    }
  ];

  const appBeneficios = [
    "Consulta pólizas",
    "Consulta montos de cobertura",
    "Paga online",
    "Gestiona tus trámites fácilmente"
  ];

  return (
    <div className="min-h-screen bg-background">
      <MegaMenuHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Users className="w-16 h-16 text-white mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Seguros de Vida
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl mb-6 font-semibold">
              Garantiza el futuro de los tuyos
            </h2>
            
            <p className="text-xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
              ¿Quién los resguardará cuando ya no estés? Cuenta con la tranquilidad de dejarle un apoyo 
              financiero a familiares y ampáralos económicamente en caso de tu deceso.
            </p>
            
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-4 bg-white text-purple-700 hover:bg-white/90"
            >
              Solicitar Póliza de Vida
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Conoce los beneficios de las pólizas Vida de La Vitalicia</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Protección integral diseñada para brindar seguridad y tranquilidad a tu familia
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

      {/* Tipos de Vida Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tenemos una póliza vida ideal para proteger a los tuyos</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Diferentes opciones de cobertura para adaptarse a tus necesidades específicas
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiposVida.map((tipo, index) => (
              <Card key={index} className={`relative ${tipo.color} hover:shadow-xl transition-all duration-300 h-full`}>
                {tipo.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600">
                    Más Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold">{tipo.nombre}</CardTitle>
                  <CardDescription className="text-sm mt-2">{tipo.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {tipo.caracteristicas.map((caracteristica, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${tipo.buttonColor} text-white mt-4`}>
                    Conoce más
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cobertura Principal */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Descubre la cobertura</h2>
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <DollarSign className="w-12 h-12 text-purple-600" />
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  La póliza de seguro Vida indemniza a los beneficiarios designados en caso de muerte del asegurado, 
                  proporcionando el apoyo económico necesario para mantener la estabilidad financiera de la familia.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Coberturas Opcionales */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Completa tu póliza con Coberturas opcionales</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Adicionalmente podrás contratar con la póliza de seguro Vida las siguientes coberturas
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {coberturasOpcionales.map((cobertura, index) => (
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

      {/* App Asegurados */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <Smartphone className="w-12 h-12 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Gestiona tus trámites desde tu teléfono</h2>
              <h3 className="text-xl font-semibold text-purple-700 mb-6">App Asegurados</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Funcionalidades disponibles:</h4>
                <ul className="space-y-3">
                  {appBeneficios.map((beneficio, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span>{beneficio}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Smartphone className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Descarga la App</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Disponible para iOS y Android
                    </p>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Descargar App
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Proceso de Cotización */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">¿Cómo se cotiza?</h2>
              <p className="text-gray-600">
                Proceso sencillo para obtener tu póliza de vida
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Solicitud</h4>
                  <p className="text-sm text-gray-600">Completa la solicitud con tus datos personales</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Evaluación</h4>
                  <p className="text-sm text-gray-600">Evaluamos tu perfil de riesgo</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Cotización</h4>
                  <p className="text-sm text-gray-600">Recibe tu cotización personalizada</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-bold">4</span>
                  </div>
                  <h4 className="font-semibold mb-2">Emisión</h4>
                  <p className="text-sm text-gray-600">Activa tu póliza y comienza tu protección</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para proteger a tu familia?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Solicita tu póliza de vida hoy y garantiza el futuro económico de los que más amas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-purple-600">
              Solicitar Póliza
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
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

export default VidaPage;
