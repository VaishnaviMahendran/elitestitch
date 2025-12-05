-- Enable RLS on orders table (if not already enabled)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to read orders (for Admin Dashboard to work without complex auth for now)
-- In a production app, you would restrict this to specific admin users.
CREATE POLICY "Allow public read access to orders"
ON orders FOR SELECT
USING (true);

-- Allow public insert (for placing orders without login if needed, or authenticated)
CREATE POLICY "Allow public insert to orders"
ON orders FOR INSERT
WITH CHECK (true);

-- Allow public update (for Admin/Driver to update status)
CREATE POLICY "Allow public update to orders"
ON orders FOR UPDATE
USING (true);
