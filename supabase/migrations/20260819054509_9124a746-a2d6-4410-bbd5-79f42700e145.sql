-- Explicitly grant owner role to the detected user ID
INSERT INTO public.user_roles (user_id, role)
VALUES ('56dd298a-bdd5-4721-948e-e2259e7a53af', 'owner')
ON CONFLICT (user_id, role) DO NOTHING;

-- Also verify if profile exists, if not create one
INSERT INTO public.profiles (id, username)
VALUES ('56dd298a-bdd5-4721-948e-e2259e7a53af', 'Кирилл')
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

-- Ensure phone is linked in profile_contacts for internal lookup
INSERT INTO public.profile_contacts (user_id, phone)
VALUES ('56dd298a-bdd5-4721-948e-e2259e7a53af', '+79270515008')
ON CONFLICT (user_id) DO UPDATE SET phone = EXCLUDED.phone;
