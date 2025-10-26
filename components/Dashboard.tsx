"use client";

import { useState, useEffect } from "react";
import { supabase, type Wallet, type GseedTransaction} from "@/lib/supabase";
import { formatGseedAmount, generateQRCode } from "@/lib/wallet-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Leaf,
  TrendingUp,
  Award,
  QrCode,
  Wallet as WalletIcon,
  Sparkles,
  ArrowRightLeft,
} from "lucide-react";
import WalletQR from "./WalletQR";
import MaterialDeposit from "./MaterialDeposit";
import RewardsMarketplace from "./RewardsMarketplace";
import TransactionHistory from "./TransactionHistory";
import Web3GreenSeed from "./Web3GreenSeed";
import { SwapInterface } from './SwapInterface';
import { ethers } from "ethers";
import { useAccount, useDisconnect } from "wagmi";

const greenSeedAbi = [
  "function balanceOf(address account) view returns (uint256)",
];
const greenSeedAddress =
  process.env.GREEN_SEED_CONTRACT_ADDRESS ||
  "0xC7C31F6dba3fbbb00d9E2d73F6cF34A5A85E0E51";

const TARGET_CHAIN_ID = 11155111; // Ethereum Sepolia Testnet.
const TARGET_NETWORK_NAME = "Ethereum Sepolia Testnet";

interface DashboardProps {
  wallet: Wallet;
  onDisconnect: () => void;
}

