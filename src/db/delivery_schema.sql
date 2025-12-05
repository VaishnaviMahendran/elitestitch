-- Create delivery_personnel table
CREATE TABLE IF NOT EXISTS delivery_personnel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  personnel_number TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- In a real app, this should be hashed
  phone TEXT,
  status TEXT DEFAULT 'inactive', -- 'active', 'busy', 'inactive'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES delivery_personnel(id),
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending', -- 'pending', 'assigned', 'out_for_delivery', 'delivered', 'failed'
ADD COLUMN IF NOT EXISTS delivery_location JSONB; -- { lat: number, lng: number, address: string, updated_at: timestamp }

-- Enable Realtime for orders table (if not already enabled)
-- This is crucial for the "Real Time Tracking" feature
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table delivery_personnel;
