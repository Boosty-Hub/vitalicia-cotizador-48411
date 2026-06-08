import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { polizaId, formData, tipoFormulario } = await req.json();

    console.log(`🚀 Iniciando llamada a RMS API para póliza ${polizaId}, tipo: ${tipoFormulario}`);
    console.log('📋 Datos recibidos:', JSON.stringify(formData, null, 2));

    const RMS_API_KEY = Deno.env.get('RMS_API_KEY');
    const RMS_API_USER = Deno.env.get('RMS_API_USER');
    const RMS_API_PASSWORD = Deno.env.get('RMS_API_PASSWORD');

    if (!RMS_API_KEY || !RMS_API_USER || !RMS_API_PASSWORD) {
      console.error('❌ Faltan credenciales de RMS API');
      throw new Error('Credenciales de RMS API no configuradas');
    }

    // Construir el payload para RMS según el tipo de formulario
    const rmsPayload = buildRmsPayload(formData, tipoFormulario);
    console.log('📦 Payload para RMS:', JSON.stringify(rmsPayload, null, 2));

    // Crear Basic Auth header
    const basicAuth = btoa(`${RMS_API_USER}:${RMS_API_PASSWORD}`);

    // Llamar al API de RMS
    const rmsResponse = await fetch('https://api.rms40.com/api-qa/form_motos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': RMS_API_KEY,
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify(rmsPayload),
    });

    const rmsData = await rmsResponse.json();
    console.log('📩 Respuesta de RMS:', JSON.stringify(rmsData, null, 2));

    if (!rmsResponse.ok) {
      console.error('❌ Error en respuesta de RMS:', rmsResponse.status, rmsData);
      throw new Error(`Error de RMS API: ${rmsData.message || rmsResponse.statusText}`);
    }

    // Extraer los datos de la respuesta
    const responseData = rmsData.data || rmsData;
    const numeroPoliza = responseData.numero_poliza;
    const nSerialcontrato = responseData.n_serialcontrato;
    const nSerialcertif = responseData.n_serialcertif;
    const recibos = responseData.recibos || [];
    const coberturas = responseData.coberturas || [];
    const apiStatus = responseData.status || 'unknown';
    const apiMessage = responseData.message || '';

    // Determinar si fue exitoso: DEBE tener número de póliza Y status no ser "error"
    const isSuccess = !!numeroPoliza && apiStatus !== 'error';

    console.log(`${isSuccess ? '✅' : '⚠️'} Respuesta RMS - Status: ${apiStatus}, Póliza: ${numeroPoliza || 'N/A'}`);

    // Actualizar la póliza en la base de datos
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('polizas_activas')
      .update({
        numero_poliza_monday: numeroPoliza,
        n_serialcontrato: nSerialcontrato?.toString(),
        n_serialcertif: nSerialcertif?.toString(),
        api_recibos: recibos,
        api_coberturas: coberturas,
        api_status: apiStatus,
        api_message: apiMessage,
        estado_principal_monday: isSuccess ? 'Activa' : 'Error API',
      })
      .eq('id', polizaId);

    if (updateError) {
      console.error('❌ Error actualizando póliza en DB:', updateError);
      throw new Error(`Error actualizando póliza: ${updateError.message}`);
    }

    console.log(`✅ Póliza ${polizaId} actualizada en DB`);

    return new Response(JSON.stringify({
      success: isSuccess,
      numeroPoliza,
      nSerialcontrato,
      nSerialcertif,
      recibos,
      coberturas,
      apiStatus,
      apiMessage,
      error: isSuccess ? undefined : (apiMessage || 'La API de RMS no generó número de póliza'),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('❌ Error en rms-create-policy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Sanitiza el código de actividad económica para la API RMS.
 * La API espera exactamente 4 dígitos numéricos.
 * 
 * Reglas:
 * 1. Si está vacío, null, undefined, o "0" → retorna fallback ("0000")
 * 2. Extrae solo los dígitos del valor
 * 3. Si tiene más de 4 dígitos, toma los últimos 4
 * 4. Si tiene menos de 4 dígitos, rellena con ceros a la izquierda
 * 5. Si no tiene dígitos válidos → retorna fallback ("0000")
 */
function sanitizeActividadEconomica(value: string | number | null | undefined, fallback: string = "0000"): string {
  // Si no hay valor o es "0" o está vacío
  if (value === null || value === undefined || value === "" || value === "0" || value === 0) {
    console.log(`🔧 c_cd_actividad: valor vacío/nulo, usando fallback: ${fallback}`);
    return fallback;
  }

  const strValue = String(value).trim();
  
  // Extraer solo los dígitos
  const digitsOnly = strValue.replace(/\D/g, '');
  
  // Si no hay dígitos válidos
  if (digitsOnly.length === 0) {
    console.log(`🔧 c_cd_actividad: sin dígitos válidos en "${strValue}", usando fallback: ${fallback}`);
    return fallback;
  }
  
  let result: string;
  
  if (digitsOnly.length > 4) {
    // Tomar los últimos 4 dígitos
    result = digitsOnly.slice(-4);
    console.log(`🔧 c_cd_actividad: "${strValue}" tiene ${digitsOnly.length} dígitos, usando últimos 4: ${result}`);
  } else if (digitsOnly.length < 4) {
    // Rellenar con ceros a la izquierda
    result = digitsOnly.padStart(4, '0');
    console.log(`🔧 c_cd_actividad: "${strValue}" tiene ${digitsOnly.length} dígitos, rellenando: ${result}`);
  } else {
    // Exactamente 4 dígitos
    result = digitsOnly;
    console.log(`🔧 c_cd_actividad: usando valor válido: ${result}`);
  }
  
  return result;
}

/**
 * Sanitiza el email para la API RMS.
 * La API espera máximo 70 caracteres, sin acentos ni caracteres especiales.
 */
function sanitizeEmail(value: string | null | undefined): string {
  if (!value) return "";
  
  // Eliminar acentos y caracteres especiales
  let email = value.trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ñ]/g, "n")
    .replace(/[Ñ]/g, "N");
  
  // Truncar a 70 caracteres si es necesario
  if (email.length > 70) {
    console.log(`⚠️ Email truncado de ${email.length} a 70 caracteres: ${email}`);
    email = email.substring(0, 70);
  }
  
  return email;
}

function buildRmsPayload(data: Record<string, any>, tipoFormulario: string): Record<string, any> {
  // Valores por defecto y fallbacks
  const defaultValues = {
    c_cd_pais: "001",
    cd_moneda: "DL",
    c_cd_actividad: "0000",
    c_cd_ocupacion: 0,
    n_ingresoanualnac: 793456.83,
    n_correlativo: 0,
  };

  // Para jurídico, usar valores especiales en apoderado si no hay datos
  const isJuridico = tipoFormulario === 'juridico';

  // Sanitizar emails
  const email1 = sanitizeEmail(data.c_email1);
  const email2 = sanitizeEmail(data.c_email2);
  
  console.log(`📧 Emails sanitizados: email1="${email1}" (${email1.length} chars), email2="${email2}" (${email2.length} chars)`);

  // Construir payload base
  const payload: Record<string, any> = {
    // Fechas
    desde: data.desde || "",
    f_fchdesde: data.f_fchdesde || "",
    
    // Vehículo
    n_anio: data.n_anio || "",
    c_placa: data.c_placa || "",
    c_carroceria: data.c_carroceria || "",
    c_motor: data.c_motor || "",
    c_cd_marca: data.c_cd_marca || "",
    c_cd_modelo: data.c_cd_modelo || "",
    c_cd_version: data.c_cd_version || "",
    c_cd_color: data.c_cd_color || "",
    n_suma: parseFloat(data.n_suma) || 0,
    n_nu_centuria: String(new Date().getFullYear()),
    c_cd_versionseguro: data.c_cd_versionseguro || "",
    c_cd_subversionseguro: data.c_cd_subversionseguro || "",
    
    // Titular - n_cedrif: usar n_cedrif, fallback a nro_documento_natural_monday o nro_documento_juridico_monday
    c_cd_nacionalidad: data.c_cd_nacionalidad || "",
    n_cedrif: parseInt(data.n_cedrif) || parseInt(data.nro_documento_natural_monday) || parseInt(data.nro_documento_juridico_monday) || 0,
    cd_sexo: data.cd_sexo || "",
    f_fecnac: data.f_fecnac || "",
    cd_edocivil: data.cd_edocivil || "",
    c_nombre: data.c_nombre || "",
    c_apellido: data.c_apellido || "",
    c_razonsocial: data.c_razonsocial || "",
    
    // Dirección
    c_cd_pais: "001",
    c_cd_estado: data.c_cd_estado || "",
    c_cd_ciudad: data.c_cd_ciudad || "",
    c_cd_municipio: data.c_cd_municipio || "",
    c_direccion: data.c_direccion || "",
    c_cd_telef1: data.c_cd_telef1 || "",
    c_numtelef1: data.c_numtelef1 || "",
    c_email1: email1,
    c_email2: email2,
    
    // Actividad económica - La API RMS espera exactamente 4 dígitos numéricos
    c_cd_actividad: sanitizeActividadEconomica(data.c_cd_actividad, defaultValues.c_cd_actividad),
    c_cd_ocupacion: parseInt(data.c_cd_ocupacion) || defaultValues.c_cd_ocupacion,
    n_ingresoanualnac: parseFloat(data.n_ingresoanualnac) || defaultValues.n_ingresoanualnac,
    
    // Moneda
    cd_moneda: "DL",
    n_correlativo: parseInt(data.n_correlativo) || defaultValues.n_correlativo,
    
    // Apoderado
    c_cd_nacionalidadap: data.c_cd_nacionalidadap || "",
    n_cedrifap: parseInt(data.n_cedrifap) || 0,
    cd_sexoap: data.cd_sexoap || "",
    f_fecnacap: data.f_fecnacap || "",
    cd_edocivilap: data.cd_edocivilap || "",
    c_nombreap: data.c_nombreap || (isJuridico ? "Sin Nombre" : ""),
    c_apellidoap: data.c_apellidoap || (isJuridico ? "Sin Nombre" : ""),
    
    // Chofer
    c_cd_nacionalidadch: data.c_cd_nacionalidadch || "",
    n_cedrifch: parseInt(data.n_cedrifch) || 0,
    cd_sexoch: data.cd_sexoch || "",
    f_fecnacch: data.f_fecnacch || "",
    cd_edocivilch: data.cd_edocivilch || "",
    c_nombrech: data.c_nombrech || "",
    c_apellidoch: data.c_apellidoch || "",
  };

  return payload;
}
