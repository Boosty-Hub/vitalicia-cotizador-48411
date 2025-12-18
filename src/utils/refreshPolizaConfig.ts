import { supabase } from "@/integrations/supabase/client";
import { fetchVersionApi } from "@/utils/versionApi";

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
    
    // 1. Fetch marca code and description
    if (poliza.s_marca) {
      const { data: marcaData } = await supabase
        .from('board_cod_marca')
        .select('cd_marca, descripcion')
        .ilike('descripcion', poliza.s_marca)
        .maybeSingle();

      if (marcaData) {
        updatedFields.c_cd_marca = marcaData.cd_marca;
        updatedFields.s_marca = marcaData.descripcion;
      }
    }

    // 2. Fetch modelo code and description
    if (poliza.s_modelo && updatedFields.c_cd_marca) {
      const { data: modeloData } = await supabase
        .from('board_cod_modelo')
        .select('cd_modelo, descripcion')
        .eq('cd_marca', updatedFields.c_cd_marca)
        .ilike('descripcion', poliza.s_modelo)
        .maybeSingle();

      if (modeloData) {
        updatedFields.c_cd_modelo = modeloData.cd_modelo;
        updatedFields.s_modelo = modeloData.descripcion;
        updatedFields.cod_modelo_monday = modeloData.cd_modelo;
      }
    }

    // 3. Fetch color code and description
    if (poliza.s_color) {
      const { data: colorData } = await supabase
        .from('board_cod_color')
        .select('cd_valdet, descripcion')
        .ilike('descripcion', poliza.s_color)
        .maybeSingle();

      if (colorData) {
        updatedFields.c_cd_color = colorData.cd_valdet;
        updatedFields.cod_color_empire_monday = colorData.cd_valdet;
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
    const versionApiData = await fetchVersionApi(poliza.s_marca, poliza.año_monday);
    if (versionApiData) {
      updatedFields.n_nu_centuria = versionApiData.n_centuria;
      updatedFields.c_cd_versionseguro = versionApiData.cd_version_seguro;
      updatedFields.c_cd_subversionseguro = versionApiData.cd_subversion_seguro;
      updatedFields.version_api_monday = versionApiData.cd_version_seguro;
    }

    // 6. Fetch precio from precios_empire if it's an Empire vehicle
    if (poliza.s_modelo) {
      const { data: precioData } = await supabase
        .from('precios_empire')
        .select('precio_venta, "precio venta", modelo, marca')
        .or(`modelo.ilike.%${poliza.s_modelo}%,name.ilike.%${poliza.s_modelo}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (precioData) {
        const precio = precioData.precio_venta || precioData["precio venta"];
        if (precio) {
          updatedFields.n_suma = precio;
          updatedFields.precio_venta_tienda_monday = precio;
        }
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
        updatedFields.n_suma = beraData.precio_venta_tienda.toString();
        updatedFields.precio_venta_tienda_monday = beraData.precio_venta_tienda.toString();
      }
    }

    // If no fields were updated, return success but no changes
    if (Object.keys(updatedFields).length === 0) {
      return {
        success: true,
        updatedFields: {},
        error: 'No se encontraron configuraciones para actualizar'
      };
    }

    // Update the poliza in the database
    const { error: updateError } = await supabase
      .from('polizas_activas')
      .update(updatedFields)
      .eq('id', poliza.id);

    if (updateError) {
      console.error('Error updating poliza config:', updateError);
      return {
        success: false,
        updatedFields: {},
        error: updateError.message
      };
    }

    console.log('✅ Poliza config refreshed:', updatedFields);
    return {
      success: true,
      updatedFields
    };

  } catch (error) {
    console.error('Error in refreshPolizaConfig:', error);
    return {
      success: false,
      updatedFields: {},
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}
