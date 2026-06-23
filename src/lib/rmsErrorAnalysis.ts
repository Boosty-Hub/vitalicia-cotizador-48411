/**
 * Interpreta la respuesta de la API de RMS y devuelve un análisis legible para el
 * usuario: qué pasó, de qué lado está el problema (RMS / nuestro) y qué hacer.
 *
 * Se basa en los patrones de error reales observados al emitir pólizas de moto.
 */

export type RmsLado = "RMS" | "Nuestro" | "Mixto" | "Indeterminado";

export interface RmsErrorAnalisis {
  nivel: "ok" | "error" | "desconocido";
  titulo: string;
  lado: RmsLado;
  explicacion: string;
  accion: string;
  /** Datos extraídos del mensaje (Tipo, Grupo, Cobertura, etc.) */
  datos?: Record<string, string>;
}

export function analizarRespuestaRms(
  apiStatus: string | null | undefined,
  apiMessage: string | null | undefined,
): RmsErrorAnalisis | null {
  const status = (apiStatus ?? "").toString().toLowerCase();
  const msg = (apiMessage ?? "").toString().trim();
  if (!msg && !status) return null;

  if (status === "success" || /success ok/i.test(msg)) {
    return {
      nivel: "ok",
      titulo: "Emisión exitosa",
      lado: "RMS",
      explicacion: "RMS procesó y emitió la póliza correctamente.",
      accion: "No se requiere ninguna acción.",
    };
  }

  // 1) Tarifa / prima no cargada (RCV) → lado RMS
  if (/no posee.*(prima|tasa).*tarifa/i.test(msg)) {
    const cob = msg.match(/cobertura\s*(?:c[oó]digo\s*)?0*(\d+)/i)?.[1];
    const tipo = msg.match(/tipo\s*0*(\d+)/i)?.[1];
    const grupo = msg.match(/grupo\s*0*(\d+)/i)?.[1];
    const ramo = msg.match(/ramo\s*0*(\d+)/i)?.[1];
    const datos: Record<string, string> = {};
    if (ramo) datos["Ramo"] = ramo;
    if (cob) datos["Cobertura"] = cob;
    if (tipo) datos["Tipo"] = tipo;
    if (grupo) datos["Grupo"] = grupo;
    return {
      nivel: "error",
      titulo: "RMS no tiene tarifa (prima/tasa) cargada para este vehículo",
      lado: "RMS",
      explicacion:
        "RMS clasificó el vehículo en un Tipo/Grupo para el cual NO tiene cargada la tarifa de la cobertura RCV indicada. " +
        "Probado: el monto de la suma asegurada y el año no cambian este error — es un faltante en la tarifa interna de RMS.",
      accion:
        "Pedir a RMS que cargue la tarifa (prima/tasa) de la cobertura indicada para ese Tipo/Grupo. " +
        "Desde nuestro lado los códigos son correctos; no hay nada que reenviar distinto.",
      datos: Object.keys(datos).length ? datos : undefined,
    };
  }

  // 2) Tarifa libre que exige suma asegurada
  if (/tarifa libre/i.test(msg) && /suma asegurada/i.test(msg)) {
    const cob = msg.match(/cobertura\s*(?:c[oó]digo\s*)?0*(\d+)/i)?.[1];
    return {
      nivel: "error",
      titulo: "La cobertura es de tarifa libre y exige una suma asegurada",
      lado: "Mixto",
      explicacion:
        "La cobertura está marcada como TARIFA LIBRE: RMS necesita una suma asegurada válida para esa cobertura específica.",
      accion:
        "Verificar que se envíe una suma asegurada (n_suma) correcta para el modelo. " +
        "Si el monto es correcto y aún falla, RMS debe revisar la configuración de esa cobertura.",
      datos: cob ? { Cobertura: cob } : undefined,
    };
  }

  // 3) Marca / Modelo no registrado en RMS
  if (/no existe la marca/i.test(msg) || /no se encuentra registrad/i.test(msg)) {
    const marca = msg.match(/marca:?\s*([0-9A-Za-z]+)/i)?.[1];
    const modelo = msg.match(/modelo:?\s*([0-9A-Za-z]+)/i)?.[1];
    const datos: Record<string, string> = {};
    if (marca) datos["Marca enviada"] = marca;
    if (modelo) datos["Modelo enviado"] = modelo;
    return {
      nivel: "error",
      titulo: "El código de marca/modelo no está registrado en RMS",
      lado: "Mixto",
      explicacion:
        "El código de marca y/o modelo enviado no existe en el catálogo actual de RMS (posible desincronización entre nuestros catálogos y los de RMS).",
      accion:
        "Verificar que el código de marca/modelo exista en RMS. Si nuestro catálogo (board_cod_marca / board_cod_modelo) difiere del de RMS, sincronizarlo; si RMS aún no lo registró, pedir el alta.",
      datos: Object.keys(datos).length ? datos : undefined,
    };
  }

  // 4) Código de modelo con longitud inválida
  if (/c[oó]digo del modelo.*longitud/i.test(msg)) {
    return {
      nivel: "error",
      titulo: "El código de modelo enviado es inválido (longitud incorrecta)",
      lado: "Nuestro",
      explicacion:
        "Se envió un código de modelo vacío o mal formado (típico cuando el modelo no mapeó contra el catálogo y se mandó '0000' o '').",
      accion:
        "Revisar el mapeo del modelo: la descripción del inventario debe coincidir con board_cod_modelo. Corregir el modelo en el inventario o en el catálogo.",
    };
  }

  // 5) Cédula con longitud no aceptada
  if (/c[eé]dula.*(longitud|superior)/i.test(msg)) {
    return {
      nivel: "error",
      titulo: "La cédula del titular excede la longitud aceptada por RMS",
      lado: "Nuestro",
      explicacion: "El número de cédula enviado supera el largo permitido por RMS para ese tipo de documento.",
      accion: "Revisar el número y el tipo de documento del titular (V/E/P) antes de reenviar.",
    };
  }

  // 6) Suma asegurada muy baja
  if (/suma asegurada.*menor/i.test(msg)) {
    return {
      nivel: "error",
      titulo: "La suma asegurada es menor al mínimo permitido",
      lado: "Nuestro",
      explicacion: "El monto de suma asegurada (n_suma) enviado es inferior al mínimo que acepta RMS para ese producto.",
      accion:
        "Cargar/corregir el precio del modelo (precios_empire para EMPIRE, precio de tienda para BERA) para que la suma sea válida.",
    };
  }

  // 7) Versión / subversión del seguro inexistente
  if (/versi[oó]n.*subversi[oó]n/i.test(msg) || /definici[oó]n de contratos/i.test(msg)) {
    return {
      nivel: "error",
      titulo: "La versión/subversión del seguro no existe en RMS",
      lado: "Nuestro",
      explicacion:
        "El producto de seguro enviado (c_cd_versionseguro / c_cd_subversionseguro) no coincide con una definición de contrato válida en RMS.",
      accion: "Revisar el mapeo del producto en board_cod_version_api (BERA2025 / EMPIRE2025) para el año del vehículo.",
    };
  }

  // 8) Falla incluyendo al titular
  if (/incluyendo.*titular/i.test(msg)) {
    return {
      nivel: "error",
      titulo: "RMS falló al registrar al titular",
      lado: "Indeterminado",
      explicacion:
        "RMS rechazó el alta del titular. Suele relacionarse con datos de la persona: cédula, nacionalidad, actividad económica u ocupación.",
      accion: "Revisar los datos del titular (cédula, tipo de documento, actividad/ocupación) y reintentar.",
    };
  }

  // Fallback
  return {
    nivel: "desconocido",
    titulo: "Error no catalogado de RMS",
    lado: "Indeterminado",
    explicacion: "RMS devolvió un error que no está en la lista de casos conocidos.",
    accion: "Revisar el mensaje crudo de RMS y el JSON enviado (botón de descarga) para diagnosticar.",
  };
}
