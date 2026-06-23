-- Ajustes de "Conexiones": modo del sistema (desarrollo/produccion) y endpoints RMS por entorno.
-- Todos NO-secretos (admin_settings tiene SELECT público): los secretos RMS siguen en Function Secrets.
-- Inserts idempotentes para no duplicar si ya existen.

insert into public.admin_settings (key, value, description)
select 'modo_sistema', 'produccion',
       'Modo del sistema. "produccion": valida documentos con IA siempre. "desarrollo": omite la validación de documentos (permite cargar cualquiera) para testear.'
where not exists (select 1 from public.admin_settings where key = 'modo_sistema');

insert into public.admin_settings (key, value, description)
select 'rms_url_dev', 'https://api.rms40.com/api-qa/form_motos',
       'Endpoint RMS para el entorno de Desarrollo / QA.'
where not exists (select 1 from public.admin_settings where key = 'rms_url_dev');

insert into public.admin_settings (key, value, description)
select 'rms_url_prod', '',
       'Endpoint RMS para Producción (pendiente: aún no provisto por RMS).'
where not exists (select 1 from public.admin_settings where key = 'rms_url_prod');
