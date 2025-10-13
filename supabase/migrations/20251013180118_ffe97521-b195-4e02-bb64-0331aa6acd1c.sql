-- Create Board Cod_Color table
CREATE TABLE IF NOT EXISTS public.board_cod_color (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_valdet TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Codigo Nacionalidad table
CREATE TABLE IF NOT EXISTS public.codigo_nacionalidad (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_valdet TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Cod_ActEconomica table
CREATE TABLE IF NOT EXISTS public.cod_act_economica (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_actividad TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Board Cod_Ciudad table
CREATE TABLE IF NOT EXISTS public.board_cod_ciudad (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_ciudad TEXT,
  cd_estado TEXT,
  cd_pais TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Board Cod_EdoCivil table
CREATE TABLE IF NOT EXISTS public.board_cod_edo_civil (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_valdet TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Board Cod_Estado table
CREATE TABLE IF NOT EXISTS public.board_cod_estado (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_estado TEXT,
  cd_pais TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Board Cod_Marca table
CREATE TABLE IF NOT EXISTS public.board_cod_marca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_marca TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Board Cod_Modelo table
CREATE TABLE IF NOT EXISTS public.board_cod_modelo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_modelo TEXT,
  cd_marca TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Board Cod_Municipio table
CREATE TABLE IF NOT EXISTS public.board_cod_municipio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_municipio TEXT,
  cd_ciudad TEXT,
  cd_estado TEXT,
  cd_pais TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Board Cod_Pais table
CREATE TABLE IF NOT EXISTS public.board_cod_pais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_pais TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Board Cod_Sexo table
CREATE TABLE IF NOT EXISTS public.board_cod_sexo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_valdet TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Board Cod_TipoVeh table
CREATE TABLE IF NOT EXISTS public.board_cod_tipo_veh (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_valdet TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Board Cod_Tlf table
CREATE TABLE IF NOT EXISTS public.board_cod_tlf (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cd_valdet TEXT,
  s_descripcion TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Board Cod_Version_API table
CREATE TABLE IF NOT EXISTS public.board_cod_version_api (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cd_version_seguro TEXT,
  cd_subversion_seguro TEXT,
  n_centuria TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Board Cod_Version_Moto table
CREATE TABLE IF NOT EXISTS public.board_cod_version_moto (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descripcion TEXT,
  cd_version TEXT,
  cd_modelo TEXT,
  cd_marca TEXT,
  monday_id_elemento TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.board_cod_color ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigo_nacionalidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cod_act_economica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cod_ciudad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cod_edo_civil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cod_estado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cod_marca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cod_modelo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cod_municipio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cod_pais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cod_sexo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cod_tipo_veh ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cod_tlf ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cod_version_api ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_cod_version_moto ENABLE ROW LEVEL SECURITY;

-- Create public read policies for all tables (as these appear to be catalog/reference data)
CREATE POLICY "Allow public read access on board_cod_color"
  ON public.board_cod_color FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on codigo_nacionalidad"
  ON public.codigo_nacionalidad FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on cod_act_economica"
  ON public.cod_act_economica FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on board_cod_ciudad"
  ON public.board_cod_ciudad FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on board_cod_edo_civil"
  ON public.board_cod_edo_civil FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on board_cod_estado"
  ON public.board_cod_estado FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on board_cod_marca"
  ON public.board_cod_marca FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on board_cod_modelo"
  ON public.board_cod_modelo FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on board_cod_municipio"
  ON public.board_cod_municipio FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on board_cod_pais"
  ON public.board_cod_pais FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on board_cod_sexo"
  ON public.board_cod_sexo FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on board_cod_tipo_veh"
  ON public.board_cod_tipo_veh FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on board_cod_tlf"
  ON public.board_cod_tlf FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on board_cod_version_api"
  ON public.board_cod_version_api FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on board_cod_version_moto"
  ON public.board_cod_version_moto FOR SELECT
  USING (true);