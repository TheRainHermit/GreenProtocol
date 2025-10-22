'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sprout,
  QrCode,
  Leaf,
  TrendingUp,
  Recycle,
  ArrowRightLeft,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import type { Wallet as WalletType, MaterialType, Deposit, Swap } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { QRCodeDisplay } from './qr-code-display';
import { DepositInterface } from './deposit-interface';
import { SwapInterface } from './swap-interface';
import { TransactionHistory } from './transaction-history';

interface WalletDashboardProps {
  wallet: WalletType;
  onWalletUpdate: (wallet: WalletType) => void;
}

export function WalletDashboard({ wallet, onWalletUpdate }: WalletDashboardProps) {
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [wallet.id]);

  const loadData = async () => {
    try {
      const [materialsResult, depositsResult, swapsResult] = await Promise.all([
        supabase.from('material_types').select('*'),
        supabase.from('deposits').select('*').eq('wallet_id', wallet.id).order('created_at', { ascending: false }),
        supabase.from('swaps').select('*').eq('wallet_id', wallet.id).order('created_at', { ascending: false }),
      ]);

      if (materialsResult.data) setMaterialTypes(materialsResult.data);
      if (depositsResult.data) setDeposits(depositsResult.data);
      if (swapsResult.data) setSwaps(swapsResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshWallet = async () => {
    const { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', wallet.id)
      .single();

    if (data) {
      onWalletUpdate(data);
    }
  };

  const handleDepositSuccess = async () => {
    await loadData();
    await refreshWallet();
  };

  const handleSwapSuccess = async () => {
    await loadData();
    await refreshWallet();
  };

  const totalCO2Saved = (deposits.length * 0.5).toFixed(2);
  const totalItemsRecycled = wallet.total_deposits;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent flex items-center gap-3">
              <Sprout className="h-10 w-10 text-emerald-600" />
              Green Protocol
            </h1>
            <p className="text-gray-600 mt-2">Finanzas regenerativas para un futuro sostenible</p>
          </div>
          {wallet.ens_name && (
            <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 text-sm">
              {wallet.ens_name}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-emerald-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Sprout className="h-4 w-4 text-emerald-600" />
                GreenSeeds Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-700">
                {wallet.gseed_balance.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">GSEED</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-teal-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-teal-600" />
                PayPal USD Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-teal-700">
                ${wallet.pyusd_balance.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">PYUSD</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                Impacto Ambiental
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-700">
                {totalCO2Saved}
              </div>
              <p className="text-xs text-gray-500 mt-1">kg CO₂ ahorrados</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-emerald-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Total Ganado</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">
                {wallet.total_gseeds_earned.toFixed(2)} GSEED
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Items Reciclados</CardTitle>
                <Recycle className="h-4 w-4 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-700">
                {totalItemsRecycled}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-600">Swaps Realizados</CardTitle>
                <ArrowRightLeft className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {swaps.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur border-2 border-emerald-200">
            <TabsTrigger value="deposit" className="data-[state=active]:bg-emerald-100">
              <Recycle className="h-4 w-4 mr-2" />
              Depositar
            </TabsTrigger>
            <TabsTrigger value="swap" className="data-[state=active]:bg-teal-100">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Swap
            </TabsTrigger>
            <TabsTrigger value="qr" className="data-[state=active]:bg-green-100">
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-emerald-100">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="mt-6">
            <DepositInterface
              wallet={wallet}
              materialTypes={materialTypes}
              onDepositSuccess={handleDepositSuccess}
            />
          </TabsContent>

          <TabsContent value="swap" className="mt-6">
            <SwapInterface
              wallet={wallet}
              onSwapSuccess={handleSwapSuccess}
            />
          </TabsContent>

          <TabsContent value="qr" className="mt-6">
            <QRCodeDisplay wallet={wallet} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <TransactionHistory
              deposits={deposits}
              swaps={swaps}
              materialTypes={materialTypes}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
