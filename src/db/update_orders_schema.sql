-- Add address and phone columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update existing rows with mock data (optional, for testing)
UPDATE orders 
SET address = '123, Gandhi Road, Salem, Tamil Nadu - 636007',
    phone = '9876543210'
WHERE address IS NULL;
