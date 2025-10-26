'use client';

import { type GseedTransaction } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatGseedAmount } from '@/lib/wallet-utils';
import { TrendingUp, Calendar, Package } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: GseedTransaction[];
}

const MATERIAL_ICONS: Record<string, string> = {
  'Plástico PET': '🥤',
  'Plástico HDPE': '🧴',
  'Vidrio': '🍾',
  'Aluminio': '🥫',
  'Cartón': '📦',
  'Papel': '📄',
  'Acero': '⚙️',
  'Tetra Pak': '🧃',
};

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <Card className="border-2 border-gray-200 shadow-xl bg-white">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aún no hay transacciones
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Comienza a depositar materiales reciclables para ver tu historial de transacciones y tu impacto ambiental.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalEarned = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.gseed_amount.toString()),
    0
  );

  const materialStats = transactions.reduce((acc, tx) => {
    acc[tx.material_type] = (acc[tx.material_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topMaterial = Object.entries(materialStats).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <Badge className="bg-white/20 text-white border-0">Total</Badge>
            </div>
            <p className="text-3xl font-bold mb-1">{formatGseedAmount(totalEarned)} $GSEED</p>
            <p className="text-sm text-emerald-100">Ganado en total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 opacity-80" />
              <Badge className="bg-white/20 text-white border-0">Depósitos</Badge>
            </div>
            <p className="text-3xl font-bold mb-1">{transactions.length}</p>
            <p className="text-sm text-blue-100">Materiales reciclados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">{topMaterial ? MATERIAL_ICONS[topMaterial[0]] : '🌍'}</span>
              <Badge className="bg-white/20 text-white border-0">Top</Badge>
            </div>
            <p className="text-xl font-bold mb-1">{topMaterial ? topMaterial[0] : 'N/A'}</p>
            <p className="text-sm text-teal-100">Material más depositado</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-emerald-200 shadow-xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Historial de Transacciones</CardTitle>
              <CardDescription className="text-base mt-1">
                Registro completo de tus depósitos y recompensas
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-600">
              {transactions.length} transacciones
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 hover:border-emerald-200 transition-all duration-200 bg-gradient-to-r from-white to-emerald-50/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-xl">
                      <span className="text-2xl">
                        {MATERIAL_ICONS[tx.material_type] || '📦'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{tx.material_type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          {new Date(tx.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {tx.transaction_hash && (
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          {tx.transaction_hash.slice(0, 10)}...{tx.transaction_hash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">
                      +{formatGseedAmount(parseFloat(tx.gseed_amount.toString()))}
                    </p>
                    <p className="text-sm text-gray-500">$GSEED</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
