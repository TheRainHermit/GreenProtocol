'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, QrCode } from 'lucide-react';
import { useState } from 'react';
import type { Wallet } from '@/lib/supabase';

interface QRCodeDisplayProps {
  wallet: Wallet;
}

export function QRCodeDisplay({ wallet }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.wallet_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-2 border-emerald-200 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <QrCode className="h-6 w-6 text-emerald-600" />
          Tu Código QR
        </CardTitle>
        <CardDescription>
          Escanea este código en la máquina de reciclaje para recibir tus GreenSeeds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
          <img
            src={wallet.qr_code}
            alt="Wallet QR Code"
            className="w-64 h-64 rounded-lg shadow-lg"
          />
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Dirección de Wallet</p>
            <p className="text-sm font-mono break-all text-gray-900">{wallet.wallet_address}</p>
          </div>

          <Button
            onClick={copyAddress}
            variant="outline"
            className="w-full border-emerald-200 hover:bg-emerald-50"
          >
            {copied ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Dirección
              </>
            )}
          </Button>
        </div>

        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-4 rounded-lg border-2 border-emerald-200">
          <p className="text-sm font-semibold text-emerald-900 mb-2">
            Cómo funciona:
          </p>
          <ol className="text-sm text-emerald-800 space-y-2 list-decimal list-inside">
            <li>Encuentra una máquina Green Protocol</li>
            <li>Deposita tu material reciclable</li>
            <li>Escanea este código QR</li>
            <li>Recibe tus GreenSeeds instantáneamente</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
