
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL,
  old_price numeric(10,2),
  image_url text NOT NULL DEFAULT '',
  is_new boolean NOT NULL DEFAULT false,
  popularity int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);

CREATE TABLE public.price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT CURRENT_DATE,
  price numeric(10,2) NOT NULL,
  UNIQUE (product_id, day)
);
GRANT SELECT ON public.price_history TO anon, authenticated;
GRANT ALL ON public.price_history TO service_role;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Price history is public" ON public.price_history FOR SELECT USING (true);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  username text NOT NULL DEFAULT 'Покупатель',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.profile_contacts (
  user_id uuid PRIMARY KEY,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profile_contacts TO authenticated;
GRANT ALL ON public.profile_contacts TO service_role;
ALTER TABLE public.profile_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own phone only" ON public.profile_contacts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own phone" ON public.profile_contacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own phone" ON public.profile_contacts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  pros text NOT NULL DEFAULT '',
  cons text NOT NULL DEFAULT '',
  comment text NOT NULL DEFAULT '',
  photos text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users create own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.pickup_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  region text NOT NULL,
  city text NOT NULL,
  address text NOT NULL
);
GRANT SELECT ON public.pickup_points TO anon, authenticated;
GRANT ALL ON public.pickup_points TO service_role;
ALTER TABLE public.pickup_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pickup points are public" ON public.pickup_points FOR SELECT USING (true);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  region text NOT NULL,
  city text NOT NULL,
  pickup_point text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  comment text NOT NULL DEFAULT '',
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  title text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Users create own order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

INSERT INTO public.products (slug, title, category, description, price, old_price, image_url, is_new, popularity) VALUES
('boxing-gloves-pro','Боксёрские перчатки INVINCIBLE Pro 12 oz','Экипировка','Перчатки из износостойкой микрофибры с многослойным наполнителем и широкой манжетой-липучкой.',4790,5990,'',true,98),
('rashguard-blue','Рашгард INVINCIBLE Blue Wave','Одежда','Компрессионный рашгард с длинным рукавом, влагоотводящая ткань, плоские швы.',2890,3490,'',true,91),
('training-shorts','Шорты для тренировок INVINCIBLE Fight','Одежда','Лёгкие шорты с эластичной вставкой и усиленными боковыми разрезами.',2190,2690,'',false,86),
('hoodie-soul','Худи INVINCIBLE SOUL Classic','Одежда','Плотное худи из футера с начёсом, унисекс, широкий диапазон размеров.',3990,4990,'',false,80),
('tshirt-logo','Футболка INVINCIBLE SOUL Logo','Одежда','Хлопковая футболка прямого кроя с фирменным принтом.',1290,1690,'',false,75),
('hand-wraps','Бинты боксёрские эластичные 4 м','Аксессуары','Эластичные бинты с петлёй для большого пальца и широкой липучкой.',590,790,'',false,70),
('jump-rope','Скакалка скоростная INVINCIBLE Speed','Аксессуары','Скоростная скакалка с подшипниками и регулировкой длины троса.',890,1190,'',true,64),
('shin-guards','Защита голени и стопы INVINCIBLE Guard','Экипировка','Анатомические щитки с многослойной пеной и двойной фиксацией.',3290,3990,'',false,58),
('sport-bag','Спортивная сумка INVINCIBLE Team 40 л','Аксессуары','Вместительная сумка с отделением для обуви и влажных вещей.',2590,3190,'',false,52),
('leggings-women','Легинсы женские INVINCIBLE Move','Одежда','Высокая посадка, плотная ткань, не просвечивают на приседе.',2390,2990,'',true,88),
('mouthguard','Капа боксёрская термопластичная','Аксессуары','Двухслойная термоформируемая капа с футляром.',690,890,'',false,44),
('windbreaker','Ветровка INVINCIBLE Storm','Одежда','Лёгкая ветровка с водоотталкивающей пропиткой и капюшоном.',4490,5490,'',false,61);

INSERT INTO public.price_history (product_id, day, price)
SELECT p.id,
       (CURRENT_DATE - g)::date,
       ROUND(p.price * (1 + (((g * 37 + length(p.slug) * 13) % 17) - 8)::numeric / 100), 2)
FROM public.products p, generate_series(0, 29) AS g;

UPDATE public.price_history ph SET price = p.price FROM public.products p
WHERE ph.product_id = p.id AND ph.day = CURRENT_DATE;

INSERT INTO public.pickup_points (provider, region, city, address) VALUES
('СДЭК','Москва и МО','Москва','ул. Тверская, 18к1'),
('СДЭК','Москва и МО','Москва','Ленинградский пр-т, 78к1'),
('Ozon','Москва и МО','Москва','ул. Профсоюзная, 61А'),
('СДЭК','Москва и МО','Химки','ул. Молодёжная, 50'),
('СДЭК','Санкт-Петербург','Санкт-Петербург','Невский пр-т, 114'),
('Ozon','Санкт-Петербург','Санкт-Петербург','пр-т Просвещения, 19'),
('СДЭК','Астраханская область','Астрахань','ул. Кирова, 41'),
('Ozon','Астраханская область','Астрахань','ул. Савушкина, 6'),
('СДЭК','Краснодарский край','Краснодар','ул. Красная, 176'),
('Ozon','Краснодарский край','Сочи','ул. Навагинская, 9'),
('СДЭК','Свердловская область','Екатеринбург','ул. 8 Марта, 46'),
('Ozon','Новосибирская область','Новосибирск','Красный пр-т, 101'),
('СДЭК','Республика Татарстан','Казань','ул. Баумана, 44'),
('Ozon','Ростовская область','Ростов-на-Дону','пр-т Стачки, 25');
