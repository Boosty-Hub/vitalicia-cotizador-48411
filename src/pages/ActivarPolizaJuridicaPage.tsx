import { useState } from "react";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, MessageCircle, CheckCircle2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const ActivarPolizaJuridicaPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [placa, setPlaca] = useState("");
  const [placaValidada, setPlacaValidada] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [formData, setFormData] = useState({
    // Datos de la empresa
    nombreEmpresa: "",
    numeroRIF: "",
    // Dirección de la empresa
    pais: "República Bolivariana de Venezuela",
    estado: "",
    municipio: "",
    ciudad: "",
    telefonoCelular: "",
    telefonoOficina: "",
    correoElectronico: "",
    actividadEconomica: "",
    paginaWeb: "",
    // Datos del representante legal
    nombresRepresentante: "",
    apellidosRepresentante: "",
    cedulaRepresentante: "",
    fechaNacimientoRepresentante: "",
    nacionalidadRepresentante: "",
    sexoRepresentante: "",
    telefonoCelularRepresentante: "",
    correoRepresentante: "",
    // Información del vehículo
    serialCarroceria: "",
    marca: "",
    modelo: "",
    version: "",
    ano: "",
    color: "",
    tipo: "",
    numeroPuestos: "",
    capacidadCarga: "",
    transmision: "",
    fechaAdquisicion: "",
    // Conductor habitual
    nombresConductor: "",
    apellidosConductor: "",
    cedulaConductor: "",
    fechaNacimientoConductor: "",
    // Coberturas
    danoCosas: "",
    rcExceso: "",
    perdidaTotal: "",
    grua: "",
    accidentesPasajeros: "",
    gastosMedicos: "",
    asistenciaJuridica: "",
    // Document uploads
    docCedulaLicenciaMedico: null as File | null,
    docOrigenVehiculo: null as File | null,
    docFacturaCompra: null as File | null,
    docRIF: null as File | null,
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const validatePlaca = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('https://avlbdqqwldjteafmzwjb.supabase.co/functions/v1/validate-placa-step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placa: placa.toUpperCase()
        })
      });

      if (!response.ok) {
        throw new Error('Error al validar la placa');
      }

      const data = await response.json();

      if (data.success) {
        setPlacaValidada(true);
        setShowError(false);
        setCurrentStep(2);
        toast({
          title: "Placa encontrada",
          description: "Continúa con el proceso de activación",
        });
      } else {
        setShowError(true);
        setPlacaValidada(false);
      }
    } catch (error) {
      console.error('Error validating placa:', error);
      setShowError(true);
      setPlacaValidada(false);
      toast({
        title: "Error",
        description: "No se pudo validar la placa. Por favor intente nuevamente.",
        variant: "destructive"
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
    setCurrentStep(7);
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
              Activación Persona Jurídica
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
                      {isValidating ? "Validando..." : "Validar Placa"}
                    </Button>
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
                    <CardTitle>Datos de la Empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombreEmpresa">Razón Social</Label>
                      <Input
                        id="nombreEmpresa"
                        value={formData.nombreEmpresa}
                        onChange={(e) => handleInputChange("nombreEmpresa", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroRIF">RIF</Label>
                      <Input
                        id="numeroRIF"
                        value={formData.numeroRIF}
                        onChange={(e) => handleInputChange("numeroRIF", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombresRepresentante">Nombre del Representante</Label>
                        <Input
                          id="nombresRepresentante"
                          value={formData.nombresRepresentante}
                          onChange={(e) => handleInputChange("nombresRepresentante", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cedulaRepresentante">Cédula del Representante</Label>
                        <Input
                          id="cedulaRepresentante"
                          value={formData.cedulaRepresentante}
                          onChange={(e) => handleInputChange("cedulaRepresentante", e.target.value)}
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
                        disabled={!formData.nombreEmpresa || !formData.numeroRIF || !formData.nombresRepresentante || !formData.cedulaRepresentante}
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
                    <CardTitle>Información de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefonoCelular">Teléfono</Label>
                      <Input
                        id="telefonoCelular"
                        type="tel"
                        value={formData.telefonoCelular}
                        onChange={(e) => handleInputChange("telefonoCelular", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="correoElectronico">Correo Electrónico</Label>
                      <Input
                        id="correoElectronico"
                        type="email"
                        value={formData.correoElectronico}
                        onChange={(e) => handleInputChange("correoElectronico", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ciudad">Dirección Fiscal</Label>
                      <Input
                        id="ciudad"
                        value={formData.ciudad}
                        onChange={(e) => handleInputChange("ciudad", e.target.value)}
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
                        onClick={handleSubmit}
                        variant="hero"
                        className="flex-1"
                        disabled={!formData.telefonoCelular || !formData.correoElectronico || !formData.ciudad}
                      >
                        Finalizar
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
                <Card className="text-center">
                  <CardContent className="py-12 px-4">
                    <motion.div
                      variants={successVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                      }}
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

export default ActivarPolizaJuridicaPage;
