-- Add RLS policies for admins to manage all configuration tables

-- board_cod_pais
CREATE POLICY "Admins can insert board_cod_pais"
ON public.board_cod_pais FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_pais"
ON public.board_cod_pais FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_pais"
ON public.board_cod_pais FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- board_cod_estado
CREATE POLICY "Admins can insert board_cod_estado"
ON public.board_cod_estado FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_estado"
ON public.board_cod_estado FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_estado"
ON public.board_cod_estado FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- board_cod_ciudad
CREATE POLICY "Admins can insert board_cod_ciudad"
ON public.board_cod_ciudad FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_ciudad"
ON public.board_cod_ciudad FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_ciudad"
ON public.board_cod_ciudad FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- board_cod_municipio
CREATE POLICY "Admins can insert board_cod_municipio"
ON public.board_cod_municipio FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_municipio"
ON public.board_cod_municipio FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_municipio"
ON public.board_cod_municipio FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- board_cod_marca
CREATE POLICY "Admins can insert board_cod_marca"
ON public.board_cod_marca FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_marca"
ON public.board_cod_marca FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_marca"
ON public.board_cod_marca FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- board_cod_color
CREATE POLICY "Admins can insert board_cod_color"
ON public.board_cod_color FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_color"
ON public.board_cod_color FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_color"
ON public.board_cod_color FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- board_cod_tipo_veh
CREATE POLICY "Admins can insert board_cod_tipo_veh"
ON public.board_cod_tipo_veh FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_tipo_veh"
ON public.board_cod_tipo_veh FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_tipo_veh"
ON public.board_cod_tipo_veh FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- board_cod_version_moto
CREATE POLICY "Admins can insert board_cod_version_moto"
ON public.board_cod_version_moto FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_version_moto"
ON public.board_cod_version_moto FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_version_moto"
ON public.board_cod_version_moto FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- board_cod_sexo
CREATE POLICY "Admins can insert board_cod_sexo"
ON public.board_cod_sexo FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_sexo"
ON public.board_cod_sexo FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_sexo"
ON public.board_cod_sexo FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- board_cod_edo_civil
CREATE POLICY "Admins can insert board_cod_edo_civil"
ON public.board_cod_edo_civil FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_edo_civil"
ON public.board_cod_edo_civil FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_edo_civil"
ON public.board_cod_edo_civil FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- codigo_nacionalidad
CREATE POLICY "Admins can insert codigo_nacionalidad"
ON public.codigo_nacionalidad FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update codigo_nacionalidad"
ON public.codigo_nacionalidad FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete codigo_nacionalidad"
ON public.codigo_nacionalidad FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- cod_act_economica
CREATE POLICY "Admins can insert cod_act_economica"
ON public.cod_act_economica FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update cod_act_economica"
ON public.cod_act_economica FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete cod_act_economica"
ON public.cod_act_economica FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- board_cod_tlf
CREATE POLICY "Admins can insert board_cod_tlf"
ON public.board_cod_tlf FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_tlf"
ON public.board_cod_tlf FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_tlf"
ON public.board_cod_tlf FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- board_cod_version_api
CREATE POLICY "Admins can insert board_cod_version_api"
ON public.board_cod_version_api FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update board_cod_version_api"
ON public.board_cod_version_api FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete board_cod_version_api"
ON public.board_cod_version_api FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));