import { supabase } from "@/integrations/supabase/client";
import { fetchVersionApi } from "@/utils/versionApi";
import { formatPriceToTwoDecimals, fetchPrecioEmpire } from "@/lib/priceUtils";

interface PolizaConfigData {
  id: string;
  s_marca: string | null;
  s_modelo: string | null;
  s_color: string | null;
  año_monday: string | null;
  formulario: string | null;
  placa_monday: string | null;
}

interface RefreshResult {
  success: boolean;
  updatedFields: Record<string, any>;
  error?: string;
}

/**
 * Refreshes configuration data for a poliza based on current values in configuration tables
 * This includes: precio, marca, modelo, version, color, version_api data
 */
export async function refreshPolizaConfig(poliza: PolizaConfigData): Promise<RefreshResult> {
  try {
    const updatedFields: Record<string, any> = {};
    
    console.log('🔄 Iniciando refreshPolizaConfig para:', poliza.id);
    console.log('📋 Datos de entrada:', { s_marca: poliza.s_marca, s_modelo: poliza.s_modelo, s_color: poliza.s_color });
    
    // 1. Fetch marca code and description
    if (poliza.s_marca) {
      // Normalize marca name for better matching
      const marcaNormalized = poliza.s_marca.trim();
      
      const { data: marcaData, error: marcaError } = await supabase
        .from('board_cod_marca')
        .select('cd_marca, descripcion')
        .ilike('descripcion', marcaNormalized)
        .maybeSingle();

      console.log('🏷️ Búsqueda de marca:', { marcaNormalized, marcaData, marcaError });

      if (marcaData) {
        updatedFields.c_cd_marca = marcaData.cd_marca;
        updatedFields.s_marca = marcaData.descripcion;
        console.log('✅ Marca encontrada:', marcaData);
      } else {
        // Try partial match if exact match fails
        const { data: marcaPartialData } = await supabase
          .from('board_cod_marca')
          .select('cd_marca, descripcion')
          .or(`descripcion.ilike.%${marcaNormalized}%,descripcion.ilike.%${marcaNormalized.replace(/\s+/g, '')}%`)
          .limit(1)
          .maybeSingle();
        
        if (marcaPartialData) {
          updatedFields.c_cd_marca = marcaPartialData.cd_marca;
          updatedFields.s_marca = marcaPartialData.descripcion;
          console.log('✅ Marca encontrada (parcial):', marcaPartialData);
        } else {
          console.warn('⚠️ No se encontró marca para:', marcaNormalized);
        }
      }
    }

    // 2. Fetch modelo code and description
    if (poliza.s_modelo && updatedFields.c_cd_marca) {
      const modeloNormalized = poliza.s_modelo.trim();
      
      const { data: modeloData, error: modeloError } = await supabase
        .from('board_cod_modelo')
        .select('cd_modelo, descripcion')
        .eq('cd_marca', updatedFields.c_cd_marca)
        .ilike('descripcion', modeloNormalized)
        .maybeSingle();

      console.log('🚗 Búsqueda de modelo:', { modeloNormalized, cd_marca: updatedFields.c_cd_marca, modeloData, modeloError });

      if (modeloData) {
        updatedFields.c_cd_modelo = modeloData.cd_modelo;
        updatedFields.s_modelo = modeloData.descripcion;
        updatedFields.cod_modelo_monday = modeloData.cd_modelo;
        console.log('✅ Modelo encontrado:', modeloData);
      } else {
        // Try partial match
        const { data: modeloPartialData } = await supabase
          .from('board_cod_modelo')
          .select('cd_modelo, descripcion')
          .eq('cd_marca', updatedFields.c_cd_marca)
          .ilike('descripcion', `%${modeloNormalized}%`)
          .limit(1)
          .maybeSingle();
        
        if (modeloPartialData) {
          updatedFields.c_cd_modelo = modeloPartialData.cd_modelo;
          updatedFields.s_modelo = modeloPartialData.descripcion;
          updatedFields.cod_modelo_monday = modeloPartialData.cd_modelo;
          console.log('✅ Modelo encontrado (parcial):', modeloPartialData);
        } else {
          console.warn('⚠️ No se encontró modelo para:', modeloNormalized);
        }
      }
    }

    // 3. Fetch color code and description
    if (poliza.s_color) {
      const colorNormalized = poliza.s_color.trim();
      
      const { data: colorData, error: colorError } = await supabase
        .from('board_cod_color')
        .select('cd_valdet, descripcion')
        .ilike('descripcion', colorNormalized)
        .maybeSingle();

      console.log('🎨 Búsqueda de color:', { colorNormalized, colorData, colorError });

      if (colorData) {
        updatedFields.c_cd_color = colorData.cd_valdet;
        updatedFields.cod_color_empire_monday = colorData.cd_valdet;
        console.log('✅ Color encontrado:', colorData);
      }
    }

    // 4. Fetch version code and description
    if (updatedFields.c_cd_marca && updatedFields.c_cd_modelo) {
      const { data: versionData } = await supabase
        .from('board_cod_version_moto')
        .select('cd_version, descripcion')
        .eq('cd_marca', updatedFields.c_cd_marca)
        .eq('cd_modelo', updatedFields.c_cd_modelo)
        .limit(1)
        .maybeSingle();

      if (versionData) {
        updatedFields.c_cd_version = versionData.cd_version;
        updatedFields.s_version = versionData.descripcion;
        updatedFields.version_modelo_monday = versionData.descripcion;
      }
    }

    // 5. Fetch version API data (n_centuria, cd_version_seguro, cd_subversion_seguro)
    console.log('🔄 Buscando versión API para marca:', poliza.s_marca, 'año:', poliza.año_monday);
    const versionApiData = await fetchVersionApi(poliza.s_marca, poliza.año_monday);
    console.log('📦 Resultado versión API:', versionApiData);
    
    if (versionApiData) {
      updatedFields.n_nu_centuria = versionApiData.n_centuria;
      updatedFields.c_cd_versionseguro = versionApiData.cd_version_seguro;
      updatedFields.c_cd_subversionseguro = versionApiData.cd_subversion_seguro;
      updatedFields.version_api_monday = versionApiData.cd_version_seguro;
      console.log('✅ Campos de versión API actualizados:', {
        n_nu_centuria: versionApiData.n_centuria,
        c_cd_versionseguro: versionApiData.cd_version_seguro,
        c_cd_subversionseguro: versionApiData.cd_subversion_seguro
      });
    } else {
      console.warn('⚠️ No se encontró versión API para la marca/año especificados');
    }

    // 6. Fetch precio from precios_empire if it's an Empire vehicle
    if (poliza.s_modelo) {
      const precio = await fetchPrecioEmpire(poliza.s_modelo);
      if (precio) {
        updatedFields.n_suma = formatPriceToTwoDecimals(precio);
        updatedFields.precio_venta_tienda_monday = formatPriceToTwoDecimals(precio);
      }
    }

    // 7. If no price from Empire, check bd_bera
    if (!updatedFields.n_suma && poliza.placa_monday) {
      const { data: beraData } = await supabase
        .from('bd_bera')
        .select('precio_venta_tienda')
        .ilike('placa', poliza.placa_monday)
        .maybeSingle();

      if (beraData?.precio_venta_tienda) {
        updatedFields.n_suma = formatPriceToTwoDecimals(beraData.precio_venta_tienda);
        updatedFields.precio_venta_tienda_monday = formatPriceToTwoDecimals(beraData.precio_venta_tienda);
      }
    }

    // If no fields were updated, return success but no changes
    if (Object.keys(updatedFields).length === 0) {
      console.log('⚠️ No se encontraron campos para actualizar');
      return {
        success: true,
        updatedFields: {},
        error: 'No se encontraron configuraciones para actualizar'
      };
    }

    console.log('📝 Campos a actualizar en la DB:', updatedFields);

    // Update the poliza in the database
    const { data: updateData, error: updateError } = await supabase
      .from('polizas_activas')
      .update(updatedFields)
      .eq('id', poliza.id)
      .select();

    if (updateError) {
      console.error('❌ Error updating poliza config:', updateError);
      return {
        success: false,
        updatedFields: {},
        error: updateError.message
      };
    }

    console.log('✅ Póliza actualizada exitosamente:', updateData);
    console.log('✅ Poliza config refreshed:', updatedFields);
    return {
      success: true,
      updatedFields
    };

  } catch (error) {
    console.error('❌ Error in refreshPolizaConfig:', error);
    return {
      success: false,
      updatedFields: {},
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}
