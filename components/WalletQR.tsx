'use client';

import { type Wallet } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WalletQRProps {
  wallet: Wallet;
}

export default function WalletQR({ wallet }: WalletQRProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(wallet.wallet_address);
    setCopied(true);
    toast({
      title: 'Dirección copiada',
      description: 'La dirección de tu wallet ha sido copiada al portapapeles',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="border-2 border-emerald-200 shadow-xl bg-white">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <QrCode className="w-6 h-6 text-emerald-600" />
            <CardTitle className="text-2xl">Código QR</CardTitle>
          </div>
          <CardDescription>
            Escanea este código para recibir $GSEED en el hardware de recolección
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {!wallet.qr_code ? (
            <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-emerald-500">
              <img
                src={wallet.qr_code}
                alt="Wallet QR Code"
                className="w-72 h-72"
              />
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-emerald-500">
              <img
                src={wallet.qr_code}
                alt="Wallet QR Code"
                className="w-72 h-72"
              />
            </div>
          )}
          <div className="mt-6 text-center">
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 text-sm">
              Listo para escanear
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-green-200 shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">Información de Wallet</CardTitle>
          <CardDescription>
            Detalles de tu wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Dirección</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg text-sm font-mono break-all">
                {wallet.wallet_address}
              </code>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {wallet.ens_name && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Nombre ENS</label>
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 rounded-lg border border-emerald-200">
                <span className="text-lg font-semibold text-emerald-700">
                  {wallet.ens_name}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Red</label>
            <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
              <span className="text-blue-700 font-medium">Ethereum Sepolia Network</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
            <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
              <span className="text-gray-700">
                {new Date(wallet.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-emerald-800 leading-relaxed">
              <strong>💡 Consejo:</strong> Muestra este QR en cualquier punto de recolección Green Protocol para recibir tus $GSEED instantáneamente tras depositar materiales reciclables.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
