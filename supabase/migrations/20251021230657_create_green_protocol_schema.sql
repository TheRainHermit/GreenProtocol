/*
  # Green Protocol Database Schema

  ## Overview
  This migration creates the complete database schema for Green Protocol, 
  a ReFi application that rewards users with GSEED tokens for recycling.

  ## New Tables
  
  ### `wallets`
  - `id` (uuid, primary key) - Unique wallet identifier
  - `ens_name` (text, unique, nullable) - Optional ENS name (e.g., miguel.eth)
  - `wallet_address` (text, unique) - Blockchain wallet address
  - `qr_code` (text) - QR code data for wallet scanning
  - `gseed_balance` (numeric, default 0) - Current GSEED token balance
  - `pyusd_balance` (numeric, default 0) - Current PYUSD balance
  - `total_gseeds_earned` (numeric, default 0) - Lifetime GSEED earnings
  - `total_deposits` (integer, default 0) - Total number of deposits made
  - `created_at` (timestamptz) - Wallet creation timestamp
  - `user_id` (uuid, nullable) - Optional link to auth user

  ### `material_types`
  - `id` (uuid, primary key) - Material type identifier
  - `name` (text, unique) - Material name (e.g., "Plastic Bottle", "Cardboard")
  - `gseed_value` (numeric) - GSEED reward per item
  - `icon` (text) - Icon identifier for UI
  - `color` (text) - Brand color for material type
  - `description` (text) - Material description
  - `environmental_impact` (text) - Impact message
  - `created_at` (timestamptz)

  ### `deposits`
  - `id` (uuid, primary key) - Deposit transaction identifier
  - `wallet_id` (uuid, foreign key) - Reference to wallet
  - `material_type_id` (uuid, foreign key) - Type of material deposited
  - `quantity` (integer, default 1) - Number of items deposited
  - `gseeds_earned` (numeric) - GSEED tokens earned
  - `deposit_location` (text, nullable) - Hardware location
  - `created_at` (timestamptz) - Deposit timestamp

  ### `swaps`
  - `id` (uuid, primary key) - Swap transaction identifier
  - `wallet_id` (uuid, foreign key) - Reference to wallet
  - `gseed_amount` (numeric) - GSEED tokens swapped
  - `pyusd_amount` (numeric) - PYUSD received
  - `exchange_rate` (numeric) - Exchange rate at time of swap (1 GSEED = X PYUSD)
  - `swap_type` (text) - 'auto' or 'manual'
  - `created_at` (timestamptz) - Swap timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Authenticated users can only access their own wallet data
  - Public read access to material_types for display purposes

  ## Important Notes
  - Exchange rate: 1 GSEED = 0.5 PYUSD (configurable)
  - All numeric values use precise decimal type for financial accuracy
  - Timestamps use timezone-aware format
*/

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ens_name text UNIQUE,
  wallet_address text UNIQUE NOT NULL,
  qr_code text NOT NULL,
  gseed_balance numeric DEFAULT 0 NOT NULL,
  pyusd_balance numeric DEFAULT 0 NOT NULL,
  total_gseeds_earned numeric DEFAULT 0 NOT NULL,
  total_deposits integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  user_id uuid,
  CONSTRAINT positive_gseed_balance CHECK (gseed_balance >= 0),
  CONSTRAINT positive_pyusd_balance CHECK (pyusd_balance >= 0)
);

-- Create material_types table
CREATE TABLE IF NOT EXISTS material_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  gseed_value numeric NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  description text NOT NULL,
  environmental_impact text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT positive_gseed_value CHECK (gseed_value > 0)
);

-- Create deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  material_type_id uuid NOT NULL REFERENCES material_types(id),
  quantity integer DEFAULT 1 NOT NULL,
  gseeds_earned numeric NOT NULL,
  deposit_location text,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_gseeds CHECK (gseeds_earned > 0)
);

-- Create swaps table
CREATE TABLE IF NOT EXISTS swaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  gseed_amount numeric NOT NULL,
  pyusd_amount numeric NOT NULL,
  exchange_rate numeric NOT NULL,
  swap_type text DEFAULT 'manual' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT positive_gseed_amount CHECK (gseed_amount > 0),
  CONSTRAINT positive_pyusd_amount CHECK (pyusd_amount > 0),
  CONSTRAINT valid_swap_type CHECK (swap_type IN ('auto', 'manual'))
);

-- Enable Row Level Security
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallets
CREATE POLICY "Users can view their own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own wallet"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Public read access for anonymous users (for demo purposes)
CREATE POLICY "Anyone can view wallets by address"
  ON wallets FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can create wallets"
  ON wallets FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update wallets by address"
  ON wallets FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for material_types (public read)
CREATE POLICY "Anyone can view material types"
  ON material_types FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for deposits
CREATE POLICY "Users can view their deposits"
  ON deposits FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM wallets
    WHERE wallets.id = deposits.wallet_id
    AND wallets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create deposits for their wallet"
  ON deposits FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM wallets
    WHERE wallets.id = deposits.wallet_id
    AND wallets.user_id = auth.uid()
  ));

-- Public access for anonymous users
CREATE POLICY "Anyone can view deposits"
  ON deposits FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create deposits"
  ON deposits FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policies for swaps
CREATE POLICY "Users can view their swaps"
  ON swaps FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM wallets
    WHERE wallets.id = swaps.wallet_id
    AND wallets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create swaps for their wallet"
  ON swaps FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM wallets
    WHERE wallets.id = swaps.wallet_id
    AND wallets.user_id = auth.uid()
  ));

-- Public access for anonymous users
CREATE POLICY "Anyone can view swaps"
  ON swaps FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create swaps"
  ON swaps FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallets_ens ON wallets(ens_name);
CREATE INDEX IF NOT EXISTS idx_deposits_wallet ON deposits(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swaps_wallet ON swaps(wallet_id, created_at DESC);

-- Insert default material types
INSERT INTO material_types (name, gseed_value, icon, color, description, environmental_impact)
VALUES
  ('Plastic Bottle', 2, 'bottle', '#3B82F6', 'PET plastic bottles', 'Saves 0.5kg CO2 per bottle recycled'),
  ('Aluminum Can', 3, 'beer', '#94A3B8', 'Aluminum beverage cans', 'Saves 95% energy vs. new aluminum production'),
  ('Glass Bottle', 2.5, 'wine', '#10B981', 'Glass containers and bottles', 'Can be recycled indefinitely without quality loss'),
  ('Cardboard', 1, 'package', '#F59E0B', 'Corrugated cardboard boxes', 'Saves 17 trees per ton recycled'),
  ('Paper', 1, 'file-text', '#8B5CF6', 'Newspapers and office paper', 'Reduces landfill waste by 60%'),
  ('Tetra Pak', 1.5, 'milk', '#EC4899', 'Beverage cartons', 'Recovers valuable paper fibers and aluminum')
ON CONFLICT (name) DO NOTHING;