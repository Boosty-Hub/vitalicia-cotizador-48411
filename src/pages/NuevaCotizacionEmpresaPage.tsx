import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  ArrowLeft,
  Building,
  Shield,
  Zap,
  Users,
  ArrowRight,
  DollarSign,
  Clock,
  CheckCircle,
  Factory,
  Truck,
  Wrench,
  FileText,
  Target,
  Globe
} from "lucide-react";

const NuevaCotizacionEmpresaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [backButtonText, setBackButtonText] = useState('Volver');

  useEffect(() => {
    // Detectar de dónde viene el usuario basado en el referrer o estado
    const referrer = document.referrer;
    const fromState = location.state?.from;
    
    if (fromState) {
      // Si viene del estado de navegación
      if (fromState.includes('dashboard-intermediario')) {
        setBackButtonText('Volver al Dashboard Intermediario');
      } else if (fromState.includes('dashboard-cliente')) {
        setBackButtonText('Volver al Dashboard Cliente');
      }
    } else if (referrer) {
      // Si viene del referrer
      if (referrer.includes('dashboard-intermediario')) {
        setBackButtonText('Volver al Dashboard Intermediario');
      } else if (referrer.includes('dashboard-cliente')) {
        setBackButtonText('Volver al Dashboard Cliente');
      } else if (referrer.includes('empresas')) {
        setBackButtonText('Volver a Seguros de Empresas');
      } else if (referrer.includes('salud-colectiva')) {
        setBackButtonText('Volver a Salud Colectiva');
      } else {
        setBackButtonText('Volver a la página anterior');
      }
    } else {
      setBackButtonText('Volver al inicio');
    }
  }, [location]);

  const handleGoBack = () => {
    // Intentar ir hacia atrás en el historial
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Si no hay historial, ir al inicio
      navigate('/');
    }
  };

  const segurosEmpresariales = [
    {
      id: 'patrimonial',
      titulo: 'Seguro Patrimonial',
      descripcion: 'Protección integral para edificaciones, contenido y equipos',
      icon: <Building className="w-8 h-8 text-blue-500" />,
      precio: 'Cotización personalizada',
      beneficios: [
        'Incendio, rayo y explosión',
        'Fenómenos naturales',
        'Robo y daños maliciosos',
        'Equipos y maquinarias',
        'Responsabilidad civil'
      ],
      ruta: '/empresas',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'responsabilidad-civil',
      titulo: 'Responsabilidad Civil',
      descripcion: 'Protección contra daños a terceros por actividades empresariales',
      icon: <Shield className="w-8 h-8 text-green-500" />,
      precio: 'Desde $150/mes',
      beneficios: [
        'Daños corporales a terceros',
        'Daños materiales a terceros',
        'Productos defectuosos',
        'Responsabilidad profesional',
        'Defensa jurídica incluida'
      ],
      ruta: '/empresas',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'salud-colectiva',
      titulo: 'Salud Colectiva',
      descripcion: 'Cobertura médica para empleados y sus familias',
      icon: <Users className="w-8 h-8 text-red-500" />,
      precio: 'Desde $25/empleado',
      beneficios: [
        'Cobertura grupal sin examen médico',
        'Hospitalización y cirugías',
        'Consultas y medicamentos',
        'Emergencias 24/7',
        'Telemedicina incluida'
      ],
      ruta: '/salud-colectiva',
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    {
      id: 'flota-vehicular',
      titulo: 'Flota Vehicular',
      descripcion: 'Cobertura especializada para vehículos comerciales',
      icon: <Truck className="w-8 h-8 text-purple-500" />,
      precio: 'Desde $200/vehículo',
      beneficios: [
        'Responsabilidad civil obligatoria',
        'Daños propios y robo',
        'Asistencia vial comercial',
        'Cobertura de carga',
        'Descuentos por flota'
      ],
      ruta: '/auto-individual',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      buttonColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'ingenieria',
      titulo: 'Seguros de Ingeniería',
      descripcion: 'Protección para proyectos de construcción y montaje',
      icon: <Wrench className="w-8 h-8 text-orange-500" />,
      precio: 'Según proyecto',
      beneficios: [
        'Todo riesgo construcción',
        'Montaje de maquinarias',
        'Rotura de maquinarias',
        'Calderas y equipos a presión',
        'Responsabilidad civil cruzada'
      ],
      ruta: '/empresas',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      buttonColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      id: 'fidelidad',
      titulo: 'Fidelidad y Manejo',
      descripcion: 'Protección contra actos deshonestos de empleados',
      icon: <FileText className="w-8 h-8 text-indigo-500" />,
      precio: 'Desde $100/mes',
      beneficios: [
        'Infidelidad de empleados',
        'Manejo de dinero y valores',
        'Falsificación y alteración',
        'Robo por empleados',
        'Cobertura de computadoras'
      ],
      ruta: '/empresas',
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={handleGoBack}
            variant="ghost"
            className="mb-6 text-primary hover:text-primary-dark transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {backButtonText}
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Building className="w-16 h-16 text-primary mr-4" />
              <h1 className="text-4xl font-bold text-foreground">
                Seguros Empresariales
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Protección integral para tu empresa con coberturas especializadas y asesoría profesional
            </p>
          </div>
        </div>

        {/* Estadísticas Empresariales */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Asesoría Especializada</h3>
              <p className="text-sm text-gray-600">Expertos en riesgos empresariales</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Coberturas Flexibles</h3>
              <p className="text-sm text-gray-600">Adaptadas a tu industria</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Cobertura Nacional</h3>
              <p className="text-sm text-gray-600">Red de servicios en todo el país</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Atención 24/7</h3>
              <p className="text-sm text-gray-600">Soporte empresarial continuo</p>
            </CardContent>
          </Card>
        </div>

        {/* Seguros Empresariales */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-8">Seguros Disponibles para Empresas</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {segurosEmpresariales.map((seguro) => (
              <Card 
                key={seguro.id} 
                className={`${seguro.color} transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer`}
                onClick={() => navigate(seguro.ruta)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {seguro.icon}
                  </div>
                  <CardTitle className="text-xl font-bold">{seguro.titulo}</CardTitle>
                  <CardDescription className="text-sm">{seguro.descripcion}</CardDescription>
                  <div className="text-lg font-semibold text-primary mt-2">{seguro.precio}</div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {seguro.beneficios.map((beneficio, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${seguro.buttonColor} text-white mt-4`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(seguro.ruta);
                    }}
                  >
                    Cotizar {seguro.titulo}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sectores Empresariales */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-8">Sectores que Atendemos</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { sector: 'Manufactura', icon: <Factory className="w-6 h-6" /> },
              { sector: 'Construcción', icon: <Wrench className="w-6 h-6" /> },
              { sector: 'Comercio', icon: <Building className="w-6 h-6" /> },
              { sector: 'Servicios', icon: <Users className="w-6 h-6" /> },
              { sector: 'Transporte', icon: <Truck className="w-6 h-6" /> },
              { sector: 'Tecnología', icon: <Zap className="w-6 h-6" /> },
              { sector: 'Salud', icon: <Shield className="w-6 h-6" /> },
              { sector: 'Educación', icon: <FileText className="w-6 h-6" /> }
            ].map((item, idx) => (
              <Card key={idx} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3 text-primary">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold">{item.sector}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Información Adicional */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">¿Necesitas una cotización personalizada?</h3>
          <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
            Nuestros especialistas en seguros empresariales pueden crear una propuesta 
            adaptada específicamente a las necesidades y riesgos de tu empresa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Solicitar Asesoría Empresarial
            </Button>
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-100">
              Descargar Brochure Empresarial
            </Button>
          </div>
          <p className="text-sm text-blue-600 mt-4">
            Atención especializada para empresas • Evaluación de riesgos gratuita
          </p>
        </div>
      </div>
    </div>
  );
};

export default NuevaCotizacionEmpresaPage;
