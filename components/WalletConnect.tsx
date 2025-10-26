'use client';

import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Sparkles, Wallet as WalletIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase, type Wallet } from '@/lib/supabase';
import { generateQRCode } from '@/lib/wallet-utils';

interface WalletConnectProps {
  onWalletCreated: (wallet: Wallet) => void;
}

export default function WalletConnect({ onWalletCreated }: WalletConnectProps) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [pendingSupabase, setPendingSupabase] = useState(false);

  // Efecto que corre cuando address cambia y está esperando Supabase
  useEffect(() => {
    const processSupabase = async () => {
      if (!address || !pendingSupabase) return;
      try {
        // Autenticación en Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
          if (authError) throw authError;
        }
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) throw new Error('Usuario no autenticado');

        // Busca la wallet en Supabase
        let { data: wallet, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('wallet_address', address)
          .maybeSingle();

        // Si no existe, la crea
        if (!wallet) {
          const qr_code = await generateQRCode(address);
          const { data: newWallet, error: insertError } = await supabase
            .from('wallets')
            .insert({
              user_id: currentUser.id,
              wallet_address: address,
              ens_name: null,
              qr_code,
            })
            .select()
            .single();
            console.log('Usuario autenticado:', currentUser);
          if (insertError) throw insertError;
          wallet = newWallet;
        }

        toast({
          title: '¡Wallet conectada!',
          description: 'Tu wallet ha sido conectada exitosamente.',
        });

        onWalletCreated(wallet);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast({
          title: 'Error',
          description: String(error),
          variant: 'destructive',
        });
      } finally {
        setPendingSupabase(false);
      }
    };

    processSupabase();
  }, [address, pendingSupabase]);

  // Cuando el usuario conecta una wallet con el modal, activa el flujo de Supabase
  useEffect(() => {
    if (isConnected && address && !pendingSupabase) {
      setPendingSupabase(true);
    }
  }, [isConnected, address, pendingSupabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLThWMTZoOHptLTE2IDB2OEg4VjE2aDEyek0zNiAzNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-2xl shadow-lg">
              <Leaf className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Green Protocol
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transforma residuos en valor. Cada acción cuenta para regenerar nuestro planeta.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-emerald-600">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Powered by PYUSD</span>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Card className="border-2 border-emerald-200 shadow-xl bg-white/80 backdrop-blur hover:shadow-2xl transition-all duration-300 w-full max-w-md">
            <CardHeader className="space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-2 mx-auto">
                <WalletIcon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800 text-center">Conectar Wallet</CardTitle>
              <CardDescription className="text-base text-center">
                Conecta tu wallet para comenzar tu viaje regenerativo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              {/* Modal multi-wallet de AppKit */}
              <appkit-button />
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center mt-4">
                <p className="text-sm text-emerald-800">
                  <strong>Tu impacto empieza aquí:</strong> Conecta tu wallet y únete a una comunidad global comprometida con la regeneración ambiental.
                </p>
              </div>
              {/* Mostrar dirección conectada y botón de desconexión */}
              {isConnected && address && (
                <div className="mt-4 text-center">
                  <div className="font-mono text-emerald-700 mb-2">
                    Wallet conectada: {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Desconectar
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
