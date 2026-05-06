INSERT INTO public.admin_settings (key, value, description)
VALUES ('whatsapp_soporte_numero', '584123230188', 'Número de WhatsApp de soporte (formato internacional sin +, usado en enlaces wa.me)')
ON CONFLICT (key) DO NOTHING;