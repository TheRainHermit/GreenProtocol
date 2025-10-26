'use client';

import { useState } from 'react';
import { supabase, type Wallet, MATERIAL_RATES } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatGseedAmount } from '@/lib/wallet-utils';
//import CameraOverlay from './CameraOverlay';

interface MaterialDepositProps {
  wallet: Wallet;
  onTransactionAdded: () => void;
}

const MATERIAL_INFO = {
  'Plástico PET': {
    icon: '🥤',
    description: 'Botellas de bebidas, envases alimentarios',
    color: 'from-blue-500 to-cyan-500',
    impact: 'Reduce contaminación oceánica',
  },
  'Plástico HDPE': {
    icon: '🧴',
    description: 'Botellas de productos de limpieza, shampoo',
    color: 'from-indigo-500 to-blue-500',
    impact: 'Evita microplásticos',
  },
  'Vidrio': {
    icon: '🍾',
    description: 'Botellas, frascos, envases de vidrio',
    color: 'from-emerald-500 to-green-500',
    impact: 'Reciclable infinitamente',
  },
  'Aluminio': {
    icon: '🥫',
    description: 'Latas de bebidas, papel aluminio',
    color: 'from-slate-500 to-gray-500',
    impact: 'Ahorra 95% de energía',
  },
  'Cartón': {
    icon: '📦',
    description: 'Cajas, empaques, cartones',
    color: 'from-amber-500 to-orange-500',
    impact: 'Salva árboles',
  },
  'Papel': {
    icon: '📄',
    description: 'Papel de oficina, periódicos, revistas',
    color: 'from-yellow-500 to-amber-500',
    impact: 'Reduce deforestación',
  },
  'Acero': {
    icon: '⚙️',
    description: 'Latas de conservas, tapas metálicas',
    color: 'from-gray-600 to-slate-600',
    impact: 'Material duradero',
  },
  'Tetra Pak': {
    icon: '🧃',
    description: 'Envases de jugos, leche',
    color: 'from-teal-500 to-cyan-500',
    impact: 'Material compuesto reciclable',
  },
};

export default function MaterialDeposit({ wallet, onTransactionAdded }: MaterialDepositProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const { toast } = useToast();

  // Llama al backend para hacer el swap a PYUSD
  async function swapGseedToPyusd(walletAddress: string, gseedAmount: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet: walletAddress,
        gseed_amount: gseedAmount,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Swap failed');
    return data;
  }

  async function sendGseedToUser(walletAddress: string, gseedAmount: number) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/send_gseed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_address: walletAddress,
        amount: gseedAmount,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Transferencia de GSEED fallida');
    return data;
  }

  const handleDeposit = async (materialType: string) => {
    setIsProcessing(true);
    setSelectedMaterial(materialType);

    try {
      const gseedAmount = MATERIAL_RATES[materialType as keyof typeof MATERIAL_RATES];

      await new Promise(resolve => setTimeout(resolve, 1500));

      const { error } = await supabase
        .from('gseed_transactions')
        .insert({
          wallet_id: wallet.id,
          material_type: materialType,
          gseed_amount: gseedAmount,
          transaction_hash: `0x${Math.random().toString(16).slice(2, 66)}`,
        });

      if (error) throw error;

      // --- TRANSFERENCIA REAL DE GSEED ---
      try {
        await sendGseedToUser(wallet.wallet_address, gseedAmount);
      } catch (gseedError) {
        toast({
          title: 'Transferencia de GSEED fallida',
          description: 'El depósito fue exitoso, pero la transferencia de GSEED real falló.',
          variant: 'destructive',
        });
      }

      // --- SWAP AUTOMÁTICO ---
      try {
        await swapGseedToPyusd(wallet.wallet_address, gseedAmount);
      } catch (swapError) {
        toast({
          title: 'Swap a PYUSD fallido',
          description: 'El depósito fue exitoso, pero el swap a PYUSD falló.',
          variant: 'destructive',
        });
      }

      setEarnedAmount(gseedAmount);
      setShowSuccess(true);

      toast({
        title: '¡Depósito exitoso!',
        description: `Has ganado ${formatGseedAmount(gseedAmount)} $GSEED por depositar ${materialType}.`,
      });

      onTransactionAdded();

      setTimeout(() => {
        setShowSuccess(false);
        setSelectedMaterial(null);
      }, 5000);
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar el depósito',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <Card className="border-2 border-green-500 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="bg-green-500 p-6 rounded-full mb-6 animate-bounce">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-green-700 mb-2">¡Excelente!</h2>
          <p className="text-xl text-gray-700 mb-4">
            Has ganado <span className="font-bold text-green-600">{formatGseedAmount(earnedAmount)} $GSEED</span>
          </p>
          <div className="flex items-center gap-2 text-emerald-600">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">Tu impacto está creciendo</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-emerald-200 shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-600" />
            Sistema de Reconocimiento de Materiales
          </CardTitle>
          <CardDescription className="text-base">
            Simula el depósito de materiales reciclables y gana $GSEED al instante
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Overlay de la cámara (consumirá el stream MJPEG del backend) */}
          {/* <CameraOverlay
            backendUrl={process.env.NEXT_PUBLIC_BACKEND_URL}
            walletAddress={wallet.wallet_address}
          /> */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-emerald-800">
              <strong>ℹ️ Simulación de Hardware:</strong> En un punto de recolección real, el hardware identifica automáticamente el material. Aquí puedes simular ese proceso seleccionando el tipo de residuo depositado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(MATERIAL_RATES).map(([material, rate]) => {
              const info = MATERIAL_INFO[material as keyof typeof MATERIAL_INFO];
              return (
                <Card
                  key={material}
                  className="border-2 hover:border-emerald-400 transition-all duration-300 cursor-pointer hover:shadow-xl group"
                  onClick={() => !isProcessing && handleDeposit(material)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl">{info.icon}</span>
                      <Badge className={`bg-gradient-to-r ${info.color} text-white border-0`}>
                        +{formatGseedAmount(rate)} $GSEED
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-emerald-600 transition-colors">
                        {material}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">{info.description}</p>
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <Sparkles className="w-3 h-3" />
                        <span>{info.impact}</span>
                      </div>
                    </div>
                    <Button
                      className={`w-full bg-gradient-to-r ${info.color} text-white hover:opacity-90`}
                      disabled={isProcessing}
                    >
                      {isProcessing && selectedMaterial === material ? 'Procesando...' : 'Depositar'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm mb-1">Mejor Recompensa</p>
                <p className="text-3xl font-bold">3.0 $GSEED</p>
              </div>
              <div className="text-5xl opacity-80">🥫</div>
            </div>
            <p className="text-sm text-emerald-100 mt-2">Aluminio - Mayor valor</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Más Común</p>
                <p className="text-3xl font-bold">2.0 $GSEED</p>
              </div>
              <div className="text-5xl opacity-80">🥤</div>
            </div>
            <p className="text-sm text-blue-100 mt-2">Plástico PET - Fácil acceso</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm mb-1">Impacto Total</p>
                <p className="text-3xl font-bold">15.6 $GSEED</p>
              </div>
              <div className="text-5xl opacity-80">🌍</div>
            </div>
            <p className="text-sm text-teal-100 mt-2">Suma de todos los materiales</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
