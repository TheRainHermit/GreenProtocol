'use client';

import { useState, useEffect } from 'react';
import { CreateWallet } from '@/components/create-wallet';
import { WalletDashboard } from '@/components/wallet-dashboard';
import type { Wallet } from '@/lib/supabase';

export default function Home() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedWalletId = localStorage.getItem('green_protocol_wallet_id');
    if (storedWalletId) {
      loadWallet(storedWalletId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadWallet = async (walletId: string) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', walletId)
        .maybeSingle();

      if (data) {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletCreated = (newWallet: Wallet) => {
    setWallet(newWallet);
    localStorage.setItem('green_protocol_wallet_id', newWallet.id);
  };

  const handleWalletUpdate = (updatedWallet: Wallet) => {
    setWallet(updatedWallet);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando Green Protocol...</p>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return <CreateWallet onWalletCreated={handleWalletCreated} />;
  }

  return <WalletDashboard wallet={wallet} onWalletUpdate={handleWalletUpdate} />;
}
