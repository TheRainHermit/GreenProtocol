'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Sprout, Wallet } from 'lucide-react';
import { createWallet } from '@/lib/wallet';
import type { Wallet as WalletType } from '@/lib/supabase';

interface CreateWalletProps {
  onWalletCreated: (wallet: WalletType) => void;
}

export function CreateWallet({ onWalletCreated }: CreateWalletProps) {
  const [ensName, setEnsName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateWallet = async () => {
    setIsCreating(true);
    setError('');

    try {
      const wallet = await createWallet(ensName || undefined);
      onWalletCreated(wallet);
    } catch (err: any) {
      setError(err.message || 'Error al crear la wallet');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 p-4">
      <Card className="w-full max-w-lg border-2 border-emerald-200 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-lg">
              <Sprout className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            Bienvenido a Green Protocol
          </CardTitle>
          <CardDescription className="text-base text-gray-700">
            Crea tu wallet y comienza a ganar GreenSeeds por reciclar.
            <br />
            <span className="font-semibold text-emerald-700">
              Cada acción ecológica es una semilla para un futuro verde.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ens" className="text-sm font-medium text-gray-700">
              Nombre ENS (opcional)
            </Label>
            <Input
              id="ens"
              placeholder="miguel.eth"
              value={ensName}
              onChange={(e) => setEnsName(e.target.value)}
              className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
            <p className="text-xs text-gray-500">
              Puedes usar un nombre ENS para identificar tu wallet más fácilmente
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button
            onClick={handleCreateWallet}
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creando tu wallet...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-5 w-5" />
                Crear Wallet
              </>
            )}
          </Button>

          <div className="pt-4 border-t border-emerald-100">
            <p className="text-xs text-center text-gray-600">
              Al crear tu wallet, aceptas formar parte del movimiento regenerativo
              <br />
              <span className="font-semibold text-emerald-700">
                Planta tu residuo, cosecha tu recompensa
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
