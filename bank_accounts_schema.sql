-- Bank Accounts Table for Saved Payment Methods
-- This allows users to save bank details for faster withdrawals

-- 1. Create bank_accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT,
  ifsc_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_is_default ON public.bank_accounts(is_default);

-- 3. Enable Row Level Security
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- 4. Bank Accounts Policies
-- Users can view their own bank accounts
CREATE POLICY "Users can view own bank accounts"
ON public.bank_accounts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own bank accounts
CREATE POLICY "Users can insert own bank accounts"
ON public.bank_accounts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bank accounts
CREATE POLICY "Users can update own bank accounts"
ON public.bank_accounts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bank accounts
CREATE POLICY "Users can delete own bank accounts"
ON public.bank_accounts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Function to ensure only one default account per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_account()
RETURNS TRIGGER AS $$
BEGIN
  -- If this account is set as default, unset all other defaults for this user
  IF NEW.is_default THEN
    UPDATE public.bank_accounts
    SET is_default = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger to maintain single default account
DROP TRIGGER IF EXISTS enforce_single_default_account ON public.bank_accounts;
CREATE TRIGGER enforce_single_default_account
BEFORE INSERT OR UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_default_account();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Bank accounts table created successfully!';
  RAISE NOTICE 'Users can now save bank details for faster withdrawals';
END $$;
