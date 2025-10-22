'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, Loader2, Sprout, Wallet, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { Wallet as WalletType } from '@/lib/supabase';
import { swapGSEEDtoPYUSD, GSEED_TO_PYUSD_RATE } from '@/lib/wallet';

interface SwapInterfaceProps {
  wallet: WalletType;
  onSwapSuccess: () => void;
}

export function SwapInterface({ wallet, onSwapSuccess }: SwapInterfaceProps) {
  const [gseedAmount, setGseedAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [swappedPyusd, setSwappedPyusd] = useState(0);
  const [error, setError] = useState('');

  const pyusdAmount = parseFloat(gseedAmount) * GSEED_TO_PYUSD_RATE || 0;

  const handleSwap = async () => {
    const amount = parseFloat(gseedAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Por favor ingresa una cantidad válida');
      return;
    }

    if (amount > wallet.gseed_balance) {
      setError('Saldo insuficiente de GSEED');
      return;
    }

    setIsSwapping(true);
    setError('');
    setShowSuccess(false);

    try {
      await swapGSEEDtoPYUSD(wallet.id, amount, 'manual');
      setSwappedPyusd(pyusdAmount);
      setShowSuccess(true);
      setGseedAmount('');
      setTimeout(() => {
        setShowSuccess(false);
        onSwapSuccess();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al realizar el swap');
    } finally {
      setIsSwapping(false);
    }
  };

  const setMaxAmount = () => {
    setGseedAmount(wallet.gseed_balance.toString());
  };

  if (showSuccess) {
    return (
      <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-blue-50">
        <CardContent className="py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-gradient-to-br from-teal-500 to-blue-600 p-6 shadow-lg animate-pulse">
                <CheckCircle2 className="h-16 w-16 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-teal-700 mb-2">
                Swap Exitoso
              </h3>
              <p className="text-lg text-gray-700">
                Has recibido <span className="font-bold text-teal-600">${swappedPyusd.toFixed(2)} PYUSD</span>
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur p-6 rounded-xl border-2 border-teal-200 max-w-md mx-auto">
              <p className="text-sm text-gray-700">
                Tus GreenSeeds se han convertido en PayPal USD y están listas para usar en
                consumo consciente y sostenible.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-teal-700">
              <Wallet className="h-5 w-5" />
              <p className="text-sm font-medium">
                Finanzas regenerativas para un futuro sostenible
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-teal-200 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ArrowRightLeft className="h-6 w-6 text-teal-600" />
          Swap GSEED a PYUSD
        </CardTitle>
        <CardDescription>
          Convierte tus GreenSeeds en PayPal USD para usar en consumo consciente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-600">Balance GSEED</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700">
                {wallet.gseed_balance.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-teal-200 bg-teal-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5 text-teal-600" />
                <span className="text-sm font-medium text-gray-600">Balance PYUSD</span>
              </div>
              <p className="text-2xl font-bold text-teal-700">
                ${wallet.pyusd_balance.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gseed-amount" className="text-sm font-medium">
              Cantidad de GSEED a convertir
            </Label>
            <div className="flex gap-2">
              <Input
                id="gseed-amount"
                type="number"
                step="0.01"
                min="0"
                max={wallet.gseed_balance}
                value={gseedAmount}
                onChange={(e) => setGseedAmount(e.target.value)}
                placeholder="0.00"
                className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
              <Button
                onClick={setMaxAmount}
                variant="outline"
                className="border-emerald-200 hover:bg-emerald-50"
              >
                MAX
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 p-3 shadow-lg">
              <ArrowRightLeft className="h-6 w-6 text-white" />
            </div>
          </div>

          <Card className="border-2 border-teal-200 bg-teal-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Recibirás</span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>1 GSEED = ${GSEED_TO_PYUSD_RATE} PYUSD</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-teal-700">
                ${pyusdAmount.toFixed(2)} <span className="text-lg font-normal text-gray-600">PYUSD</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSwap}
          disabled={isSwapping || !gseedAmount || parseFloat(gseedAmount) <= 0}
          className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white py-6 text-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          {isSwapping ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Procesando Swap...
            </>
          ) : (
            <>
              <ArrowRightLeft className="mr-2 h-5 w-5" />
              Confirmar Swap
            </>
          )}
        </Button>

        <div className="bg-gradient-to-r from-teal-100 to-blue-100 p-4 rounded-lg border-2 border-teal-200">
          <p className="text-sm font-semibold text-teal-900 mb-2">
            Sobre el Swap:
          </p>
          <ul className="text-sm text-teal-800 space-y-1">
            <li>Tasa de cambio: 1 GSEED = ${GSEED_TO_PYUSD_RATE} PYUSD</li>
            <li>Sin comisiones por transacción</li>
            <li>Conversión instantánea</li>
            <li>PYUSD disponible inmediatamente para uso</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
