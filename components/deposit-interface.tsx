'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Sprout,
  Leaf,
  CheckCircle2,
  Recycle
} from 'lucide-react';
import type { Wallet, MaterialType } from '@/lib/supabase';
import { depositMaterial } from '@/lib/wallet';

interface DepositInterfaceProps {
  wallet: Wallet;
  materialTypes: MaterialType[];
  onDepositSuccess: () => void;
}

const iconMap: Record<string, any> = {
  bottle: Recycle,
  beer: Recycle,
  wine: Recycle,
  package: Recycle,
  'file-text': Recycle,
  milk: Recycle,
};

export function DepositInterface({ wallet, materialTypes, onDepositSuccess }: DepositInterfaceProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedGseeds, setEarnedGseeds] = useState(0);

  const handleDeposit = async (material: MaterialType) => {
    setIsProcessing(true);
    setSelectedMaterial(material);
    setShowSuccess(false);

    try {
      await depositMaterial(wallet.id, material.id, 1);
      setEarnedGseeds(material.gseed_value);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onDepositSuccess();
      }, 3000);
    } catch (error) {
      console.error('Error depositing material:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccess && selectedMaterial) {
    return (
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-lg animate-pulse">
                <CheckCircle2 className="h-16 w-16 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-emerald-700 mb-2">
                Depósito Exitoso
              </h3>
              <p className="text-lg text-gray-700">
                Has ganado <span className="font-bold text-emerald-600">{earnedGseeds} GSEED</span>
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur p-6 rounded-xl border-2 border-emerald-200 max-w-md mx-auto">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold text-emerald-700">Impacto Ambiental:</span>
              </p>
              <p className="text-sm text-emerald-800">
                {selectedMaterial.environmental_impact}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-emerald-700">
              <Sprout className="h-5 w-5" />
              <p className="text-sm font-medium">
                Cada acción ecológica es una semilla para un futuro verde
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-emerald-200 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Leaf className="h-6 w-6 text-emerald-600" />
          Depositar Material Reciclable
        </CardTitle>
        <CardDescription>
          Selecciona el tipo de material que estás depositando para recibir tus GreenSeeds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materialTypes.map((material) => {
            const Icon = iconMap[material.icon] || Recycle;
            return (
              <Card
                key={material.id}
                className="border-2 hover:border-emerald-400 transition-all cursor-pointer hover:shadow-lg hover:scale-105 duration-200"
                style={{ borderColor: material.color + '40' }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: material.color + '20' }}
                    >
                      <Icon className="h-8 w-8" style={{ color: material.color }} />
                    </div>
                    <Badge
                      className="text-white font-semibold"
                      style={{ backgroundColor: material.color }}
                    >
                      +{material.gseed_value} GSEED
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {material.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                    <p className="text-xs text-gray-500 italic">
                      {material.environmental_impact}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleDeposit(material)}
                    disabled={isProcessing}
                    className="w-full text-white font-semibold"
                    style={{
                      backgroundColor: material.color,
                    }}
                  >
                    {isProcessing && selectedMaterial?.id === material.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Sprout className="mr-2 h-4 w-4" />
                        Depositar
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border-2 border-emerald-200">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-emerald-600 p-2 flex-shrink-0">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900 mb-2">Planta tu residuo, cosecha tu recompensa</h4>
              <p className="text-sm text-emerald-800">
                Cada depósito que realizas genera GreenSeeds en tu wallet. Estas semillas digitales
                representan tu contribución al planeta y pueden convertirse en valor real a través de PYUSD.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
