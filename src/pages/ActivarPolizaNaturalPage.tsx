import { useState, useEffect } from "react";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, MessageCircle, CheckCircle2, Upload, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ActivarPolizaNaturalPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [placa, setPlaca] = useState("");
  const [placaValidada, setPlacaValidada] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [vehicleData, setVehicleData] = useState<{
    Marca: string | null;
    Modelo: string | null;
    Año: string | null;
    Color: string | null;
    Carroceria: string | null;
  } | null>(null);
  const [nacionalidades, setNacionalidades] = useState<Array<{ cd_valdet: string | null; descripcion: string | null }>>([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    tipoIdentificacion: "",
    numeroCedula: "",
    razonSocial: "",
    sexo: "",
    fechaNacimiento: "",
    estadoCivil: "",
    direccion: "",
    pais: "República Bolivariana de Venezuela",
    estado: "",
    ciudad: "",
    municipio: "",
    codigoTelefonico: "",
    numeroTelefonico: "",
    email: "",
    email2: "",
    serialCarroceria: "",
    fechaCompra: "",
    // Document uploads
    docIdentidad: null as File | null,
    docOrigenVehiculo: null as File | null,
    docFacturaCompra: null as File | null,
    docRIF: null as File | null,
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    const fetchNacionalidades = async () => {
      const { data, error } = await supabase
        .from('codigo_nacionalidad')
        .select('cd_valdet, descripcion')
        .order('descripcion');
      
      if (error) {
        console.error('Error loading nacionalidades:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los tipos de identificación",
          variant: "destructive",
        });
      } else if (data) {
        setNacionalidades(data);
      }
    };

    fetchNacionalidades();
  }, [toast]);

  const validatePlaca = async () => {
    setIsValidating(true);
    try {
      const response = await fetch(`https://hook.us2.make.com/bvauv3534xqm83vqccqwgev20t5h7jxe?placa=${encodeURIComponent(placa)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Verificar si la placa fue encontrada en el sistema
        if (data.Encontrado === true) {
          setVehicleData({
            Marca: data.Marca || null,
            Modelo: data.Modelo || null,
            Año: data.Año || null,
            Color: data.Color || null,
            Carroceria: data.Carroceria || null,
          });
          setPlacaValidada(true);
          setShowError(false);
          setCurrentStep(1.5);
          toast({
            title: "Vehículo encontrado",
            description: "Por favor, confirma los datos del vehículo",
          });
        } else {
          setShowError(true);
          setPlacaValidada(false);
          toast({
            title: "Placa no encontrada",
            description: "La placa no se encuentra en el sistema",
            variant: "destructive",
          });
        }
      } else {
        setShowError(true);
        setPlacaValidada(false);
        toast({
          title: "Error",
          description: "No se pudo validar la placa. Por favor, intenta nuevamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error validating placa:", error);
      setShowError(true);
      setPlacaValidada(false);
      toast({
        title: "Error",
        description: "No se pudo validar la placa. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleContactSupport = () => {
    window.open(`https://wa.me/584123230188?text=Hola, necesito ayuda con la activación de mi póliza RCV. Placa: ${placa}`, '_blank');
  };

  const handleSubmit = () => {
    console.log("Datos del formulario:", { placa, ...formData });
    toast({
      title: "Formulario enviado",
      description: "Tu solicitud ha sido procesada exitosamente",
    });
    setCurrentStep(5);
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const successVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MegaMenuHeader />
      
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <Button 
            onClick={() => navigate('/activar-poliza-rcv')}
            variant="ghost"
            className="mb-6 text-primary hover:text-primary-dark transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
              Activación Persona Natural
            </h1>
            <p className="text-muted-foreground">
              Paso {currentStep} de {totalSteps}
            </p>
            <Progress value={progress} className="mt-4" />
          </motion.div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Validación de Placa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="placa">Placa del Vehículo</Label>
                      <Input
                        id="placa"
                        placeholder="Ej: ABC123"
                        value={placa}
                        onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                        className="text-lg"
                      />
                    </div>

                    {showError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                      >
                        <p className="text-destructive font-medium mb-3">
                          Placa no encontrada en el sistema
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Por favor, contacta a nuestro equipo de soporte para resolver esta situación.
                        </p>
                        <Button
                          onClick={handleContactSupport}
                          variant="outline"
                          className="w-full gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Contactar a Soporte
                        </Button>
                      </motion.div>
                    )}

                    <Button
                      onClick={validatePlaca}
                      variant="hero"
                      size="lg"
                      className="w-full"
                      disabled={!placa || isValidating}
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        "Validar Placa"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 1.5 && vehicleData && (
              <motion.div
                key="step1.5"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-success/5 border-success/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-success">
                      <CheckCircle2 className="w-6 h-6" />
                      Vehículo Verificado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground font-medium">Marca:</p>
                          <p className="text-foreground text-lg">{vehicleData.Marca || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Modelo:</p>
                          <p className="text-foreground text-lg">{vehicleData.Modelo || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Año:</p>
                          <p className="text-foreground text-lg">{vehicleData.Año || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Color:</p>
                          <p className="text-foreground text-lg">{vehicleData.Color || "N/A"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground font-medium">Carrocería:</p>
                          <p className="text-foreground text-lg">{vehicleData.Carroceria || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => {
                          setCurrentStep(1);
                          setVehicleData(null);
                          setPlacaValidada(false);
                        }}
                        variant="destructive"
                        size="lg"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => setCurrentStep(2)}
                        variant="hero"
                        size="lg"
                        className="flex-1"
                      >
                        Continuar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Datos Personales y de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => handleInputChange("nombre", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellidos">Apellidos *</Label>
                        <Input
                          id="apellidos"
                          value={formData.apellidos}
                          onChange={(e) => handleInputChange("apellidos", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipoIdentificacion">Tipo de Identificación *</Label>
                        <Select value={formData.tipoIdentificacion} onValueChange={(value) => handleInputChange("tipoIdentificacion", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una opción" />
                          </SelectTrigger>
                          <SelectContent>
                            {nacionalidades.map((nac) => (
                              <SelectItem key={nac.cd_valdet} value={nac.cd_valdet || ""}>
                                {nac.descripcion || ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numeroCedula">Número de Cédula o RIF *</Label>
                        <Input
                          id="numeroCedula"
                          value={formData.numeroCedula}
                          onChange={(e) => handleInputChange("numeroCedula", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="razonSocial">Razón Social</Label>
                        <Input
                          id="razonSocial"
                          value={formData.razonSocial}
                          onChange={(e) => handleInputChange("razonSocial", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sexo">Sexo *</Label>
                        <Select value={formData.sexo} onValueChange={(value) => handleInputChange("sexo", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una opción" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Femenino</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                        <Input
                          id="fechaNacimiento"
                          type="date"
                          value={formData.fechaNacimiento}
                          onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estadoCivil">Estado Civil *</Label>
                        <Select value={formData.estadoCivil} onValueChange={(value) => handleInputChange("estadoCivil", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una opción" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="soltero">Soltero/a</SelectItem>
                            <SelectItem value="casado">Casado/a</SelectItem>
                            <SelectItem value="divorciado">Divorciado/a</SelectItem>
                            <SelectItem value="viudo">Viudo/a</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="direccion">Dirección *</Label>
                      <Input
                        id="direccion"
                        value={formData.direccion}
                        onChange={(e) => handleInputChange("direccion", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pais">País *</Label>
                        <Input
                          id="pais"
                          value={formData.pais}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado *</Label>
                        <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="amazonas">Amazonas</SelectItem>
                            <SelectItem value="anzoategui">Anzoátegui</SelectItem>
                            <SelectItem value="apure">Apure</SelectItem>
                            <SelectItem value="aragua">Aragua</SelectItem>
                            <SelectItem value="barinas">Barinas</SelectItem>
                            <SelectItem value="bolivar">Bolívar</SelectItem>
                            <SelectItem value="carabobo">Carabobo</SelectItem>
                            <SelectItem value="cojedes">Cojedes</SelectItem>
                            <SelectItem value="delta">Delta Amacuro</SelectItem>
                            <SelectItem value="distrito">Distrito Capital</SelectItem>
                            <SelectItem value="falcon">Falcón</SelectItem>
                            <SelectItem value="guarico">Guárico</SelectItem>
                            <SelectItem value="lara">Lara</SelectItem>
                            <SelectItem value="merida">Mérida</SelectItem>
                            <SelectItem value="miranda">Miranda</SelectItem>
                            <SelectItem value="monagas">Monagas</SelectItem>
                            <SelectItem value="nuevaesparta">Nueva Esparta</SelectItem>
                            <SelectItem value="portuguesa">Portuguesa</SelectItem>
                            <SelectItem value="sucre">Sucre</SelectItem>
                            <SelectItem value="tachira">Táchira</SelectItem>
                            <SelectItem value="trujillo">Trujillo</SelectItem>
                            <SelectItem value="vargas">Vargas</SelectItem>
                            <SelectItem value="yaracuy">Yaracuy</SelectItem>
                            <SelectItem value="zulia">Zulia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ciudad">Ciudad *</Label>
                        <Input
                          id="ciudad"
                          placeholder="Seleccione una ciudad"
                          value={formData.ciudad}
                          onChange={(e) => handleInputChange("ciudad", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="municipio">Municipio *</Label>
                        <Input
                          id="municipio"
                          placeholder="Seleccione un municipio"
                          value={formData.municipio}
                          onChange={(e) => handleInputChange("municipio", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="codigoTelefonico">Código Telefónico *</Label>
                        <Select value={formData.codigoTelefonico} onValueChange={(value) => handleInputChange("codigoTelefonico", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un código" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0412">0412</SelectItem>
                            <SelectItem value="0414">0414</SelectItem>
                            <SelectItem value="0424">0424</SelectItem>
                            <SelectItem value="0416">0416</SelectItem>
                            <SelectItem value="0426">0426</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numeroTelefonico">Número Telefónico *</Label>
                        <Input
                          id="numeroTelefonico"
                          type="tel"
                          value={formData.numeroTelefonico}
                          onChange={(e) => handleInputChange("numeroTelefonico", e.target.value)}
                          placeholder="1234567"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Dirección de correo electrónico *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email2">Email 2</Label>
                        <Input
                          id="email2"
                          type="email"
                          value={formData.email2}
                          onChange={(e) => handleInputChange("email2", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        className="flex-1"
                      >
                        Anterior
                      </Button>
                      <Button
                        onClick={() => setCurrentStep(3)}
                        variant="hero"
                        className="flex-1"
                        disabled={!formData.nombre || !formData.apellidos || !formData.numeroCedula || !formData.sexo || !formData.fechaNacimiento || !formData.estadoCivil || !formData.direccion || !formData.estado || !formData.ciudad || !formData.municipio || !formData.codigoTelefonico || !formData.numeroTelefonico || !formData.email}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Vehículo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="serialCarroceria">Serial de Carrocería *</Label>
                      <Input
                        id="serialCarroceria"
                        value={formData.serialCarroceria}
                        onChange={(e) => handleInputChange("serialCarroceria", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaCompra">Fecha de Compra en la Factura *</Label>
                      <Input
                        id="fechaCompra"
                        type="date"
                        value={formData.fechaCompra}
                        onChange={(e) => handleInputChange("fechaCompra", e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => setCurrentStep(2)}
                        variant="outline"
                        className="flex-1"
                      >
                        Anterior
                      </Button>
                      <Button
                        onClick={() => setCurrentStep(4)}
                        variant="hero"
                        className="flex-1"
                        disabled={!formData.serialCarroceria || !formData.fechaCompra}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Carga de Documentos</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Por favor, cargue las fotos de los documentos que se indican a continuación:
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="docIdentidad">
                        Cédula de Identidad, Licencia de Conducir y Certificado Médico *
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="docIdentidad"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange("docIdentidad", e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {formData.docIdentidad && (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="docOrigenVehiculo">
                        Certificado de Origen del Vehículo *
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="docOrigenVehiculo"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange("docOrigenVehiculo", e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {formData.docOrigenVehiculo && (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="docFacturaCompra">
                        Factura de Compra del Vehículo *
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="docFacturaCompra"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange("docFacturaCompra", e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {formData.docFacturaCompra && (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="docRIF">
                        RIF *
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="docRIF"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange("docRIF", e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {formData.docRIF && (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        El arriba identificado como asegurado propuesto, como solicitante de la póliza o en representación de este, 
                        declaro que la información aquí suministrada es exacta, sin omisión alguna de detalle, hecho o circunstancia, 
                        con el propósito de eliminar el riesgo, en el entendido que servirá de base para la emisión de la póliza.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => setCurrentStep(3)}
                        variant="outline"
                        className="flex-1"
                      >
                        Anterior
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        variant="hero"
                        className="flex-1"
                        disabled={!formData.docIdentidad || !formData.docOrigenVehiculo || !formData.docFacturaCompra || !formData.docRIF}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Finalizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step5"
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={{ duration: 0.3 }}
              >
                <Card className="text-center">
                  <CardContent className="py-12 px-4">
                    <motion.div
                      variants={successVariants}
                      initial="hidden"
                      animate="visible"
                      className="mb-6"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-primary" />
                      </div>
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl sm:text-3xl font-bold text-foreground mb-4"
                    >
                      ¡Activación Exitosa!
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-muted-foreground mb-8"
                    >
                      Tu póliza RCV ha sido activada correctamente. En breve recibirás un correo de confirmación.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        onClick={() => navigate('/')}
                        variant="hero"
                        size="lg"
                      >
                        Volver al Inicio
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ActivarPolizaNaturalPage;
