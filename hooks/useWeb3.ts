import { useState } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

let web3Modal: Web3Modal | null = null;

export function useWeb3() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [walletProviderName, setWalletProviderName] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!web3Modal) {
      web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {}
      });
    }
    const instance = await web3Modal.connect();
    const ethersProvider = new ethers.BrowserProvider(instance);
    setProvider(ethersProvider);

    const signer = await ethersProvider.getSigner();
    setSigner(signer);

    const addr = await signer.getAddress();
    setAddress(addr);

    // Detecta el proveedor (MetaMask, Coinbase, etc.)
    setWalletProviderName(instance?.wc?.peerMeta?.name || instance?.isMetaMask ? "MetaMask" : instance?.isCoinbaseWallet ? "Coinbase Wallet" : "Wallet");

    return { ethersProvider, signer, addr };
  };

  const disconnectWallet = async () => {
    if (web3Modal) {
      await web3Modal.clearCachedProvider();
    }
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setWalletProviderName(null);
  };

  return { provider, signer, address, walletProviderName, connectWallet, disconnectWallet };
}