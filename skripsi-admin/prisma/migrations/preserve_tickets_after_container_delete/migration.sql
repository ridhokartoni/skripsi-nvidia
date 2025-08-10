-- This migration ensures tickets are preserved when containers are deleted
-- The containerId field is already nullable in the schema
-- This migration just ensures the foreign key constraint is set to SET NULL

-- Drop existing foreign key constraint if it exists
ALTER TABLE "Tiket" DROP CONSTRAINT IF EXISTS "Tiket_containerId_fkey";

-- Recreate the foreign key constraint with SET NULL on delete
ALTER TABLE "Tiket" 
ADD CONSTRAINT "Tiket_containerId_fkey" 
FOREIGN KEY ("containerId") 
REFERENCES "Container"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;
