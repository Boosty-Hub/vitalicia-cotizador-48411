import { useState, useEffect } from "react";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, MessageCircle, CheckCircle2, Upload, Loader2, Wand2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fixEncoding } from "@/lib/utils";
import { FileUploader } from "@/components/ui/file-uploader";

const ActivarPolizaJuridicaPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [placa, setPlaca] = useState("");
  const [placaValidada, setPlacaValidada] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [numeroRIFError, setNumeroRIFError] = useState("");
  const [cedulaRepresentanteError, setCedulaRepresentanteError] = useState("");
  const [estadosCiviles, setEstadosCiviles] = useState<Array<{ descripcion: string }>>([]);
  const [sexos, setSexos] = useState<Array<{ descripcion: string }>>([]);
  const [actividadesEconomicas, setActividadesEconomicas] = useState<Array<{ descripcion: string }>>([]);
  const [estados, setEstados] = useState<Array<{ descripcion: string; cd_estado: string }>>([]);
  const [ciudades, setCiudades] = useState<Array<{ descripcion: string }>>([]);
  const [municipios, setMunicipios] = useState<Array<{ descripcion: string }>>([]);
  const [codigosTelefonicos, setCodigosTelefonicos] = useState<Array<{ s_descripcion: string }>>([]);
  const [nacionalidades, setNacionalidades] = useState<Array<{ descripcion: string }>>([]);
  const [vehicleData, setVehicleData] = useState<{
    Marca: string | null;
    Modelo: string | null;
    Año: string | null;
    Color: string | null;
    Carroceria: string | null;
    Suma: string;
    MondayId: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    // Datos de la empresa
    nombreEmpresa: "",
    tipoIdentificacion: "",
    numeroRIF: "",
    // Dirección de la empresa
    pais: "República Bolivariana de Venezuela",
    estado: "",
    municipio: "",
    ciudad: "",
    direccion: "",
    codigoPostal: "",
    codigoTelefonicoWhatsapp: "",
    telefonoCelular: "",
    codigoTelefonicoResidencial: "",
    telefonoOficina: "",
    correoElectronico: "",
    correoAlternativo: "",
    actividadEconomica: "",
    paginaWeb: "",
    // Datos del representante legal
    nombresRepresentante: "",
    apellidosRepresentante: "",
    tipoIdentificacionRepresentante: "",
    cedulaRepresentante: "",
    estadoCivilRepresentante: "",
    sexoRepresentante: "",
    fechaNacimientoRepresentante: "",
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
    docIdentidad: null as File | null,
    docLicenciaConducir: null as File | null,
    docCertificadoMedico: null as File | null,
    docOrigenVehiculo: null as File | null,
    docFacturaCompra: null as File | null,
    docRIF: null as File | null,
  });

  const [serialConfirmado, setSerialConfirmado] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    const fetchData = async () => {
      // Fetch nacionalidades
      const { data: nacData, error: nacError } = await supabase
        .from('codigo_nacionalidad')
        .select('descripcion')
        .order('descripcion');
      
      if (nacError) {
        console.error('Error fetching nacionalidades:', nacError);
      } else if (nacData) {
        setNacionalidades(nacData);
      }

      // Fetch estados civiles
      const { data: civilData, error: civilError } = await supabase
        .from('board_cod_edo_civil')
        .select('descripcion')
        .order('descripcion');
      
      if (civilError) {
        console.error('Error fetching estados civiles:', civilError);
      } else if (civilData) {
        setEstadosCiviles(civilData);
      }

      // Fetch sexos
      const { data: sexoData, error: sexoError } = await supabase
        .from('board_cod_sexo')
        .select('descripcion')
        .order('descripcion');
      
      if (sexoError) {
        console.error('Error fetching sexos:', sexoError);
      } else if (sexoData) {
        setSexos(sexoData);
      }

      // Fetch actividades económicas
      const { data: actData, error: actError } = await supabase
        .from('cod_act_economica')
        .select('descripcion')
        .order('descripcion');
      
      if (actError) {
        console.error('Error fetching actividades:', actError);
      } else if (actData) {
        // Corregir caracteres especiales mal codificados
        const actividadesCorregidas = actData.map(act => ({
          ...act,
          descripcion: fixEncoding(act.descripcion)
        }));
        setActividadesEconomicas(actividadesCorregidas);
      }

      // Fetch estados
      const { data: estadoData, error: estadoError } = await supabase
        .from('board_cod_estado')
        .select('descripcion, cd_estado')
        .order('descripcion');
      
      if (estadoError) {
        console.error('Error fetching estados:', estadoError);
      } else if (estadoData) {
        // Filtrar duplicados por descripción
        const uniqueEstados = estadoData.filter((estado, index, self) =>
          index === self.findIndex((e) => e.descripcion === estado.descripcion)
        );
        setEstados(uniqueEstados);
      }

      // Fetch códigos telefónicos
      const { data: tlfData, error: tlfError } = await supabase
        .from('board_cod_tlf')
        .select('s_descripcion')
        .order('s_descripcion');
      
      if (tlfError) {
        console.error('Error fetching codigos telefonicos:', tlfError);
      } else if (tlfData) {
        // Filtrar duplicados usando Set
        const uniqueTlf = Array.from(
          new Set(tlfData.map(item => item.s_descripcion))
        ).map(s_descripcion => ({ s_descripcion }));
        setCodigosTelefonicos(uniqueTlf);
      }
    };

    fetchData();
  }, []);

  const validatePlaca = async () => {
    setIsValidating(true);
    try {
      const response = await fetch(`https://hook.us2.make.com/bvauv3534xqm83vqccqwgev20t5h7jxe?placa=${encodeURIComponent(placa)}`);
      
      if (response.ok) {
        const data = await response.json();

        // Verificar si la placa fue encontrada en el sistema
        if (data.Encontrado === true) {
          console.log('🔍 Respuesta completa del webhook de validación de placa:', data);
          console.log('📋 MondayId recibido:', data["BERA-EMPIRE ID Monday"]);
          
          const vehicleInfo = {
            Marca: data.Marca || null,
            Modelo: data.Modelo || null,
            Año: data.Año || null,
            Color: data.Color || null,
            Carroceria: data.Carroceria || null,
            Suma: data["Precio Venta"] || "0",
            MondayId: data["BERA-EMPIRE ID Monday"] ?? null
          };
          
          console.log('💾 VehicleData guardado:', vehicleInfo);
          setVehicleData(vehicleInfo);
          
          // Pre-llenar el campo de serial de carrocería en formData
          if (data.Carroceria) {
            setFormData(prev => ({
              ...prev,
              serialCarroceria: data.Carroceria
            }));
          }
          
          setPlacaValidada(true);
          setShowError(false);
          setCurrentStep(1.5);
          toast({
            title: "Vehículo encontrado",
            description: "Por favor, confirma los datos del vehículo"
          });
        } else {
          setShowError(true);
          setPlacaValidada(false);
          toast({
            title: "Placa no encontrada",
            description: "La placa no se encuentra en el sistema",
            variant: "destructive"
          });
        }
      } else {
          setShowError(true);
          setPlacaValidada(false);
          toast({
            title: "Placa no encontrada",
            description: "La placa no se encuentra en el sistema",
            variant: "destructive"
          });
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
    // Si es el campo de número de identificación de la empresa
    if (field === "numeroRIF" && typeof value === "string") {
      const prefix = getPrefixForTipoIdentificacion(formData.tipoIdentificacion);
      
      if (prefix && !value.startsWith(prefix)) {
        if (value.length === 0) {
          value = prefix;
        } else if (!value.startsWith(prefix)) {
          value = prefix + value.replace(/^[A-Z]-?/, '');
        }
      }
      
      const error = validateNumeroRIF(value, formData.tipoIdentificacion);
      setNumeroRIFError(error);
    }
    
    // Si es el campo de cédula del representante
    if (field === "cedulaRepresentante" && typeof value === "string") {
      const prefix = getPrefixForTipoIdentificacion(formData.tipoIdentificacionRepresentante);
      
      if (prefix && !value.startsWith(prefix)) {
        if (value.length === 0) {
          value = prefix;
        } else if (!value.startsWith(prefix)) {
          value = prefix + value.replace(/^[A-Z]-?/, '');
        }
      }
      
      const error = validateNumeroRIF(value, formData.tipoIdentificacionRepresentante);
      setCedulaRepresentanteError(error);
    }

    // Si cambia el estado, cargar ciudades y municipios
    if (field === "estado" && typeof value === "string") {
      const estadoSeleccionado = estados.find(e => e.descripcion === value);
      if (estadoSeleccionado) {
        fetchCiudadesYMunicipios(estadoSeleccionado.cd_estado);
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchCiudadesYMunicipios = async (cdEstado: string) => {
    // Fetch ciudades para el estado seleccionado
    const { data: ciudadData, error: ciudadError } = await supabase
      .from('board_cod_ciudad')
      .select('descripcion')
      .eq('cd_estado', cdEstado)
      .order('descripcion');
    
    if (ciudadError) {
      console.error('Error fetching ciudades:', ciudadError);
    } else if (ciudadData) {
      // Filtrar duplicados
      const uniqueCiudades = Array.from(
        new Set(ciudadData.map(item => item.descripcion))
      ).map(descripcion => ({ descripcion }));
      setCiudades(uniqueCiudades);
    }

    // Fetch municipios para el estado seleccionado
    const { data: municipioData, error: municipioError } = await supabase
      .from('board_cod_municipio')
      .select('descripcion')
      .eq('cd_estado', cdEstado)
      .order('descripcion');
    
    if (municipioError) {
      console.error('Error fetching municipios:', municipioError);
    } else if (municipioData) {
      // Filtrar duplicados
      const uniqueMunicipios = Array.from(
        new Set(municipioData.map(item => item.descripcion))
      ).map(descripcion => ({ descripcion }));
      setMunicipios(uniqueMunicipios);
    }
  };

  const validateNumeroRIF = (value: string, tipo: string): string => {
    if (!value || !tipo) return "";
    
    switch (tipo) {
      case "Jurídico":
      case "Juridico":
      case "Gobierno":
        // Formato: J-12345678-9 (13 caracteres)
        if (value.length > 13) {
          return "El RIF no puede exceder 13 caracteres (J-12345678-9)";
        }
        if (value.length > 2 && !/^J-\d{0,8}(-\d?)?$/.test(value)) {
          return "Formato inválido. Use: J-12345678-9";
        }
        break;
      case "Venezolano":
        // Formato: V-12345678 (11 caracteres)
        if (value.length > 11) {
          return "La cédula no puede exceder 11 caracteres (V-12345678)";
        }
        if (value.length > 2 && !/^V-\d{0,8}$/.test(value)) {
          return "Formato inválido. Use: V-12345678";
        }
        break;
      case "Extranjero":
        // Formato: E-12345678 (11 caracteres)
        if (value.length > 11) {
          return "La cédula no puede exceder 11 caracteres (E-12345678)";
        }
        if (value.length > 2 && !/^E-\d{0,8}$/.test(value)) {
          return "Formato inválido. Use: E-12345678";
        }
        break;
      case "Pasaporte":
        // Formato alfanumérico, 6-15 caracteres
        if (value.length > 15) {
          return "El pasaporte no puede exceder 15 caracteres";
        }
        if (value.length > 0 && !/^[A-Z0-9]{0,15}$/.test(value)) {
          return "Solo se permiten letras y números";
        }
        break;
    }
    
    return "";
  };

  const getPrefixForTipoIdentificacion = (tipo: string): string => {
    switch (tipo) {
      case "Jurídico":
      case "Juridico":
      case "Gobierno":
        return "J-";
      case "Venezolano":
        return "V-";
      case "Extranjero":
        return "E-";
      case "Pasaporte":
        return "";
      default:
        return "";
    }
  };

  const handleTipoIdentificacionChange = (value: string) => {
    const prefix = getPrefixForTipoIdentificacion(value);
    setNumeroRIFError("");
    setFormData(prev => ({ 
      ...prev, 
      tipoIdentificacion: value,
      numeroRIF: prefix
    }));
  };

  const handleTipoIdentificacionRepresentanteChange = (value: string) => {
    const prefix = getPrefixForTipoIdentificacion(value);
    setCedulaRepresentanteError("");
    setFormData(prev => ({ 
      ...prev, 
      tipoIdentificacionRepresentante: value,
      cedulaRepresentante: prefix
    }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleContactSupport = () => {
    window.open(`https://wa.me/584123230188?text=Hola, necesito ayuda con la activación de mi póliza RCV. Placa: ${placa}`, '_blank');
  };

  const uploadFileToStorage = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('poliza-documentos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('poliza-documentos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Upload all documents to Supabase storage
      const [
        cedulaUrl,
        licenciaUrl,
        certificadoUrl,
        origenUrl,
        facturaUrl,
        rifUrl
      ] = await Promise.all([
        formData.docIdentidad ? uploadFileToStorage(formData.docIdentidad, 'cedulas') : null,
        formData.docLicenciaConducir ? uploadFileToStorage(formData.docLicenciaConducir, 'licencias') : null,
        formData.docCertificadoMedico ? uploadFileToStorage(formData.docCertificadoMedico, 'certificados') : null,
        formData.docOrigenVehiculo ? uploadFileToStorage(formData.docOrigenVehiculo, 'origenes') : null,
        formData.docFacturaCompra ? uploadFileToStorage(formData.docFacturaCompra, 'facturas') : null,
        formData.docRIF ? uploadFileToStorage(formData.docRIF, 'rifs') : null,
      ]);

      // Validate all files were uploaded
      if (!cedulaUrl || !licenciaUrl || !certificadoUrl || !origenUrl || !facturaUrl || !rifUrl) {
        throw new Error('Error al subir uno o más documentos');
      }

      // Fetch database codes with maybeSingle to handle missing data
      const { data: marcaData } = await supabase
        .from('board_cod_marca')
        .select('cd_marca, descripcion')
        .eq('descripcion', vehicleData?.Marca || '')
        .maybeSingle();

      const { data: modeloData } = await supabase
        .from('board_cod_modelo')
        .select('cd_modelo, descripcion')
        .eq('descripcion', vehicleData?.Modelo || '')
        .maybeSingle();

      const { data: versionData } = await supabase
        .from('board_cod_version_moto')
        .select('cd_version, descripcion')
        .eq('descripcion', vehicleData?.Modelo || '')
        .maybeSingle();

      const { data: colorData } = await supabase
        .from('board_cod_color')
        .select('cd_valdet, descripcion')
        .ilike('descripcion', vehicleData?.Color || '')
        .maybeSingle();

      const { data: estadoData } = await supabase
        .from('board_cod_estado')
        .select('cd_estado, descripcion')
        .eq('descripcion', formData.estado)
        .maybeSingle();

      const { data: ciudadData } = await supabase
        .from('board_cod_ciudad')
        .select('cd_ciudad, descripcion')
        .eq('descripcion', formData.ciudad)
        .eq('cd_estado', estadoData?.cd_estado || '')
        .maybeSingle();

      // Debug logs
      console.log('Valores del formulario:', {
        pais: 'República Bolivariana de Venezuela',
        estado: formData.estado,
        ciudad: formData.ciudad,
        municipio: formData.municipio,
        estadoCodigo: estadoData?.cd_estado
      });

      console.log('Ciudad data:', ciudadData);

      // Query municipio with proper relationships (cd_pais, cd_estado only)
      const { data: municipioData } = await supabase
        .from('board_cod_municipio')
        .select('cd_municipio, cd_ciudad, cd_estado, cd_pais, descripcion')
        .ilike('descripcion', formData.municipio)
        .eq('cd_pais', '001')
        .eq('cd_estado', estadoData?.cd_estado || '')
        .maybeSingle();

      console.log('Municipio data:', municipioData);
      console.log('Relaciones verificadas:', {
        pais: '001',
        estado: estadoData?.cd_estado,
        ciudad: ciudadData?.cd_ciudad,
        municipio: municipioData?.cd_municipio
      });

      const { data: actividadData } = await supabase
        .from('cod_act_economica')
        .select('cd_actividad, descripcion')
        .ilike('descripcion', formData.actividadEconomica)
        .maybeSingle();

      const { data: codigoTelef1Data } = await supabase
        .from('board_cod_tlf')
        .select('cd_valdet, s_descripcion')
        .ilike('s_descripcion', formData.codigoTelefonicoWhatsapp)
        .maybeSingle();

      console.log('Codigo telefono 1 data:', codigoTelef1Data);

      const { data: codigoTelef2Data } = await supabase
        .from('board_cod_tlf')
        .select('cd_valdet, s_descripcion')
        .ilike('s_descripcion', formData.codigoTelefonicoResidencial)
        .maybeSingle();

      console.log('Codigo telefono 2 data:', codigoTelef2Data);

      // Extract prefix and number from RIF/Cedula
      const extractIdentification = (value: string) => {
        const match = value.match(/^([A-Z])-(\d+)(-\d+)?$/);
        return match ? { prefix: match[1], number: match[2] } : { prefix: '', number: value };
      };

      const empresaId = extractIdentification(formData.numeroRIF);
      const representanteId = extractIdentification(formData.cedulaRepresentante);

      // Create the JSON structure
      const jsonData = {
        f_fchdesde: new Date().toISOString().split('T')[0],
        c_placa: placa,
        c_carroceria: formData.serialCarroceria,
        c_cd_nacionalidad: empresaId.prefix,
        c_cd_nacionalidad_descripcion: formData.tipoIdentificacion,
        n_cedrif: empresaId.number,
        n_correlativo: 0,
        cd_sexo: formData.sexoRepresentante === "Masculino" ? "M" : formData.sexoRepresentante === "Femenino" ? "F" : "N",
        cd_sexo_descripcion: formData.sexoRepresentante,
        f_fecnac: formData.fechaNacimientoRepresentante,
        cd_edocivil: formData.estadoCivilRepresentante?.charAt(0) || "S",
        cd_edocivil_descripcion: formData.estadoCivilRepresentante,
        c_nombre: formData.nombresRepresentante,
        c_apellido: formData.apellidosRepresentante,
        c_razonsocial: formData.nombreEmpresa,
        c_cd_pais: "001",
        c_cd_pais_descripcion: formData.pais,
        c_cd_estado: estadoData?.cd_estado || "",
        c_cd_estado_descripcion: formData.estado,
        c_cd_ciudad: ciudadData?.cd_ciudad || "",
        c_cd_ciudad_descripcion: formData.ciudad,
        c_cd_municipio: municipioData?.cd_municipio || "",
        c_cd_municipio_descripcion: formData.municipio,
        c_direccion: formData.direccion,
        c_codpostal: formData.codigoPostal,
        c_cd_telef1: codigoTelef1Data?.cd_valdet || "",
        c_numtelef1: formData.telefonoCelular,
        c_cd_telef2: codigoTelef2Data?.cd_valdet || "",
        c_cd_telef2_descripcion: formData.codigoTelefonicoResidencial,
        c_numtelef2: formData.telefonoOficina,
        c_email1: formData.correoElectronico,
        c_email2: formData.correoAlternativo,
        c_cd_actividad: actividadData?.cd_actividad || "0",
        c_cd_actividad_descripcion: formData.actividadEconomica,
        c_cd_ocupacion: 0,
        c_cd_ocupacion_descripcion: "No aplica",
        n_ingresoanualnac: 0,
        c_cd_nacionalidadap: representanteId.prefix,
        c_cd_nacionalidadap_descripcion: formData.tipoIdentificacionRepresentante,
        n_cedrifap: representanteId.number,
        cd_sexoap: formData.sexoRepresentante === "Masculino" ? "M" : formData.sexoRepresentante === "Femenino" ? "F" : "N",
        cd_sexoap_descripcion: formData.sexoRepresentante,
        f_fecnacap: formData.fechaNacimientoRepresentante,
        cd_edocivilap: formData.estadoCivilRepresentante?.charAt(0) || "S",
        cd_edocivilap_descripcion: formData.estadoCivilRepresentante,
        c_nombreap: "Sin Nombre",
        c_apellidoap: "Sin Nombre",
        c_cd_nacionalidadch: representanteId.prefix,
        c_cd_nacionalidadch_descripcion: formData.tipoIdentificacionRepresentante,
        n_cedrifch: representanteId.number,
        cd_sexoch: formData.sexoRepresentante === "Masculino" ? "M" : formData.sexoRepresentante === "Femenino" ? "F" : "N",
        cd_sexoch_descripcion: formData.sexoRepresentante,
        f_fecnacch: formData.fechaNacimientoRepresentante,
        cd_edocivilch: formData.estadoCivilRepresentante?.charAt(0) || "S",
        cd_edocivilch_descripcion: formData.estadoCivilRepresentante,
        c_nombrech: formData.nombresRepresentante,
        c_apellidoch: formData.apellidosRepresentante,
        cd_moneda: "DL",
        cd_moneda_descripcion: "Dólares",
        c_cd_marca: marcaData?.cd_marca || "",
        c_cd_marca_descripcion: vehicleData?.Marca || "",
        c_cd_modelo: modeloData?.cd_modelo || "",
        c_cd_modelo_descripcion: vehicleData?.Modelo || "",
        c_cd_version: versionData?.cd_version || "",
        c_cd_version_descripcion: vehicleData?.Modelo || "",
        n_nu_centuria: vehicleData?.Año || new Date().getFullYear().toString(),
        n_nu_centuria_descripcion: vehicleData?.Año || new Date().getFullYear().toString(),
        c_motor: formData.serialCarroceria,
        c_cd_color: colorData?.cd_valdet || "",
        c_cd_color_descripcion: vehicleData?.Color || "",
        f_feccompra: formData.fechaAdquisicion,
        c_cd_versionseguro: "BERA2025",
        c_cd_subversionseguro: "BERAWEB01",
        n_suma: vehicleData?.Suma || "0",
        desde: "web",
        mondayid: vehicleData?.MondayId || "null",
        listaColumnas: [
          {
            nombre: "Cédula de identidad URL",
            url: cedulaUrl,
            columnaID: "file_mkpytq4p"
          },
          {
            nombre: "Licencia de conducir URL",
            url: licenciaUrl,
            columnaID: "file_mkpz6yzk"
          },
          {
            nombre: "Certificado médico URL",
            url: certificadoUrl,
            columnaID: "file_mkpz3ckf"
          },
          {
            nombre: "Certificado de Origen del Vehículo URL",
            url: origenUrl,
            columnaID: "file_mkpy886c"
          },
          {
            nombre: "Factura de Compra del Vehículo URL",
            url: facturaUrl,
            columnaID: "file_mkpy429y"
          },
          {
            nombre: "RIF URL",
            url: rifUrl,
            columnaID: "file_mkpyt85x"
          }
        ]
      };

      console.log("📤 JSON enviado al webhook:", jsonData);

      // Send to webhook
      const response = await fetch('https://hook.us2.make.com/adb9tmwyo3b4he9lsr7spxwosjmfggdp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });

      if (!response.ok) {
        throw new Error(`Error del webhook: ${response.status}`);
      }

      toast({
        title: "✅ Formulario enviado",
        description: "Tu solicitud ha sido procesada exitosamente",
      });
      setCurrentStep(7);

    } catch (error) {
      console.error('❌ Error al enviar el formulario:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al procesar tu solicitud. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillTestDataStep2 = () => {
    setFormData(prev => ({
      ...prev,
      nombreEmpresa: "Inversiones El Roble C.A.",
      tipoIdentificacion: "RIF",
      numeroRIF: "J-12345678-9"
    }));
    toast({
      title: "Datos de prueba cargados",
      description: "Formulario llenado con datos aleatorios"
    });
  };

  const fillTestDataStep3 = () => {
    setFormData(prev => ({
      ...prev,
      nombresRepresentante: "Carlos Alberto",
      apellidosRepresentante: "González Pérez",
      tipoIdentificacionRepresentante: "Venezolano",
      cedulaRepresentante: "V-12345678",
      estadoCivilRepresentante: "Casado",
      sexoRepresentante: "Masculino",
      fechaNacimientoRepresentante: "1985-05-15"
    }));
    toast({
      title: "Datos de prueba cargados",
      description: "Formulario llenado con datos aleatorios"
    });
  };

  const fillTestDataStep4 = () => {
    setFormData(prev => ({
      ...prev,
      actividadEconomica: "Comercio",
      direccion: "Av. Principal, Centro Empresarial Torre Norte, Piso 5",
      estado: "Distrito Capital",
      ciudad: "Caracas",
      municipio: "Libertador",
      codigoPostal: "1050",
      codigoTelefonicoWhatsapp: "0412",
      telefonoCelular: "9876543",
      codigoTelefonicoResidencial: "0212",
      telefonoOficina: "5551234",
      correoElectronico: "contacto@empresa-test.com",
      correoAlternativo: "info@empresa-test.com"
    }));
    toast({
      title: "Datos de prueba cargados",
      description: "Formulario llenado con datos aleatorios"
    });
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
                        onClick={() => {
                          if (vehicleData?.Carroceria) {
                            setFormData(prev => ({
                              ...prev,
                              serialCarroceria: vehicleData.Carroceria || ""
                            }));
                          }
                          setCurrentStep(2);
                        }}
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
                    <CardTitle className="flex items-center justify-between">
                      <span>Datos del Tomador</span>
                      <Button
                        onClick={fillTestDataStep2}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        Llenar Prueba
                      </Button>
                    </CardTitle>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipoIdentificacion">
                          Tipo de Identificación <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.tipoIdentificacion}
                          onValueChange={handleTipoIdentificacionChange}
                        >
                          <SelectTrigger id="tipoIdentificacion">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {nacionalidades
                              .filter((nac) => 
                                nac.descripcion.toLowerCase() === 'jurídico' || 
                                nac.descripcion.toLowerCase() === 'gobierno'
                              )
                              .map((nac) => (
                                <SelectItem key={nac.descripcion} value={nac.descripcion}>
                                  {nac.descripcion}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numeroRIF">
                          {formData.tipoIdentificacion === "Jurídico" || formData.tipoIdentificacion === "Juridico" || formData.tipoIdentificacion === "Gobierno"
                            ? "Número de RIF" 
                            : formData.tipoIdentificacion === "Venezolano"
                            ? "Número de Cédula" 
                            : formData.tipoIdentificacion === "Extranjero"
                            ? "Número de Cédula"
                            : formData.tipoIdentificacion === "Pasaporte"
                            ? "Número de Pasaporte"
                            : "Número de Identificación"} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="numeroRIF"
                          placeholder={
                            formData.tipoIdentificacion === "Jurídico" || formData.tipoIdentificacion === "Juridico" || formData.tipoIdentificacion === "Gobierno"
                              ? "J-12345678-9" 
                            : formData.tipoIdentificacion === "Venezolano"
                              ? "V-12345678" 
                            : formData.tipoIdentificacion === "Extranjero"
                              ? "E-12345678"
                              : formData.tipoIdentificacion === "Pasaporte"
                              ? "123456789"
                              : "Ingrese el número"
                          }
                          value={formData.numeroRIF}
                          onChange={(e) => handleInputChange("numeroRIF", e.target.value)}
                          className={numeroRIFError ? "border-destructive" : ""}
                        />
                        {numeroRIFError && (
                          <p className="text-sm text-destructive">{numeroRIFError}</p>
                        )}
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
                        disabled={!formData.nombreEmpresa || !formData.tipoIdentificacion || !formData.numeroRIF || !!numeroRIFError}
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
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-primary">DATOS DEL REPRESENTANTE LEGAL</span>
                      <Button
                        onClick={fillTestDataStep3}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        Llenar Prueba
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombresRepresentante">
                          Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="nombresRepresentante"
                          value={formData.nombresRepresentante}
                          onChange={(e) => handleInputChange("nombresRepresentante", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellidosRepresentante">
                          Apellidos <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="apellidosRepresentante"
                          value={formData.apellidosRepresentante}
                          onChange={(e) => handleInputChange("apellidosRepresentante", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipoIdentificacionRepresentante">
                          Tipo de Identificación <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.tipoIdentificacionRepresentante}
                          onValueChange={handleTipoIdentificacionRepresentanteChange}
                        >
                          <SelectTrigger id="tipoIdentificacionRepresentante">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {nacionalidades
                              .filter((nac) => 
                                nac.descripcion.toLowerCase() === 'venezolano' || 
                                nac.descripcion.toLowerCase() === 'extranjero' ||
                                nac.descripcion.toLowerCase() === 'pasaporte'
                              )
                              .map((nac) => (
                                <SelectItem key={nac.descripcion} value={nac.descripcion}>
                                  {nac.descripcion}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cedulaRepresentante">
                          {formData.tipoIdentificacionRepresentante === "Jurídico" || formData.tipoIdentificacionRepresentante === "Juridico" || formData.tipoIdentificacionRepresentante === "Gobierno"
                            ? "Número de RIF" 
                            : formData.tipoIdentificacionRepresentante === "Venezolano"
                            ? "Número de Cédula" 
                            : formData.tipoIdentificacionRepresentante === "Extranjero"
                            ? "Número de Cédula"
                            : formData.tipoIdentificacionRepresentante === "Pasaporte"
                            ? "Número de Pasaporte"
                            : "Número de Identificación"} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="cedulaRepresentante"
                          placeholder={
                            formData.tipoIdentificacionRepresentante === "Jurídico" || formData.tipoIdentificacionRepresentante === "Juridico" || formData.tipoIdentificacionRepresentante === "Gobierno"
                              ? "J-12345678-9" 
                            : formData.tipoIdentificacionRepresentante === "Venezolano"
                              ? "V-12345678" 
                            : formData.tipoIdentificacionRepresentante === "Extranjero"
                              ? "E-12345678"
                              : formData.tipoIdentificacionRepresentante === "Pasaporte"
                              ? "123456789"
                              : "Ingrese el número"
                          }
                          value={formData.cedulaRepresentante}
                          onChange={(e) => handleInputChange("cedulaRepresentante", e.target.value)}
                          className={cedulaRepresentanteError ? "border-destructive" : ""}
                        />
                        {cedulaRepresentanteError && (
                          <p className="text-sm text-destructive">{cedulaRepresentanteError}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estadoCivilRepresentante">
                        Estado Civil <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.estadoCivilRepresentante}
                        onValueChange={(value) => handleInputChange("estadoCivilRepresentante", value)}
                      >
                        <SelectTrigger id="estadoCivilRepresentante">
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {estadosCiviles.map((estado) => (
                            <SelectItem key={estado.descripcion} value={estado.descripcion}>
                              {estado.descripcion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sexoRepresentante">
                          Sexo <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.sexoRepresentante}
                          onValueChange={(value) => handleInputChange("sexoRepresentante", value)}
                        >
                          <SelectTrigger id="sexoRepresentante">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {sexos.map((sexo) => (
                              <SelectItem key={sexo.descripcion} value={sexo.descripcion}>
                                {sexo.descripcion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fechaNacimientoRepresentante">
                          Fecha de Nacimiento <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="fechaNacimientoRepresentante"
                          type="date"
                          value={formData.fechaNacimientoRepresentante}
                          onChange={(e) => handleInputChange("fechaNacimientoRepresentante", e.target.value)}
                        />
                      </div>
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
                        disabled={
                          !formData.nombresRepresentante || 
                          !formData.apellidosRepresentante || 
                          !formData.tipoIdentificacionRepresentante || 
                          !formData.cedulaRepresentante ||
                          !formData.estadoCivilRepresentante ||
                          !formData.sexoRepresentante ||
                          !formData.fechaNacimientoRepresentante ||
                          !!cedulaRepresentanteError
                        }
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
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-primary">Información de Contacto</span>
                      <Button
                        onClick={fillTestDataStep4}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        Llenar Prueba
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pais">
                        País <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="pais"
                        value={formData.pais}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="actividadEconomica">Actividad económica</Label>
                      <Select
                        value={formData.actividadEconomica}
                        onValueChange={(value) => handleInputChange("actividadEconomica", value)}
                      >
                        <SelectTrigger id="actividadEconomica">
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {actividadesEconomicas.map((act) => (
                            <SelectItem key={act.descripcion} value={act.descripcion}>
                              {act.descripcion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="direccion">
                        Dirección <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="direccion"
                        value={formData.direccion}
                        onChange={(e) => handleInputChange("direccion", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estado">
                          Estado <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.estado}
                          onValueChange={(value) => handleInputChange("estado", value)}
                        >
                          <SelectTrigger id="estado">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {estados.map((estado) => (
                              <SelectItem key={estado.cd_estado} value={estado.descripcion}>
                                {estado.descripcion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ciudad">
                          Ciudad <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.ciudad}
                          onValueChange={(value) => handleInputChange("ciudad", value)}
                        >
                          <SelectTrigger id="ciudad">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ciudades.map((ciudad) => (
                              <SelectItem key={ciudad.descripcion} value={ciudad.descripcion}>
                                {ciudad.descripcion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="municipio">
                          Municipio <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.municipio}
                          onValueChange={(value) => handleInputChange("municipio", value)}
                        >
                          <SelectTrigger id="municipio">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {municipios.map((municipio) => (
                              <SelectItem key={municipio.descripcion} value={municipio.descripcion}>
                                {municipio.descripcion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="codigoPostal">Código Postal</Label>
                        <Input
                          id="codigoPostal"
                          value={formData.codigoPostal}
                          onChange={(e) => handleInputChange("codigoPostal", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="codigoTelefonicoWhatsapp">
                          Código Telefónico <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.codigoTelefonicoWhatsapp}
                          onValueChange={(value) => handleInputChange("codigoTelefonicoWhatsapp", value)}
                        >
                          <SelectTrigger id="codigoTelefonicoWhatsapp">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {codigosTelefonicos.map((codigo) => (
                              <SelectItem key={codigo.s_descripcion} value={codigo.s_descripcion}>
                                {codigo.s_descripcion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefonoCelular">
                          Número Telefónico con Whatsapp <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="telefonoCelular"
                          value={formData.telefonoCelular}
                          onChange={(e) => handleInputChange("telefonoCelular", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="codigoTelefonicoResidencial">
                          Código Telefónico <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.codigoTelefonicoResidencial}
                          onValueChange={(value) => handleInputChange("codigoTelefonicoResidencial", value)}
                        >
                          <SelectTrigger id="codigoTelefonicoResidencial">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {codigosTelefonicos.map((codigo) => (
                              <SelectItem key={codigo.s_descripcion} value={codigo.s_descripcion}>
                                {codigo.s_descripcion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefonoOficina">
                          Número Residencial <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="telefonoOficina"
                          value={formData.telefonoOficina}
                          onChange={(e) => handleInputChange("telefonoOficina", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="correoElectronico">
                          Dirección de correo electrónico <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="correoElectronico"
                          type="email"
                          value={formData.correoElectronico}
                          onChange={(e) => handleInputChange("correoElectronico", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="correoAlternativo">
                          Correo alternativo <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="correoAlternativo"
                          type="email"
                          value={formData.correoAlternativo}
                          onChange={(e) => handleInputChange("correoAlternativo", e.target.value)}
                        />
                      </div>
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
                        onClick={() => setCurrentStep(5)}
                        variant="hero"
                        className="flex-1"
                        disabled={
                          !formData.direccion ||
                          !formData.estado ||
                          !formData.ciudad ||
                          !formData.municipio ||
                          !formData.codigoTelefonicoWhatsapp ||
                          !formData.telefonoCelular ||
                          !formData.codigoTelefonicoResidencial ||
                          !formData.telefonoOficina ||
                          !formData.correoElectronico ||
                          !formData.correoAlternativo
                        }
                      >
                        Siguiente
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary text-center">INFORMACION SOBRE EL VEHICULO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="placaMoto">
                        Placa de la Moto <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="placaMoto"
                        value={placa.toUpperCase()}
                        onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                        placeholder="Ingrese la placa"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serialCarroceria">
                        Serial de Carrocería <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="serialCarroceria"
                        value={formData.serialCarroceria || vehicleData?.Carroceria || ""}
                        onChange={(e) => {
                          handleInputChange("serialCarroceria", e.target.value);
                          setSerialConfirmado(null);
                        }}
                        placeholder="Ingrese el serial de carrocería"
                      />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg space-y-4">
                      <p className="text-blue-900 dark:text-blue-100 text-sm font-medium">
                        Confirme que este sea su serial de carrocería.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => setSerialConfirmado(true)}
                          variant={serialConfirmado === true ? "default" : "outline"}
                          className={serialConfirmado === true ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Sí es
                        </Button>
                        <Button
                          onClick={() => setSerialConfirmado(false)}
                          variant={serialConfirmado === false ? "destructive" : "outline"}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          No es
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaAdquisicion">
                        Fecha de Compra en la Factura <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fechaAdquisicion"
                        type="date"
                        value={formData.fechaAdquisicion}
                        onChange={(e) => handleInputChange("fechaAdquisicion", e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => setCurrentStep(4)}
                        variant="outline"
                        className="flex-1"
                      >
                        Anterior
                      </Button>
                      <Button
                        onClick={() => setCurrentStep(6)}
                        variant="hero"
                        className="flex-1"
                        disabled={
                          !placa ||
                          !formData.serialCarroceria ||
                          serialConfirmado !== true ||
                          !formData.fechaAdquisicion
                        }
                      >
                        Siguiente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 6 && (
              <motion.div
                key="step6"
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
                    <FileUploader
                      id="docIdentidad"
                      label="Cédula de Identidad"
                      file={formData.docIdentidad}
                      onFileChange={(file) => handleFileChange("docIdentidad", file)}
                      required
                    />

                    <FileUploader
                      id="docLicenciaConducir"
                      label="Licencia de Conducir"
                      file={formData.docLicenciaConducir}
                      onFileChange={(file) => handleFileChange("docLicenciaConducir", file)}
                      required
                    />

                    <FileUploader
                      id="docCertificadoMedico"
                      label="Certificado Médico"
                      file={formData.docCertificadoMedico}
                      onFileChange={(file) => handleFileChange("docCertificadoMedico", file)}
                      required
                    />

                    <FileUploader
                      id="docOrigenVehiculo"
                      label="Certificado de Origen del Vehículo"
                      file={formData.docOrigenVehiculo}
                      onFileChange={(file) => handleFileChange("docOrigenVehiculo", file)}
                      required
                    />

                    <FileUploader
                      id="docFacturaCompra"
                      label="Factura de Compra del Vehículo"
                      file={formData.docFacturaCompra}
                      onFileChange={(file) => handleFileChange("docFacturaCompra", file)}
                      required
                    />

                    <FileUploader
                      id="docRIF"
                      label="RIF"
                      file={formData.docRIF}
                      onFileChange={(file) => handleFileChange("docRIF", file)}
                      required
                    />

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        El arriba identificado como asegurado propuesto, como solicitante de la póliza o en representación de este, 
                        declaro que la información aquí suministrada es exacta, sin omisión alguna de detalle, hecho o circunstancia, 
                        con el propósito de eliminar el riesgo, en el entendido que servirá de base para la emisión de la póliza.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={() => setCurrentStep(5)} 
                        variant="outline" 
                        className="flex-1" 
                        disabled={isSubmitting}
                      >
                        Anterior
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        variant="hero" 
                        className="flex-1" 
                        disabled={
                          isSubmitting || 
                          !formData.docIdentidad || 
                          !formData.docLicenciaConducir || 
                          !formData.docCertificadoMedico || 
                          !formData.docOrigenVehiculo || 
                          !formData.docFacturaCompra || 
                          !formData.docRIF
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Finalizar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 7 && (
              <motion.div
                key="step7"
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

      {/* Popup Loader */}
      <Dialog open={isSubmitting}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Procesando solicitud</h3>
            <p className="text-sm text-muted-foreground text-center">
              Subiendo documentos y enviando información...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivarPolizaJuridicaPage;
