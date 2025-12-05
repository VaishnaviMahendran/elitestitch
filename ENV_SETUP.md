# Environment Setup

To run the backend and payment features, you need to create a `.env.local` file in the root directory (`tailoring-shop/`) with the following keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY

## Supabase Setup
1. Create a new project at https://supabase.com
2. Go to Project Settings -> API to find your URL and Anon Key.
3. Create two tables in the SQL Editor:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Orders Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  status text default 'pending',
  customer_name text,
  email text,
  design_title text,
  design_type text,
  measurements jsonb,
  amount numeric,
  payment_status text,
  payment_method text
);

-- Reviews Table
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  rating integer,
  comment text,
  image_url text
);
```

## Stripe Setup
1. Create an account at https://stripe.com
2. Get your API keys from the Developer Dashboard.
