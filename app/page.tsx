"use client";

import { useState, useEffect } from "react";
import { supabase, type Wallet } from "@/lib/supabase";
import WalletConnect from "@/components/WalletConnect";
import Dashboard from "@/components/Dashboard";
import { Toaster } from "@/components/ui/toaster";
import { useAccount } from "wagmi";

export default function Home() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useAccount();

  useEffect(() => {
    checkExistingWallet();
  }, []);

  const checkExistingWallet = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: walletData } = await supabase
          .from("wallets")
          .select()
          .eq("user_id", user.id)
          .maybeSingle();

        if (walletData) {
          setWallet(walletData);
        }
      }
    } catch (error) {
      console.error("Error checking wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletCreated = (newWallet: Wallet) => {
    setWallet(newWallet);
  };

  const handleDisconnect = () => {
    setWallet(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando Green Protocol...</p>
        </div>
      </div>
    );
  }

  return (
  <>
    {wallet && isConnected ? (
      <Dashboard wallet={wallet} onDisconnect={handleDisconnect} />
    ) : (
      <WalletConnect onWalletCreated={handleWalletCreated} />
    )}
    <Toaster />
  </>
);
}
