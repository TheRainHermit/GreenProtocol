'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Recycle,
  ArrowRightLeft,
  Calendar,
  Sprout,
  Wallet,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import type { Deposit, Swap, MaterialType } from '@/lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransactionHistoryProps {
  deposits: Deposit[];
  swaps: Swap[];
  materialTypes: MaterialType[];
}

export function TransactionHistory({ deposits, swaps, materialTypes }: TransactionHistoryProps) {
  const getMaterialType = (id: string) => {
    return materialTypes.find(m => m.id === id);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
  };

  return (
    <Card className="border-2 border-emerald-200 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          Historial de Transacciones
        </CardTitle>
        <CardDescription>
          Revisa todas tus actividades en Green Protocol
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deposits" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="deposits" className="data-[state=active]:bg-emerald-100">
              <Recycle className="h-4 w-4 mr-2" />
              Depósitos ({deposits.length})
            </TabsTrigger>
            <TabsTrigger value="swaps" className="data-[state=active]:bg-teal-100">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Swaps ({swaps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposits" className="mt-6">
            <div className="space-y-4">
              {deposits.length === 0 ? (
                <div className="text-center py-12">
                  <Recycle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aún no has realizado depósitos</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Comienza a depositar materiales para ganar GreenSeeds
                  </p>
                </div>
              ) : (
                deposits.map((deposit) => {
                  const material = getMaterialType(deposit.material_type_id);
                  return (
                    <Card
                      key={deposit.id}
                      className="border-l-4 hover:shadow-md transition-shadow"
                      style={{ borderLeftColor: material?.color || '#10B981' }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: material?.color + '20' || '#10B98120' }}
                              >
                                <Recycle
                                  className="h-5 w-5"
                                  style={{ color: material?.color || '#10B981' }}
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {material?.name || 'Material Desconocido'}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Cantidad: {deposit.quantity}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 ml-12">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(deposit.created_at)}</span>
                            </div>

                            {deposit.deposit_location && (
                              <p className="text-xs text-gray-500 mt-2 ml-12">
                                Ubicación: {deposit.deposit_location}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <Badge className="bg-emerald-600 text-white font-semibold">
                              +{deposit.gseeds_earned} GSEED
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="swaps" className="mt-6">
            <div className="space-y-4">
              {swaps.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowRightLeft className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aún no has realizado swaps</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Convierte tus GreenSeeds a PYUSD cuando lo desees
                  </p>
                </div>
              ) : (
                swaps.map((swap) => (
                  <Card
                    key={swap.id}
                    className="border-l-4 border-l-teal-500 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-teal-100">
                              <ArrowRightLeft className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                Swap GSEED → PYUSD
                              </h4>
                              <p className="text-sm text-gray-500">
                                Tipo: {swap.swap_type === 'auto' ? 'Automático' : 'Manual'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600 ml-12">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(swap.created_at)}</span>
                          </div>

                          <div className="flex items-center gap-4 mt-3 ml-12">
                            <div className="flex items-center gap-1 text-sm">
                              <Sprout className="h-4 w-4 text-emerald-600" />
                              <span className="text-gray-700">
                                {swap.gseed_amount.toFixed(2)} GSEED
                              </span>
                            </div>
                            <ArrowRightLeft className="h-3 w-3 text-gray-400" />
                            <div className="flex items-center gap-1 text-sm">
                              <Wallet className="h-4 w-4 text-teal-600" />
                              <span className="text-gray-700">
                                ${swap.pyusd_amount.toFixed(2)} PYUSD
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 mt-2 ml-12">
                            Tasa: 1 GSEED = ${swap.exchange_rate} PYUSD
                          </p>
                        </div>

                        <div className="text-right">
                          <Badge className="bg-teal-600 text-white font-semibold">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            ${swap.pyusd_amount.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {(deposits.length > 0 || swaps.length > 0) && (
          <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-600 p-2">
                <Sprout className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-900">
                  Total de impacto generado
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Cada transacción representa tu compromiso con un futuro más sostenible
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
