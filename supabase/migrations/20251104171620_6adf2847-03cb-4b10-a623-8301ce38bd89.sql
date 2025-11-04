-- Create function for automatic timestamp updates (create this first)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create Polizas_Activas table
CREATE TABLE public.polizas_activas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Monday fields
  poliza_monday TEXT,
  numero_poliza_monday TEXT,
  placa_monday TEXT,
  fecha_de_vencimiento_monday TEXT,
  api_monday TEXT,
  estado_principal_monday TEXT,
  recordatorio_de_vencimiento_monday TEXT,
  nombre_titular_monday TEXT,
  apellidos_titular_monday TEXT,
  tipo_id_titular_monday TEXT,
  nro_documento_juridico_monday TEXT,
  nro_documento_natural_monday TEXT,
  razon_social_juridico_monday TEXT,
  fecha_nacimiento_titular_monday TEXT,
  pais_monday TEXT,
  direccion_monday TEXT,
  ciudad_monday TEXT,
  municipio_monday TEXT,
  codigo_postal_monday TEXT,
  codigo_telefonico_titular_monday TEXT,
  numero_telefonico_titular_monday TEXT,
  email_monday TEXT,
  email_alternativo_monday TEXT,
  fecha_compra_monday TEXT,
  serial_carroceria_monday TEXT,
  version_modelo_monday TEXT,
  cod_modelo_monday TEXT,
  año_monday TEXT,
  transmision_empire_monday TEXT,
  serial_motor_monday TEXT,
  cod_color_empire_monday TEXT,
  precio_venta_tienda_monday TEXT,
  color_bera_monday TEXT,
  url_poliza_monday TEXT,
  url_carnet_monday TEXT,
  nombre_apoderado_monday TEXT,
  apellido_apoderado_monday TEXT,
  numero_documento_apoderado_monday TEXT,
  fecha_nacimiento_apoderado_monday TEXT,
  estado_civil_apoderado_monday TEXT,
  sexo_apoderado_monday TEXT,
  version_api_monday TEXT,
  
  -- API fields
  f_fchdesde TEXT,
  f_fechacompra TEXT,
  n_anio TEXT,
  c_placa TEXT,
  c_carroceria TEXT,
  c_cd_nacionalidad TEXT,
  s_nacionalidad TEXT,
  n_cedrif TEXT,
  n_correlativo TEXT,
  cd_sexo TEXT,
  s_sexo TEXT,
  f_fecnac TEXT,
  cd_edocivil TEXT,
  s_edocivil TEXT,
  c_nombre TEXT,
  c_apellido TEXT,
  c_razonsocial TEXT,
  c_cd_pais TEXT,
  s_pais TEXT,
  c_cd_estado TEXT,
  s_estado TEXT,
  c_cd_ciudad TEXT,
  s_ciudad TEXT,
  c_cd_municipio TEXT,
  s_municipio TEXT,
  c_direccion TEXT,
  c_cd_telef1 TEXT,
  s_telef1 TEXT,
  c_numtelef1 TEXT,
  c_email1 TEXT,
  c_email2 TEXT,
  c_cd_actividad TEXT,
  c_cd_ocupacion TEXT,
  n_ingresoanualnac TEXT,
  c_cd_nacionalidadap TEXT,
  s_nacionalidadap TEXT,
  n_cedrifap TEXT,
  cd_sexoap TEXT,
  s_sexoap TEXT,
  f_fecnacap TEXT,
  cd_edocivilap TEXT,
  s_edocivilap TEXT,
  c_nombreap TEXT,
  c_apellidoap TEXT,
  c_cd_nacionalidadch TEXT,
  s_nacionalidadch TEXT,
  n_cedrifch TEXT,
  cd_sexoch TEXT,
  s_sexoch TEXT,
  f_fecnacch TEXT,
  cd_edocivilch TEXT,
  s_edocivilch TEXT,
  c_nombrech TEXT,
  c_apellidoch TEXT,
  cd_moneda TEXT,
  s_moneda TEXT,
  c_cd_marca TEXT,
  s_marca TEXT,
  c_cd_modelo TEXT,
  s_modelo TEXT,
  c_cd_version TEXT,
  s_version TEXT,
  n_nu_centuria TEXT,
  c_motor TEXT,
  c_cd_color TEXT,
  s_color TEXT,
  c_cd_versionseguro TEXT,
  c_cd_subversionseguro TEXT,
  n_suma TEXT,
  desde TEXT,
  mondayid TEXT,
  listacolumnas TEXT,
  
  -- Document URLs
  cedula_identidad_url TEXT,
  licencia_conducir_url TEXT,
  certificado_medico_url TEXT,
  certificado_origen_vehiculo_url TEXT,
  factura_compra_vehiculo_url TEXT,
  rif_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.polizas_activas ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to manage their own policies
CREATE POLICY "Users can view their own policies" 
ON public.polizas_activas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own policies" 
ON public.polizas_activas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policies" 
ON public.polizas_activas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own policies" 
ON public.polizas_activas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_polizas_activas_updated_at
BEFORE UPDATE ON public.polizas_activas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index on user_id for better query performance
CREATE INDEX idx_polizas_activas_user_id ON public.polizas_activas(user_id);

-- Create index on placa_monday for quick policy lookups
CREATE INDEX idx_polizas_activas_placa ON public.polizas_activas(placa_monday);