import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  ArrowLeft,
  Heart,
  Car,
  Plane,
  Home,
  Shield,
  Users,
  Building,
  ArrowRight,
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";

const NuevaPolizaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [backButtonText, setBackButtonText] = useState('Volver');

  useEffect(() => {
    // Detectar de dónde viene el usuario basado en el referrer o estado
    const referrer = document.referrer;
    const fromState = location.state?.from;
    
    if (fromState) {
      // Si viene del estado de navegación
      if (fromState.includes('dashboard-cliente')) {
        setBackButtonText('Volver al Dashboard Cliente');
      } else if (fromState.includes('dashboard-intermediario')) {
        setBackButtonText('Volver al Dashboard Intermediario');
      }
    } else if (referrer) {
      // Si viene del referrer
      if (referrer.includes('dashboard-cliente')) {
        setBackButtonText('Volver al Dashboard Cliente');
      } else if (referrer.includes('dashboard-intermediario')) {
        setBackButtonText('Volver al Dashboard Intermediario');
      } else if (referrer.includes('salud')) {
        setBackButtonText('Volver a Seguros de Salud');
      } else if (referrer.includes('auto')) {
        setBackButtonText('Volver a Seguros de Auto');
      } else if (referrer.includes('viajes')) {
        setBackButtonText('Volver a Seguros de Viajes');
      } else if (referrer.includes('hogar')) {
        setBackButtonText('Volver a Seguros de Hogar');
      } else if (referrer.includes('vida')) {
        setBackButtonText('Volver a Seguros de Vida');
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

  const polizasDisponibles = [
    {
      id: 'salud',
      titulo: 'Seguro de Salud',
      descripcion: 'Protección médica integral para ti y tu familia',
      icon: <Heart className="w-8 h-8 text-red-500" />,
      precio: 'Desde $45/mes',
      beneficios: [
        'Cobertura hospitalaria completa',
        'Consultas médicas especializadas',
        'Medicamentos incluidos',
        'Red de clínicas nacional'
      ],
      ruta: '/cotizar-salud',
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    {
      id: 'auto',
      titulo: 'Seguro de Vehículo',
      descripcion: 'Protege tu inversión con cobertura automotriz completa',
      icon: <Car className="w-8 h-8 text-blue-500" />,
      precio: 'Desde $35/año',
      beneficios: [
        'Responsabilidad civil obligatoria',
        'Daños por colisión y robo',
        'Asistencia vial 24/7',
        'Grúa y servicios de emergencia'
      ],
      ruta: '/cotizar-vehiculo',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'viajes',
      titulo: 'Seguro de Viajes',
      descripcion: 'Viaja tranquilo con cobertura internacional',
      icon: <Plane className="w-8 h-8 text-green-500" />,
      precio: 'Desde $45',
      beneficios: [
        'Asistencia médica en el extranjero',
        'Equipaje perdido o dañado',
        'Cancelación de viaje',
        'Repatriación sanitaria'
      ],
      ruta: '/cotizar-viajes',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'hogar',
      titulo: 'Seguro de Hogar',
      descripcion: 'Protección integral para tu hogar y bienes',
      icon: <Home className="w-8 h-8 text-orange-500" />,
      precio: 'Desde $6.25/mes',
      beneficios: [
        'Incendio y fenómenos naturales',
        'Robo y daños maliciosos',
        'Responsabilidad civil',
        'Asistencia al hogar 24/7'
      ],
      ruta: '/cotizar-hogar',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      buttonColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      id: 'vida',
      titulo: 'Seguro de Vida',
      descripcion: 'Garantiza el futuro de tus seres queridos',
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      precio: 'Desde $12/mes',
      beneficios: [
        'Cobertura por muerte natural',
        'Muerte accidental',
        'Gastos de entierro',
        'Servicio psicológico'
      ],
      ruta: '/cotizar-vida',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      buttonColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'empresas',
      titulo: 'Seguro de Empresas',
      descripcion: 'Protección integral para tu negocio',
      icon: <Building className="w-8 h-8 text-indigo-500" />,
      precio: 'Cotización personalizada',
      beneficios: [
        'Incendio y fenómenos naturales',
        'Equipos y maquinarias',
        'Responsabilidad civil',
        'Pérdida de beneficios'
      ],
      ruta: '/cotizar-empresa',
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
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Solicitar Nueva Póliza
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elige el tipo de seguro que necesitas y obtén tu cotización personalizada
            </p>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Proceso Rápido</h3>
              <p className="text-sm text-gray-600">Cotización en 5 minutos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Sin Compromiso</h3>
              <p className="text-sm text-gray-600">Cotiza gratis</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Asesoría Personal</h3>
              <p className="text-sm text-gray-600">Expertos disponibles</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Mejores Precios</h3>
              <p className="text-sm text-gray-600">Tarifas competitivas</p>
            </CardContent>
          </Card>
        </div>

        {/* Pólizas Disponibles */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-8">Pólizas Disponibles</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {polizasDisponibles.map((poliza) => (
              <Card 
                key={poliza.id} 
                className={`${poliza.color} transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer`}
                onClick={() => navigate(poliza.ruta)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {poliza.icon}
                  </div>
                  <CardTitle className="text-xl font-bold">{poliza.titulo}</CardTitle>
                  <CardDescription className="text-sm">{poliza.descripcion}</CardDescription>
                  <div className="text-lg font-semibold text-primary mt-2">{poliza.precio}</div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {poliza.beneficios.map((beneficio, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${poliza.buttonColor} text-white mt-4`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(poliza.ruta);
                    }}
                  >
                    Cotizar {poliza.titulo.replace('Seguro de ', '')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Información Adicional */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">¿Necesitas ayuda para elegir?</h3>
          <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
            Nuestros asesores especializados pueden ayudarte a encontrar la póliza perfecta 
            para tus necesidades específicas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Hablar con un Asesor
            </Button>
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-100">
              Ver Comparativo de Pólizas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevaPolizaPage;
