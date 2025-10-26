import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Wallet = {
  id: string;
  user_id: string;
  wallet_address: string;
  ens_name: string | null;
  qr_code: string;
  created_at: string;
  updated_at: string;
};

export type GseedTransaction = {
  id: string;
  wallet_id: string;
  material_type: string;
  gseed_amount: number;
  transaction_hash: string | null;
  created_at: string;
};

export type Reward = {
  id: string;
  name: string;
  description: string;
  gseed_cost: number;
  image_url: string;
  type: 'nft' | 'physical';
  stock: number;
  created_at: string;
};

export type Redemption = {
  id: string;
  wallet_id: string;
  reward_id: string;
  gseed_spent: number;
  status: 'pending' | 'completed' | 'cancelled';
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

export const MATERIAL_RATES = {
  'Plástico PET': 2.0,
  'Plástico HDPE': 1.8,
  'Vidrio': 1.5,
  'Aluminio': 3.0,
  'Cartón': 1.0,
  'Papel': 0.8,
  'Acero': 2.5,
  'Tetra Pak': 1.2,
};
