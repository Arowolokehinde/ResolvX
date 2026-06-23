"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  request,
  disconnect as stacksDisconnect,
  isConnected as stacksIsConnected,
  getLocalStorage,
} from "@stacks/connect";

/**
 * Only show Stacks-capable wallet providers in the connection modal.
 * Intentionally excludes XverseProviders.BitcoinProvider and
 * FordefiProviders.UtxoProvider which are Bitcoin/Ordinals providers.
 */
const STACKS_PROVIDER_IDS = [
  "LeatherProvider",           // Leather (formerly Hiro Wallet)
  "XverseProviders.StacksProvider", // Xverse – Stacks interface
  "AsignaProvider",            // Asigna Multisig
  "WalletConnectProvider",     // WalletConnect
];

interface WalletContextValue {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue>({
  address: null,
  isConnected: false,
  isConnecting: false,
  connect: () => {},
  disconnect: () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  /* ── Restore session on mount ── */
  useEffect(() => {
    if (stacksIsConnected()) {
      const data = getLocalStorage();
      const stxAddress = data?.addresses?.stx?.[0]?.address ?? null;
      setAddress(stxAddress);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Use stx_getAddresses (Stacks-specific method) with only Stacks wallet providers.
      // This prevents Bitcoin/Ordinals wallets from appearing in the modal.
      const result = await request(
        {
          forceWalletSelect: true,
          approvedProviderIds: STACKS_PROVIDER_IDS,
        },
        "stx_getAddresses",
        { network: "mainnet" }
      );

      // Pick the STX address: by symbol first, then fallback to any SP/ST prefix address
      const stxAddress =
        result.addresses.find((a) => a.symbol === "STX")?.address ??
        result.addresses.find(
          (a) => a.address.startsWith("SP") || a.address.startsWith("ST")
        )?.address ??
        null;

      setAddress(stxAddress);
    } catch {
      // User cancelled or wallet error — do nothing
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    stacksDisconnect();
    setAddress(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
