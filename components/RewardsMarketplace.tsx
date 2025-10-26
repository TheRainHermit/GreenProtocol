'use client';

import { useState, useEffect } from 'react';
import { supabase, type Wallet, type Reward } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Award, ShoppingBag, Sparkles, CheckCircle2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatGseedAmount } from '@/lib/wallet-utils';

interface RewardsMarketplaceProps {
  wallet: Wallet;
  balance: number;
  onRedemption: () => void;
}

export default function RewardsMarketplace({ wallet, balance, onRedemption }: RewardsMarketplaceProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('gseed_cost', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (balance < reward.gseed_cost) {
      toast({
        title: '$GSEED insuficiente',
        description: `Necesitas ${formatGseedAmount(reward.gseed_cost - balance)} $GSEED más para canjear esta recompensa`,
        variant: 'destructive',
      });
      return;
    }

    setSelectedReward(reward);
  };

  const confirmRedeem = async () => {
    if (!selectedReward) return;

    setIsRedeeming(true);
    try {
      const { error } = await supabase
        .from('redemptions')
        .insert({
          wallet_id: wallet.id,
          reward_id: selectedReward.id,
          gseed_spent: selectedReward.gseed_cost,
          status: 'completed',
        });

      if (error) throw error;

      setShowSuccess(true);
      setSelectedReward(null);

      toast({
        title: '¡Recompensa canjeada!',
        description: `Has canjeado ${selectedReward.name} por ${formatGseedAmount(selectedReward.gseed_cost)} $GSEED`,
      });

      onRedemption();

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: 'Error',
        description: 'No se pudo canjear la recompensa',
        variant: 'destructive',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const nftRewards = rewards.filter((r) => r.type === 'nft');
  const physicalRewards = rewards.filter((r) => r.type === 'physical');

  if (showSuccess) {
    return (
      <Card className="border-2 border-green-500 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="bg-green-500 p-6 rounded-full mb-6 animate-bounce">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-green-700 mb-2">¡Recompensa Canjeada!</h2>
          <p className="text-xl text-gray-700 mb-4 text-center">
            Tu recompensa será procesada y enviada pronto
          </p>
          <div className="flex items-center gap-2 text-emerald-600">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">Gracias por tu compromiso ambiental</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-3 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tu Balance Disponible</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {formatGseedAmount(balance)} $GSEED
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 px-4 py-2">
              Listo para canjear
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">NFTs Exclusivos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {nftRewards.map((reward) => {
              const canAfford = balance >= reward.gseed_cost;
              return (
                <Card
                  key={reward.id}
                  className={`border-2 transition-all duration-300 hover:shadow-xl ${
                    canAfford
                      ? 'border-purple-200 hover:border-purple-400'
                      : 'border-gray-200 opacity-60'
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={reward.image_url}
                        alt={reward.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-3 right-3 bg-purple-600 text-white border-0">
                        NFT
                      </Badge>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{reward.name}</h3>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatGseedAmount(reward.gseed_cost)}
                          </p>
                          <p className="text-sm text-gray-500">$GSEED</p>
                        </div>
                        <Badge variant="outline" className="text-gray-600">
                          {reward.stock} disponibles
                        </Badge>
                      </div>
                      <Button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford}
                        className={`w-full ${
                          canAfford
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                            : 'bg-gray-300'
                        } text-white`}
                      >
                        {canAfford ? 'Canjear' : 'Insuficiente $GSEED'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-800">Recompensas Físicas</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {physicalRewards.map((reward) => {
              const canAfford = balance >= reward.gseed_cost;
              return (
                <Card
                  key={reward.id}
                  className={`border-2 transition-all duration-300 hover:shadow-xl ${
                    canAfford
                      ? 'border-emerald-200 hover:border-emerald-400'
                      : 'border-gray-200 opacity-60'
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={reward.image_url}
                        alt={reward.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-3 right-3 bg-emerald-600 text-white border-0">
                        Físico
                      </Badge>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{reward.name}</h3>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-emerald-600">
                            {formatGseedAmount(reward.gseed_cost)}
                          </p>
                          <p className="text-sm text-gray-500">$GSEED</p>
                        </div>
                        <Badge variant="outline" className="text-gray-600">
                          {reward.stock} en stock
                        </Badge>
                      </div>
                      <Button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford}
                        className={`w-full ${
                          canAfford
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                            : 'bg-gray-300'
                        } text-white`}
                      >
                        {canAfford ? 'Canjear' : 'Insuficiente $GSEED'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-600" />
              Confirmar Canje
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres canjear esta recompensa?
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{selectedReward.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedReward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Costo:</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatGseedAmount(selectedReward.gseed_cost)} $GSEED
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Balance después:</span>
                  <span className="text-xl font-bold text-gray-700">
                    {formatGseedAmount(balance - selectedReward.gseed_cost)} $GSEED
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedReward(null)}
                  disabled={isRedeeming}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                  onClick={confirmRedeem}
                  disabled={isRedeeming}
                >
                  {isRedeeming ? 'Procesando...' : 'Confirmar Canje'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
