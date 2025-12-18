import { supabase } from "@/integrations/supabase/client";

export interface VersionApiData {
  cd_version_seguro: string;
  cd_subversion_seguro: string;
  n_centuria: string;
}

/**
 * Fetches the version API data based on brand and year from board_cod_version_api table.
 * This function dynamically determines the correct version codes for insurance based on
 * the vehicle's brand (BERA or EMPIRE) and model year.
 * 
 * @param marca - The vehicle brand (e.g., "BERA", "EMPIRE", or full brand names containing these)
 * @param año - The model year of the vehicle (e.g., "2025")
 * @returns VersionApiData object or null if not found
 */
export const fetchVersionApi = async (
  marca: string | null | undefined,
  año: string | null | undefined
): Promise<VersionApiData | null> => {
  if (!marca || !año) {
    console.warn('fetchVersionApi: Missing marca or año', { marca, año });
    return null;
  }

  // Normalize the brand to uppercase for comparison
  const marcaNormalizada = marca.toUpperCase();
  
  // Determine if it's BERA or EMPIRE based on the brand name
  const esBera = marcaNormalizada.includes('BERA');
  const esEmpire = marcaNormalizada.includes('EMPIRE');
  
  // Get the correct prefix
  const prefijo = esBera ? 'BERA' : esEmpire ? 'EMPIRE' : null;
  
  if (!prefijo) {
    console.warn('fetchVersionApi: Unrecognized brand:', marca);
    return null;
  }

  try {
    // Query the table filtering by brand prefix and year (centuria)
    let { data, error } = await supabase
      .from('board_cod_version_api')
      .select('cd_version_seguro, cd_subversion_seguro, n_centuria')
      .ilike('cd_version_seguro', `${prefijo}%`)
      .eq('n_centuria', año)
      .maybeSingle();

    if (error) {
      console.error('fetchVersionApi: Error querying database:', error);
      return null;
    }

    // If not found, try with the previous year as fallback
    if (!data) {
      const añoAnterior = String(parseInt(año) - 1);
      console.log(`fetchVersionApi: No encontrado para ${prefijo} ${año}, buscando año anterior: ${añoAnterior}`);
      
      const fallbackResult = await supabase
        .from('board_cod_version_api')
        .select('cd_version_seguro, cd_subversion_seguro, n_centuria')
        .ilike('cd_version_seguro', `${prefijo}%`)
        .eq('n_centuria', añoAnterior)
        .maybeSingle();
      
      if (fallbackResult.error) {
        console.error('fetchVersionApi: Error en fallback:', fallbackResult.error);
        return null;
      }
      
      data = fallbackResult.data;
      
      if (!data) {
        console.warn(`fetchVersionApi: No version API found for ${prefijo} ${año} ni ${añoAnterior}`);
        return null;
      }
      
      console.log(`fetchVersionApi: Usando versión API del año anterior (${añoAnterior}):`, data);
    } else {
      console.log('fetchVersionApi: Found version API data:', data);
    }
    
    return {
      cd_version_seguro: data.cd_version_seguro || '',
      cd_subversion_seguro: data.cd_subversion_seguro || '',
      n_centuria: data.n_centuria || ''
    };
  } catch (error) {
    console.error('fetchVersionApi: Unexpected error:', error);
    return null;
  }
};
