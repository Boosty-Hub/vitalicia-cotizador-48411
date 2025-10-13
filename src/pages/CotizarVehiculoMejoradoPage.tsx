import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  Car, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Download,
  Eye
} from "lucide-react";

interface VehicleData {
  // Paso 1: Datos del vehículo
  tipoVehiculo: string;
  anoVehiculo: string;
  marcaVehiculo: string;
  modeloVehiculo: string;
  versionVehiculo: string;
  estadoCirculacion: string;
  poseeBlindaje: boolean;
  poseeAsesor: boolean;
  
  // Paso 2: Datos personales
  tipoPersona: string;
  cedula: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  
  // Paso 3: Datos adicionales
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  ocupacion: string;
  
  // Paso 4: Uso del vehículo
  usoVehiculo: string;
  kilometrajeAnual: string;
  conductoresAdicionales: number;
  
  // Paso 5: Coberturas
  coberturaDeseada: string;
  deducible: string;
  coberturaAdicional: string[];
  
  // Paso 6: Documentos
  documentos: File[];
}

const CotizarVehiculoMejoradoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    tipoVehiculo: "",
    anoVehiculo: "",
    marcaVehiculo: "",
    modeloVehiculo: "",
    versionVehiculo: "",
    estadoCirculacion: "",
    poseeBlindaje: false,
    poseeAsesor: false,
    tipoPersona: "",
    cedula: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    ocupacion: "",
    usoVehiculo: "",
    kilometrajeAnual: "",
    conductoresAdicionales: 0,
    coberturaDeseada: "",
    deducible: "",
    coberturaAdicional: [],
    documentos: []
  });

  const [backButtonText, setBackButtonText] = useState('Volver');

  useEffect(() => {
    const referrer = document.referrer;
    const fromState = location.state?.from;
    
    if (fromState?.includes('dashboard')) {
      setBackButtonText('Volver al Dashboard');
    } else if (referrer.includes('auto')) {
      setBackButtonText('Volver a Seguros de Auto');
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

  const totalSteps = 6;
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

  const updateVehicleData = (field: keyof VehicleData, value: any) => {
    setVehicleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStep2 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Datos Personales</CardTitle>
        <CardDescription className="text-blue-50">
          Ingresa tu información personal para continuar
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label className="text-sm font-medium mb-3 block">Tipo de persona</Label>
          <RadioGroup 
            value={vehicleData.tipoPersona} 
            onValueChange={(value) => updateVehicleData('tipoPersona', value)}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="natural" id="natural" />
              <Label htmlFor="natural">Persona Natural</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="juridica" id="juridica" />
              <Label htmlFor="juridica">Persona Jurídica</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cedula">Cédula / RIF</Label>
            <Input 
              id="cedula"
              value={vehicleData.cedula}
              onChange={(e) => updateVehicleData('cedula', e.target.value)}
              placeholder="V-12345678"
            />
          </div>
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input 
              id="nombre"
              value={vehicleData.nombre}
              onChange={(e) => updateVehicleData('nombre', e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="apellido">Apellido</Label>
            <Input 
              id="apellido"
              value={vehicleData.apellido}
              onChange={(e) => updateVehicleData('apellido', e.target.value)}
              placeholder="Tu apellido"
            />
          </div>
          <div>
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
            <Input 
              id="fechaNacimiento"
              type="date"
              value={vehicleData.fechaNacimiento}
              onChange={(e) => updateVehicleData('fechaNacimiento', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input 
              id="telefono"
              value={vehicleData.telefono}
              onChange={(e) => updateVehicleData('telefono', e.target.value)}
              placeholder="+58 412-1234567"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={vehicleData.email}
              onChange={(e) => updateVehicleData('email', e.target.value)}
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
        <CardTitle className="text-2xl">Información Adicional</CardTitle>
        <CardDescription className="text-purple-50">
          Completa tu información de contacto y ocupación
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label htmlFor="direccion">Dirección</Label>
          <Textarea 
            id="direccion"
            value={vehicleData.direccion}
            onChange={(e) => updateVehicleData('direccion', e.target.value)}
            placeholder="Tu dirección completa"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input 
              id="ciudad"
              value={vehicleData.ciudad}
              onChange={(e) => updateVehicleData('ciudad', e.target.value)}
              placeholder="Tu ciudad"
            />
          </div>
          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select value={vehicleData.estado} onValueChange={(value) => updateVehicleData('estado', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu estado" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="codigoPostal">Código Postal</Label>
            <Input 
              id="codigoPostal"
              value={vehicleData.codigoPostal}
              onChange={(e) => updateVehicleData('codigoPostal', e.target.value)}
              placeholder="1234"
            />
          </div>
          <div>
            <Label htmlFor="ocupacion">Ocupación</Label>
            <Input 
              id="ocupacion"
              value={vehicleData.ocupacion}
              onChange={(e) => updateVehicleData('ocupacion', e.target.value)}
              placeholder="Tu ocupación"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Uso del Vehículo</CardTitle>
        <CardDescription className="text-orange-50">
          Información sobre el uso de tu vehículo
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label htmlFor="usoVehiculo">Uso principal del vehículo</Label>
          <Select value={vehicleData.usoVehiculo} onValueChange={(value) => updateVehicleData('usoVehiculo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el uso principal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="particular">Particular</SelectItem>
              <SelectItem value="comercial">Comercial</SelectItem>
              <SelectItem value="taxi">Taxi</SelectItem>
              <SelectItem value="uber">Uber/Transporte</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="kilometraje">Kilometraje anual estimado</Label>
          <Select value={vehicleData.kilometrajeAnual} onValueChange={(value) => updateVehicleData('kilometrajeAnual', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el kilometraje" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-10000">0 - 10,000 km</SelectItem>
              <SelectItem value="10000-20000">10,000 - 20,000 km</SelectItem>
              <SelectItem value="20000-30000">20,000 - 30,000 km</SelectItem>
              <SelectItem value="30000+">Más de 30,000 km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="conductores">Número de conductores adicionales</Label>
          <Select 
            value={vehicleData.conductoresAdicionales.toString()} 
            onValueChange={(value) => updateVehicleData('conductoresAdicionales', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona cantidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 conductores</SelectItem>
              <SelectItem value="1">1 conductor</SelectItem>
              <SelectItem value="2">2 conductores</SelectItem>
              <SelectItem value="3">3 o más conductores</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Coberturas Deseadas</CardTitle>
        <CardDescription className="text-indigo-50">
          Selecciona el tipo de cobertura que necesitas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label className="text-sm font-medium mb-3 block">Tipo de cobertura</Label>
          <RadioGroup 
            value={vehicleData.coberturaDeseada} 
            onValueChange={(value) => updateVehicleData('coberturaDeseada', value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="rcv" id="rcv" />
              <div className="flex-1">
                <Label htmlFor="rcv" className="font-medium">Responsabilidad Civil</Label>
                <p className="text-sm text-gray-600">Cobertura básica obligatoria</p>
              </div>
              <Badge variant="secondary">Desde $35/año</Badge>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="amplia" id="amplia" />
              <div className="flex-1">
                <Label htmlFor="amplia" className="font-medium">Cobertura Amplia</Label>
                <p className="text-sm text-gray-600">Incluye robo, choque, incendio</p>
              </div>
              <Badge variant="secondary">Desde $280/año</Badge>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="todo-riesgo" id="todo-riesgo" />
              <div className="flex-1">
                <Label htmlFor="todo-riesgo" className="font-medium">Todo Riesgo</Label>
                <p className="text-sm text-gray-600">Cobertura completa premium</p>
              </div>
              <Badge variant="secondary">Desde $650/año</Badge>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="deducible">Deducible preferido</Label>
          <Select value={vehicleData.deducible} onValueChange={(value) => updateVehicleData('deducible', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu deducible" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="500">$500</SelectItem>
              <SelectItem value="1000">$1,000</SelectItem>
              <SelectItem value="1500">$1,500</SelectItem>
              <SelectItem value="2000">$2,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Coberturas adicionales</Label>
          <div className="space-y-2">
            {[
              { id: "grua", label: "Servicio de grúa 24/7", price: "+$25/año" },
              { id: "vidrios", label: "Rotura de vidrios", price: "+$35/año" },
              { id: "asistencia", label: "Asistencia vial", price: "+$45/año" },
              { id: "conductor", label: "Conductor elegido", price: "+$60/año" }
            ].map((cobertura) => (
              <div key={cobertura.id} className="flex items-center space-x-2 p-2 border rounded">
                <Checkbox 
                  id={cobertura.id}
                  checked={vehicleData.coberturaAdicional.includes(cobertura.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateVehicleData('coberturaAdicional', [...vehicleData.coberturaAdicional, cobertura.id]);
                    } else {
                      updateVehicleData('coberturaAdicional', vehicleData.coberturaAdicional.filter(c => c !== cobertura.id));
                    }
                  }}
                />
                <div className="flex-1">
                  <Label htmlFor={cobertura.id}>{cobertura.label}</Label>
                </div>
                <Badge variant="outline">{cobertura.price}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep6 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl">Resumen y Cotización</CardTitle>
        <CardDescription className="text-green-50">
          Revisa tu información y obtén tu cotización
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Resumen de datos */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Resumen de tu solicitud</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Vehículo:</strong> {vehicleData.marcaVehiculo} {vehicleData.modeloVehiculo} {vehicleData.anoVehiculo}
            </div>
            <div>
              <strong>Cobertura:</strong> {vehicleData.coberturaDeseada}
            </div>
            <div>
              <strong>Nombre:</strong> {vehicleData.nombre} {vehicleData.apellido}
            </div>
            <div>
              <strong>Email:</strong> {vehicleData.email}
            </div>
          </div>
        </div>

        {/* Cotización estimada */}
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Cotización Estimada</h3>
              <p className="text-blue-700">Prima anual aproximada</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">$420/año</div>
              <div className="text-sm text-blue-600">o $35/mes</div>
            </div>
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

        {/* Información adicional */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>Esta cotización es válida por 30 días</p>
          <p>Los precios pueden variar según inspección del vehículo</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
        <div className="flex items-center justify-center mb-4">
          <Car className="w-12 h-12 mr-3" />
          <CardTitle className="text-2xl">Protege tu vehículo</CardTitle>
        </div>
        <CardDescription className="text-green-50">
          Ingresa tus datos para ver los planes que hemos ideado para tu vehículo.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label className="text-sm font-medium mb-3 block">Tipo de vehículo</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "todos", label: "Todos", active: true },
              { value: "automovil", label: "Automóvil" },
              { value: "carga", label: "Carga" },
              { value: "moto", label: "Moto" }
            ].map((tipo) => (
              <Button
                key={tipo.value}
                variant={vehicleData.tipoVehiculo === tipo.value ? "default" : "outline"}
                className={`h-12 ${tipo.active ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                onClick={() => updateVehicleData('tipoVehiculo', tipo.value)}
              >
                {tipo.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ano">Año del vehículo</Label>
            <Select value={vehicleData.anoVehiculo} onValueChange={(value) => updateVehicleData('anoVehiculo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un año" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 25 }, (_, i) => 2024 - i).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="marca">Marca del vehículo</Label>
            <Select value={vehicleData.marcaVehiculo} onValueChange={(value) => updateVehicleData('marcaVehiculo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toyota">Toyota</SelectItem>
                <SelectItem value="chevrolet">Chevrolet</SelectItem>
                <SelectItem value="ford">Ford</SelectItem>
                <SelectItem value="hyundai">Hyundai</SelectItem>
                <SelectItem value="nissan">Nissan</SelectItem>
                <SelectItem value="kia">Kia</SelectItem>
                <SelectItem value="volkswagen">Volkswagen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="modelo">Modelo del vehículo</Label>
            <Select value={vehicleData.modeloVehiculo} onValueChange={(value) => updateVehicleData('modeloVehiculo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corolla">Corolla</SelectItem>
                <SelectItem value="aveo">Aveo</SelectItem>
                <SelectItem value="fiesta">Fiesta</SelectItem>
                <SelectItem value="accent">Accent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="version">Versión del vehículo</Label>
            <Select value={vehicleData.versionVehiculo} onValueChange={(value) => updateVehicleData('versionVehiculo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una versión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estado">¿Dónde circula el vehículo mayormente?</Label>
            <Select value={vehicleData.estadoCirculacion} onValueChange={(value) => updateVehicleData('estadoCirculacion', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un estado" />
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

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">¿Posee blindaje?</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  variant={vehicleData.poseeBlindaje ? "default" : "outline"}
                  onClick={() => updateVehicleData('poseeBlindaje', true)}
                  className="flex-1"
                >
                  Sí
                </Button>
                <Button
                  variant={!vehicleData.poseeBlindaje ? "default" : "outline"}
                  onClick={() => updateVehicleData('poseeBlindaje', false)}
                  className="flex-1"
                >
                  No
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">¿Posee un asesor de seguros?</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  variant={vehicleData.poseeAsesor ? "default" : "outline"}
                  onClick={() => updateVehicleData('poseeAsesor', true)}
                  className="flex-1"
                >
                  Sí
                </Button>
                <Button
                  variant={!vehicleData.poseeAsesor ? "default" : "outline"}
                  onClick={() => updateVehicleData('poseeAsesor', false)}
                  className="flex-1"
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={nextStep}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
          disabled={!vehicleData.tipoVehiculo || !vehicleData.anoVehiculo || !vehicleData.marcaVehiculo}
        >
          Continuar
        </Button>

        <p className="text-center text-sm text-gray-600">
          Si su vehículo no se encuentra en la lista haga clic{" "}
          <Button variant="link" className="p-0 h-auto text-blue-600">
            aquí
          </Button>
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MegaMenuHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header con botón de regreso */}
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
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
          </div>

          {/* Navegación entre pasos */}
          {currentStep > 1 && (
            <div className="flex justify-between">
              <Button onClick={prevStep} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              <Button onClick={nextStep} disabled={currentStep === totalSteps}>
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

export default CotizarVehiculoMejoradoPage;
