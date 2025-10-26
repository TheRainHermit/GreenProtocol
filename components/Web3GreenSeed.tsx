import { useState } from 'react';
import { ethers } from 'ethers';

// ABI del contrato greenSeed (simplificada, agrega la real)
const greenSeedAbi = [
  // Ejemplo: función transfer
  "function transfer(address to, uint256 amount) public returns (bool)"
];

const greenSeedAddress = "0xC7C31F6dba3fbbb00d9E2d73F6cF34A5A85E0E51";

export default function Web3greenSeed({ recipient, amount }: { recipient: string, amount: number }) {
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSendgreenSeed = async () => {
    if (!window.ethereum) {
      alert("Instala MetaMask para usar Web3");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(greenSeedAddress, greenSeedAbi, signer);

    // amount debe estar en decimales correctos (ejemplo: ethers.parseUnits)
    const tx = await contract.transfer(recipient, amount);
    setTxHash(tx.hash);
  };

  return (
    <div>
      <button onClick={handleSendgreenSeed}>
        Enviar {amount} $GSEED a {recipient}
      </button>
      {txHash && (
        <div>
          <p>Transacción enviada:</p>
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            {txHash}
          </a>
        </div>
      )}
    </div>
  );
}