export default function Dashboard({ wallet, onDisconnect }: DashboardProps) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<GseedTransaction[]>([]);
  const [totalImpact, setTotalImpact] = useState(0);
  const [loading, setLoading] = useState(true);
  const [realBalance, setRealBalance] = useState<string>("0");
  const [networkOk, setNetworkOk] = useState(true);
  //const [swaps, setSwaps] = useState<Swap[]>([]);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    loadWalletData();
    const channel = supabase
      .channel("gseed_transactions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gseed_transactions",
          filter: `wallet_id=eq.${wallet.id}`,
        },
        () => {
          loadWalletData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [wallet.id]);

  const loadWalletData = async () => {
    try {
      const { data: txData, error: txError } = await supabase
        .from("gseed_transactions")
        .select("*")
        .eq("wallet_id", wallet.id)
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      setTransactions(txData || []);

      const totalGreenSeed =
        txData?.reduce(
          (sum, tx) => sum + parseFloat(tx.gseed_amount.toString()),
          0
        ) || 0;
      setBalance(totalGreenSeed);
      setTotalImpact(txData?.length || 0);
    } catch (error) {
      console.error("Error loading wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAdded = () => {
    loadWalletData();
  };


  const handleSwapSuccess = async () => {
    await loadWalletData();
  };

  // Función para obtener el balance real de la blockchain y chequear red
  const fetchRealGreenSeedBalance = async () => {
    try {
      console.log("Consultando saldo para:", address || wallet.wallet_address);
      if (!window.ethereum) {
        console.error("No se detecta window.ethereum");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      // Normaliza el tipo de chainId
      const chainId =
        typeof network.chainId === "bigint"
          ? Number(network.chainId)
          : network.chainId;
      if (chainId !== TARGET_CHAIN_ID) {
        setNetworkOk(false);
        setRealBalance("0");
        console.warn("Red incorrecta:", chainId);
        return;
      } else {
        setNetworkOk(true);
      }
      const contract = new ethers.Contract(
        greenSeedAddress,
        greenSeedAbi,
        provider
      );
      console.log("Consultando balanceOf en contrato:", greenSeedAddress);
      let balance;
      try {
        balance = await contract.balanceOf(address || wallet.wallet_address);
        console.log("Saldo obtenido:", ethers.formatUnits(balance, 18));
        setRealBalance(ethers.formatUnits(balance, 18));
      } catch (err) {
        console.error("Error en balanceOf:", err);
      }
    } catch (error) {
      console.error("Error general en fetchRealGreenSeedBalance:", error);
    }
  };

  useEffect(() => {
    fetchRealGreenSeedBalance();
  }, [address, wallet.wallet_address]);

  useEffect(() => {
    // Si el wallet no tiene qr_code, lo generamos y actualizamos en Supabase
    async function ensureQRCode() {
      if (!wallet.qr_code && wallet.wallet_address) {
        const qr_code = await generateQRCode(wallet.wallet_address);
        await supabase.from("wallets").update({ qr_code }).eq("id", wallet.id);
        // Opcional: recarga el wallet desde Supabase
        // Puedes pedirle al padre que recargue el wallet, o hacerlo aquí si tienes el método
      }
    }
    ensureQRCode();
  }, [wallet.qr_code, wallet.wallet_address, wallet.id]);

  console.log("Wallet recibido en Dashboard:", wallet);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLThWMTZoOHptLTE2IDB2OEg4VjE2aDEyek0zNiAzNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

      <div className="relative z-10">
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-2xl">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                  <Leaf className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Green Protocol</h1>
                  <p className="text-emerald-100 text-sm">
                    Tu impacto regenerativo
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                <WalletIcon className="w-4 h-4" />
                <span className="text-sm font-mono">
                  {address
                    ? `${address.slice(0, 6)}...${address.slice(-4)}`
                    : "No conectada"}
                </span>
                {isConnected && (
                  <button
                    onClick={() => {
                      disconnect();
                      onDisconnect();
                    }}
                    className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    title="Desconectar wallet"
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-600">
                    Balance Total
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {realBalance} $GSEED
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">En crecimiento</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-600">
                    Depósitos Totales
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold text-green-600">
                    {totalImpact}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-green-600">
                    <Leaf className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Materiales reciclados
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription className="text-gray-600">
                    Impacto Ambiental
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold text-teal-600">
                    {(totalImpact * 0.5).toFixed(1)} kg
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-teal-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">CO₂ evitado</span>
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {!networkOk && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-center">
              Por favor, conecta tu wallet a <b>{TARGET_NETWORK_NAME}</b> para
              ver tu saldo real de $GSEED.
              <br />
              <button
                onClick={async () => {
                  if (window.ethereum) {
                    try {
                      await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x2105" }], // 8453 en hexadecimal
                      });
                    } catch (switchError) {
                      // Si la red no está agregada, solicita agregarla
                      if (
                        typeof switchError === "object" &&
                        switchError !== null &&
                        "code" in switchError &&
                        (switchError as { code: number }).code === 4902
                      ) {
                        await window.ethereum.request({
                          method: "wallet_addEthereumChain",
                          params: [
                            {
                              chainId: "0xaa36a7",
                              chainName: "Ethereum Sepolia Testnet",
                              nativeCurrency: {
                                name: "Ether",
                                symbol: "ETH",
                                decimals: 18,
                              },
                              rpcUrls: [
                                "https://ethereum-sepolia-rpc.publicnode.com",
                              ],
                              blockExplorerUrls: [
                                "https://sepolia.etherscan.io/",
                              ],
                            },
                          ],
                        });
                      }
                    }
                  }
                }}
                className="mt-3 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Cambiar a Testnet
              </button>
            </div>
          )}
          <Tabs defaultValue="deposit" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-14 bg-white shadow-lg rounded-xl p-1">
              <TabsTrigger
                value="deposit"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg"
              >
                <Leaf className="w-4 h-4 mr-2" />
                Depositar
              </TabsTrigger>
              <TabsTrigger
                value="qr"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Mi QR
              </TabsTrigger>
              <TabsTrigger
                value="rewards"
                className="data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-lg"
              >
                <Award className="w-4 h-4 mr-2" />
                Recompensas
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit">
              <MaterialDeposit
                wallet={wallet}
                onTransactionAdded={handleTransactionAdded}
              />
              {/* Botón para enviar GSEED por el último depósito */}
              <div className="mt-6">
                {transactions.length > 0 && (
                  <Web3GreenSeed
                    recipient={wallet.wallet_address}
                    amount={transactions[0]?.gseed_amount || 0} // Monto del último depósito
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="qr">
              <WalletQR wallet={wallet} />
            </TabsContent>

            <TabsContent value="rewards">
              <RewardsMarketplace
                wallet={wallet}
                balance={balance}
                onRedemption={loadWalletData}
              />
            </TabsContent>

            <TabsContent value="history">
              <TransactionHistory transactions={transactions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
