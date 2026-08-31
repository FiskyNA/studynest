-- Add pdf_url column to notes for embedded PDF viewer
ALTER TABLE notes ADD COLUMN IF NOT EXISTS pdf_url text;
