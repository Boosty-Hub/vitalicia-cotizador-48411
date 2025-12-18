-- Create profile if not exists
INSERT INTO public.profiles (id, email, full_name)
VALUES ('36f3b700-7246-4bf1-9bd4-4378e0671d59', 'gmontiel@spatiumgroup.com', 'Admin')
ON CONFLICT (id) DO NOTHING;

-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('36f3b700-7246-4bf1-9bd4-4378e0671d59', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;