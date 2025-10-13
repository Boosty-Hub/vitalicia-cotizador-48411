import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  Plane, 
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Shield,
  Download,
  CheckCircle
} from "lucide-react";

interface TravelData {
  // Paso 1: Datos del viaje
  destino: string;
  fechaSalida: string;
  fechaRegreso: string;
  diasViaje: number;
  
  // Paso 2: Datos del viajero
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  edad: number;
  telefono: string;
  email: string;
  
  // Paso 3: Tipo de viaje y cobertura
  tipoViaje: string;
  planSeleccionado: string;
  coberturaDeseada: number;
  
  // Paso 4: Información adicional
  ocupacion: string;
  motivoViaje: string;
  actividadesRiesgo: boolean;
}

const CotizarViajesMejoradoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [travelData, setTravelData] = useState<TravelData>({
    destino: "",
    fechaSalida: "",
    fechaRegreso: "",
    diasViaje: 0,
    nombre: "",
    apellido: "",
    cedula: "",
    fechaNacimiento: "",
    edad: 0,
    telefono: "",
    email: "",
    tipoViaje: "",
    planSeleccionado: "",
    coberturaDeseada: 0,
    ocupacion: "",
    motivoViaje: "",
    actividadesRiesgo: false
  });

  const [backButtonText, setBackButtonText] = useState('Volver');

  useEffect(() => {
    const referrer = document.referrer;
    const fromState = location.state?.from;
    
    if (fromState?.includes('dashboard')) {
      setBackButtonText('Volver al Dashboard');
    } else if (referrer.includes('viajes')) {
      setBackButtonText('Volver a Seguros de Viajes');
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

  const totalSteps = 4;
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

  const updateTravelData = (field: keyof TravelData, value: any) => {
    setTravelData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calcularDias = (fechaSalida: string, fechaRegreso: string) => {
    if (fechaSalida && fechaRegreso) {
      const salida = new Date(fechaSalida);
      const regreso = new Date(fechaRegreso);
      const diferencia = regreso.getTime() - salida.getTime();
      const dias = Math.ceil(diferencia / (1000 * 3600 * 24));
      updateTravelData('diasViaje', dias > 0 ? dias : 0);
    }
  };

  const planes = [
    {
      id: 'access30',
      nombre: 'Access 30',
      cobertura: 'USD 30,000',
      precio: '$45',
      descripcion: 'Protección esencial para viajeros',
      beneficios: [
        'Gastos médicos hasta USD 30,000',
        'Equipaje hasta USD 1,000',
        'Cancelación de viaje',
        'Asistencia 24/7'
      ]
    },
    {
      id: 'premium50',
      nombre: 'Premium 50',
      precio: '$75',
      cobertura: 'USD 50,000',
      descripcion: 'Cobertura completa recomendada',
      beneficios: [
        'Gastos médicos hasta USD 50,000',
        'Equipaje hasta USD 1,500',
        'Cancelación y demora',
        'Deportes de aventura'
      ],
      popular: true
    },
    {
      id: 'elite100',
      nombre: 'Elite 100',
      precio: '$125',
      cobertura: 'USD 100,000',
      descripcion: 'Máxima protección premium',
      beneficios: [
        'Gastos médicos hasta USD 100,000',
        'Equipaje hasta USD 2,500',
        'Todas las coberturas',
        'Acceso salas VIP'
      ]
    }
  ];

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
        <div className="flex items-center justify-center mb-4">
          <Plane className="w-12 h-12 mr-3" />
          <CardTitle className="text-2xl">Datos del Viaje</CardTitle>
        </div>
        <CardDescription className="text-green-50">
          Ingresa los detalles de tu próximo viaje
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label htmlFor="destino">Destino del viaje</Label>
          <Select value={travelData.destino} onValueChange={(value) => updateTravelData('destino', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu destino" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="europa">Europa</SelectItem>
              <SelectItem value="norteamerica">Norte América</SelectItem>
              <SelectItem value="sudamerica">Sud América</SelectItem>
              <SelectItem value="asia">Asia</SelectItem>
              <SelectItem value="oceania">Oceanía</SelectItem>
              <SelectItem value="africa">África</SelectItem>
              <SelectItem value="mundial">Mundial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fechaSalida">Fecha de salida</Label>
            <Input 
              id="fechaSalida"
              type="date"
              value={travelData.fechaSalida}
              onChange={(e) => {
                updateTravelData('fechaSalida', e.target.value);
                calcularDias(e.target.value, travelData.fechaRegreso);
              }}
            />
          </div>
          <div>
            <Label htmlFor="fechaRegreso">Fecha de regreso</Label>
            <Input 
              id="fechaRegreso"
              type="date"
              value={travelData.fechaRegreso}
              onChange={(e) => {
                updateTravelData('fechaRegreso', e.target.value);
                calcularDias(travelData.fechaSalida, e.target.value);
              }}
            />
          </div>
        </div>

        {travelData.diasViaje > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-medium">
              Duración del viaje: {travelData.diasViaje} días
            </p>
          </div>
        )}

        <Button 
          onClick={nextStep}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          disabled={!travelData.destino || !travelData.fechaSalida || !travelData.fechaRegreso}
        >
          Continuar
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Datos del Viajero</CardTitle>
        <CardDescription className="text-blue-50">
          Información personal del viajero principal
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input 
              id="nombre"
              value={travelData.nombre}
              onChange={(e) => updateTravelData('nombre', e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <Label htmlFor="apellido">Apellido</Label>
            <Input 
              id="apellido"
              value={travelData.apellido}
              onChange={(e) => updateTravelData('apellido', e.target.value)}
              placeholder="Tu apellido"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cedula">Cédula</Label>
            <Input 
              id="cedula"
              value={travelData.cedula}
              onChange={(e) => updateTravelData('cedula', e.target.value)}
              placeholder="V-12345678"
            />
          </div>
          <div>
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
            <Input 
              id="fechaNacimiento"
              type="date"
              value={travelData.fechaNacimiento}
              onChange={(e) => {
                updateTravelData('fechaNacimiento', e.target.value);
                const edad = new Date().getFullYear() - new Date(e.target.value).getFullYear();
                updateTravelData('edad', edad);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input 
              id="telefono"
              value={travelData.telefono}
              onChange={(e) => updateTravelData('telefono', e.target.value)}
              placeholder="+58 412-1234567"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={travelData.email}
              onChange={(e) => updateTravelData('email', e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
        </div>

        {travelData.edad > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              Edad del viajero: {travelData.edad} años
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Selección de Plan</CardTitle>
        <CardDescription className="text-purple-50">
          Elige el plan que mejor se adapte a tu viaje
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label className="text-sm font-medium mb-3 block">Tipo de viaje</Label>
          <RadioGroup 
            value={travelData.tipoViaje} 
            onValueChange={(value) => updateTravelData('tipoViaje', value)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="turismo" id="turismo" />
              <Label htmlFor="turismo">Turismo</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="negocios" id="negocios" />
              <Label htmlFor="negocios">Negocios</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="estudios" id="estudios" />
              <Label htmlFor="estudios">Estudios</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-medium mb-4 block">Planes disponibles</Label>
          <div className="space-y-4">
            {planes.map((plan) => (
              <div 
                key={plan.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  travelData.planSeleccionado === plan.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                } ${plan.popular ? 'ring-2 ring-purple-200' : ''}`}
                onClick={() => updateTravelData('planSeleccionado', plan.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={plan.id} 
                      id={plan.id}
                      checked={travelData.planSeleccionado === plan.id}
                    />
                    <div>
                      <h3 className="font-semibold flex items-center">
                        {plan.nombre}
                        {plan.popular && (
                          <Badge className="ml-2 bg-purple-500">Recomendado</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{plan.descripcion}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{plan.precio}</div>
                    <div className="text-sm text-gray-500">{plan.cobertura}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {plan.beneficios.map((beneficio, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {beneficio}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Resumen y Cotización</CardTitle>
        <CardDescription className="text-indigo-50">
          Revisa tu información y obtén tu cotización
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Resumen del viaje */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Resumen de tu viaje</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Destino:</strong> {travelData.destino}</div>
            <div><strong>Duración:</strong> {travelData.diasViaje} días</div>
            <div><strong>Viajero:</strong> {travelData.nombre} {travelData.apellido}</div>
            <div><strong>Plan:</strong> {planes.find(p => p.id === travelData.planSeleccionado)?.nombre}</div>
          </div>
        </div>

        {/* Cotización */}
        <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-indigo-900">Tu Cotización</h3>
              <p className="text-indigo-700">Prima total del seguro</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-900">
                {planes.find(p => p.id === travelData.planSeleccionado)?.precio || '$0'}
              </div>
              <div className="text-sm text-indigo-600">Para {travelData.diasViaje} días</div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3">
            <Download className="w-4 h-4 mr-2" />
            Descargar Cotización
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
            {currentStep === 4 && renderStep4()}
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

export default CotizarViajesMejoradoPage;
