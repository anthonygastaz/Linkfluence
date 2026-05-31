-- Run once in Supabase SQL Editor to create an admin account.
-- Replace username and password before executing.

INSERT INTO public.admin_users (username, password_hash)
VALUES (
  'your_admin_username',
  extensions.crypt('your_secure_password', extensions.gen_salt('bf'))
);
