-- CORE TABLES FOR THE NOBLE BEING

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  color TEXT,
  material TEXT,
  style TEXT,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable full-text search on products
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_description TSVECTOR 
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))) STORED;

CREATE INDEX IF NOT EXISTS products_name_description_idx ON products USING GIN(name_description);

-- Profiles Table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  name TEXT,
  email TEXT,
  phone TEXT,
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Carts Table
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Policies for carts
CREATE POLICY "Users can view own cart"
  ON carts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart"
  ON carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON carts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
  ON carts FOR DELETE
  USING (auth.uid() = user_id);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  options JSONB,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policies for cart items
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid()));

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total DECIMAL NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for order items
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- MOCK DATA INSERTION

-- Insert Categories
INSERT INTO categories (name, description, image_url) VALUES
('Dresses', 'Handcrafted artisanal dresses for all occasions', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8'),
('Tops', 'Unique tops made from sustainable materials', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a'),
('Bottoms', 'Ethically made pants, skirts, and shorts', 'https://images.unsplash.com/photo-1560243563-062bfc001d68'),
('Accessories', 'Handmade accessories to complete your look', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d');

-- Insert Products
INSERT INTO products (name, description, price, image_url, category_id, color, material, style, in_stock, featured, popular) VALUES
-- Dresses
('Terra Maxi Dress', 'A flowing maxi dress inspired by the rich tones of the earth. Made from organic cotton and natural dyes.', 129.99, 'https://images.unsplash.com/photo-1622122201714-77da0ca8e5d2', (SELECT id FROM categories WHERE name = 'Dresses'), 'Terracotta', 'Organic Cotton', 'Bohemian', true, true, true),
('Lunar Shift Dress', 'A minimalist shift dress with subtle geometric patterns. Perfect for day to night transitions.', 99.99, 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03', (SELECT id FROM categories WHERE name = 'Dresses'), 'Sage Green', 'Hemp Blend', 'Minimalist', true, true, false),
('Solar Wrap Dress', 'An elegant wrap dress with adjustable fit and draping inspired by ancient sun worship ceremonies.', 149.99, 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956', (SELECT id FROM categories WHERE name = 'Dresses'), 'Soft Gold', 'Tencel', 'Elegant', true, false, true),
('Stellar Slip Dress', 'A shimmering slip dress made with sustainable peace silk. For special occasions or layering.', 189.99, 'https://images.unsplash.com/photo-1536243298747-ea8874136d64', (SELECT id FROM categories WHERE name = 'Dresses'), 'Deep Charcoal', 'Peace Silk', 'Evening', true, false, false),

-- Tops
('Gaia Blouse', 'A lightweight blouse with hand-embroidered botanical details celebrating the natural world.', 79.99, 'https://images.unsplash.com/photo-1624206112918-f140f087f9b5', (SELECT id FROM categories WHERE name = 'Tops'), 'Sandstone Beige', 'Organic Linen', 'Casual', true, true, true),
('Nebula Cardigan', 'A versatile open-front cardigan with a subtle gradient dye reminiscent of distant nebulae.', 89.99, 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f', (SELECT id FROM categories WHERE name = 'Tops'), 'Sage Green', 'Alpaca Wool', 'Cozy', true, true, false),
('Solstice Tee', 'A relaxed fit tee with hand-printed solstice symbols. Made from organic cotton.', 49.99, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27', (SELECT id FROM categories WHERE name = 'Tops'), 'Terracotta', 'Organic Cotton', 'Casual', true, false, true),
('Zenith Tunic', 'A longer length tunic with side slits and minimal detailing. Perfect for layering.', 69.99, 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2', (SELECT id FROM categories WHERE name = 'Tops'), 'Deep Charcoal', 'Bamboo Rayon', 'Minimal', true, false, false),

-- Bottoms
('Terra Trousers', 'Wide-leg trousers with a high waist and flowing silhouette. Supremely comfortable.', 119.99, 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec', (SELECT id FROM categories WHERE name = 'Bottoms'), 'Sandstone Beige', 'Tencel Blend', 'Flowing', true, true, true),
('Horizon Skirt', 'A midi skirt with gradual color shift from earth to sky tones. Features practical pockets.', 89.99, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa', (SELECT id FROM categories WHERE name = 'Bottoms'), 'Multi', 'Organic Cotton', 'A-line', true, true, false),
('Canyon Shorts', 'Relaxed fit shorts with natural fiber drawstring. Perfect for warm days.', 59.99, 'https://images.unsplash.com/photo-1591195853866-860e8a85b073', (SELECT id FROM categories WHERE name = 'Bottoms'), 'Terracotta', 'Hemp', 'Casual', true, false, true),
('Cosmos Pants', 'Slim-fit pants with subtle stretch and ankle detail. Versatile for work or casual wear.', 99.99, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246', (SELECT id FROM categories WHERE name = 'Bottoms'), 'Deep Charcoal', 'Organic Cotton with Elastane', 'Tailored', true, false, false),

-- Accessories
('Aurora Scarf', 'A lightweight scarf with hand-dyed pattern reminiscent of the northern lights.', 39.99, 'https://images.unsplash.com/photo-1597983073500-43bafbd372eb', (SELECT id FROM categories WHERE name = 'Accessories'), 'Multi', 'Modal', 'Ethereal', true, true, true),
('Solstice Belt', 'A hand-tooled leather belt with brass detailing inspired by ancient solstice symbols.', 49.99, 'https://images.unsplash.com/photo-1575414004403-a9ae5d8de631', (SELECT id FROM categories WHERE name = 'Accessories'), 'Terracotta', 'Vegetable-tanned Leather', 'Bohemian', true, true, false),
('Lunar Necklace', 'A delicate necklace featuring a handcrafted pendant representing the phases of the moon.', 59.99, 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e', (SELECT id FROM categories WHERE name = 'Accessories'), 'Silver', 'Recycled Silver', 'Minimal', true, false, true),
('Gaia Tote', 'A spacious tote bag made from upcycled materials with hand-embroidered botanical designs.', 79.99, 'https://images.unsplash.com/photo-1591561954557-26941169b49e', (SELECT id FROM categories WHERE name = 'Accessories'), 'Sage Green', 'Upcycled Canvas', 'Functional', true, false, false);

-- Automatic User Profile Creation on Registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to Create Profile on New User
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Automatic Cart Creation for New Users
CREATE OR REPLACE FUNCTION public.create_cart_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.carts (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to Create Cart on New Profile
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_cart_for_new_user();
