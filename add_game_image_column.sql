-- Add game_image_url column to tournaments table
-- Run this in Supabase SQL Editor

-- Add game_image_url column
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS game_image_url TEXT;

-- Add comment to document the purpose
COMMENT ON COLUMN public.tournaments.game_image_url IS 'Custom game image URL for tournament (optional, falls back to emoji if not provided)';
