export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      board_cod_ciudad: {
        Row: {
          cd_ciudad: string | null
          cd_estado: string | null
          cd_pais: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_ciudad?: string | null
          cd_estado?: string | null
          cd_pais?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_ciudad?: string | null
          cd_estado?: string | null
          cd_pais?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      board_cod_color: {
        Row: {
          cd_valdet: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_valdet?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_valdet?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      board_cod_edo_civil: {
        Row: {
          cd_valdet: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_valdet?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_valdet?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      board_cod_estado: {
        Row: {
          cd_estado: string | null
          cd_pais: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_estado?: string | null
          cd_pais?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_estado?: string | null
          cd_pais?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      board_cod_marca: {
        Row: {
          cd_marca: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_marca?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_marca?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      board_cod_modelo: {
        Row: {
          cd_marca: string | null
          cd_modelo: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_marca?: string | null
          cd_modelo?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_marca?: string | null
          cd_modelo?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      board_cod_municipio: {
        Row: {
          cd_ciudad: string | null
          cd_estado: string | null
          cd_municipio: string | null
          cd_pais: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_ciudad?: string | null
          cd_estado?: string | null
          cd_municipio?: string | null
          cd_pais?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_ciudad?: string | null
          cd_estado?: string | null
          cd_municipio?: string | null
          cd_pais?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      board_cod_pais: {
        Row: {
          cd_pais: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_pais?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_pais?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      board_cod_sexo: {
        Row: {
          cd_valdet: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_valdet?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_valdet?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      board_cod_tipo_veh: {
        Row: {
          cd_valdet: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_valdet?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_valdet?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      board_cod_tlf: {
        Row: {
          cd_valdet: string | null
          created_at: string
          id: string
          monday_id_elemento: string | null
          s_descripcion: string | null
        }
        Insert: {
          cd_valdet?: string | null
          created_at?: string
          id?: string
          monday_id_elemento?: string | null
          s_descripcion?: string | null
        }
        Update: {
          cd_valdet?: string | null
          created_at?: string
          id?: string
          monday_id_elemento?: string | null
          s_descripcion?: string | null
        }
        Relationships: []
      }
      board_cod_version_api: {
        Row: {
          cd_subversion_seguro: string | null
          cd_version_seguro: string | null
          created_at: string
          id: string
          monday_id_elemento: string | null
          n_centuria: string | null
        }
        Insert: {
          cd_subversion_seguro?: string | null
          cd_version_seguro?: string | null
          created_at?: string
          id?: string
          monday_id_elemento?: string | null
          n_centuria?: string | null
        }
        Update: {
          cd_subversion_seguro?: string | null
          cd_version_seguro?: string | null
          created_at?: string
          id?: string
          monday_id_elemento?: string | null
          n_centuria?: string | null
        }
        Relationships: []
      }
      board_cod_version_moto: {
        Row: {
          cd_marca: string | null
          cd_modelo: string | null
          cd_version: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_marca?: string | null
          cd_modelo?: string | null
          cd_version?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_marca?: string | null
          cd_modelo?: string | null
          cd_version?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      cod_act_economica: {
        Row: {
          cd_actividad: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_actividad?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_actividad?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      codigo_nacionalidad: {
        Row: {
          cd_valdet: string | null
          created_at: string
          descripcion: string | null
          id: string
          monday_id_elemento: string | null
        }
        Insert: {
          cd_valdet?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Update: {
          cd_valdet?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          monday_id_elemento?: string | null
        }
        Relationships: []
      }
      polizas_activas: {
        Row: {
          año_monday: string | null
          apellido_apoderado_monday: string | null
          apellidos_titular_monday: string | null
          api_monday: string | null
          c_apellido: string | null
          c_apellidoap: string | null
          c_apellidoch: string | null
          c_carroceria: string | null
          c_cd_actividad: string | null
          c_cd_ciudad: string | null
          c_cd_color: string | null
          c_cd_estado: string | null
          c_cd_marca: string | null
          c_cd_modelo: string | null
          c_cd_municipio: string | null
          c_cd_nacionalidad: string | null
          c_cd_nacionalidadap: string | null
          c_cd_nacionalidadch: string | null
          c_cd_ocupacion: string | null
          c_cd_pais: string | null
          c_cd_subversionseguro: string | null
          c_cd_telef1: string | null
          c_cd_version: string | null
          c_cd_versionseguro: string | null
          c_direccion: string | null
          c_email1: string | null
          c_email2: string | null
          c_motor: string | null
          c_nombre: string | null
          c_nombreap: string | null
          c_nombrech: string | null
          c_numtelef1: string | null
          c_placa: string | null
          c_razonsocial: string | null
          cd_edocivil: string | null
          cd_edocivilap: string | null
          cd_edocivilch: string | null
          cd_moneda: string | null
          cd_sexo: string | null
          cd_sexoap: string | null
          cd_sexoch: string | null
          cedula_identidad_url: string | null
          certificado_medico_url: string | null
          certificado_origen_vehiculo_url: string | null
          ciudad_monday: string | null
          cod_color_empire_monday: string | null
          cod_modelo_monday: string | null
          codigo_postal_monday: string | null
          codigo_telefonico_titular_monday: string | null
          color_bera_monday: string | null
          created_at: string
          desde: string | null
          direccion_monday: string | null
          email_alternativo_monday: string | null
          email_monday: string | null
          estado_civil_apoderado_monday: string | null
          estado_principal_monday: string | null
          f_fchdesde: string | null
          f_fechacompra: string | null
          f_fecnac: string | null
          f_fecnacap: string | null
          f_fecnacch: string | null
          factura_compra_vehiculo_url: string | null
          fecha_compra_monday: string | null
          fecha_de_vencimiento_monday: string | null
          fecha_nacimiento_apoderado_monday: string | null
          fecha_nacimiento_titular_monday: string | null
          formulario: string | null
          id: string
          licencia_conducir_url: string | null
          listacolumnas: string | null
          mondayid: string | null
          municipio_monday: string | null
          n_anio: string | null
          n_cedrif: string | null
          n_cedrifap: string | null
          n_cedrifch: string | null
          n_correlativo: string | null
          n_ingresoanualnac: string | null
          n_nu_centuria: string | null
          n_suma: string | null
          nombre_apoderado_monday: string | null
          nombre_titular_monday: string | null
          nro_documento_juridico_monday: string | null
          nro_documento_natural_monday: string | null
          numero_documento_apoderado_monday: string | null
          numero_poliza_monday: string | null
          numero_telefonico_titular_monday: string | null
          pais_monday: string | null
          placa_monday: string | null
          poliza_monday: string | null
          precio_venta_tienda_monday: string | null
          razon_social_juridico_monday: string | null
          recordatorio_de_vencimiento_monday: string | null
          rif_url: string | null
          s_ciudad: string | null
          s_color: string | null
          s_edocivil: string | null
          s_edocivilap: string | null
          s_edocivilch: string | null
          s_estado: string | null
          s_marca: string | null
          s_modelo: string | null
          s_moneda: string | null
          s_municipio: string | null
          s_nacionalidad: string | null
          s_nacionalidadap: string | null
          s_nacionalidadch: string | null
          s_pais: string | null
          s_sexo: string | null
          s_sexoap: string | null
          s_sexoch: string | null
          s_telef1: string | null
          s_version: string | null
          serial_carroceria_monday: string | null
          serial_motor_monday: string | null
          sexo_apoderado_monday: string | null
          tipo_id_titular_monday: string | null
          transmision_empire_monday: string | null
          updated_at: string
          url_carnet_monday: string | null
          url_poliza_monday: string | null
          user_id: string | null
          version_api_monday: string | null
          version_modelo_monday: string | null
        }
        Insert: {
          año_monday?: string | null
          apellido_apoderado_monday?: string | null
          apellidos_titular_monday?: string | null
          api_monday?: string | null
          c_apellido?: string | null
          c_apellidoap?: string | null
          c_apellidoch?: string | null
          c_carroceria?: string | null
          c_cd_actividad?: string | null
          c_cd_ciudad?: string | null
          c_cd_color?: string | null
          c_cd_estado?: string | null
          c_cd_marca?: string | null
          c_cd_modelo?: string | null
          c_cd_municipio?: string | null
          c_cd_nacionalidad?: string | null
          c_cd_nacionalidadap?: string | null
          c_cd_nacionalidadch?: string | null
          c_cd_ocupacion?: string | null
          c_cd_pais?: string | null
          c_cd_subversionseguro?: string | null
          c_cd_telef1?: string | null
          c_cd_version?: string | null
          c_cd_versionseguro?: string | null
          c_direccion?: string | null
          c_email1?: string | null
          c_email2?: string | null
          c_motor?: string | null
          c_nombre?: string | null
          c_nombreap?: string | null
          c_nombrech?: string | null
          c_numtelef1?: string | null
          c_placa?: string | null
          c_razonsocial?: string | null
          cd_edocivil?: string | null
          cd_edocivilap?: string | null
          cd_edocivilch?: string | null
          cd_moneda?: string | null
          cd_sexo?: string | null
          cd_sexoap?: string | null
          cd_sexoch?: string | null
          cedula_identidad_url?: string | null
          certificado_medico_url?: string | null
          certificado_origen_vehiculo_url?: string | null
          ciudad_monday?: string | null
          cod_color_empire_monday?: string | null
          cod_modelo_monday?: string | null
          codigo_postal_monday?: string | null
          codigo_telefonico_titular_monday?: string | null
          color_bera_monday?: string | null
          created_at?: string
          desde?: string | null
          direccion_monday?: string | null
          email_alternativo_monday?: string | null
          email_monday?: string | null
          estado_civil_apoderado_monday?: string | null
          estado_principal_monday?: string | null
          f_fchdesde?: string | null
          f_fechacompra?: string | null
          f_fecnac?: string | null
          f_fecnacap?: string | null
          f_fecnacch?: string | null
          factura_compra_vehiculo_url?: string | null
          fecha_compra_monday?: string | null
          fecha_de_vencimiento_monday?: string | null
          fecha_nacimiento_apoderado_monday?: string | null
          fecha_nacimiento_titular_monday?: string | null
          formulario?: string | null
          id?: string
          licencia_conducir_url?: string | null
          listacolumnas?: string | null
          mondayid?: string | null
          municipio_monday?: string | null
          n_anio?: string | null
          n_cedrif?: string | null
          n_cedrifap?: string | null
          n_cedrifch?: string | null
          n_correlativo?: string | null
          n_ingresoanualnac?: string | null
          n_nu_centuria?: string | null
          n_suma?: string | null
          nombre_apoderado_monday?: string | null
          nombre_titular_monday?: string | null
          nro_documento_juridico_monday?: string | null
          nro_documento_natural_monday?: string | null
          numero_documento_apoderado_monday?: string | null
          numero_poliza_monday?: string | null
          numero_telefonico_titular_monday?: string | null
          pais_monday?: string | null
          placa_monday?: string | null
          poliza_monday?: string | null
          precio_venta_tienda_monday?: string | null
          razon_social_juridico_monday?: string | null
          recordatorio_de_vencimiento_monday?: string | null
          rif_url?: string | null
          s_ciudad?: string | null
          s_color?: string | null
          s_edocivil?: string | null
          s_edocivilap?: string | null
          s_edocivilch?: string | null
          s_estado?: string | null
          s_marca?: string | null
          s_modelo?: string | null
          s_moneda?: string | null
          s_municipio?: string | null
          s_nacionalidad?: string | null
          s_nacionalidadap?: string | null
          s_nacionalidadch?: string | null
          s_pais?: string | null
          s_sexo?: string | null
          s_sexoap?: string | null
          s_sexoch?: string | null
          s_telef1?: string | null
          s_version?: string | null
          serial_carroceria_monday?: string | null
          serial_motor_monday?: string | null
          sexo_apoderado_monday?: string | null
          tipo_id_titular_monday?: string | null
          transmision_empire_monday?: string | null
          updated_at?: string
          url_carnet_monday?: string | null
          url_poliza_monday?: string | null
          user_id?: string | null
          version_api_monday?: string | null
          version_modelo_monday?: string | null
        }
        Update: {
          año_monday?: string | null
          apellido_apoderado_monday?: string | null
          apellidos_titular_monday?: string | null
          api_monday?: string | null
          c_apellido?: string | null
          c_apellidoap?: string | null
          c_apellidoch?: string | null
          c_carroceria?: string | null
          c_cd_actividad?: string | null
          c_cd_ciudad?: string | null
          c_cd_color?: string | null
          c_cd_estado?: string | null
          c_cd_marca?: string | null
          c_cd_modelo?: string | null
          c_cd_municipio?: string | null
          c_cd_nacionalidad?: string | null
          c_cd_nacionalidadap?: string | null
          c_cd_nacionalidadch?: string | null
          c_cd_ocupacion?: string | null
          c_cd_pais?: string | null
          c_cd_subversionseguro?: string | null
          c_cd_telef1?: string | null
          c_cd_version?: string | null
          c_cd_versionseguro?: string | null
          c_direccion?: string | null
          c_email1?: string | null
          c_email2?: string | null
          c_motor?: string | null
          c_nombre?: string | null
          c_nombreap?: string | null
          c_nombrech?: string | null
          c_numtelef1?: string | null
          c_placa?: string | null
          c_razonsocial?: string | null
          cd_edocivil?: string | null
          cd_edocivilap?: string | null
          cd_edocivilch?: string | null
          cd_moneda?: string | null
          cd_sexo?: string | null
          cd_sexoap?: string | null
          cd_sexoch?: string | null
          cedula_identidad_url?: string | null
          certificado_medico_url?: string | null
          certificado_origen_vehiculo_url?: string | null
          ciudad_monday?: string | null
          cod_color_empire_monday?: string | null
          cod_modelo_monday?: string | null
          codigo_postal_monday?: string | null
          codigo_telefonico_titular_monday?: string | null
          color_bera_monday?: string | null
          created_at?: string
          desde?: string | null
          direccion_monday?: string | null
          email_alternativo_monday?: string | null
          email_monday?: string | null
          estado_civil_apoderado_monday?: string | null
          estado_principal_monday?: string | null
          f_fchdesde?: string | null
          f_fechacompra?: string | null
          f_fecnac?: string | null
          f_fecnacap?: string | null
          f_fecnacch?: string | null
          factura_compra_vehiculo_url?: string | null
          fecha_compra_monday?: string | null
          fecha_de_vencimiento_monday?: string | null
          fecha_nacimiento_apoderado_monday?: string | null
          fecha_nacimiento_titular_monday?: string | null
          formulario?: string | null
          id?: string
          licencia_conducir_url?: string | null
          listacolumnas?: string | null
          mondayid?: string | null
          municipio_monday?: string | null
          n_anio?: string | null
          n_cedrif?: string | null
          n_cedrifap?: string | null
          n_cedrifch?: string | null
          n_correlativo?: string | null
          n_ingresoanualnac?: string | null
          n_nu_centuria?: string | null
          n_suma?: string | null
          nombre_apoderado_monday?: string | null
          nombre_titular_monday?: string | null
          nro_documento_juridico_monday?: string | null
          nro_documento_natural_monday?: string | null
          numero_documento_apoderado_monday?: string | null
          numero_poliza_monday?: string | null
          numero_telefonico_titular_monday?: string | null
          pais_monday?: string | null
          placa_monday?: string | null
          poliza_monday?: string | null
          precio_venta_tienda_monday?: string | null
          razon_social_juridico_monday?: string | null
          recordatorio_de_vencimiento_monday?: string | null
          rif_url?: string | null
          s_ciudad?: string | null
          s_color?: string | null
          s_edocivil?: string | null
          s_edocivilap?: string | null
          s_edocivilch?: string | null
          s_estado?: string | null
          s_marca?: string | null
          s_modelo?: string | null
          s_moneda?: string | null
          s_municipio?: string | null
          s_nacionalidad?: string | null
          s_nacionalidadap?: string | null
          s_nacionalidadch?: string | null
          s_pais?: string | null
          s_sexo?: string | null
          s_sexoap?: string | null
          s_sexoch?: string | null
          s_telef1?: string | null
          s_version?: string | null
          serial_carroceria_monday?: string | null
          serial_motor_monday?: string | null
          sexo_apoderado_monday?: string | null
          tipo_id_titular_monday?: string | null
          transmision_empire_monday?: string | null
          updated_at?: string
          url_carnet_monday?: string | null
          url_poliza_monday?: string | null
          user_id?: string | null
          version_api_monday?: string | null
          version_modelo_monday?: string | null
        }
        Relationships: []
      }
      precios_empire: {
        Row: {
          created_at: string
          estado: string | null
          id: string
          marca: string | null
          modelo: string | null
          monday_id_elemento: string | null
          name: string | null
          "precio venta": string | null
          precio_venta: string | null
        }
        Insert: {
          created_at?: string
          estado?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          monday_id_elemento?: string | null
          name?: string | null
          "precio venta"?: string | null
          precio_venta?: string | null
        }
        Update: {
          created_at?: string
          estado?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          monday_id_elemento?: string | null
          name?: string | null
          "precio venta"?: string | null
          precio_venta?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
