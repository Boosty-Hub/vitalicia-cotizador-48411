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
import { Textarea } from "@/components/ui/textarea";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  Building, 
  Shield,
  User,
  Phone,
  Mail,
  Download,
  CheckCircle,
  Factory
} from "lucide-react";

interface EmpresaData {
  // Paso 1: Datos de la empresa
  razonSocial: string;
  rif: string;
  sector: string;
  empleados: string;
  direccion: string;
  ciudad: string;
  estado: string;
  
  // Paso 2: Contacto y representante
  nombreContacto: string;
  cargoContacto: string;
  telefono: string;
  email: string;
  
  // Paso 3: Tipo de cobertura
  tipoCobertura: string;
  valorAsegurado: string;
  coberturasOpcionales: string[];
  deducible: string;
}

const CotizarEmpresaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [empresaData, setEmpresaData] = useState<EmpresaData>({
    razonSocial: "",
    rif: "",
    sector: "",
    empleados: "",
    direccion: "",
    ciudad: "",
    estado: "",
    nombreContacto: "",
    cargoContacto: "",
    telefono: "",
    email: "",
    tipoCobertura: "",
    valorAsegurado: "",
    coberturasOpcionales: [],
    deducible: ""
  });

  const [backButtonText, setBackButtonText] = useState('Volver');

  useEffect(() => {
    const referrer = document.referrer;
    const fromState = location.state?.from;
    
    if (fromState?.includes('dashboard')) {
      setBackButtonText('Volver al Dashboard');
    } else if (referrer.includes('empresa')) {
      setBackButtonText('Volver a Seguros de Empresas');
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

  const updateEmpresaData = (field: keyof EmpresaData, value: any) => {
    setEmpresaData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const sectores = [
    'Manufactura',
    'Comercio',
    'Servicios',
    'Construcción',
    'Tecnología',
    'Salud',
    'Educación',
    'Transporte',
    'Agricultura',
    'Turismo'
  ];

  const coberturasBasicas = [
    {
      id: 'patrimonial',
      nombre: 'Seguro Patrimonial',
      descripcion: 'Protección para edificaciones, contenido y equipos',
      precio: 'Desde $500/año'
    },
    {
      id: 'responsabilidad',
      nombre: 'Responsabilidad Civil',
      descripcion: 'Protección contra daños a terceros',
      precio: 'Desde $300/año',
      popular: true
    },
    {
      id: 'flota',
      nombre: 'Flota Vehicular',
      descripcion: 'Cobertura para vehículos comerciales',
      precio: 'Desde $800/año'
    }
  ];

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center justify-center mb-4">
          <Building className="w-12 h-12 mr-3" />
          <CardTitle className="text-2xl">Datos de la Empresa</CardTitle>
        </div>
        <CardDescription className="text-blue-50">
          Información básica de tu empresa
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label htmlFor="razonSocial">Razón Social</Label>
          <Input 
            id="razonSocial"
            value={empresaData.razonSocial}
            onChange={(e) => updateEmpresaData('razonSocial', e.target.value)}
            placeholder="Nombre completo de la empresa"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rif">RIF</Label>
            <Input 
              id="rif"
              value={empresaData.rif}
              onChange={(e) => updateEmpresaData('rif', e.target.value)}
              placeholder="J-12345678-9"
            />
          </div>
          <div>
            <Label htmlFor="sector">Sector de actividad</Label>
            <Select value={empresaData.sector} onValueChange={(value) => updateEmpresaData('sector', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el sector" />
              </SelectTrigger>
              <SelectContent>
                {sectores.map((sector) => (
                  <SelectItem key={sector} value={sector.toLowerCase()}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="empleados">Número de empleados</Label>
          <Select value={empresaData.empleados} onValueChange={(value) => updateEmpresaData('empleados', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1 - 10 empleados</SelectItem>
              <SelectItem value="11-50">11 - 50 empleados</SelectItem>
              <SelectItem value="51-100">51 - 100 empleados</SelectItem>
              <SelectItem value="101-500">101 - 500 empleados</SelectItem>
              <SelectItem value="500+">Más de 500 empleados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="direccion">Dirección</Label>
          <Textarea 
            id="direccion"
            value={empresaData.direccion}
            onChange={(e) => updateEmpresaData('direccion', e.target.value)}
            placeholder="Dirección completa de la empresa"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input 
              id="ciudad"
              value={empresaData.ciudad}
              onChange={(e) => updateEmpresaData('ciudad', e.target.value)}
              placeholder="Ciudad"
            />
          </div>
          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select value={empresaData.estado} onValueChange={(value) => updateEmpresaData('estado', value)}>
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
      <CardHeader className="text-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Contacto y Representante</CardTitle>
        <CardDescription className="text-green-50">
          Información del representante legal o contacto
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombreContacto">Nombre del contacto</Label>
            <Input 
              id="nombreContacto"
              value={empresaData.nombreContacto}
              onChange={(e) => updateEmpresaData('nombreContacto', e.target.value)}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <Label htmlFor="cargoContacto">Cargo</Label>
            <Input 
              id="cargoContacto"
              value={empresaData.cargoContacto}
              onChange={(e) => updateEmpresaData('cargoContacto', e.target.value)}
              placeholder="Cargo en la empresa"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input 
              id="telefono"
              value={empresaData.telefono}
              onChange={(e) => updateEmpresaData('telefono', e.target.value)}
              placeholder="+58 412-1234567"
            />
          </div>
          <div>
            <Label htmlFor="email">Email corporativo</Label>
            <Input 
              id="email"
              type="email"
              value={empresaData.email}
              onChange={(e) => updateEmpresaData('email', e.target.value)}
              placeholder="contacto@empresa.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Resumen y Cotización</CardTitle>
        <CardDescription className="text-purple-50">
          Tu cotización empresarial personalizada
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Resumen de la empresa */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Resumen de tu empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Empresa:</strong> {empresaData.razonSocial}</div>
            <div><strong>Sector:</strong> {empresaData.sector}</div>
            <div><strong>Empleados:</strong> {empresaData.empleados}</div>
            <div><strong>Contacto:</strong> {empresaData.nombreContacto}</div>
          </div>
        </div>

        {/* Coberturas recomendadas */}
        <div>
          <h4 className="font-semibold mb-4">Coberturas recomendadas para tu empresa:</h4>
          <div className="space-y-3">
            {coberturasBasicas.map((cobertura) => (
              <div key={cobertura.id} className="p-4 border rounded-lg bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="font-medium flex items-center">
                      {cobertura.nombre}
                      {cobertura.popular && (
                        <Badge className="ml-2 bg-purple-500">Recomendado</Badge>
                      )}
                    </h5>
                    <p className="text-sm text-gray-600">{cobertura.descripcion}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{cobertura.precio}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cotización total estimada */}
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-purple-900">Cotización Estimada Total</h3>
              <p className="text-purple-700">Prima anual aproximada</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-900">$1,200/año</div>
              <div className="text-sm text-purple-600">o $100/mes</div>
            </div>
          </div>
        </div>

        {/* Beneficios empresariales */}
        <div className="space-y-3">
          <h4 className="font-semibold">Beneficios incluidos:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Asesoría especializada',
              'Inspecciones gratuitas',
              'Gestión de siniestros 24/7',
              'Cobertura nacional',
              'Descuentos por volumen',
              'Renovación automática'
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
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3">
            <Download className="w-4 h-4 mr-2" />
            Descargar Propuesta Comercial
          </Button>
          <Button variant="outline" className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            Enviar por Email
          </Button>
          <Button variant="outline" className="w-full">
            <Phone className="w-4 h-4 mr-2" />
            Solicitar Asesoría Especializada
          </Button>
        </div>

        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>Esta cotización es válida por 30 días</p>
          <p>Sujeta a inspección y evaluación de riesgos</p>
          <p>Un asesor especializado se contactará contigo</p>
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

export default CotizarEmpresaPage;
