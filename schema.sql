-- Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  partner_id UUID REFERENCES users(id)
);

-- Insert the two users
INSERT INTO users (email, password, name) VALUES 
('fathur@duofinance.com', '11', 'Fathur'),
('berli@duofinance.com', '22', 'Berli');

-- Update partner_ids
UPDATE users SET partner_id = (SELECT id FROM users WHERE email = 'berli@duofinance.com') WHERE email = 'fathur@duofinance.com';
UPDATE users SET partner_id = (SELECT id FROM users WHERE email = 'fathur@duofinance.com') WHERE email = 'berli@duofinance.com';

-- Create Wallets Table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  balance NUMERIC DEFAULT 0
);

-- Create Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  wallet_id UUID REFERENCES wallets(id) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update wallet balance on new transaction
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'income' THEN
    UPDATE wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
  ELSIF NEW.type = 'expense' THEN
    UPDATE wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_insert_trigger
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance();

-- Policies (We'll just allow all for this anon key since it's a private 2-person app, but typically you'd secure this)
-- To allow the REST API to access these tables, we need to enable RLS and add a permissive policy (or just disable RLS).
-- Disabling RLS for simplicity in this trusted 2-user setup:
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
