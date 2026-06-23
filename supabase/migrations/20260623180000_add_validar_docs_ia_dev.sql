-- Toggle: en modo Desarrollo, activar a propósito la validación de documentos con IA.
-- Por defecto 'false' (en desarrollo NO valida). En Producción la validación es
-- siempre activa y este ajuste se ignora. No-secreto. Insert idempotente.

insert into public.admin_settings (key, value, description)
select 'validar_docs_ia_dev', 'false',
       'Solo aplica en modo Desarrollo: si es true, valida documentos con IA (para testear). En Producción la validación siempre está activa y este valor se ignora.'
where not exists (select 1 from public.admin_settings where key = 'validar_docs_ia_dev');
