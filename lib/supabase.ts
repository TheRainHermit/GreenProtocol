import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Wallet = {
  id: string;
  ens_name: string | null;
  wallet_address: string;
  qr_code: string;
  gseed_balance: number;
  pyusd_balance: number;
  total_gseeds_earned: number;
  total_deposits: number;
  created_at: string;
  user_id: string | null;
};

export type MaterialType = {
  id: string;
  name: string;
  gseed_value: number;
  icon: string;
  color: string;
  description: string;
  environmental_impact: string;
  created_at: string;
};

export type Deposit = {
  id: string;
  wallet_id: string;
  material_type_id: string;
  quantity: number;
  gseeds_earned: number;
  deposit_location: string | null;
  created_at: string;
};

export type Swap = {
  id: string;
  wallet_id: string;
  gseed_amount: number;
  pyusd_amount: number;
  exchange_rate: number;
  swap_type: 'auto' | 'manual';
  created_at: string;
};
