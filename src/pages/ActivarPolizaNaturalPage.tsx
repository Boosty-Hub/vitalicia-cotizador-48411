import { useState, useEffect, useCallback } from "react";
import { SimpleHeader } from "@/components/ui/SimpleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, MessageCircle, CheckCircle2, Upload, Loader2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploader } from "@/components/ui/file-uploader";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { fetchVersionApi } from "@/utils/versionApi";
import { formatPriceToTwoDecimals } from "@/lib/priceUtils";
import { useDocumentValidation } from "@/hooks/useDocumentValidation";
import {
  formatCedulaInput as formatCedulaInputHelper,
  validateCedula,
  validateEmailFormat,
  validateFechaCompra as validateFechaCompraHelper,
  validateDireccion,
  sanitizeDireccion,
  isAdult,
  maxBirthDateForAdult,
  todayISO,
  MIN_FECHA_COMPRA,
  filterSexos,
  filterEstadosCiviles,
  filterCodigosMoviles,
  BENEFICIARY_RELATIONSHIPS,
} from "@/lib/formValidation";

const ActivarPolizaNaturalPage = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [placa, setPlaca] = useState("");
  const [placaValidada, setPlacaValidada] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [email2Error, setEmail2Error] = useState("");
  const [vehicleData, setVehicleData] = useState<{
    Marca: string | null;
    Modelo: string | null;
    Año: string | null;
    Color: string | null;
    Carroceria: string | null;
    Suma?: string;
    MondayId?: string | null;
    Source?: 'bd_bera' | 'bd_empire';
  } | null>(null);
  const [serialConfirmado, setSerialConfirmado] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nacionalidades, setNacionalidades] = useState<Array<{
    cd_valdet: string | null;
    descripcion: string | null;
  }>>([]);
  const [sexos, setSexos] = useState<Array<{
    cd_valdet: string | null;
    descripcion: string | null;
  }>>([]);
  const [estadosCiviles, setEstadosCiviles] = useState<Array<{
    cd_valdet: string | null;
    descripcion: string | null;
  }>>([]);
  const [estados, setEstados] = useState<Array<{
    cd_estado: string | null;
    descripcion: string | null;
  }>>([]);
  const [ciudades, setCiudades] = useState<Array<{
    cd_ciudad: string | null;
    descripcion: string | null;
    cd_estado: string | null;
  }>>([]);
  const [municipios, setMunicipios] = useState<Array<{
    id: string;
    cd_municipio: string | null;
    descripcion: string | null;
    cd_ciudad: string | null;
  }>>([]);
  const [codigosTelefonicos, setCodigosTelefonicos] = useState<Array<{
    cd_valdet: string | null;
    s_descripcion: string | null;
  }>>([]);
  const [actividadesEconomicas, setActividadesEconomicas] = useState<Array<{ descripcion: string }>>([]);
  const [cedulaError, setCedulaError] = useState("");
  const [beneficiarioCedulaError, setBeneficiarioCedulaError] = useState("");
  const [direccionError, setDireccionError] = useState("");
  const [fechaCompraError, setFechaCompraError] = useState("");
  const [fechaNacimientoError, setFechaNacimientoError] = useState("");
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
    codigoPostal: "",
    codigoTelefonico: "",
    numeroTelefonico: "",
    email: "",
    email2: "",
    actividadEconomica: "",
    serialCarroceria: "",
    fechaCompra: "",
    // Beneficiary data
    beneficiarioRelacion: "",
    beneficiarioRelacionOtro: "",
    beneficiarioTieneCedula: "si" as "si" | "no",
    beneficiarioNombre: "",
    beneficiarioApellidos: "",
    beneficiarioTipoIdentificacion: "",
    beneficiarioNumeroCedula: "",
    beneficiarioSexo: "",
    beneficiarioFechaNacimiento: "",
    beneficiarioEstadoCivil: "",
    // Document uploads
    docIdentidad: null as File | null,
    docLicenciaConducir: null as File | null,
    docCertificadoMedico: null as File | null,
    docOrigenVehiculo: null as File | null,
    docFacturaCompra: null as File | null,
    docRIF: null as File | null
  });
  const totalSteps = 5;
  const progress = currentStep / totalSteps * 100;

  // Function to fix special characters encoding issues
  const fixSpecialCharacters = (text: string | null): string | null => {
    if (!text) return text;
    
    let fixed = text;
    
    // Apply replacements sequentially
    fixed = fixed.replace(/Ã±/g, 'ñ');
    fixed = fixed.replace(/Ã³/g, 'ó');
    fixed = fixed.replace(/Ã¡/g, 'á');
    fixed = fixed.replace(/Ã©/g, 'é');
    fixed = fixed.replace(/Ã­/g, 'í');
    fixed = fixed.replace(/Ãº/g, 'ú');
    fixed = fixed.replace(/Ã'/g, 'Ñ');
    fixed = fixed.replace(/Ã"/g, 'Ó');
    fixed = fixed.replace(/Ã/g, 'Á');
    fixed = fixed.replace(/Ã‰/g, 'É');
    fixed = fixed.replace(/Ã/g, 'Í');
    fixed = fixed.replace(/Ãš/g, 'Ú');
    fixed = fixed.replace(/Ã¼/g, 'ü');
    fixed = fixed.replace(/Ãœ/g, 'Ü');
    fixed = fixed.replace(/�/g, 'ñ'); // Common replacement for broken ñ

    return fixed;
  };
  useEffect(() => {
    const fetchNacionalidades = async () => {
      const {
        data,
        error
      } = await supabase.from('codigo_nacionalidad').select('cd_valdet, descripcion').order('descripcion');
      if (error) {
        console.error('Error loading nacionalidades:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los tipos de identificación",
          variant: "destructive"
        });
      } else if (data) {
        const fixedData = data.map(item => ({
          ...item,
          descripcion: fixSpecialCharacters(item.descripcion)
        }));
        setNacionalidades(fixedData);
      }
    };
    fetchNacionalidades();
  }, [toast]);
  useEffect(() => {
    const fetchSexos = async () => {
      const {
        data,
        error
      } = await supabase.from('board_cod_sexo').select('cd_valdet, descripcion').order('descripcion');
      if (error) {
        console.error('Error loading sexos:', error);
      } else if (data) {
        setSexos(filterSexos(data));
      }
    };
    fetchSexos();
  }, []);
  useEffect(() => {
    const fetchEstadosCiviles = async () => {
      const {
        data,
        error
      } = await supabase.from('board_cod_edo_civil').select('cd_valdet, descripcion').order('descripcion');
      if (error) {
        console.error('Error loading estados civiles:', error);
      } else if (data) {
        setEstadosCiviles(filterEstadosCiviles(data));
      }
    };
    fetchEstadosCiviles();
  }, []);
  useEffect(() => {
    const fetchEstados = async () => {
      const {
        data,
        error
      } = await supabase.from('board_cod_estado').select('cd_estado, descripcion').order('descripcion');
      if (error) {
        console.error('Error loading estados:', error);
      } else if (data) {
        const fixedData = data.map(item => ({
          ...item,
          descripcion: fixSpecialCharacters(item.descripcion)
        }));
        setEstados(fixedData);
      }
    };
    fetchEstados();
  }, []);
  useEffect(() => {
    const fetchCodigosTelefonicos = async () => {
      const {
        data,
        error
      } = await supabase.from('board_cod_tlf').select('cd_valdet, s_descripcion').order('cd_valdet');
      if (error) {
        console.error('Error loading códigos telefónicos:', error);
      } else if (data) {
        setCodigosTelefonicos(filterCodigosMoviles(data));
      }
    };
    fetchCodigosTelefonicos();
  }, []);
  useEffect(() => {
    const fetchActividades = async () => {
      const { data, error } = await supabase
        .from('cod_act_economica')
        .select('descripcion')
        .order('descripcion');
      if (error) {
        console.error('Error loading actividades:', error);
      } else if (data) {
        const fixed = data
          .map((a: { descripcion: string | null }) => ({ descripcion: fixSpecialCharacters(a.descripcion) || "" }))
          .filter((a) => a.descripcion);
        setActividadesEconomicas(fixed);
      }
    };
    fetchActividades();
  }, []);

  // Fetch ciudades when estado changes
  useEffect(() => {
    const fetchCiudades = async () => {
      if (!formData.estado) {
        setCiudades([]);
        return;
      }
      const {
        data,
        error
      } = await supabase
        .from('board_cod_ciudad')
        .select('cd_ciudad, descripcion, cd_estado')
        .eq('cd_estado', formData.estado)
        .not('cd_ciudad', 'is', null)
        .order('descripcion');
      
      if (error) {
        console.error('Error loading ciudades:', error);
      } else if (data) {
        const fixedData = data.map(item => ({
          ...item,
          descripcion: fixSpecialCharacters(item.descripcion)
        }));
        setCiudades(fixedData);
      }
    };
    fetchCiudades();
  }, [formData.estado]);

  // Fetch municipios when ciudad changes
  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!formData.ciudad || !formData.estado) {
        setMunicipios([]);
        return;
      }
      
      // Fetch municipios filtered by cd_ciudad and cd_estado
      const {
        data,
        error
      } = await supabase
        .from('board_cod_municipio')
        .select('id, cd_municipio, descripcion, cd_ciudad, cd_estado')
        .eq('cd_ciudad', formData.ciudad)
        .eq('cd_estado', formData.estado)
        .not('descripcion', 'is', null)
        .order('descripcion');
      
      if (error) {
        console.error('Error loading municipios:', error);
        toast({
          title: "Error",
          description: "Error al cargar los municipios",
          variant: "destructive"
        });
      } else if (data) {
        const fixedData = data.map(item => ({
          ...item,
          descripcion: fixSpecialCharacters(item.descripcion)
        }));
        setMunicipios(fixedData);
        
        if (data.length === 0) {
          console.log(`No se encontraron municipios para cd_ciudad: ${formData.ciudad} y cd_estado: ${formData.estado}`);
        }
      }
    };
    fetchMunicipios();
  }, [formData.ciudad, formData.estado, toast]);
  const validatePlaca = async () => {
    setIsValidating(true);
    try {
      const placaUpper = placa.toUpperCase().trim();
      
      // PRIMERO: Verificar si la placa ya tiene una póliza activa
      const { data: polizaResults, error: polizaError } = await supabase
        .from('polizas_activas')
        .select('numero_poliza_monday, placa_monday, estado_principal_monday, nombre_titular_monday, apellidos_titular_monday, fecha_de_vencimiento_monday')
        .ilike('placa_monday', placaUpper)
        .order('created_at', { ascending: false })
        .limit(1);

      if (polizaError) {
        console.error('Error buscando en polizas_activas:', polizaError);
      }

      const polizaData = polizaResults?.[0] || null;

      if (polizaData) {
        // La placa ya tiene una póliza registrada
        const fechaVencimiento = polizaData.fecha_de_vencimiento_monday;
        const esActiva = fechaVencimiento ? new Date(fechaVencimiento) > new Date() : false;
        
        console.log('⚠️ Placa encontrada en polizas_activas:', polizaData, 'Activa:', esActiva);
        setShowError(true);
        setPlacaValidada(false);
        toast({
          title: esActiva ? "Póliza Activa" : "Placa ya registrada",
          description: esActiva 
            ? `Esta placa ya tiene una póliza ACTIVA (${polizaData.numero_poliza_monday || 'Sin número'}). Fecha de vencimiento: ${fechaVencimiento}`
            : `Esta placa tiene una póliza vencida. Contacte soporte para renovar.`,
          variant: "destructive"
        });
        return;
      }

      // 1. Buscar en bd_bera (priorizar no duplicados, tomar el primero)
      const { data: beraResults, error: beraError } = await supabase
        .from('bd_bera')
        .select('*')
        .ilike('placa', placaUpper)
        .order('es_duplicado', { ascending: true }) // No duplicados primero
        .order('created_at', { ascending: false }) // Más reciente
        .limit(1);

      if (beraError) {
        console.error('Error buscando en bd_bera:', beraError);
      }
      
      const beraData = beraResults?.[0] || null;

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
        setPlacaValidada(true);
        setShowError(false);
        setCurrentStep(1.5);
        toast({
          title: "Vehículo BERA encontrado",
          description: "Por favor, confirma los datos del vehículo"
        });
        return;
      }

      // 2. Buscar en bd_empire (priorizar no duplicados, tomar el primero)
      const { data: empireResults, error: empireError } = await supabase
        .from('bd_empire')
        .select('*')
        .ilike('placa', placaUpper)
        .order('es_duplicado', { ascending: true }) // No duplicados primero
        .order('created_at', { ascending: false }) // Más reciente
        .limit(1);

      if (empireError) {
        console.error('Error buscando en bd_empire:', empireError);
      }
      
      const empireData = empireResults?.[0] || null;

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
        setPlacaValidada(true);
        setShowError(false);
        setCurrentStep(1.5);
        toast({
          title: "Vehículo EMPIRE encontrado",
          description: "Por favor, confirma los datos del vehículo"
        });
        return;
      }

      // 3. No se encontró en ninguna base de datos
      setShowError(true);
      setPlacaValidada(false);
      toast({
        title: "Placa no encontrada",
        description: "La placa no se encuentra en el inventario de vehículos",
        variant: "destructive"
      });

    } catch (error) {
      console.error("Error validating placa:", error);
      setShowError(true);
      setPlacaValidada(false);
      toast({
        title: "Error",
        description: "No se pudo validar la placa. Por favor, intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };
  const formatCedulaInput = (tipo: string, value: string) =>
    formatCedulaInputHelper(tipo, value);

  const validateEmail = validateEmailFormat;

  const removeAccents = (str: string): string => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[ñÑ]/g, (match) => match === 'ñ' ? 'n' : 'N');
  };

  const handleInputChange = (field: string, value: string | File | null) => {
    // Email handling (sanitize + validate)
    if ((field === "email" || field === "email2") && typeof value === "string") {
      const cleanValue = removeAccents(value.trim());
      setFormData(prev => ({ ...prev, [field]: cleanValue }));
      const validation = validateEmail(cleanValue);
      if (field === "email") setEmailError(validation.error);
      else setEmail2Error(validation.error);
      return;
    }

    // Address: strip commas as the user types and validate
    if (field === "direccion" && typeof value === "string") {
      const clean = sanitizeDireccion(value);
      setFormData(prev => ({ ...prev, direccion: clean }));
      setDireccionError(clean ? validateDireccion(clean).error : "");
      return;
    }

    // Birthdate: must be adult
    if (field === "fechaNacimiento" && typeof value === "string") {
      setFormData(prev => ({ ...prev, fechaNacimiento: value }));
      if (value && !isAdult(value)) {
        setFechaNacimientoError("El titular debe ser mayor de edad (18 años o más)");
      } else {
        setFechaNacimientoError("");
      }
      return;
    }

    // Purchase date: in range
    if (field === "fechaCompra" && typeof value === "string") {
      setFormData(prev => ({ ...prev, fechaCompra: value }));
      setFechaCompraError(value ? validateFechaCompraHelper(value).error : "");
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTipoIdentificacionChange = (value: string) => {
    setFormData(prev => {
      const currentNumero = prev.numeroCedula;
      let newNumero = '';
      if (currentNumero) {
        const numbersOnly = currentNumero.replace(/[^0-9]/g, '');
        newNumero = formatCedulaInput(value, numbersOnly);
      } else {
        newNumero = value === "P" ? "" : value ? `${value}-` : '';
      }
      return {
        ...prev,
        tipoIdentificacion: value,
        numeroCedula: newNumero
      };
    });
    setCedulaError("");
  };
  const handleCedulaChange = (value: string) => {
    const formatted = formatCedulaInput(formData.tipoIdentificacion, value);
    setFormData(prev => ({
      ...prev,
      numeroCedula: formatted
    }));
    if (formatted) {
      setCedulaError(validateCedula(formData.tipoIdentificacion, formatted).error);
    } else {
      setCedulaError("");
    }
  };
  const handleBeneficiarioTipoIdentificacionChange = (value: string) => {
    setFormData(prev => {
      const currentNumero = prev.beneficiarioNumeroCedula;
      let newNumero = '';
      if (currentNumero) {
        const numbersOnly = currentNumero.replace(/[^0-9]/g, '');
        newNumero = formatCedulaInput(value, numbersOnly);
      } else {
        newNumero = value === "P" ? "" : value ? `${value}-` : '';
      }
      return {
        ...prev,
        beneficiarioTipoIdentificacion: value,
        beneficiarioNumeroCedula: newNumero
      };
    });
    setBeneficiarioCedulaError("");
  };
  const handleBeneficiarioCedulaChange = (value: string) => {
    const formatted = formatCedulaInput(formData.beneficiarioTipoIdentificacion, value);
    setFormData(prev => ({
      ...prev,
      beneficiarioNumeroCedula: formatted
    }));
    if (formatted) {
      setBeneficiarioCedulaError(validateCedula(formData.beneficiarioTipoIdentificacion, formatted).error);
    } else {
      setBeneficiarioCedulaError("");
    }
  };
  const autoFillPersonalData = () => {
    const randomNames = ["Juan", "María", "Carlos", "Ana", "Pedro", "Laura", "José", "Carmen"];
    const randomLastNames = ["García", "Rodríguez", "Martínez", "López", "González", "Pérez", "Sánchez", "Ramírez"];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomLastName = randomLastNames[Math.floor(Math.random() * randomLastNames.length)];
    const randomId = Math.floor(10000000 + Math.random() * 90000000);
    const randomPhone = Math.floor(1000000 + Math.random() * 9000000);
    const randomPostalCode = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({
      ...prev,
      nombre: randomName,
      apellidos: `${randomLastName} ${randomLastNames[Math.floor(Math.random() * randomLastNames.length)]}`,
      tipoIdentificacion: "V",
      numeroCedula: `V-${randomId}`,
      razonSocial: `${randomName} ${randomLastName}`,
      sexo: Math.random() > 0.5 ? "M" : "F",
      fechaNacimiento: `199${Math.floor(Math.random() * 10)}-0${Math.floor(1 + Math.random() * 9)}-${Math.floor(10 + Math.random() * 18)}`,
      estadoCivil: ["S", "C", "D", "V"][Math.floor(Math.random() * 4)],
      direccion: `Avenida Principal, Casa ${Math.floor(1 + Math.random() * 100)}`,
      estado: estados[Math.floor(Math.random() * estados.length)]?.cd_estado || "",
      codigoPostal: randomPostalCode.toString(),
      codigoTelefonico: codigosTelefonicos[Math.floor(Math.random() * codigosTelefonicos.length)]?.cd_valdet || "",
      numeroTelefonico: randomPhone.toString(),
      email: `${randomName.toLowerCase()}.${randomLastName.toLowerCase()}@email.com`,
      email2: `${randomName.toLowerCase()}${randomId.toString().slice(0, 3)}@gmail.com`
    }));
    toast({
      title: "Datos auto-rellenados",
      description: "Se han generado datos de prueba aleatorios"
    });
  };
  const autoFillVehicleData = () => {
    const randomSerial = `VIN${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
    const randomDate = `202${Math.floor(Math.random() * 5)}-${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')}-${String(Math.floor(1 + Math.random() * 28)).padStart(2, '0')}`;
    setFormData(prev => ({
      ...prev,
      serialCarroceria: randomSerial,
      fechaCompra: randomDate
    }));
    toast({
      title: "Datos del vehículo auto-rellenados",
      description: "Se han generado datos de prueba aleatorios"
    });
  };
  const autoFillBeneficiaryData = () => {
    const randomNames = ["Carlos", "Ana", "Luis", "Elena", "Miguel", "Sofia", "Diego", "Isabel"];
    const randomLastNames = ["Fernández", "Torres", "Ruiz", "Díaz", "Moreno", "Álvarez", "Romero", "Navarro"];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomLastName = randomLastNames[Math.floor(Math.random() * randomLastNames.length)];
    const randomId = Math.floor(10000000 + Math.random() * 90000000);
    setFormData(prev => ({
      ...prev,
      beneficiarioNombre: randomName,
      beneficiarioApellidos: `${randomLastName} ${randomLastNames[Math.floor(Math.random() * randomLastNames.length)]}`,
      beneficiarioTipoIdentificacion: "V",
      beneficiarioNumeroCedula: `V-${randomId}`,
      beneficiarioSexo: Math.random() > 0.5 ? "M" : "F",
      beneficiarioFechaNacimiento: `198${Math.floor(Math.random() * 10)}-0${Math.floor(1 + Math.random() * 9)}-${Math.floor(10 + Math.random() * 18)}`,
      beneficiarioEstadoCivil: ["S", "C", "D", "V"][Math.floor(Math.random() * 4)]
    }));
    toast({
      title: "Datos del beneficiario auto-rellenados",
      description: "Se han generado datos de prueba aleatorios"
    });
  };
  const { validateDocument, clearValidation, getValidation, allCriticalDocsValid, hasAnyValidating, hasAnyInvalid } = useDocumentValidation();

  const getFormDataForValidation = useCallback(() => {
    const cedulaDigits = formData.numeroCedula.replace(/[^0-9]/g, '');
    return {
      cedula: cedulaDigits,
      nombre: formData.nombre,
      apellido: formData.apellidos,
      placa: placa.toUpperCase().trim(),
    };
  }, [formData.numeroCedula, formData.nombre, formData.apellidos, placa]);

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
    if (file) {
      validateDocument(field, file, getFormDataForValidation());
    } else {
      clearValidation(field);
    }
  };
  const handleContactSupport = () => {
    window.open(`https://wa.me/584123230188?text=Hola, necesito ayuda con la activación de mi póliza RCV. Placa: ${placa}`, '_blank');
  };
  // Fetch precio_venta for EMPIRE vehicles
  const fetchPrecioVentaEmpire = async (): Promise<string> => {
    const marcaUpper = vehicleData?.Marca?.toUpperCase();
    
    // Solo procesar para vehículos EMPIRE/EK
    if (!marcaUpper || (!marcaUpper.includes('EMPIRE') && !marcaUpper.includes('EK'))) {
      return formatPriceToTwoDecimals(vehicleData?.Suma);
    }

    try {
      // Convert fechaCompra to end-of-day timestamp for proper comparison
      const fechaComparison = formData.fechaCompra 
        ? `${formData.fechaCompra}T23:59:59.999Z`
        : new Date().toISOString();

      const modeloVehiculo = vehicleData?.Modelo || '';

      console.log('🔍 Buscando precio en precios_empire:', {
        modelo_vehiculo: modeloVehiculo,
        marca_vehiculo: vehicleData?.Marca,
        fecha_compra: formData.fechaCompra,
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
        console.error('❌ Error fetching precio_venta:', error);
        return formatPriceToTwoDecimals(vehicleData?.Suma);
      }

      // Enhanced logging for debugging
      if (data) {
        const precioFinal = data.precio_venta || data["precio venta"];
        console.log('✅ Precio de venta encontrado:', {
          modelo_encontrado: data.modelo,
          marca_encontrada: data.marca,
          name_encontrado: data.name,
          precio_venta: precioFinal,
          fecha_registro: data.created_at,
          fecha_compra: formData.fechaCompra,
          fecha_comparacion: fechaComparison
        });
        return formatPriceToTwoDecimals(precioFinal || vehicleData?.Suma);
      } else {
        console.log('⚠️ No se encontró precio en precios_empire, usando Suma:', {
          modelo: vehicleData?.Modelo,
          marca: vehicleData?.Marca,
          fecha_compra: formData.fechaCompra,
          suma_fallback: vehicleData?.Suma || "0"
        });
        return formatPriceToTwoDecimals(vehicleData?.Suma);
      }
    } catch (error) {
      console.error('❌ Error in fetchPrecioVentaEmpire:', error);
      return formatPriceToTwoDecimals(vehicleData?.Suma);
    }
  };

  // Upload documents to Supabase Storage
  const uploadDocumentsToStorage = async () => {
    const timestamp = Date.now();
    const uploadedUrls: Record<string, string> = {};
    
    const documentsToUpload = [
      { key: 'docIdentidad', file: formData.docIdentidad, name: 'cedula-identidad' },
      { key: 'docLicenciaConducir', file: formData.docLicenciaConducir, name: 'licencia-conducir' },
      { key: 'docCertificadoMedico', file: formData.docCertificadoMedico, name: 'certificado-medico' },
      { key: 'docOrigenVehiculo', file: formData.docOrigenVehiculo, name: 'certificado-origen' },
      { key: 'docFacturaCompra', file: formData.docFacturaCompra, name: 'factura-compra' },
      { key: 'docRIF', file: formData.docRIF, name: 'rif' }
    ];

    for (const doc of documentsToUpload) {
      if (doc.file) {
        const fileExt = doc.file.name.split('.').pop();
        const fileName = `${placa}/${timestamp}-${doc.name}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('poliza-documentos')
          .upload(fileName, doc.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error(`Error uploading ${doc.key}:`, error);
          throw new Error(`Error al subir ${doc.name}`);
        }

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('poliza-documentos')
            .getPublicUrl(fileName);
          
          uploadedUrls[doc.key] = publicUrl;
        }
      }
    }

    return uploadedUrls;
  };

  // Fetch vehicle codes and descriptions from Supabase
  const fetchVehicleCodes = async () => {
    try {
      // Fetch marca code and description
      const { data: marcaData } = await supabase
        .from('board_cod_marca')
        .select('cd_marca, descripcion')
        .ilike('descripcion', vehicleData?.Marca || '')
        .maybeSingle();

      // Fetch modelo code and description
      const { data: modeloData } = await supabase
        .from('board_cod_modelo')
        .select('cd_modelo, descripcion')
        .eq('cd_marca', marcaData?.cd_marca || '')
        .ilike('descripcion', vehicleData?.Modelo || '')
        .maybeSingle();

      // Fetch color code and description
      const { data: colorData } = await supabase
        .from('board_cod_color')
        .select('cd_valdet, descripcion')
        .ilike('descripcion', vehicleData?.Color || '')
        .maybeSingle();

      // Fetch version code and description
      const { data: versionData } = await supabase
        .from('board_cod_version_moto')
        .select('cd_version, descripcion')
        .eq('cd_marca', marcaData?.cd_marca || '')
        .eq('cd_modelo', modeloData?.cd_modelo || '')
        .limit(1)
        .maybeSingle();

      return {
        c_cd_marca: marcaData?.cd_marca || "0000",
        s_marca: marcaData?.descripcion || vehicleData?.Marca || "",
        c_cd_modelo: modeloData?.cd_modelo || "0000",
        s_modelo: modeloData?.descripcion || vehicleData?.Modelo || "",
        c_cd_color: colorData?.cd_valdet || "0001",
        s_color: colorData?.descripcion || vehicleData?.Color || "",
        c_cd_version: versionData?.cd_version || "0001",
        s_version: versionData?.descripcion || ""
      };
    } catch (error) {
      console.error("Error fetching vehicle codes:", error);
      return {
        c_cd_marca: "0000",
        s_marca: vehicleData?.Marca || "",
        c_cd_modelo: "0000",
        s_modelo: vehicleData?.Modelo || "",
        c_cd_color: "0001",
        s_color: vehicleData?.Color || "",
        c_cd_version: "0001",
        s_version: ""
      };
    }
  };

  // Map form data to webhook payload
  const mapFormDataToWebhook = async (documentUrls: Record<string, string>) => {
    const vehicleCodes = await fetchVehicleCodes();
    const versionApiData = await fetchVersionApi(vehicleData?.Marca, vehicleData?.Año);
    const extractNumbers = (cedula: string) => cedula.replace(/[^0-9]/g, '');

    // Fetch descriptions for form data codes
    const { data: estadoData } = await supabase
      .from('board_cod_estado')
      .select('descripcion')
      .eq('cd_estado', formData.estado)
      .maybeSingle();

    const { data: ciudadData } = await supabase
      .from('board_cod_ciudad')
      .select('descripcion')
      .eq('cd_pais', '001')
      .eq('cd_estado', formData.estado)
      .eq('cd_ciudad', formData.ciudad)
      .maybeSingle();

    // Get cd_municipio from the selected id
    const selectedMunicipio = municipios.find(m => m.id === formData.municipio);
    const cd_municipio = selectedMunicipio?.cd_municipio || formData.municipio;
    
    const { data: municipioData } = await supabase
      .from('board_cod_municipio')
      .select('descripcion')
      .eq('cd_pais', '001')
      .eq('cd_estado', formData.estado)
      .eq('cd_ciudad', formData.ciudad)
      .eq('cd_municipio', cd_municipio)
      .maybeSingle();


    const { data: nacionalidadData } = await supabase
      .from('codigo_nacionalidad')
      .select('descripcion')
      .eq('cd_valdet', formData.tipoIdentificacion)
      .maybeSingle();

    const { data: sexoData } = await supabase
      .from('board_cod_sexo')
      .select('descripcion')
      .eq('cd_valdet', formData.sexo)
      .maybeSingle();

    const { data: edoCivilData } = await supabase
      .from('board_cod_edo_civil')
      .select('descripcion')
      .eq('cd_valdet', formData.estadoCivil)
      .maybeSingle();

    const { data: telfData } = await supabase
      .from('board_cod_tlf')
      .select('s_descripcion')
      .eq('cd_valdet', formData.codigoTelefonico)
      .maybeSingle();

    const { data: nacionalidadApData } = await supabase
      .from('codigo_nacionalidad')
      .select('descripcion')
      .eq('cd_valdet', formData.beneficiarioTipoIdentificacion)
      .maybeSingle();

    const { data: sexoApData } = await supabase
      .from('board_cod_sexo')
      .select('descripcion')
      .eq('cd_valdet', formData.beneficiarioSexo)
      .maybeSingle();

    const { data: edoCivilApData } = await supabase
      .from('board_cod_edo_civil')
      .select('descripcion')
      .eq('cd_valdet', formData.beneficiarioEstadoCivil)
      .maybeSingle();

    const payload = {
      f_fchdesde: new Date().toISOString().split('T')[0],
      f_fechacompra: formData.fechaCompra,
      n_anio: vehicleData?.Año || "",
      c_placa: placa,
      c_carroceria: formData.serialCarroceria,
      c_cd_nacionalidad: formData.tipoIdentificacion,
      s_nacionalidad: nacionalidadData?.descripcion || "",
      n_cedrif: extractNumbers(formData.numeroCedula),
      n_correlativo: 0,
      cd_sexo: formData.sexo,
      s_sexo: sexoData?.descripcion || "",
      f_fecnac: formData.fechaNacimiento,
      cd_edocivil: formData.estadoCivil,
      s_edocivil: edoCivilData?.descripcion || "",
      c_nombre: formData.nombre,
      c_apellido: formData.apellidos,
      c_razonsocial: `${formData.nombre} ${formData.apellidos}`,
      c_cd_pais: "001",
      s_pais: "Venezuela",
      c_cd_estado: formData.estado,
      s_estado: estadoData?.descripcion || "",
      c_cd_ciudad: formData.ciudad,
      s_ciudad: ciudadData?.descripcion || "",
      c_cd_municipio: cd_municipio,
      s_municipio: municipioData?.descripcion || "",
      c_direccion: formData.direccion,
      c_cd_telef1: formData.codigoTelefonico,
      s_telef1: telfData?.s_descripcion || "",
      c_numtelef1: formData.numeroTelefonico,
      c_email1: formData.email,
      c_email2: formData.email2,
      c_cd_actividad: 0,
      c_cd_ocupacion: 0,
      n_ingresoanualnac: 0,
      c_cd_nacionalidadap: formData.beneficiarioTipoIdentificacion,
      s_nacionalidadap: nacionalidadApData?.descripcion || "",
      n_cedrifap: extractNumbers(formData.beneficiarioNumeroCedula),
      cd_sexoap: formData.beneficiarioSexo,
      s_sexoap: sexoApData?.descripcion || "",
      f_fecnacap: formData.beneficiarioFechaNacimiento,
      cd_edocivilap: formData.beneficiarioEstadoCivil,
      s_edocivilap: edoCivilApData?.descripcion || "",
      c_nombreap: formData.beneficiarioNombre,
      c_apellidoap: formData.beneficiarioApellidos,
      c_cd_nacionalidadch: formData.tipoIdentificacion,
      s_nacionalidadch: nacionalidadData?.descripcion || "",
      n_cedrifch: extractNumbers(formData.numeroCedula),
      cd_sexoch: formData.sexo,
      s_sexoch: sexoData?.descripcion || "",
      f_fecnacch: formData.fechaNacimiento,
      cd_edocivilch: "N",
      s_edocivilch: "No Aplica",
      c_nombrech: formData.nombre,
      c_apellidoch: formData.apellidos,
      cd_moneda: "DL",
      s_moneda: "Dólar",
      c_cd_marca: vehicleCodes.c_cd_marca,
      s_marca: vehicleCodes.s_marca,
      c_cd_modelo: vehicleCodes.c_cd_modelo,
      s_modelo: vehicleCodes.s_modelo,
      c_cd_version: vehicleCodes.c_cd_version,
      s_version: vehicleCodes.s_version,
      n_nu_centuria: versionApiData?.n_centuria || vehicleData?.Año || new Date().getFullYear().toString(),
      c_motor: formData.serialCarroceria,
      c_cd_color: vehicleCodes.c_cd_color,
      s_color: vehicleCodes.s_color,
      c_cd_versionseguro: versionApiData?.cd_version_seguro || "",
      c_cd_subversionseguro: versionApiData?.cd_subversion_seguro || "",
      n_suma: vehicleData?.Suma || "0",
      desde: "web",
      mondayid: vehicleData?.MondayId ?? "null",
      listaColumnas: [
        {
          nombre: "Cédula de identidad URL",
          url: documentUrls.docIdentidad || "",
          columnaID: "file_mkpytq4p"
        },
        {
          nombre: "Licencia de conducir URL",
          url: documentUrls.docLicenciaConducir || "",
          columnaID: "file_mkpz6yzk"
        },
        {
          nombre: "Certificado médico URL",
          url: documentUrls.docCertificadoMedico || "",
          columnaID: "file_mkpz3ckf"
        },
        {
          nombre: "Certificado de Origen del Vehículo URL",
          url: documentUrls.docOrigenVehiculo || "",
          columnaID: "file_mkpy886c"
        },
        {
          nombre: "Factura de Compra del Vehículo URL",
          url: documentUrls.docFacturaCompra || "",
          columnaID: "file_mkpy429y"
        },
        {
          nombre: "RIF URL",
          url: documentUrls.docRIF || "",
          columnaID: "file_mkpyt85x"
        }
      ]
    };

    return payload;
  };

  // Save to polizas_activas table
  const saveToPolizasActivas = async (payload: any, documentUrls: Record<string, string>, precioVenta: string) => {
    try {
      // Calculate dates
      const today = new Date();
      const fechaVencimiento = new Date(today);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 365);
      
      const recordatorioVencimiento = new Date(fechaVencimiento);
      recordatorioVencimiento.setMonth(recordatorioVencimiento.getMonth() - 1);

      // Get current user (if authenticated)
      const { data: { user } } = await supabase.auth.getUser();

      const polizaData = {
        // Estado y metadata
        estado_principal_monday: "Nuevo registro",
        api_monday: "BERA2025",
        user_id: user?.id || null,
        
        // Fechas calculadas
        fecha_de_vencimiento_monday: fechaVencimiento.toISOString().split('T')[0],
        recordatorio_de_vencimiento_monday: recordatorioVencimiento.toISOString().split('T')[0],
        
        // Datos del vehículo
        placa_monday: placa,
        año_monday: payload.n_anio,
        serial_carroceria_monday: payload.c_carroceria,
        serial_motor_monday: payload.c_motor,
        fecha_compra_monday: payload.f_fechacompra,
        cod_modelo_monday: payload.c_cd_modelo,
        version_modelo_monday: payload.s_version,
        cod_color_empire_monday: payload.c_cd_color,
        color_bera_monday: payload.s_color,
        precio_venta_tienda_monday: precioVenta,
        version_api_monday: payload.c_cd_versionseguro,
        
        // Datos del titular
        nombre_titular_monday: payload.c_nombre,
        apellidos_titular_monday: payload.c_apellido,
        tipo_id_titular_monday: payload.c_cd_nacionalidad,
        nro_documento_natural_monday: payload.n_cedrif,
        fecha_nacimiento_titular_monday: payload.f_fecnac,
        
        // Dirección y contacto
        pais_monday: payload.s_pais,
        direccion_monday: payload.c_direccion,
        ciudad_monday: payload.s_ciudad,
        municipio_monday: payload.s_municipio,
        codigo_postal_monday: formData.codigoPostal || "",
        codigo_telefonico_titular_monday: payload.c_cd_telef1,
        numero_telefonico_titular_monday: payload.c_numtelef1,
        email_monday: payload.c_email1,
        email_alternativo_monday: payload.c_email2,
        
        // Beneficiario/Apoderado
        nombre_apoderado_monday: payload.c_nombreap,
        apellido_apoderado_monday: payload.c_apellidoap,
        numero_documento_apoderado_monday: payload.n_cedrifap,
        fecha_nacimiento_apoderado_monday: payload.f_fecnacap,
        estado_civil_apoderado_monday: payload.s_edocivilap,
        sexo_apoderado_monday: payload.s_sexoap,
        
        // URLs de documentos
        cedula_identidad_url: documentUrls.docIdentidad || "",
        licencia_conducir_url: documentUrls.docLicenciaConducir || "",
        certificado_medico_url: documentUrls.docCertificadoMedico || "",
        certificado_origen_vehiculo_url: documentUrls.docOrigenVehiculo || "",
        factura_compra_vehiculo_url: documentUrls.docFacturaCompra || "",
        rif_url: documentUrls.docRIF || "",
        
        // Campos del payload completo (compatibilidad)
        f_fchdesde: payload.f_fchdesde,
        f_fechacompra: payload.f_fechacompra,
        n_anio: payload.n_anio,
        c_placa: payload.c_placa,
        c_carroceria: payload.c_carroceria,
        c_cd_nacionalidad: payload.c_cd_nacionalidad,
        s_nacionalidad: payload.s_nacionalidad,
        n_cedrif: payload.n_cedrif,
        n_correlativo: payload.n_correlativo?.toString(),
        cd_sexo: payload.cd_sexo,
        s_sexo: payload.s_sexo,
        f_fecnac: payload.f_fecnac,
        cd_edocivil: payload.cd_edocivil,
        s_edocivil: payload.s_edocivil,
        c_nombre: payload.c_nombre,
        c_apellido: payload.c_apellido,
        c_razonsocial: payload.c_razonsocial,
        c_cd_pais: payload.c_cd_pais,
        s_pais: payload.s_pais,
        c_cd_estado: payload.c_cd_estado,
        s_estado: payload.s_estado,
        c_cd_ciudad: payload.c_cd_ciudad,
        s_ciudad: payload.s_ciudad,
        c_cd_municipio: payload.c_cd_municipio,
        s_municipio: payload.s_municipio,
        c_direccion: payload.c_direccion,
        c_cd_telef1: payload.c_cd_telef1,
        s_telef1: payload.s_telef1,
        c_numtelef1: payload.c_numtelef1,
        c_email1: payload.c_email1,
        c_email2: payload.c_email2,
        c_cd_actividad: payload.c_cd_actividad?.toString(),
        c_cd_ocupacion: payload.c_cd_ocupacion?.toString(),
        n_ingresoanualnac: payload.n_ingresoanualnac?.toString(),
        c_cd_nacionalidadap: payload.c_cd_nacionalidadap,
        s_nacionalidadap: payload.s_nacionalidadap,
        n_cedrifap: payload.n_cedrifap,
        cd_sexoap: payload.cd_sexoap,
        s_sexoap: payload.s_sexoap,
        f_fecnacap: payload.f_fecnacap,
        cd_edocivilap: payload.cd_edocivilap,
        s_edocivilap: payload.s_edocivilap,
        c_nombreap: payload.c_nombreap,
        c_apellidoap: payload.c_apellidoap,
        c_cd_nacionalidadch: payload.c_cd_nacionalidadch,
        s_nacionalidadch: payload.s_nacionalidadch,
        n_cedrifch: payload.n_cedrifch,
        cd_sexoch: payload.cd_sexoch,
        s_sexoch: payload.s_sexoch,
        f_fecnacch: payload.f_fecnacch,
        cd_edocivilch: payload.cd_edocivilch,
        s_edocivilch: payload.s_edocivilch,
        c_nombrech: payload.c_nombrech,
        c_apellidoch: payload.c_apellidoch,
        cd_moneda: payload.cd_moneda,
        s_moneda: payload.s_moneda,
        c_cd_marca: payload.c_cd_marca,
        s_marca: payload.s_marca,
        c_cd_modelo: payload.c_cd_modelo,
        s_modelo: payload.s_modelo,
        c_cd_version: payload.c_cd_version,
        s_version: payload.s_version,
        n_nu_centuria: payload.n_nu_centuria,
        c_motor: payload.c_motor,
        c_cd_color: payload.c_cd_color,
        s_color: payload.s_color,
        c_cd_versionseguro: payload.c_cd_versionseguro,
        c_cd_subversionseguro: payload.c_cd_subversionseguro,
        n_suma: payload.n_suma,
        desde: payload.desde,
        mondayid: payload.mondayid,
        listacolumnas: JSON.stringify(payload.listaColumnas),
        formulario: "natural"
      };

      const { data, error } = await supabase
        .from('polizas_activas')
        .insert([polizaData])
        .select()
        .single();

      if (error) {
        console.error('Error saving to polizas_activas:', error);
        throw error;
      }

      console.log('✅ Registro guardado en polizas_activas:', data);
      return data;
    } catch (error) {
      console.error('Error in saveToPolizasActivas:', error);
      throw error;
    }
  };

  // Call RMS API to get policy number
  const callRmsApi = async (polizaId: string, payload: any) => {
    try {
      console.log('🔄 Llamando a RMS API para obtener número de póliza...');
      
      const { data, error } = await supabase.functions.invoke('rms-create-policy', {
        body: {
          polizaId,
          formData: payload,
          tipoFormulario: 'natural'
        }
      });

      if (error) {
        console.error('❌ Error llamando a RMS API:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('❌ RMS API retornó error:', data?.error);
        throw new Error(data?.error || 'Error al obtener número de póliza');
      }

      console.log('✅ Número de póliza obtenido:', data.numeroPoliza);
      return data;
    } catch (error) {
      console.error('❌ Error en callRmsApi:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Step 1: Upload documents
      const documentUrls = await uploadDocumentsToStorage();
      
      // Step 2: Fetch precio_venta for EMPIRE vehicles
      const precioVenta = await fetchPrecioVentaEmpire();
      
      // Step 3: Map form data to webhook payload
      const payload = await mapFormDataToWebhook(documentUrls);
      
      console.log('🚀 Payload completo que se enviará al webhook final:', payload);
      console.log('🔑 MondayId en el payload final:', payload.mondayid);
      console.log('💰 Precio venta EMPIRE:', precioVenta);
      
      // Step 4: Save to polizas_activas table
      const savedPoliza = await saveToPolizasActivas(payload, documentUrls, precioVenta);
      
      // Step 5: Call RMS API to get policy number
      try {
        const rmsResponse = await callRmsApi(savedPoliza.id, payload);
        toast({
          title: "¡Póliza activada exitosamente!",
          description: `Tu número de póliza es: ${rmsResponse.numeroPoliza}`
        });
      } catch (rmsError) {
        console.error('⚠️ Error al obtener número de póliza, pero la póliza fue guardada:', rmsError);
        toast({
          title: "Póliza registrada",
          description: "Tu póliza ha sido guardada. El número de póliza se asignará pronto.",
          variant: "default"
        });
      }

      setCurrentStep(6);
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al enviar el formulario. Por favor, intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const pageVariants = {
    initial: {
      opacity: 0,
      x: 20
    },
    in: {
      opacity: 1,
      x: 0
    },
    out: {
      opacity: 0,
      x: -20
    }
  };
  const successVariants = {
    hidden: {
      scale: 0,
      rotate: -180
    },
    visible: {
      scale: 1,
      rotate: 0
    }
  };
  return <div className="min-h-screen bg-background">
      <SimpleHeader />
      
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <Button onClick={() => navigate('/activar-poliza-rcv')} variant="ghost" className="mb-6 text-primary hover:text-primary-dark transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          
          <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }} className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
              Activación Persona Natural
            </h1>
            <p className="text-muted-foreground">
              Paso {currentStep} de {totalSteps}
            </p>
            <Progress value={progress} className="mt-4" />
          </motion.div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && <motion.div key="step1" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{
            duration: 0.3
          }}>
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
                      <Input id="placa" placeholder="Ej: ABC123" value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} className="text-lg" />
                    </div>

                    {showError && <motion.div initial={{
                  opacity: 0,
                  y: -10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-destructive font-medium mb-3">
                          Placa no encontrada en el sistema
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Por favor, contacta a nuestro equipo de soporte para resolver esta situación.
                        </p>
                        <Button onClick={handleContactSupport} variant="outline" className="w-full gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Contactar a Soporte
                        </Button>
                      </motion.div>}

                    <Button onClick={validatePlaca} variant="hero" size="lg" className="w-full" disabled={!placa || isValidating}>
                      {isValidating ? <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Validando...
                        </> : "Validar Placa"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>}

            {currentStep === 1.5 && vehicleData && <motion.div key="step1.5" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{
            duration: 0.3
          }}>
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
                      <Button onClick={() => {
                    setCurrentStep(1);
                    setVehicleData(null);
                    setPlacaValidada(false);
                  }} variant="destructive" size="lg" className="flex-1">
                        Cancelar
                      </Button>
                      <Button onClick={() => {
                    if (vehicleData?.Carroceria) {
                      setFormData(prev => ({
                        ...prev,
                        serialCarroceria: vehicleData.Carroceria || ""
                      }));
                    }
                    setCurrentStep(2);
                  }} variant="hero" size="lg" className="flex-1">
                        Continuar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>}

            {currentStep === 2 && <motion.div key="step2" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{
            duration: 0.3
          }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>DATOS DEL ASEGURADO</CardTitle>
                      <Button onClick={autoFillPersonalData} variant="outline" size="sm" className="gap-2">
                        <Zap className="w-4 h-4" />
                        Auto-rellenar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre * (mín. 2 caracteres)</Label>
                        <Input id="nombre" value={formData.nombre} onChange={e => handleInputChange("nombre", e.target.value)} />
                        {formData.nombre && formData.nombre.trim().length < 2 && (
                          <p className="text-sm text-destructive">Mínimo 2 caracteres</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellidos">Apellidos * (mín. 2 caracteres)</Label>
                        <Input id="apellidos" value={formData.apellidos} onChange={e => handleInputChange("apellidos", e.target.value)} />
                        {formData.apellidos && formData.apellidos.trim().length < 2 && (
                          <p className="text-sm text-destructive">Mínimo 2 caracteres</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipoIdentificacion">Tipo de Identificación *</Label>
                        <Select value={formData.tipoIdentificacion} onValueChange={handleTipoIdentificacionChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una opción" />
                          </SelectTrigger>
                          <SelectContent>
                            {nacionalidades.filter(nac => nac.cd_valdet !== "G" && nac.cd_valdet !== "J").map(nac => <SelectItem key={nac.cd_valdet} value={nac.cd_valdet || ""}>
                                {nac.descripcion || ""}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numeroCedula">Número de {formData.tipoIdentificacion === "P" ? "Pasaporte" : "Cédula o RIF"} *</Label>
                        <Input
                          id="numeroCedula"
                          value={formData.numeroCedula}
                          onChange={e => handleCedulaChange(e.target.value)}
                          placeholder={
                            formData.tipoIdentificacion === "P"
                              ? "Ej: AB123456 (alfanumérico)"
                              : formData.tipoIdentificacion === "V"
                              ? "Ej: V-12345678 (entre 2.000.000 y 45.000.000)"
                              : formData.tipoIdentificacion === "E"
                              ? "Ej: E-85123456 (entre 80.000.000 y 99.999.999)"
                              : formData.tipoIdentificacion
                              ? `Ej: ${formData.tipoIdentificacion}-12345678`
                              : "Seleccione tipo primero"
                          }
                          disabled={!formData.tipoIdentificacion}
                          className={cedulaError ? "border-destructive" : ""}
                        />
                        {cedulaError && (
                          <p className="text-sm text-destructive">{cedulaError}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sexo">Sexo *</Label>
                      <Select value={formData.sexo} onValueChange={value => handleInputChange("sexo", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          {sexos.map(sexo => <SelectItem key={sexo.cd_valdet} value={sexo.cd_valdet || ""}>
                              {sexo.descripcion || ""}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fechaNacimiento">Fecha de Nacimiento * (mayor de edad)</Label>
                        <Input
                          id="fechaNacimiento"
                          type="date"
                          value={formData.fechaNacimiento}
                          max={maxBirthDateForAdult()}
                          onChange={e => handleInputChange("fechaNacimiento", e.target.value)}
                          className={fechaNacimientoError ? "border-destructive" : ""}
                        />
                        {fechaNacimientoError && (
                          <p className="text-sm text-destructive">{fechaNacimientoError}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estadoCivil">Estado Civil *</Label>
                        <Select value={formData.estadoCivil} onValueChange={value => handleInputChange("estadoCivil", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una opción" />
                          </SelectTrigger>
                          <SelectContent>
                            {estadosCiviles.map(estado => <SelectItem key={estado.cd_valdet} value={estado.cd_valdet || ""}>
                                {estado.descripcion || ""}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="actividadEconomica">Actividad Económica *</Label>
                      <Select
                        value={formData.actividadEconomica}
                        onValueChange={value => handleInputChange("actividadEconomica", value)}
                      >
                        <SelectTrigger id="actividadEconomica">
                          <SelectValue placeholder="Seleccione una actividad" />
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
                      <Label htmlFor="direccion">Dirección * (mín. 5 caracteres, sin comas)</Label>
                      <Input
                        id="direccion"
                        value={formData.direccion}
                        onChange={e => handleInputChange("direccion", e.target.value)}
                        placeholder="Ej: Av. Principal Edificio Vista Piso 3 Apto 5"
                        className={direccionError ? "border-destructive" : ""}
                      />
                      {direccionError && (
                        <p className="text-sm text-destructive">{direccionError}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pais">País *</Label>
                        <Input id="pais" value={formData.pais} readOnly className="bg-muted" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado *</Label>
                        <Select value={formData.estado} onValueChange={value => {
                      handleInputChange("estado", value);
                      // Reset ciudad and municipio when estado changes
                      handleInputChange("ciudad", "");
                      handleInputChange("municipio", "");
                    }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {estados.map(estado => <SelectItem key={estado.cd_estado} value={estado.cd_estado || ""}>
                                {estado.descripcion || ""}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ciudad">Ciudad *</Label>
                        <Select 
                          value={formData.ciudad} 
                          onValueChange={value => {
                            handleInputChange("ciudad", value);
                            // Reset municipio when ciudad changes
                            setFormData(prev => ({ ...prev, municipio: "" }));
                          }} 
                          disabled={!formData.estado}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={formData.estado ? "Seleccione una ciudad" : "Seleccione estado primero"} />
                          </SelectTrigger>
                          <SelectContent>
                            {ciudades.map(ciudad => <SelectItem key={ciudad.cd_ciudad} value={ciudad.cd_ciudad || ""}>
                                {ciudad.descripcion || ""}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="municipio">Municipio *</Label>
                        <Select 
                          value={typeof formData.municipio === 'string' ? formData.municipio : ""} 
                          onValueChange={value => {
                            setFormData(prev => ({ ...prev, municipio: value }));
                          }} 
                          disabled={!formData.ciudad}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={formData.ciudad ? "Seleccione un municipio" : "Seleccione ciudad primero"} />
                          </SelectTrigger>
                          <SelectContent>
                            {municipios.map(municipio => <SelectItem key={municipio.id} value={municipio.id}>
                                {municipio.descripcion || ""}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="codigoPostal">Código Postal</Label>
                        <Input 
                          id="codigoPostal" 
                          type="text" 
                          value={formData.codigoPostal} 
                          onChange={e => handleInputChange("codigoPostal", e.target.value)} 
                          placeholder="Ej: 1010" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        📱 Ingresa un número celular con WhatsApp (lo usaremos para contactarte).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="codigoTelefonico">Código de Celular (WhatsApp) *</Label>
                        <Select value={formData.codigoTelefonico} onValueChange={value => handleInputChange("codigoTelefonico", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un código" />
                          </SelectTrigger>
                          <SelectContent>
                            {codigosTelefonicos.map(codigo => <SelectItem key={codigo.cd_valdet} value={codigo.cd_valdet || ""}>
                                {codigo.cd_valdet || ""}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numeroTelefonico">Número de Celular (WhatsApp) * (7 dígitos)</Label>
                        <Input id="numeroTelefonico" type="tel" value={formData.numeroTelefonico} onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 7);
                          handleInputChange("numeroTelefonico", val);
                        }} placeholder="1234567" maxLength={7} />
                        {formData.numeroTelefonico && formData.numeroTelefonico.length < 7 && formData.numeroTelefonico.length > 0 && (
                          <p className="text-sm text-destructive">El teléfono debe tener exactamente 7 dígitos</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Dirección de correo electrónico *</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={formData.email} 
                          onChange={e => handleInputChange("email", e.target.value)}
                          className={emailError ? "border-destructive" : ""}
                        />
                        {emailError && (
                          <p className="text-sm text-destructive">{emailError}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email2">Email 2</Label>
                        <Input 
                          id="email2" 
                          type="email" 
                          value={formData.email2} 
                          onChange={e => handleInputChange("email2", e.target.value)}
                          className={email2Error ? "border-destructive" : ""}
                        />
                        {email2Error && (
                          <p className="text-sm text-destructive">{email2Error}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex-1">
                        Anterior
                      </Button>
                      <Button
                        onClick={() => {
                          const missing: string[] = [];
                          if (!formData.nombre || formData.nombre.trim().length < 2) missing.push("Nombre");
                          if (!formData.apellidos || formData.apellidos.trim().length < 2) missing.push("Apellidos");
                          if (!formData.tipoIdentificacion) missing.push("Tipo de identificación");
                          if (!formData.numeroCedula) missing.push("Número de cédula/pasaporte");
                          else if (validateCedula(formData.tipoIdentificacion, formData.numeroCedula).error) {
                            missing.push("Número de cédula/pasaporte (formato inválido)");
                          }
                          if (!formData.sexo) missing.push("Sexo");
                          if (!formData.fechaNacimiento) missing.push("Fecha de nacimiento");
                          else if (!isAdult(formData.fechaNacimiento)) missing.push("Fecha de nacimiento (debe ser mayor de edad)");
                          if (!formData.estadoCivil) missing.push("Estado civil");
                          if (!formData.actividadEconomica) missing.push("Actividad económica");
                          if (!formData.direccion || validateDireccion(formData.direccion).error) missing.push("Dirección");
                          if (!formData.estado) missing.push("Estado");
                          if (!formData.ciudad) missing.push("Ciudad");
                          if (!formData.municipio) missing.push("Municipio");
                          if (!formData.codigoTelefonico) missing.push("Código de celular");
                          if (!formData.numeroTelefonico || formData.numeroTelefonico.length !== 7) missing.push("Número de celular (7 dígitos)");
                          if (!formData.email || validateEmailFormat(formData.email).error) missing.push("Correo electrónico");
                          if (formData.email2 && validateEmailFormat(formData.email2).error) missing.push("Correo electrónico 2 (formato inválido)");

                          if (missing.length > 0) {
                            toast({
                              title: "Faltan campos por completar",
                              description: missing.join(" • "),
                              variant: "destructive",
                            });
                            return;
                          }
                          setCurrentStep(3);
                        }}
                        variant="hero"
                        className="flex-1"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>}

            {currentStep === 3 && <motion.div key="step3" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{
            duration: 0.3
          }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>INFORMACION SOBRE EL VEHICULO</CardTitle>
                      <Button onClick={autoFillVehicleData} variant="outline" size="sm" className="gap-2">
                        <Zap className="w-4 h-4" />
                        Auto-rellenar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="placaMoto">Placa de la Moto *</Label>
                      <Input id="placaMoto" value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} placeholder="Ej: ABC123" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serialCarroceria">Serial de Carrocería *</Label>
                      <Input id="serialCarroceria" value={formData.serialCarroceria} readOnly className="bg-muted cursor-not-allowed" />
                      <p className="text-xs text-muted-foreground">Este campo se precarga del inventario y no puede ser modificado</p>
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
                      <Label htmlFor="fechaCompra">Fecha de Compra (según la factura) *</Label>
                      <Input
                        id="fechaCompra"
                        type="date"
                        value={formData.fechaCompra}
                        min={MIN_FECHA_COMPRA}
                        max={todayISO()}
                        onChange={e => handleInputChange("fechaCompra", e.target.value)}
                        className={fechaCompraError ? "border-destructive" : ""}
                      />
                      {fechaCompraError && (
                        <p className="text-sm text-destructive">{fechaCompraError}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Debe ser anterior o igual a hoy y no puede ser anterior al {MIN_FECHA_COMPRA}.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={() => setCurrentStep(2)} variant="outline" className="flex-1">
                        Anterior
                      </Button>
                      <Button
                        onClick={() => {
                          const missing: string[] = [];
                          if (!placa) missing.push("Placa");
                          if (!formData.serialCarroceria) missing.push("Serial de carrocería");
                          if (!formData.fechaCompra) missing.push("Fecha de compra");
                          else {
                            const fc = validateFechaCompraHelper(formData.fechaCompra);
                            if (!fc.valid) missing.push(`Fecha de compra (${fc.error})`);
                          }
                          if (serialConfirmado !== true) missing.push("Confirmación del serial");
                          if (missing.length > 0) {
                            toast({
                              title: "Faltan campos por completar",
                              description: missing.join(" • "),
                              variant: "destructive",
                            });
                            return;
                          }
                          setCurrentStep(4);
                        }}
                        variant="hero"
                        className="flex-1"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>}

            {currentStep === 4 && <motion.div key="step5" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{
            duration: 0.3
          }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-primary">BENEFICIARIO PREFERENCIAL EN CASO DE MUERTE </CardTitle>
                      <Button onClick={autoFillBeneficiaryData} variant="outline" size="sm" className="gap-2">
                        <Zap className="w-4 h-4" />
                        Auto-rellenar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="beneficiarioNombre">Nombre *</Label>
                        <Input id="beneficiarioNombre" value={formData.beneficiarioNombre} onChange={e => handleInputChange("beneficiarioNombre", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="beneficiarioApellidos">Apellidos *</Label>
                        <Input id="beneficiarioApellidos" value={formData.beneficiarioApellidos} onChange={e => handleInputChange("beneficiarioApellidos", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="beneficiarioTipoIdentificacion">Tipo de Identificación *</Label>
                        <Select value={formData.beneficiarioTipoIdentificacion} onValueChange={handleBeneficiarioTipoIdentificacionChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una opción" />
                          </SelectTrigger>
                          <SelectContent>
                            {nacionalidades.filter(nac => nac.cd_valdet !== "G" && nac.cd_valdet !== "J").map(nac => <SelectItem key={nac.cd_valdet} value={nac.cd_valdet || ""}>
                                  {nac.descripcion || ""}
                                </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="beneficiarioNumeroCedula">Número de Cédula o RIF *</Label>
                        <Input id="beneficiarioNumeroCedula" value={formData.beneficiarioNumeroCedula} onChange={e => handleBeneficiarioCedulaChange(e.target.value)} placeholder={formData.beneficiarioTipoIdentificacion ? `Ej: ${formData.beneficiarioTipoIdentificacion}-12345678` : "Seleccione tipo primero"} disabled={!formData.beneficiarioTipoIdentificacion} />
                        {formData.beneficiarioNumeroCedula && formData.beneficiarioNumeroCedula.replace(/[^0-9]/g, '').length < 7 && formData.beneficiarioNumeroCedula.replace(/[^0-9]/g, '').length > 0 && (
                          <p className="text-sm text-destructive">La cédula debe tener al menos 7 dígitos</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="beneficiarioSexo">Sexo *</Label>
                        <Select value={formData.beneficiarioSexo} onValueChange={value => handleInputChange("beneficiarioSexo", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una opción" />
                          </SelectTrigger>
                          <SelectContent>
                            {sexos.map(sexo => <SelectItem key={sexo.cd_valdet} value={sexo.cd_valdet || ""}>
                                {sexo.descripcion || ""}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="beneficiarioFechaNacimiento">Fecha de Nacimiento *</Label>
                        <Input id="beneficiarioFechaNacimiento" type="date" value={formData.beneficiarioFechaNacimiento} onChange={e => handleInputChange("beneficiarioFechaNacimiento", e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="beneficiarioEstadoCivil">Estado Civil *</Label>
                      <Select value={formData.beneficiarioEstadoCivil} onValueChange={value => handleInputChange("beneficiarioEstadoCivil", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          {estadosCiviles.map(estado => <SelectItem key={estado.cd_valdet} value={estado.cd_valdet || ""}>
                              {estado.descripcion || ""}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={() => setCurrentStep(3)} variant="outline" className="flex-1">
                        Anterior
                      </Button>
                      <Button onClick={() => setCurrentStep(5)} variant="hero" className="flex-1" disabled={!formData.beneficiarioNombre || !formData.beneficiarioApellidos || !formData.beneficiarioNumeroCedula || !formData.beneficiarioSexo || !formData.beneficiarioFechaNacimiento || !formData.beneficiarioEstadoCivil}>
                        Siguiente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>}

            {currentStep === 5 && <motion.div key="step4" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{
            duration: 0.3
          }}>
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
                      validationStatus={getValidation("docIdentidad").status}
                      validationMessage={getValidation("docIdentidad").message}
                      validationObservations={getValidation("docIdentidad").observations}
                    />

                    <FileUploader
                      id="docLicenciaConducir"
                      label="Licencia de Conducir"
                      file={formData.docLicenciaConducir}
                      onFileChange={(file) => handleFileChange("docLicenciaConducir", file)}
                      required
                      validationStatus={getValidation("docLicenciaConducir").status}
                      validationMessage={getValidation("docLicenciaConducir").message}
                      validationObservations={getValidation("docLicenciaConducir").observations}
                    />

                    <FileUploader
                      id="docCertificadoMedico"
                      label="Certificado Médico"
                      file={formData.docCertificadoMedico}
                      onFileChange={(file) => handleFileChange("docCertificadoMedico", file)}
                      required
                      validationStatus={getValidation("docCertificadoMedico").status}
                      validationMessage={getValidation("docCertificadoMedico").message}
                      validationObservations={getValidation("docCertificadoMedico").observations}
                    />

                    <FileUploader
                      id="docOrigenVehiculo"
                      label="Certificado de Origen del Vehículo"
                      file={formData.docOrigenVehiculo}
                      onFileChange={(file) => handleFileChange("docOrigenVehiculo", file)}
                      required
                      validationStatus={getValidation("docOrigenVehiculo").status}
                      validationMessage={getValidation("docOrigenVehiculo").message}
                      validationObservations={getValidation("docOrigenVehiculo").observations}
                    />

                    <FileUploader
                      id="docFacturaCompra"
                      label="Factura de Compra del Vehículo"
                      file={formData.docFacturaCompra}
                      onFileChange={(file) => handleFileChange("docFacturaCompra", file)}
                      required
                      validationStatus={getValidation("docFacturaCompra").status}
                      validationMessage={getValidation("docFacturaCompra").message}
                      validationObservations={getValidation("docFacturaCompra").observations}
                    />

                    <FileUploader
                      id="docRIF"
                      label="RIF"
                      file={formData.docRIF}
                      onFileChange={(file) => handleFileChange("docRIF", file)}
                      required
                      validationStatus={getValidation("docRIF").status}
                      validationMessage={getValidation("docRIF").message}
                      validationObservations={getValidation("docRIF").observations}
                    />

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        El arriba identificado como asegurado propuesto, como solicitante de la póliza o en representación de este, 
                        declaro que la información aquí suministrada es exacta, sin omisión alguna de detalle, hecho o circunstancia, 
                        con el propósito de eliminar el riesgo, en el entendido que servirá de base para la emisión de la póliza.
                      </p>
                    </div>

                     <div className="flex gap-3 pt-4">
                      <Button onClick={() => setCurrentStep(4)} variant="outline" className="flex-1" disabled={isSubmitting}>
                        Anterior
                      </Button>
                      <Button onClick={handleSubmit} variant="hero" className="flex-1" disabled={isSubmitting || !formData.docIdentidad || !formData.docLicenciaConducir || !formData.docCertificadoMedico || !formData.docOrigenVehiculo || !formData.docFacturaCompra || !formData.docRIF || !allCriticalDocsValid() || hasAnyValidating()}>
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
              </motion.div>}

            {currentStep === 6 && <motion.div key="step6" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{
            duration: 0.3
          }}>
                <Card className="text-center">
                  <CardContent className="py-12 px-4">
                    <motion.div variants={successVariants} initial="hidden" animate="visible" className="mb-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-primary" />
                      </div>
                    </motion.div>

                    <motion.h2 initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: 0.3
                }} className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                      ¡Activación Exitosa!
                    </motion.h2>

                    <motion.p initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: 0.4
                }} className="text-muted-foreground mb-8">
                      Tu póliza RCV ha sido activada correctamente. En breve recibirás un correo de confirmación.
                    </motion.p>

                    <motion.div initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} transition={{
                  delay: 0.5
                }}>
                      <Button onClick={() => navigate('/')} variant="hero" size="lg">
                        Volver al Inicio
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>}
          </AnimatePresence>
        </div>
      </div>

      {/* Loading Dialog */}
      <Dialog open={isSubmitting}>
        <DialogContent className="sm:max-w-md border-none bg-card/95 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Loader2 className="w-16 h-16 text-primary" />
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-semibold text-foreground mb-2"
            >
              Procesando tu solicitud
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground text-center"
            >
              Estamos subiendo tus documentos y enviando la información a la aseguradora. 
              Por favor, espera un momento...
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mt-6 flex gap-2"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default ActivarPolizaNaturalPage;