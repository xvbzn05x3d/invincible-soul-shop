
-- 1. Enum for roles
CREATE TYPE public.app_role AS ENUM ('owner', 'editor', 'user');

-- 2. user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security Definer Function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Initial owner (the first user who signs up or we can set manually)
-- Note: We'll need to manually assign 'owner' to the first user in the dashboard or via a trigger.
-- For this setup, we'll allow owners to manage roles.

-- Policies for user_roles
CREATE POLICY "Owners can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. Update Product Policies to allow owner and editors to manage products
DROP POLICY IF EXISTS "Products are public" ON public.products;
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);

CREATE POLICY "Owners and editors can manage products"
ON public.products
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'editor'));

-- 6. Grant ALL on products to authenticated (so policies decide)
GRANT ALL ON public.products TO authenticated;

-- 7. Pickup Points - seed more data
INSERT INTO public.pickup_points (provider, region, city, address) VALUES
('СДЭК', 'Московская обл.', 'Балашиха', 'пр. Ленина, 32'),
('СДЭК', 'Московская обл.', 'Подольск', 'ул. Кирова, 15'),
('СДЭК', 'Ленинградская обл.', 'Гатчина', 'ул. Соборная, 2'),
('СДЭК', 'Краснодарский край', 'Новороссийск', 'ул. Мира, 12'),
('СДЭК', 'Татарстан', 'Набережные Челны', 'пр. Мира, 50'),
('СДЭК', 'Приморский край', 'Владивосток', 'ул. Светланская, 45'),
('СДЭК', 'Хабаровский край', 'Хабаровск', 'ул. Муравьева-Амурского, 20'),
('СДЭК', 'Нижегородская область', 'Нижний Новгород', 'ул. Большая Покровская, 15'),
('СДЭК', 'Челябинская область', 'Челябинск', 'пр. Ленина, 60'),
('СДЭК', 'Самарская область', 'Самара', 'ул. Куйбышева, 90'),
('СДЭК', 'Омская область', 'Омск', 'пр. Маркса, 10'),
('СДЭК', 'Воронежская область', 'Воронеж', 'пр. Революции, 33'),
('СДЭК', 'Пермский край', 'Пермь', 'ул. Ленина, 50'),
('СДЭК', 'Волгоградская область', 'Волгоград', 'пр. Ленина, 15'),
('СДЭК', 'Красноярский край', 'Красноярск', 'пр. Мира, 100');
