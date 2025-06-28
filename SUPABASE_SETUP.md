# Supabase Setup Guide for The Noble Being

This guide will help you set up the Supabase backend for The Noble Being e-commerce platform.

## Getting Started

1. Install dependencies:
```bash
npm run setup
```

> **IMPORTANT**: Do not use regular `npm install` as it will cause dependency conflicts between Three.js versions. The project has a dependency conflict between `@google/model-viewer` (which requires three.js v0.172.0) and other 3D dependencies (which use three.js v0.155.0).
>
> We've added a custom `setup` script that uses the `--legacy-peer-deps` flag to resolve these conflicts.
>
> **TensorFlow.js Dependencies**: The project now uses TensorFlow.js for visual search features. These will be installed automatically with the setup script.

2. Create a `.env` file in the project root with your Supabase credentials:
```
REACT_APP_SUPABASE_URL=https://ivqlwwzqaevvloloofjf.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema

The following tables need to be set up in Supabase (tables with ✓ are already created):

### Products Table
```sql
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price decimal not null,
  image text,
  category text,
  style text,
  material text,
  color text,
  in_stock boolean default true,
  featured boolean default false,
  popular boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable full-text search
alter table products add column name_description tsvector 
  generated always as (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))) stored;

create index products_name_description_idx on products using gin(name_description);
```

### Categories Table
```sql
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamp with time zone default now()
);
```

### Profiles Table
```sql
create table profiles (
  id uuid primary key references auth.users,
  name text,
  email text,
  phone text,
  address jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS (Row Level Security)
alter table profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
```

### Carts & Cart Items Tables
```sql
create table carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default now()
);

create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid references carts not null,
  product_id uuid references products not null,
  quantity integer not null,
  options jsonb,
  added_at timestamp with time zone default now()
);

-- Enable RLS
alter table carts enable row level security;
alter table cart_items enable row level security;

-- Policies
create policy "Users can view own cart"
  on carts for select
  using ( auth.uid() = user_id );

create policy "Users can insert own cart"
  on carts for insert
  with check ( auth.uid() = user_id );

create policy "Users can view own cart items"
  on cart_items for select
  using ( cart_id in (select id from carts where user_id = auth.uid()) );

create policy "Users can insert own cart items"
  on cart_items for insert
  with check ( cart_id in (select id from carts where user_id = auth.uid()) );

create policy "Users can update own cart items"
  on cart_items for update
  using ( cart_id in (select id from carts where user_id = auth.uid()) );

create policy "Users can delete own cart items"
  on cart_items for delete
  using ( cart_id in (select id from carts where user_id = auth.uid()) );
```

### Orders Tables
```sql
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  status text not null default 'pending',
  total decimal not null,
  shipping_address jsonb not null,
  payment_method text,
  payment_status text default 'pending',
  created_at timestamp with time zone default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders not null,
  product_id uuid references products not null,
  quantity integer not null,
  price decimal not null,
  options jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table orders enable row level security;
alter table order_items enable row level security;

-- Policies
create policy "Users can view own orders"
  on orders for select
  using ( auth.uid() = user_id );

create policy "Users can insert own orders"
  on orders for insert
  with check ( auth.uid() = user_id );

create policy "Users can view own order items"
  on order_items for select
  using ( order_id in (select id from orders where user_id = auth.uid()) );
```

### Search Logs Table ✓
```sql
create table search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  query text,
  search_type text not null check (search_type in ('text', 'semantic', 'visual', 'style')),
  detected_category text,
  detected_color text,
  image_url text,
  result_count integer,
  created_at timestamp with time zone default now() not null,
  session_id text
);

-- Indexes
create index search_logs_query_idx on search_logs(query);
create index search_logs_created_at_idx on search_logs(created_at desc);
create index search_logs_user_id_idx on search_logs(user_id);
```

### Product Embeddings Table ✓
```sql
create table product_embeddings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  embedding vector(1024), -- MobileNet feature vectors
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create index for similarity search using HNSW algorithm
create index product_embeddings_embedding_idx on product_embeddings 
using hnsw (embedding vector_l2_ops);
```

## Database Extensions

### Vector Extension ✓

The `vector` extension has been enabled to support visual similarity searches. This extension adds the `vector` data type and the following search algorithms:

- **L2 distance** - Euclidean distance between vectors
- **Inner product** - For cosine similarity between normalized vectors
- **HNSW indexing** - Hierarchical Navigable Small World algorithm for fast approximate nearest neighbor searches

```sql
-- Enable the vector extension
create extension if not exists vector;
```

## Storage Buckets

Create the following storage buckets in Supabase:

1. **products** ✓ - For product images
2. **search-images** ✓ - For visual search images

## Authentication

Enable the following authentication methods in Supabase:

1. Email/Password
2. Google OAuth (optional)

## Testing the Setup

1. Start the development server:
```bash
npm start
```

2. Navigate to the application in your browser

## Visual Search

The visual search implementation uses:

1. **Client-side image analysis** - Using TensorFlow.js and MobileNet for client-side image classification
2. **Supabase Storage** - For storing uploaded search images
3. **Vector similarity** - For finding similar products based on image features

The implementation flow is:

1. User uploads an image in the `AISearch` component
2. Image is analyzed with `imageAnalysisService.js` to extract feature vectors
3. Image is uploaded to Supabase's `search-images` bucket
4. Products with similar features are returned based on categories and colors
5. Search is logged to the `search_logs` table for trending analysis

## Trending Searches

Trending searches are implemented by aggregating data from the `search_logs` table. The system tracks:

- Text searches
- Visual searches
- Search results shown to users

This data is used to identify popular search terms and provide better user recommendations.

## Troubleshooting

- If you encounter CORS issues, make sure to add your localhost URL to the allowed origins in Supabase dashboard.
- For authentication issues, check the browser console for detailed error messages.

## Design Notes

We're following The Noble Being's earthy-futuristic design theme with:

- **Color Palette**: terracotta (#E2725B), sage green (#8A9A5B), soft gold (#D4A017), deep charcoal (#333333), sandstone beige (#D9C2A6)
- **Fonts**: Playfair Display for headings, Inter for body text

For questions or issues, please contact the development team.
