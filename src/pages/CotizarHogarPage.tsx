import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Shield,
  User,
  Phone,
  Mail,
  Download,
  CheckCircle,
  MapPin
} from "lucide-react";

interface HogarData {
  // Paso 1: Datos de la propiedad
  tipoPropiedad: string;
  valorPropiedad: string;
  direccion: string;
  ciudad: string;
  estado: string;
  
  // Paso 2: Datos del propietario
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
  
  // Paso 3: Coberturas deseadas
  coberturaBasica: string;
  coberturasOpcionales: string[];
  deducible: string;
}

const CotizarHogarPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [hogarData, setHogarData] = useState<HogarData>({
    tipoPropiedad: "",
    valorPropiedad: "",
    direccion: "",
    ciudad: "",
    estado: "",
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
    email: "",
    coberturaBasica: "",
    coberturasOpcionales: [],
    deducible: ""
  });

  const [backButtonText, setBackButtonText] = useState('Volver');

  useEffect(() => {
    const referrer = document.referrer;
    const fromState = location.state?.from;
    
    if (fromState?.includes('dashboard')) {
      setBackButtonText('Volver al Dashboard');
    } else if (referrer.includes('hogar')) {
      setBackButtonText('Volver a Seguros de Hogar');
    } else {
      setBackButtonText('Volver a la página anterior');
    }
  }, [location]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateHogarData = (field: keyof HogarData, value: any) => {
    setHogarData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
        <div className="flex items-center justify-center mb-4">
          <Home className="w-12 h-12 mr-3" />
          <CardTitle className="text-2xl">Datos de la Propiedad</CardTitle>
        </div>
        <CardDescription className="text-orange-50">
          Información sobre tu hogar a asegurar
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label htmlFor="tipoPropiedad">Tipo de propiedad</Label>
          <Select value={hogarData.tipoPropiedad} onValueChange={(value) => updateHogarData('tipoPropiedad', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="apartamento">Apartamento</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="quinta">Quinta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="valorPropiedad">Valor aproximado de la propiedad</Label>
          <Select value={hogarData.valorPropiedad} onValueChange={(value) => updateHogarData('valorPropiedad', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-50000">$0 - $50,000</SelectItem>
              <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
              <SelectItem value="100000-200000">$100,000 - $200,000</SelectItem>
              <SelectItem value="200000+">Más de $200,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="direccion">Dirección completa</Label>
          <Input 
            id="direccion"
            value={hogarData.direccion}
            onChange={(e) => updateHogarData('direccion', e.target.value)}
            placeholder="Dirección de la propiedad"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input 
              id="ciudad"
              value={hogarData.ciudad}
              onChange={(e) => updateHogarData('ciudad', e.target.value)}
              placeholder="Ciudad"
            />
          </div>
          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select value={hogarData.estado} onValueChange={(value) => updateHogarData('estado', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distrito-capital">Distrito Capital</SelectItem>
                <SelectItem value="miranda">Miranda</SelectItem>
                <SelectItem value="carabobo">Carabobo</SelectItem>
                <SelectItem value="zulia">Zulia</SelectItem>
                <SelectItem value="aragua">Aragua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Datos del Propietario</CardTitle>
        <CardDescription className="text-blue-50">
          Información personal del propietario
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input 
              id="nombre"
              value={hogarData.nombre}
              onChange={(e) => updateHogarData('nombre', e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <Label htmlFor="apellido">Apellido</Label>
            <Input 
              id="apellido"
              value={hogarData.apellido}
              onChange={(e) => updateHogarData('apellido', e.target.value)}
              placeholder="Tu apellido"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="cedula">Cédula</Label>
          <Input 
            id="cedula"
            value={hogarData.cedula}
            onChange={(e) => updateHogarData('cedula', e.target.value)}
            placeholder="V-12345678"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input 
              id="telefono"
              value={hogarData.telefono}
              onChange={(e) => updateHogarData('telefono', e.target.value)}
              placeholder="+58 412-1234567"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={hogarData.email}
              onChange={(e) => updateHogarData('email', e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Resumen y Cotización</CardTitle>
        <CardDescription className="text-green-50">
          Tu cotización de seguro de hogar
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Resumen */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Resumen de tu propiedad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Tipo:</strong> {hogarData.tipoPropiedad}</div>
            <div><strong>Valor:</strong> {hogarData.valorPropiedad}</div>
            <div><strong>Propietario:</strong> {hogarData.nombre} {hogarData.apellido}</div>
            <div><strong>Ubicación:</strong> {hogarData.ciudad}, {hogarData.estado}</div>
          </div>
        </div>

        {/* Cotización */}
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">Cotización Estimada</h3>
              <p className="text-green-700">Prima anual aproximada</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-900">$75/año</div>
              <div className="text-sm text-green-600">o $6.25/mes</div>
            </div>
          </div>
        </div>

        {/* Coberturas incluidas */}
        <div className="space-y-3">
          <h4 className="font-semibold">Coberturas incluidas:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Incendio y explosión',
              'Daños por agua',
              'Robo y hurto',
              'Responsabilidad civil',
              'Fenómenos naturales',
              'Asistencia al hogar 24/7'
            ].map((cobertura, index) => (
              <div key={index} className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                {cobertura}
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
            <Download className="w-4 h-4 mr-2" />
            Descargar Cotización PDF
          </Button>
          <Button variant="outline" className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            Enviar por Email
          </Button>
          <Button variant="outline" className="w-full">
            <Phone className="w-4 h-4 mr-2" />
            Contactar Asesor
          </Button>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Esta cotización es válida por 30 días</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MegaMenuHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={handleGoBack}
            variant="ghost"
            className="mb-6 text-primary hover:text-primary-dark transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {backButtonText}
          </Button>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Paso {currentStep} de {totalSteps}
              </span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% completado</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Contenido del paso actual */}
          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          {/* Navegación entre pasos */}
          {currentStep > 1 && currentStep < totalSteps && (
            <div className="flex justify-between">
              <Button onClick={prevStep} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              <Button onClick={nextStep}>
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CotizarHogarPage;
