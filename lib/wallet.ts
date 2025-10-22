import QRCode from 'qrcode';
import { supabase } from './supabase';

export async function generateWalletAddress(): Promise<string> {
  const randomBytes = crypto.getRandomValues(new Uint8Array(20));
  const hexAddress = '0x' + Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hexAddress;
}

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#10B981',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export async function createWallet(ensName?: string) {
  const walletAddress = await generateWalletAddress();
  const qrCode = await generateQRCode(walletAddress);

  const { data, error } = await supabase
    .from('wallets')
    .insert({
      wallet_address: walletAddress,
      ens_name: ensName || null,
      qr_code: qrCode,
      gseed_balance: 0,
      pyusd_balance: 0,
      total_gseeds_earned: 0,
      total_deposits: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getWalletByAddress(address: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('wallet_address', address)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getWalletByENS(ensName: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('ens_name', ensName)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export const GSEED_TO_PYUSD_RATE = 0.5;

export async function swapGSEEDtoPYUSD(
  walletId: string,
  gseedAmount: number,
  swapType: 'auto' | 'manual' = 'manual'
) {
  const pyusdAmount = gseedAmount * GSEED_TO_PYUSD_RATE;

  const { data: wallet, error: fetchError } = await supabase
    .from('wallets')
    .select('gseed_balance, pyusd_balance')
    .eq('id', walletId)
    .single();

  if (fetchError) throw fetchError;

  if (wallet.gseed_balance < gseedAmount) {
    throw new Error('Insufficient GSEED balance');
  }

  const newGseedBalance = wallet.gseed_balance - gseedAmount;
  const newPyusdBalance = wallet.pyusd_balance + pyusdAmount;

  const { error: updateError } = await supabase
    .from('wallets')
    .update({
      gseed_balance: newGseedBalance,
      pyusd_balance: newPyusdBalance,
    })
    .eq('id', walletId);

  if (updateError) throw updateError;

  const { data: swapData, error: swapError } = await supabase
    .from('swaps')
    .insert({
      wallet_id: walletId,
      gseed_amount: gseedAmount,
      pyusd_amount: pyusdAmount,
      exchange_rate: GSEED_TO_PYUSD_RATE,
      swap_type: swapType,
    })
    .select()
    .single();

  if (swapError) throw swapError;
  return swapData;
}

export async function depositMaterial(
  walletId: string,
  materialTypeId: string,
  quantity: number = 1,
  depositLocation?: string
) {
  const { data: materialType, error: materialError } = await supabase
    .from('material_types')
    .select('gseed_value')
    .eq('id', materialTypeId)
    .single();

  if (materialError) throw materialError;

  const gseeds = materialType.gseed_value * quantity;

  const { data: wallet, error: fetchError } = await supabase
    .from('wallets')
    .select('gseed_balance, total_gseeds_earned, total_deposits')
    .eq('id', walletId)
    .single();

  if (fetchError) throw fetchError;

  const { error: updateError } = await supabase
    .from('wallets')
    .update({
      gseed_balance: wallet.gseed_balance + gseeds,
      total_gseeds_earned: wallet.total_gseeds_earned + gseeds,
      total_deposits: wallet.total_deposits + quantity,
    })
    .eq('id', walletId);

  if (updateError) throw updateError;

  const { data: depositData, error: depositError } = await supabase
    .from('deposits')
    .insert({
      wallet_id: walletId,
      material_type_id: materialTypeId,
      quantity,
      gseeds_earned: gseeds,
      deposit_location: depositLocation || null,
    })
    .select()
    .single();

  if (depositError) throw depositError;
  return depositData;
}
