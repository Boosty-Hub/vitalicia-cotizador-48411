import { useState, useEffect } from "react";
import { MegaMenuHeader } from "@/components/ui/MegaMenuHeader";
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
  const [vehicleData, setVehicleData] = useState<{
    Marca: string | null;
    Modelo: string | null;
    Año: string | null;
    Color: string | null;
    Carroceria: string | null;
    Suma?: string;
    MondayId?: string;
  } | null>(null);
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
    cd_municipio: string | null;
    descripcion: string | null;
    cd_ciudad: string | null;
  }>>([]);
  const [codigosTelefonicos, setCodigosTelefonicos] = useState<Array<{
    cd_valdet: string | null;
    s_descripcion: string | null;
  }>>([]);
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
    // Beneficiary data
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
        setNacionalidades(data);
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
        setSexos(data);
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
        setEstadosCiviles(data);
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
        setEstados(data);
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
        setCodigosTelefonicos(data);
      }
    };
    fetchCodigosTelefonicos();
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
      } = await supabase.from('board_cod_ciudad').select('cd_ciudad, descripcion, cd_estado').eq('cd_estado', formData.estado).order('descripcion');
      if (error) {
        console.error('Error loading ciudades:', error);
      } else if (data) {
        setCiudades(data);
      }
    };
    fetchCiudades();
  }, [formData.estado]);

  // Fetch municipios when ciudad changes
  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!formData.ciudad) {
        setMunicipios([]);
        return;
      }
      const {
        data,
        error
      } = await supabase.from('board_cod_municipio').select('cd_municipio, descripcion, cd_ciudad').eq('cd_ciudad', formData.ciudad).order('descripcion');
      if (error) {
        console.error('Error loading municipios:', error);
      } else if (data) {
        setMunicipios(data);
      }
    };
    fetchMunicipios();
  }, [formData.ciudad]);
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
            Suma: data.n_suma || "0",
            MondayId: data.mondayid || "null"
          });
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
          title: "Error",
          description: "No se pudo validar la placa. Por favor, intenta nuevamente.",
          variant: "destructive"
        });
      }
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
  const formatCedulaInput = (tipo: string, value: string) => {
    // Remover caracteres no numéricos y guiones
    const numbersOnly = value.replace(/[^0-9]/g, '');

    // Obtener el prefijo según el tipo
    const prefix = tipo || '';
    if (!prefix) return value;

    // Formatear según el tipo
    switch (prefix) {
      case 'V':
      case 'E':
        // Formato: V-12345678 (hasta 8 dígitos)
        if (numbersOnly.length === 0) return `${prefix}-`;
        return `${prefix}-${numbersOnly.slice(0, 8)}`;
      case 'J':
      case 'G':
        // Formato: J-123456789-0 (hasta 9 dígitos + 1 dígito verificador)
        if (numbersOnly.length === 0) return `${prefix}-`;
        if (numbersOnly.length <= 9) {
          return `${prefix}-${numbersOnly}`;
        }
        return `${prefix}-${numbersOnly.slice(0, 9)}-${numbersOnly.slice(9, 10)}`;
      case 'P':
        // Pasaporte: texto libre
        return value;
      default:
        return value;
    }
  };
  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleTipoIdentificacionChange = (value: string) => {
    setFormData(prev => {
      // Si hay un número de cédula existente, reformatearlo con el nuevo tipo
      const currentNumero = prev.numeroCedula;
      let newNumero = '';
      if (currentNumero) {
        // Extraer solo los números del valor actual
        const numbersOnly = currentNumero.replace(/[^0-9]/g, '');
        newNumero = formatCedulaInput(value, numbersOnly);
      } else {
        // Si no hay número, solo poner el prefijo
        newNumero = value ? `${value}-` : '';
      }
      return {
        ...prev,
        tipoIdentificacion: value,
        numeroCedula: newNumero
      };
    });
  };
  const handleCedulaChange = (value: string) => {
    const formatted = formatCedulaInput(formData.tipoIdentificacion, value);
    setFormData(prev => ({
      ...prev,
      numeroCedula: formatted
    }));
  };
  const handleBeneficiarioTipoIdentificacionChange = (value: string) => {
    setFormData(prev => {
      const currentNumero = prev.beneficiarioNumeroCedula;
      let newNumero = '';
      if (currentNumero) {
        const numbersOnly = currentNumero.replace(/[^0-9]/g, '');
        newNumero = formatCedulaInput(value, numbersOnly);
      } else {
        newNumero = value ? `${value}-` : '';
      }
      return {
        ...prev,
        beneficiarioTipoIdentificacion: value,
        beneficiarioNumeroCedula: newNumero
      };
    });
  };
  const handleBeneficiarioCedulaChange = (value: string) => {
    const formatted = formatCedulaInput(formData.beneficiarioTipoIdentificacion, value);
    setFormData(prev => ({
      ...prev,
      beneficiarioNumeroCedula: formatted
    }));
  };
  const autoFillPersonalData = () => {
    const randomNames = ["Juan", "María", "Carlos", "Ana", "Pedro", "Laura", "José", "Carmen"];
    const randomLastNames = ["García", "Rodríguez", "Martínez", "López", "González", "Pérez", "Sánchez", "Ramírez"];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomLastName = randomLastNames[Math.floor(Math.random() * randomLastNames.length)];
    const randomId = Math.floor(10000000 + Math.random() * 90000000);
    const randomPhone = Math.floor(1000000 + Math.random() * 9000000);
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
  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };
  const handleContactSupport = () => {
    window.open(`https://wa.me/584123230188?text=Hola, necesito ayuda con la activación de mi póliza RCV. Placa: ${placa}`, '_blank');
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
      .eq('cd_ciudad', formData.ciudad)
      .maybeSingle();

    const { data: municipioData } = await supabase
      .from('board_cod_municipio')
      .select('descripcion')
      .eq('cd_municipio', formData.municipio)
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
      c_cd_municipio: formData.municipio,
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
      n_nu_centuria: vehicleData?.Año || "2025",
      c_motor: formData.serialCarroceria,
      c_cd_color: vehicleCodes.c_cd_color,
      s_color: vehicleCodes.s_color,
      c_cd_versionseguro: "BERA2025",
      c_cd_subversionseguro: "BERAWEB01",
      n_suma: vehicleData?.Suma || "0",
      desde: "web",
      mondayid: vehicleData?.MondayId || "null",
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Step 1: Upload documents
      const documentUrls = await uploadDocumentsToStorage();
      
      // Step 2: Map form data to webhook payload
      const payload = await mapFormDataToWebhook(documentUrls);
      
      // Step 3: Send to webhook
      const response = await fetch('https://hook.us2.make.com/4squonwol5qr0mdhgozmvgom94kyr5bm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Error al enviar los datos');
      }

      const result = await response.json();
      console.log('Respuesta de webhook:', result);

      toast({
        title: "¡Formulario enviado exitosamente!",
        description: "Tu póliza ha sido activada correctamente"
      });

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
      <MegaMenuHeader />
      
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
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input id="nombre" value={formData.nombre} onChange={e => handleInputChange("nombre", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellidos">Apellidos *</Label>
                        <Input id="apellidos" value={formData.apellidos} onChange={e => handleInputChange("apellidos", e.target.value)} />
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
                        <Label htmlFor="numeroCedula">Número de Cédula o RIF *</Label>
                        <Input id="numeroCedula" value={formData.numeroCedula} onChange={e => handleCedulaChange(e.target.value)} placeholder={formData.tipoIdentificacion ? `Ej: ${formData.tipoIdentificacion}-12345678` : "Seleccione tipo primero"} disabled={!formData.tipoIdentificacion} />
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
                        <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                        <Input id="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={e => handleInputChange("fechaNacimiento", e.target.value)} />
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
                      <Label htmlFor="direccion">Dirección *</Label>
                      <Input id="direccion" value={formData.direccion} onChange={e => handleInputChange("direccion", e.target.value)} />
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
                        <Select value={formData.ciudad} onValueChange={value => {
                      handleInputChange("ciudad", value);
                      // Reset municipio when ciudad changes
                      handleInputChange("municipio", "");
                    }} disabled={!formData.estado}>
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
                        <Select value={formData.municipio} onValueChange={value => handleInputChange("municipio", value)} disabled={!formData.ciudad}>
                          <SelectTrigger>
                            <SelectValue placeholder={formData.ciudad ? "Seleccione un municipio" : "Seleccione ciudad primero"} />
                          </SelectTrigger>
                          <SelectContent>
                            {municipios.map(municipio => <SelectItem key={municipio.cd_municipio} value={municipio.cd_municipio || ""}>
                                {municipio.descripcion || ""}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="codigoTelefonico">Código Telefónico *</Label>
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
                        <Label htmlFor="numeroTelefonico">Número Telefónico *</Label>
                        <Input id="numeroTelefonico" type="tel" value={formData.numeroTelefonico} onChange={e => handleInputChange("numeroTelefonico", e.target.value)} placeholder="1234567" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Dirección de correo electrónico *</Label>
                        <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email2">Email 2</Label>
                        <Input id="email2" type="email" value={formData.email2} onChange={e => handleInputChange("email2", e.target.value)} />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex-1">
                        Anterior
                      </Button>
                      <Button onClick={() => setCurrentStep(3)} variant="hero" className="flex-1" disabled={!formData.nombre || !formData.apellidos || !formData.numeroCedula || !formData.sexo || !formData.fechaNacimiento || !formData.estadoCivil || !formData.direccion || !formData.estado || !formData.ciudad || !formData.municipio || !formData.codigoTelefonico || !formData.numeroTelefonico || !formData.email}>
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
                      <Input id="serialCarroceria" value={formData.serialCarroceria} onChange={e => handleInputChange("serialCarroceria", e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaCompra">Fecha de Compra en la Factura *</Label>
                      <Input id="fechaCompra" type="date" value={formData.fechaCompra} onChange={e => handleInputChange("fechaCompra", e.target.value)} />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={() => setCurrentStep(2)} variant="outline" className="flex-1">
                        Anterior
                      </Button>
                      <Button onClick={() => setCurrentStep(4)} variant="hero" className="flex-1" disabled={!placa || !formData.serialCarroceria || !formData.fechaCompra}>
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
                      <Button onClick={() => setCurrentStep(4)} variant="outline" className="flex-1" disabled={isSubmitting}>
                        Anterior
                      </Button>
                      <Button onClick={handleSubmit} variant="hero" className="flex-1" disabled={isSubmitting || !formData.docIdentidad || !formData.docLicenciaConducir || !formData.docCertificadoMedico || !formData.docOrigenVehiculo || !formData.docFacturaCompra || !formData.docRIF}>
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