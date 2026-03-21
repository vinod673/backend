-- Add room credentials columns to tournaments table
-- Run this in Supabase SQL Editor

-- Add room_id column
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS room_id TEXT;

-- Add room_password column  
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS room_password TEXT;

-- Add comment to document the purpose
COMMENT ON COLUMN public.tournaments.room_id IS 'Game room ID or lobby code for players to join (visible only to joined players when tournament is active)';
COMMENT ON COLUMN public.tournaments.room_password IS 'Password required to join the game room (visible only to joined players when tournament is active)';
