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
