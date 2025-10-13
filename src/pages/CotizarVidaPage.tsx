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
  Heart, 
  Shield,
  User,
  Phone,
  Mail,
  Download,
  CheckCircle,
  Users
} from "lucide-react";

interface VidaData {
  // Paso 1: Datos personales
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  edad: number;
  genero: string;
  estadoCivil: string;
  
  // Paso 2: Información adicional
  ocupacion: string;
  ingresos: string;
  telefono: string;
  email: string;
  
  // Paso 3: Tipo de seguro y beneficiarios
  tipoSeguro: string;
  sumaAsegurada: string;
  beneficiarios: Array<{nombre: string, parentesco: string, porcentaje: number}>;
  
  // Paso 4: Información de salud
  fuma: boolean;
  enfermedades: string[];
  medicamentos: boolean;
}

const CotizarVidaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [vidaData, setVidaData] = useState<VidaData>({
    nombre: "",
    apellido: "",
    cedula: "",
    fechaNacimiento: "",
    edad: 0,
    genero: "",
    estadoCivil: "",
    ocupacion: "",
    ingresos: "",
    telefono: "",
    email: "",
    tipoSeguro: "",
    sumaAsegurada: "",
    beneficiarios: [{nombre: "", parentesco: "", porcentaje: 100}],
    fuma: false,
    enfermedades: [],
    medicamentos: false
  });

  const [backButtonText, setBackButtonText] = useState('Volver');

  useEffect(() => {
    const referrer = document.referrer;
    const fromState = location.state?.from;
    
    if (fromState?.includes('dashboard')) {
      setBackButtonText('Volver al Dashboard');
    } else if (referrer.includes('vida')) {
      setBackButtonText('Volver a Seguros de Vida');
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

  const updateVidaData = (field: keyof VidaData, value: any) => {
    setVidaData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calcularEdad = (fechaNacimiento: string) => {
    if (fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      const edad = hoy.getFullYear() - nacimiento.getFullYear();
      updateVidaData('edad', edad);
    }
  };

  const tiposSeguro = [
    {
      id: 'temporal',
      nombre: 'Vida Temporal',
      descripcion: 'Cobertura por un período específico',
      precio: 'Desde $25/mes',
      beneficios: ['Cobertura temporal', 'Primas más bajas', 'Renovable']
    },
    {
      id: 'entera',
      nombre: 'Vida Entera',
      descripcion: 'Cobertura de por vida con ahorro',
      precio: 'Desde $85/mes',
      beneficios: ['Cobertura permanente', 'Valor en efectivo', 'Dividendos'],
      popular: true
    },
    {
      id: 'universal',
      nombre: 'Vida Universal',
      descripcion: 'Flexibilidad en primas y beneficios',
      precio: 'Desde $65/mes',
      beneficios: ['Primas flexibles', 'Inversión', 'Ajustable']
    }
  ];

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
        <div className="flex items-center justify-center mb-4">
          <Heart className="w-12 h-12 mr-3" />
          <CardTitle className="text-2xl">Datos Personales</CardTitle>
        </div>
        <CardDescription className="text-red-50">
          Información básica del asegurado
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input 
              id="nombre"
              value={vidaData.nombre}
              onChange={(e) => updateVidaData('nombre', e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <Label htmlFor="apellido">Apellido</Label>
            <Input 
              id="apellido"
              value={vidaData.apellido}
              onChange={(e) => updateVidaData('apellido', e.target.value)}
              placeholder="Tu apellido"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cedula">Cédula</Label>
            <Input 
              id="cedula"
              value={vidaData.cedula}
              onChange={(e) => updateVidaData('cedula', e.target.value)}
              placeholder="V-12345678"
            />
          </div>
          <div>
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
            <Input 
              id="fechaNacimiento"
              type="date"
              value={vidaData.fechaNacimiento}
              onChange={(e) => {
                updateVidaData('fechaNacimiento', e.target.value);
                calcularEdad(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="genero">Género</Label>
            <Select value={vidaData.genero} onValueChange={(value) => updateVidaData('genero', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="estadoCivil">Estado Civil</Label>
            <Select value={vidaData.estadoCivil} onValueChange={(value) => updateVidaData('estadoCivil', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona estado civil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soltero">Soltero(a)</SelectItem>
                <SelectItem value="casado">Casado(a)</SelectItem>
                <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                <SelectItem value="viudo">Viudo(a)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {vidaData.edad > 0 && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-800 font-medium">
              Edad: {vidaData.edad} años
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Información Adicional</CardTitle>
        <CardDescription className="text-blue-50">
          Datos profesionales y de contacto
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label htmlFor="ocupacion">Ocupación</Label>
          <Input 
            id="ocupacion"
            value={vidaData.ocupacion}
            onChange={(e) => updateVidaData('ocupacion', e.target.value)}
            placeholder="Tu ocupación actual"
          />
        </div>

        <div>
          <Label htmlFor="ingresos">Ingresos mensuales aproximados</Label>
          <Select value={vidaData.ingresos} onValueChange={(value) => updateVidaData('ingresos', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona rango de ingresos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-500">$0 - $500</SelectItem>
              <SelectItem value="500-1000">$500 - $1,000</SelectItem>
              <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
              <SelectItem value="2000+">Más de $2,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input 
              id="telefono"
              value={vidaData.telefono}
              onChange={(e) => updateVidaData('telefono', e.target.value)}
              placeholder="+58 412-1234567"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={vidaData.email}
              onChange={(e) => updateVidaData('email', e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Tipo de Seguro</CardTitle>
        <CardDescription className="text-purple-50">
          Selecciona el plan que mejor se adapte a tus necesidades
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label className="text-sm font-medium mb-4 block">Planes disponibles</Label>
          <div className="space-y-4">
            {tiposSeguro.map((tipo) => (
              <div 
                key={tipo.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  vidaData.tipoSeguro === tipo.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                } ${tipo.popular ? 'ring-2 ring-purple-200' : ''}`}
                onClick={() => updateVidaData('tipoSeguro', tipo.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={tipo.id} 
                      id={tipo.id}
                      checked={vidaData.tipoSeguro === tipo.id}
                    />
                    <div>
                      <h3 className="font-semibold flex items-center">
                        {tipo.nombre}
                        {tipo.popular && (
                          <Badge className="ml-2 bg-purple-500">Recomendado</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{tipo.descripcion}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{tipo.precio}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {tipo.beneficios.map((beneficio, index) => (
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

        <div>
          <Label htmlFor="sumaAsegurada">Suma asegurada deseada</Label>
          <Select value={vidaData.sumaAsegurada} onValueChange={(value) => updateVidaData('sumaAsegurada', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona la suma asegurada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50000">$50,000</SelectItem>
              <SelectItem value="100000">$100,000</SelectItem>
              <SelectItem value="200000">$200,000</SelectItem>
              <SelectItem value="500000">$500,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Beneficiario principal</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="beneficiarioNombre">Nombre completo</Label>
              <Input 
                id="beneficiarioNombre"
                value={vidaData.beneficiarios[0]?.nombre || ""}
                onChange={(e) => {
                  const newBeneficiarios = [...vidaData.beneficiarios];
                  newBeneficiarios[0] = {...newBeneficiarios[0], nombre: e.target.value};
                  updateVidaData('beneficiarios', newBeneficiarios);
                }}
                placeholder="Nombre del beneficiario"
              />
            </div>
            <div>
              <Label htmlFor="beneficiarioParentesco">Parentesco</Label>
              <Select 
                value={vidaData.beneficiarios[0]?.parentesco || ""} 
                onValueChange={(value) => {
                  const newBeneficiarios = [...vidaData.beneficiarios];
                  newBeneficiarios[0] = {...newBeneficiarios[0], parentesco: value};
                  updateVidaData('beneficiarios', newBeneficiarios);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona parentesco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conyuge">Cónyuge</SelectItem>
                  <SelectItem value="hijo">Hijo(a)</SelectItem>
                  <SelectItem value="padre">Padre</SelectItem>
                  <SelectItem value="madre">Madre</SelectItem>
                  <SelectItem value="hermano">Hermano(a)</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Resumen y Cotización</CardTitle>
        <CardDescription className="text-green-50">
          Tu cotización de seguro de vida
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Resumen */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Resumen de tu seguro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Asegurado:</strong> {vidaData.nombre} {vidaData.apellido}</div>
            <div><strong>Edad:</strong> {vidaData.edad} años</div>
            <div><strong>Tipo:</strong> {tiposSeguro.find(t => t.id === vidaData.tipoSeguro)?.nombre}</div>
            <div><strong>Suma:</strong> ${vidaData.sumaAsegurada}</div>
          </div>
        </div>

        {/* Cotización */}
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">Cotización Estimada</h3>
              <p className="text-green-700">Prima mensual aproximada</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-900">$85/mes</div>
              <div className="text-sm text-green-600">o $1,020/año</div>
            </div>
          </div>
        </div>

        {/* Beneficios incluidos */}
        <div className="space-y-3">
          <h4 className="font-semibold">Beneficios incluidos:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Muerte por cualquier causa',
              'Muerte accidental doble',
              'Gastos de entierro',
              'Servicio psicológico familiar',
              'Adelanto por enfermedad terminal',
              'Exención de pago por invalidez'
            ].map((beneficio, index) => (
              <div key={index} className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                {beneficio}
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
          <p>Sujeta a examen médico y aprobación</p>
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

export default CotizarVidaPage;
