-- Search for the user and grant owner role
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- The shop uses synthetic emails like p79270515008@invincible-soul.app
    -- Note: Previous message mentioned deleting this account. If it was deleted, this will do nothing.
    -- The user is asking to give rights to this account, implying it exists or was re-created.
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'p79270515008@invincible-soul.app' 
       OR phone = '+79270515008';

    IF target_user_id IS NOT NULL THEN
        -- Insert or update role to owner
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'owner')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;
