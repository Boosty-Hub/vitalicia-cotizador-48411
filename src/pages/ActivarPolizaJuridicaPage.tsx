import { useState, useEffect } from "react";
import { SimpleHeader } from "@/components/ui/SimpleHeader";
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
  const [ciudades, setCiudades] = useState<Array<{ id: string; cd_ciudad: string | null; descripcion: string | null; cd_estado: string | null }>>([]);
  const [municipios, setMunicipios] = useState<Array<{ id: string; cd_municipio: string | null; descripcion: string | null; cd_ciudad: string | null }>>([]);
  const [codigosTelefonicos, setCodigosTelefonicos] = useState<Array<{ cd_valdet: string; s_descripcion: string }>>([]);
  const [nacionalidades, setNacionalidades] = useState<Array<{ descripcion: string }>>([]);
  const [vehicleData, setVehicleData] = useState<{
    Marca: string | null;
    Modelo: string | null;
    Año: string | null;
    Color: string | null;
    Carroceria: string | null;
    Suma: string;
    MondayId: string | null;
    Source?: 'bd_bera' | 'bd_empire';
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
        .select('cd_valdet, s_descripcion')
        .order('cd_valdet');
      
      if (tlfError) {
        console.error('Error fetching codigos telefonicos:', tlfError);
      } else if (tlfData) {
        // Filtrar duplicados por cd_valdet
        const uniqueTlf = tlfData.filter((item, index, self) =>
          item.cd_valdet && index === self.findIndex((t) => t.cd_valdet === item.cd_valdet)
        );
        setCodigosTelefonicos(uniqueTlf);
      }
    };

    fetchData();
  }, []);

  // Fetch ciudades when estado changes
  useEffect(() => {
    const fetchCiudades = async () => {
      if (!formData.estado) {
        setCiudades([]);
        return;
      }
      
      const estadoSeleccionado = estados.find(e => e.descripcion === formData.estado);
      if (!estadoSeleccionado) return;

      const { data, error } = await supabase
        .from('board_cod_ciudad')
        .select('id, cd_ciudad, descripcion, cd_estado')
        .eq('cd_estado', estadoSeleccionado.cd_estado)
        .not('cd_ciudad', 'is', null)
        .order('descripcion');
      
      if (error) {
        console.error('Error loading ciudades:', error);
      } else if (data) {
        const fixedData = data.map(item => ({
          ...item,
          descripcion: fixEncoding(item.descripcion)
        }));
        setCiudades(fixedData);
      }
    };
    fetchCiudades();
  }, [formData.estado, estados]);

  // Fetch municipios when ciudad changes
  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!formData.ciudad || !formData.estado) {
        setMunicipios([]);
        return;
      }
      
      // Get cd_ciudad from the selected ciudad id
      const ciudadSeleccionada = ciudades.find(c => c.id === formData.ciudad);
      if (!ciudadSeleccionada?.cd_ciudad) return;

      // Get cd_estado from the selected estado
      const estadoSeleccionado = estados.find(e => e.descripcion === formData.estado);
      if (!estadoSeleccionado?.cd_estado) return;

      const { data, error } = await supabase
        .from('board_cod_municipio')
        .select('id, cd_municipio, descripcion, cd_ciudad, cd_estado')
        .eq('cd_ciudad', ciudadSeleccionada.cd_ciudad)
        .eq('cd_estado', estadoSeleccionado.cd_estado)
        .not('descripcion', 'is', null)
        .order('descripcion');
      
      if (error) {
        console.error('Error loading municipios:', error);
      } else if (data) {
        const fixedData = data.map(item => ({
          ...item,
          descripcion: fixEncoding(item.descripcion)
        }));
        setMunicipios(fixedData);
      }
    };
    fetchMunicipios();
  }, [formData.ciudad, formData.estado, ciudades, estados]);

  const validatePlaca = async () => {
    setIsValidating(true);
    try {
      const placaUpper = placa.toUpperCase().trim();
      
      // 1. Buscar en bd_bera
      const { data: beraData, error: beraError } = await supabase
        .from('bd_bera')
        .select('*')
        .ilike('placa', placaUpper)
        .maybeSingle();

      if (beraError) {
        console.error('Error buscando en bd_bera:', beraError);
      }

      if (beraData) {
        console.log('✅ Vehículo encontrado en bd_bera:', beraData);
        const vehicleInfo = {
          Marca: beraData.marca || null,
          Modelo: beraData.modelo || null,
          Año: beraData.anio_modelo?.toString() || null,
          Color: beraData.color || null,
          Carroceria: beraData.serial_chasis || null,
          Suma: beraData.precio_venta_tienda?.toString() || "0",
          MondayId: null,
          Source: 'bd_bera' as const
        };
        
        setVehicleData(vehicleInfo);
        
        // Pre-llenar el campo de serial de carrocería
        if (beraData.serial_chasis) {
          setFormData(prev => ({
            ...prev,
            serialCarroceria: beraData.serial_chasis || ''
          }));
        }
        
        setPlacaValidada(true);
        setShowError(false);
        setCurrentStep(1.5);
        toast({
          title: "Vehículo BERA encontrado",
          description: "Por favor, confirma los datos del vehículo"
        });
        return;
      }

      // 2. Buscar en bd_empire
      const { data: empireData, error: empireError } = await supabase
        .from('bd_empire')
        .select('*')
        .ilike('placa', placaUpper)
        .maybeSingle();

      if (empireError) {
        console.error('Error buscando en bd_empire:', empireError);
      }

      if (empireData) {
        console.log('✅ Vehículo encontrado en bd_empire:', empireData);
        
        // Buscar precio en precios_empire usando el modelo
        let precioVenta = "0";
        const modeloVehiculo = empireData.modelo || '';
        
        if (modeloVehiculo) {
          const { data: precioData, error: precioError } = await supabase
            .from('precios_empire')
            .select('precio_venta, "precio venta", created_at, modelo, marca, name')
            .or(`modelo.ilike.%${modeloVehiculo}%,name.ilike.%${modeloVehiculo}%,marca.ilike.%${modeloVehiculo}%`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (precioError) {
            console.error('Error buscando precio en precios_empire:', precioError);
          }

          if (precioData) {
            precioVenta = precioData.precio_venta || precioData["precio venta"] || "0";
            console.log('💰 Precio encontrado en precios_empire:', precioVenta);
          }
        }

        const vehicleInfo = {
          Marca: empireData.marca || null,
          Modelo: empireData.modelo || null,
          Año: empireData.anio?.toString() || null,
          Color: empireData.color || null,
          Carroceria: empireData.serial_carroceria || null,
          Suma: precioVenta,
          MondayId: null,
          Source: 'bd_empire' as const
        };
        
        setVehicleData(vehicleInfo);
        
        // Pre-llenar el campo de serial de carrocería
        if (empireData.serial_carroceria) {
          setFormData(prev => ({
            ...prev,
            serialCarroceria: empireData.serial_carroceria || ''
          }));
        }
        
        setPlacaValidada(true);
        setShowError(false);
        setCurrentStep(1.5);
        toast({
          title: "Vehículo EMPIRE encontrado",
          description: "Por favor, confirma los datos del vehículo"
        });
        return;
      }

      // 3. Si no está en inventario, buscar en polizas_activas
      const { data: polizaData, error: polizaError } = await supabase
        .from('polizas_activas')
        .select('numero_poliza_monday, placa_monday, estado_principal_monday, nombre_titular_monday, apellidos_titular_monday, fecha_de_vencimiento_monday')
        .ilike('placa_monday', placaUpper)
        .maybeSingle();

      if (polizaError) {
        console.error('Error buscando en polizas_activas:', polizaError);
      }

      if (polizaData) {
        // La placa ya tiene una póliza registrada
        const fechaVencimiento = polizaData.fecha_de_vencimiento_monday;
        const esActiva = fechaVencimiento ? new Date(fechaVencimiento) > new Date() : false;
        
        console.log('⚠️ Placa encontrada en polizas_activas:', polizaData);
        setShowError(true);
        setPlacaValidada(false);
        toast({
          title: "Placa ya registrada",
          description: esActiva 
            ? `Esta placa ya tiene una póliza activa (${polizaData.numero_poliza_monday || 'Sin número'}). Vence: ${fechaVencimiento}`
            : `Esta placa tiene una póliza vencida. Contacte soporte para renovar.`,
          variant: "destructive"
        });
        return;
      }

      // 4. No se encontró en ninguna base de datos
      setShowError(true);
      setPlacaValidada(false);
      toast({
        title: "Placa no encontrada",
        description: "La placa no se encuentra en el inventario de vehículos",
        variant: "destructive"
      });

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

    // Si cambia el estado, resetear ciudad y municipio
    if (field === "estado" && typeof value === "string") {
      setFormData(prev => ({ ...prev, estado: value, ciudad: "", municipio: "" }));
      return;
    }
    
    // Si cambia la ciudad, resetear municipio
    if (field === "ciudad" && typeof value === "string") {
      setFormData(prev => ({ ...prev, ciudad: value, municipio: "" }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchCiudadesYMunicipios = async (cdEstado: string) => {
    // Esta función ya no es necesaria, pero la mantenemos por compatibilidad
    // El filtrado ahora se hace con useEffect
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

  // Fetch precio_venta for EMPIRE vehicles
  const fetchPrecioVentaEmpire = async (): Promise<string> => {
    const marcaUpper = vehicleData?.Marca?.toUpperCase();
    
    // Solo procesar para vehículos EMPIRE/EK
    if (!marcaUpper || (!marcaUpper.includes('EMPIRE') && !marcaUpper.includes('EK'))) {
      return vehicleData?.Suma || "0";
    }

    try {
      const fechaComparison = formData.fechaAdquisicion 
        ? `${formData.fechaAdquisicion}T23:59:59.999Z`
        : new Date().toISOString();

      const modeloVehiculo = vehicleData?.Modelo || '';

      console.log('🔍 Buscando precio en precios_empire (Jurídica):', {
        modelo_vehiculo: modeloVehiculo,
        marca_vehiculo: vehicleData?.Marca,
        fecha_adquisicion: formData.fechaAdquisicion,
        fecha_comparacion: fechaComparison
      });

      // Buscar por modelo en las columnas: modelo, name, o marca
      const { data, error } = await supabase
        .from('precios_empire')
        .select('precio_venta, "precio venta", created_at, modelo, marca, name')
        .or(`modelo.ilike.%${modeloVehiculo}%,name.ilike.%${modeloVehiculo}%,marca.ilike.%${modeloVehiculo}%`)
        .lte('created_at', fechaComparison)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching precio_venta (Jurídica):', error);
        return vehicleData?.Suma || "0";
      }

      if (data) {
        const precioFinal = data.precio_venta || data["precio venta"];
        console.log('✅ Precio de venta encontrado (Jurídica):', {
          modelo_encontrado: data.modelo,
          marca_encontrada: data.marca,
          name_encontrado: data.name,
          precio_venta: precioFinal,
          fecha_registro: data.created_at,
          fecha_adquisicion: formData.fechaAdquisicion,
          fecha_comparacion: fechaComparison
        });
        return precioFinal || vehicleData?.Suma || "0";
      } else {
        console.log('⚠️ No se encontró precio en precios_empire (Jurídica), usando Suma:', {
          modelo: vehicleData?.Modelo,
          marca: vehicleData?.Marca,
          fecha_adquisicion: formData.fechaAdquisicion,
          suma_fallback: vehicleData?.Suma || "0"
        });
        return vehicleData?.Suma || "0";
      }
    } catch (error) {
      console.error('❌ Error in fetchPrecioVentaEmpire (Jurídica):', error);
      return vehicleData?.Suma || "0";
    }
  };

  const saveToPolizasActivas = async (
    precioVenta: string,
    cedulaUrl: string,
    licenciaUrl: string,
    certificadoUrl: string,
    origenUrl: string,
    facturaUrl: string,
    rifUrl: string,
    codigosData: {
      marcaCodigo: string,
      modeloCodigo: string,
      versionCodigo: string,
      colorCodigo: string,
      estadoCodigo: string,
      ciudadCodigo: string,
      ciudadDescripcion: string,
      municipioCodigo: string,
      municipioDescripcion: string,
      actividadCodigo: string,
      codigoTelef1: string,
      codigoTelef2: string
    },
    versionApiData: {
      cd_version_seguro: string | null;
      cd_subversion_seguro: string | null;
      n_centuria: string | null;
    } | null
  ) => {
    try {
      const empresaId = formData.numeroRIF.match(/^([A-Z])-(\d+)(-\d+)?$/);
      const representanteId = formData.cedulaRepresentante.match(/^([A-Z])-(\d+)(-\d+)?$/);
      
      const hoy = new Date().toISOString().split('T')[0];
      const vencimiento = new Date();
      vencimiento.setFullYear(vencimiento.getFullYear() + 1);
      const fechaVencimiento = vencimiento.toISOString().split('T')[0];
      
      const recordatorio = new Date(vencimiento);
      recordatorio.setMonth(recordatorio.getMonth() - 1);
      const fechaRecordatorio = recordatorio.toISOString().split('T')[0];

      const polizaData = {
        // Campos Monday
        estado_principal_monday: "Nuevo registro",
        api_monday: versionApiData?.cd_version_seguro || "BERA2025",
        user_id: null, // Anonymous user
        fecha_de_vencimiento_monday: fechaVencimiento,
        recordatorio_de_vencimiento_monday: fechaRecordatorio,
        placa_monday: placa,
        año_monday: vehicleData?.Año || new Date().getFullYear().toString(),
        serial_carroceria_monday: formData.serialCarroceria,
        serial_motor_monday: formData.serialCarroceria,
        fecha_compra_monday: formData.fechaAdquisicion,
        cod_modelo_monday: codigosData.modeloCodigo,
        version_modelo_monday: vehicleData?.Modelo || "",
        cod_color_empire_monday: codigosData.colorCodigo,
        color_bera_monday: vehicleData?.Color || "",
        precio_venta_tienda_monday: precioVenta,
        version_api_monday: versionApiData?.cd_version_seguro || "BERA2025",
        
        // Datos del representante legal (como titular en Monday)
        nombre_titular_monday: formData.nombresRepresentante,
        apellidos_titular_monday: formData.apellidosRepresentante,
        tipo_id_titular_monday: formData.tipoIdentificacion,
        nro_documento_juridico_monday: empresaId?.[2] || "",
        nro_documento_natural_monday: "",
        razon_social_juridico_monday: formData.nombreEmpresa,
        
        // Ubicación
        pais_monday: "Venezuela",
        direccion_monday: formData.direccion,
        ciudad_monday: codigosData.ciudadDescripcion,
        municipio_monday: codigosData.municipioDescripcion,
        codigo_postal_monday: formData.codigoPostal,
        
        // Contacto
        codigo_telefonico_titular_monday: codigosData.codigoTelef1,
        numero_telefonico_titular_monday: formData.telefonoCelular,
        email_monday: formData.correoElectronico,
        email_alternativo_monday: formData.correoAlternativo,
        
        // Datos del representante (apoderado)
        nombre_apoderado_monday: formData.nombresRepresentante,
        apellido_apoderado_monday: formData.apellidosRepresentante,
        numero_documento_apoderado_monday: representanteId?.[2] || "",
        fecha_nacimiento_apoderado_monday: formData.fechaNacimientoRepresentante,
        estado_civil_apoderado_monday: formData.estadoCivilRepresentante,
        sexo_apoderado_monday: formData.sexoRepresentante,
        
        // URLs de documentos
        cedula_identidad_url: cedulaUrl,
        licencia_conducir_url: licenciaUrl,
        certificado_medico_url: certificadoUrl,
        certificado_origen_vehiculo_url: origenUrl,
        factura_compra_vehiculo_url: facturaUrl,
        rif_url: rifUrl,
        
        // Campos de API (formato del webhook anterior)
        f_fchdesde: hoy,
        f_fechacompra: formData.fechaAdquisicion,
        n_anio: vehicleData?.Año || new Date().getFullYear().toString(),
        c_placa: placa,
        c_carroceria: formData.serialCarroceria,
        c_cd_nacionalidad: empresaId?.[1] || "J",
        s_nacionalidad: formData.tipoIdentificacion,
        n_cedrif: empresaId?.[2] || "",
        n_correlativo: "0",
        cd_sexo: formData.sexoRepresentante === "Masculino" ? "M" : formData.sexoRepresentante === "Femenino" ? "F" : "NA",
        s_sexo: formData.sexoRepresentante,
        f_fecnac: formData.fechaNacimientoRepresentante,
        cd_edocivil: formData.estadoCivilRepresentante?.charAt(0) || "S",
        s_edocivil: formData.estadoCivilRepresentante,
        c_nombre: formData.nombresRepresentante,
        c_apellido: formData.apellidosRepresentante,
        c_razonsocial: formData.nombreEmpresa,
        c_cd_pais: "001",
        s_pais: "Venezuela",
        c_cd_estado: codigosData.estadoCodigo,
        s_estado: formData.estado,
        c_cd_ciudad: codigosData.ciudadCodigo,
        s_ciudad: codigosData.ciudadDescripcion,
        c_cd_municipio: codigosData.municipioCodigo,
        s_municipio: codigosData.municipioDescripcion,
        c_direccion: formData.direccion,
        c_cd_telef1: codigosData.codigoTelef1,
        s_telef1: formData.codigoTelefonicoWhatsapp,
        c_numtelef1: formData.telefonoCelular,
        c_email1: formData.correoElectronico,
        c_email2: formData.correoAlternativo,
        c_cd_actividad: codigosData.actividadCodigo,
        c_cd_ocupacion: "0",
        n_ingresoanualnac: "0",
        
        // Datos apoderado (representante legal)
        c_cd_nacionalidadap: representanteId?.[1] || "V",
        s_nacionalidadap: formData.tipoIdentificacionRepresentante,
        n_cedrifap: representanteId?.[2] || "",
        cd_sexoap: formData.sexoRepresentante === "Masculino" ? "M" : formData.sexoRepresentante === "Femenino" ? "F" : "NA",
        s_sexoap: formData.sexoRepresentante,
        f_fecnacap: formData.fechaNacimientoRepresentante,
        cd_edocivilap: formData.estadoCivilRepresentante?.charAt(0) || "S",
        s_edocivilap: formData.estadoCivilRepresentante,
        c_nombreap: formData.nombresRepresentante,
        c_apellidoap: formData.apellidosRepresentante,
        
        // Datos chofer (mismo que representante para jurídica)
        c_cd_nacionalidadch: representanteId?.[1] || "V",
        s_nacionalidadch: formData.tipoIdentificacionRepresentante,
        n_cedrifch: representanteId?.[2] || "",
        cd_sexoch: formData.sexoRepresentante === "Masculino" ? "M" : formData.sexoRepresentante === "Femenino" ? "F" : "NA",
        s_sexoch: formData.sexoRepresentante,
        f_fecnacch: formData.fechaNacimientoRepresentante,
        cd_edocivilch: formData.estadoCivilRepresentante?.charAt(0) || "S",
        s_edocivilch: formData.estadoCivilRepresentante,
        c_nombrech: formData.nombresRepresentante,
        c_apellidoch: formData.apellidosRepresentante,
        
        // Datos del vehículo
        cd_moneda: "DL",
        s_moneda: "Dólar",
        c_cd_marca: codigosData.marcaCodigo,
        s_marca: vehicleData?.Marca || "",
        c_cd_modelo: codigosData.modeloCodigo,
        s_modelo: vehicleData?.Modelo || "",
        c_cd_version: codigosData.versionCodigo,
        s_version: vehicleData?.Modelo || "",
        n_nu_centuria: vehicleData?.Año || new Date().getFullYear().toString(),
        c_motor: formData.serialCarroceria,
        c_cd_color: codigosData.colorCodigo,
        s_color: vehicleData?.Color || "",
        c_cd_versionseguro: versionApiData?.cd_version_seguro || "BERA2025",
        c_cd_subversionseguro: versionApiData?.cd_subversion_seguro || "BERAWEB01",
        n_suma: precioVenta,
        desde: "web",
        mondayid: vehicleData?.MondayId || "",
        listacolumnas: JSON.stringify([
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
        ]),
        formulario: "juridico"
      };

      console.log('💾 Guardando en polizas_activas (Jurídica):', polizaData);

      const { data, error } = await supabase
        .from('polizas_activas')
        .insert(polizaData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error guardando en polizas_activas:', error);
        throw error;
      }

      console.log('✅ Registro guardado exitosamente en polizas_activas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en saveToPolizasActivas:', error);
      throw error;
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

      // Fetch precio venta para EMPIRE
      const precioVenta = await fetchPrecioVentaEmpire();
      console.log('💰 Precio venta calculado (Jurídica):', precioVenta);

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

      // Buscar versión API basado en s_marca (Marca del vehículo)
      const { data: versionApiData } = await supabase
        .from('board_cod_version_api')
        .select('cd_version_seguro, cd_subversion_seguro, n_centuria')
        .ilike('cd_version_seguro', `%${vehicleData?.Marca || ''}%`)
        .maybeSingle();

      console.log('🔍 Versión API encontrada:', versionApiData);

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

      // Get ciudad data using id stored in formData
      let ciudadData = (await supabase
        .from('board_cod_ciudad')
        .select('cd_ciudad, descripcion')
        .eq('id', formData.ciudad)
        .maybeSingle()).data;

      // Get municipio data using id stored in formData
      let municipioData = (await supabase
        .from('board_cod_municipio')
        .select('cd_municipio, cd_ciudad, cd_estado, cd_pais, descripcion')
        .eq('id', formData.municipio)
        .maybeSingle()).data;

      // Debug logs
      console.log('Valores del formulario:', {
        pais: 'República Bolivariana de Venezuela',
        estado: formData.estado,
        ciudad: formData.ciudad,
        municipio: formData.municipio,
        estadoCodigo: estadoData?.cd_estado
      });

      console.log('Ciudad data:', ciudadData);
      console.log('Municipio data:', municipioData);

      console.log('📋 Códigos finales para envío:', {
        pais: '001',
        estado: estadoData?.cd_estado,
        ciudad: ciudadData?.cd_ciudad,
        municipio: municipioData?.cd_municipio
      });

      // Validate all required codes exist
      if (!estadoData?.cd_estado) {
        console.error('❌ ERROR: No se encontró el código del estado');
        toast({
          title: "Error",
          description: `No se encontró el estado "${formData.estado}" en la base de datos.`,
          variant: "destructive"
        });
        return;
      }

      if (!ciudadData?.cd_ciudad) {
        console.error('❌ ERROR: No se encontró el código de la ciudad');
        toast({
          title: "Error",
          description: `No se encontró la ciudad seleccionada en la base de datos.`,
          variant: "destructive"
        });
        return;
      }

      if (!municipioData?.cd_municipio) {
        console.error('❌ ERROR: No se encontró el municipio en la base de datos');
        console.error('Datos buscados:', {
          municipioId: formData.municipio,
          ciudad: formData.ciudad,
          estado: formData.estado
        });
        toast({
          title: "Error",
          description: `No se encontró el municipio seleccionado. Por favor verifique la selección.`,
          variant: "destructive",
          duration: 8000
        });
        return;
      }

      const { data: actividadData } = await supabase
        .from('cod_act_economica')
        .select('cd_actividad, descripcion')
        .ilike('descripcion', formData.actividadEconomica)
        .maybeSingle();

      // Query all phone codes and filter in frontend
      const { data: codigosTelef1 } = await supabase
        .from('board_cod_tlf')
        .select('cd_valdet, s_descripcion');

      const codigoTelef1Data = codigosTelef1?.find(c => 
        c.cd_valdet?.toLowerCase() === formData.codigoTelefonicoWhatsapp.toLowerCase()
      );

      console.log('Codigo telefono 1 data:', codigoTelef1Data);

      const { data: codigosTelef2 } = await supabase
        .from('board_cod_tlf')
        .select('cd_valdet, s_descripcion');

      const codigoTelef2Data = codigosTelef2?.find(c => 
        c.cd_valdet?.toLowerCase() === formData.codigoTelefonicoResidencial.toLowerCase()
      );

      console.log('Codigo telefono 2 data:', codigoTelef2Data);

      // Preparar códigos para guardar
      const codigosData = {
        marcaCodigo: marcaData?.cd_marca || "",
        modeloCodigo: modeloData?.cd_modelo || "",
        versionCodigo: versionData?.cd_version || "",
        colorCodigo: colorData?.cd_valdet || "",
        estadoCodigo: estadoData?.cd_estado || "",
        ciudadCodigo: ciudadData?.cd_ciudad || "",
        ciudadDescripcion: ciudadData?.descripcion || "",
        municipioCodigo: municipioData?.cd_municipio || "",
        municipioDescripcion: municipioData?.descripcion || "",
        actividadCodigo: actividadData?.cd_actividad || "0",
        codigoTelef1: codigoTelef1Data?.cd_valdet || "",
        codigoTelef2: codigoTelef2Data?.cd_valdet || ""
      };

      // Guardar en polizas_activas
      await saveToPolizasActivas(
        precioVenta,
        cedulaUrl,
        licenciaUrl,
        certificadoUrl,
        origenUrl,
        facturaUrl,
        rifUrl,
        codigosData,
        versionApiData
      );

      toast({
        title: "✅ Póliza registrada",
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
      <SimpleHeader />
      
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
                          disabled={!formData.estado}
                        >
                          <SelectTrigger id="ciudad">
                            <SelectValue placeholder={formData.estado ? "Seleccione una ciudad" : "Seleccione estado primero"} />
                          </SelectTrigger>
                          <SelectContent>
                            {ciudades.map((ciudad) => (
                              <SelectItem key={ciudad.id} value={ciudad.id}>
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
                          disabled={!formData.ciudad}
                        >
                          <SelectTrigger id="municipio">
                            <SelectValue placeholder={formData.ciudad ? "Seleccione un municipio" : "Seleccione ciudad primero"} />
                          </SelectTrigger>
                          <SelectContent>
                            {municipios.map((municipio) => (
                              <SelectItem key={municipio.id} value={municipio.id}>
                                {municipio.descripcion || ""}
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
                              <SelectItem key={codigo.cd_valdet} value={codigo.cd_valdet}>
                                {codigo.cd_valdet}
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
                              <SelectItem key={codigo.cd_valdet} value={codigo.cd_valdet}>
                                {codigo.cd_valdet}
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
