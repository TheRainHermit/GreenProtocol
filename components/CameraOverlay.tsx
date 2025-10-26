"use client";

import { useEffect, useState } from "react";

interface CameraOverlayProps {
  backendUrl?: string;
  walletAddress: string; // Asegúrate de pasar la dirección del usuario como prop
  onDepositSuccess?: (material: string, amount: number) => void; // Para mostrar aviso y actualizar balance
}

export default function CameraOverlay({ backendUrl, walletAddress, onDepositSuccess }: CameraOverlayProps) {
  const src =
    (backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") +
    "/video_feed";

  const [prediction, setPrediction] = useState<{ material: string | null; confidence: number | null }>({
    material: null,
    confidence: null,
  });
  const [lastDeposited, setLastDeposited] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          (backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/predict"
        );
        const data = await res.json();
        setPrediction(data);
      } catch (err) {
        setPrediction({ material: null, confidence: null });
      }
    }, 1000); // consulta cada segundo

    return () => clearInterval(interval);
  }, [backendUrl]);

  useEffect(() => {
    // Detecta cambio de material y evita múltiples depósitos seguidos
    if (
      prediction.material &&
      prediction.material !== lastDeposited &&
      walletAddress
    ) {
      const timeout = setTimeout(async () => {
        // Llama a la API /deposit
        const res = await fetch(
          (backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/deposit",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              material: prediction.material,
              wallet: walletAddress,
            }),
          }
        );
        const data = await res.json();
        if (data.success) {
          setLastDeposited(prediction.material);
          if (onDepositSuccess) {
            onDepositSuccess(prediction.material, data.amount);
          }
        }
      }, 3000); // delay de 3 segundos

      return () => clearTimeout(timeout);
    }
  }, [prediction.material, walletAddress, lastDeposited, backendUrl, onDepositSuccess]);

  return (
    <div className="w-full max-w-[720px] mx-auto my-4 rounded-xl overflow-hidden border border-emerald-100 shadow-lg bg-white">
      <img src={src} alt="Camera feed" className="w-full h-[720px] object-cover" />
      <div className="p-2 text-center">
        {prediction.material ? (
          <span className="text-emerald-700 font-semibold">
            Material detectado: {prediction.material} ({(prediction.confidence * 100).toFixed(1)}%)
          </span>
        ) : (
          <span className="text-gray-500">No se detecta material</span>
        )}
      </div>
    </div>
  );
}
