"use client";

import { useState, useMemo, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useWalletClient, useBalance } from "wagmi";
import { parseEther, isAddress } from "viem";

// Fundsmith contract address and ABI
const CONTRACT_ADDRESS = "0x786946eA051A9054c07fBFf23A19c0Ba987aB14E";
const ABI = [
  {
    "inputs": [
      { "internalType": "address[]", "name": "recipients", "type": "address[]" },
      { "internalType": "uint256", "name": "amountPerRecipient", "type": "uint256" }
    ],
    "name": "batchFund",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

export default function Home() {
  const [addressesText, setAddressesText] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "funding" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");

  const { address, isConnected, chain } = useAccount();
  const { data: balanceData, refetch: refetchBalance } = useBalance({ address });
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (!isConnected) {
      setErrorMsg("");
      setTxHash("");
      setStatus("idle");
    }
  }, [isConnected]);

  // Clean and validate addresses
  const recipients = useMemo(() => {
    return addressesText
      .split(/[\s,]+/)
      .map((a: string) => a.trim())
      .filter((a: string) => isAddress(a)) as `0x${string}`[];
  }, [addressesText]);

  const totalRequired = useMemo(() => {
    if (!amount || isNaN(Number(amount))) return "0";
    return (Number(amount) * recipients.length).toString();
  }, [amount, recipients]);

  const hasInsufficientBalance = useMemo(() => {
    if (!balanceData || !amount || isNaN(Number(amount))) return false;
    try {
      const requiredBigInt = parseEther(amount) * BigInt(recipients.length);
      return balanceData.value < requiredBigInt;
    } catch {
      return false;
    }
  }, [balanceData, amount, recipients.length]);

  const handleBatchFund = async () => {
    if (!walletClient || !publicClient || !address) return;
    if (recipients.length === 0) return setErrorMsg("No valid addresses provided. Make sure they are comma or newline-separated.");
    if (!amount || Number(amount) <= 0) return setErrorMsg("Please provide a valid MON amount per wallet.");

    setStatus("funding");
    setErrorMsg("");
    setTxHash("");

    try {
      const amountPerRecipient = parseEther(amount);
      const totalValue = amountPerRecipient * BigInt(recipients.length);

      // Monad Specific Gas Logic
      // Monad charges for declared gas_limit, so we tightly estimate gas + 10% buffer for economic efficiency.
      const estimatedGas = await publicClient.estimateContractGas({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI,
        functionName: "batchFund",
        args: [recipients, amountPerRecipient],
        value: totalValue,
        account: address,
      });

      const bufferedGasLimit = (estimatedGas * 110n) / 100n;

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ABI,
        functionName: "batchFund",
        args: [recipients, amountPerRecipient],
        value: totalValue,
        gas: bufferedGasLimit,
        account: address,
      });

      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      await refetchBalance();
      setStatus("success");
    } catch (err: unknown) {
      const error = err as any;
      console.error(error);
      setErrorMsg(error.shortMessage || error.message || "Transaction failed");
      setStatus("idle"); // Revert status so user can try again
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-monad-DEFAULT/30 font-sans overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-monad-DEFAULT/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <nav className="flex items-center justify-between p-4 md:p-5 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-monad-light to-monad-DEFAULT flex items-center justify-center shadow-lg shadow-monad-DEFAULT/20">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white">Fundsmith</span>
          </div>
          <div>
            <ConnectButton />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-12 lg:pt-32 lg:pb-16 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

        {/* Left Column: Hero & Copy */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-monad-DEFAULT/10 border border-monad-DEFAULT/20 text-monad-light text-sm font-medium mb-8 shadow-sm">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-monad-DEFAULT opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-monad-light"></span>
            </span>
            Live on {chain?.id === 143 ? "Monad Mainnet" : "Monad Testnet"}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 md:mb-6 leading-[1.1]">
            Batch fund wallets with <span className="text-transparent bg-clip-text bg-gradient-to-r from-monad-light via-monad-DEFAULT to-pink-500">precision.</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-400 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Fundsmith is the most efficient way to distribute MON to multiple addresses simultaneously. Designed for developers, hackers, and teams building on Monad.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto lg:mx-0 text-left">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-sm transition-transform hover:-translate-y-1 hover:bg-slate-900/60 duration-300">
              <div className="w-12 h-12 rounded-xl bg-monad-DEFAULT/20 flex items-center justify-center mb-5 border border-monad-DEFAULT/10">
                <svg className="w-6 h-6 text-monad-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Time-Saving</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Execute one transaction instead of dozens. Focus on building your dApp, not managing funds.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-sm transition-transform hover:-translate-y-1 hover:bg-slate-900/60 duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-5 border border-blue-500/10">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Gas Optimized</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Leverage Monad's high throughput with tightly estimated, buffered gas limits for economic efficiency.</p>
            </div>
          </div>
        </div>

        {/* Right Column: App Card */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none lg:w-[500px] shrink-0">
          <div className="glass rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-monad-DEFAULT/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Distribute Funds</h2>
              <p className="text-sm text-slate-400">Enter recipient addresses and the amount of MON to send.</p>
            </div>

            {!isConnected ? (
              <div className="flex flex-col items-center justify-center py-8 md:py-10 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-900 flex items-center justify-center mb-4 md:mb-6 shadow-inner border border-white/5">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-white text-lg font-semibold mb-2 md:mb-3">Wallet Disconnected</h3>
                <p className="text-slate-400 text-sm mb-6 md:mb-8 max-w-[280px] mx-auto leading-relaxed">Please connect your Web3 wallet using the button at the top right to start batching transactions.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Recipients</label>
                    <span className="text-xs font-mono text-monad-light bg-monad-DEFAULT/20 px-2.5 py-1 rounded-full border border-monad-DEFAULT/30">{recipients.length} valid</span>
                  </div>
                  <textarea
                    value={addressesText}
                    onChange={(e) => setAddressesText(e.target.value)}
                    placeholder="0x123...&#10;0xabc..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-monad-DEFAULT focus:ring-1 focus:ring-monad-DEFAULT transition-all min-h-[90px] h-[90px] resize-none text-slate-300 placeholder:text-slate-700 custom-scrollbar shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-medium text-slate-300">Amount per wallet</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.1"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 pr-16 text-sm font-mono focus:outline-none focus:border-monad-DEFAULT focus:ring-1 focus:ring-monad-DEFAULT transition-all text-slate-300 placeholder:text-slate-700 shadow-inner"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded-md">
                      MON
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950 border border-white/10 p-5 rounded-xl mt-2 shadow-inner">
                  <span className="text-sm font-medium text-slate-400">Total Required</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight">{totalRequired} MON</span>
                </div>

                {hasInsufficientBalance && (
                  <div className="flex items-start gap-3 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl animate-in fade-in">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="break-words leading-tight flex-1">
                      Insufficient balance. You need more MON to cover this transaction.{" "}
                      {chain?.id !== 143 && (
                        <a href="https://faucet.monad.xyz/" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-amber-300 transition-colors">
                          Get Testnet MON here.
                        </a>
                      )}
                    </span>
                  </div>
                )}

                {errorMsg && (
                  <div className="flex items-start gap-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-in fade-in relative pr-10">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="break-words leading-tight">{errorMsg}</span>
                    <button 
                      onClick={() => setErrorMsg("")} 
                      className="absolute right-3 top-4 text-red-400/70 hover:text-red-400 transition-colors"
                      aria-label="Dismiss error"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {status === "success" && (
                  <div className="flex items-start gap-3 text-green-400 text-sm bg-green-500/10 border border-green-500/20 p-4 rounded-xl animate-in fade-in flex-col">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="break-words leading-tight font-medium">Successfully funded {recipients.length} wallets!</span>
                    </div>
                    {txHash && (
                      <div className="ml-8 mt-1">
                        <a 
                          href={`${chain?.id === 143 ? "https://explorer.monad.xyz/tx/" : "https://testnet.monadexplorer.com/tx/"}${txHash}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-green-400/80 hover:text-green-300 transition-colors bg-green-500/10 px-2.5 py-1.5 rounded-lg border border-green-500/20"
                        >
                          View Transaction
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleBatchFund}
                  disabled={status === "funding" || recipients.length === 0 || !amount || Number(amount) <= 0 || hasInsufficientBalance}
                  className="w-full relative overflow-hidden bg-white text-slate-950 hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:bg-white disabled:hover:-translate-y-0 disabled:cursor-not-allowed transition-all py-4 rounded-xl font-bold mt-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {status === "funding" ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Batch Fund Wallets"
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/80 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-semibold">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-monad-light to-monad-DEFAULT flex items-center justify-center shadow-sm">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span>Fundsmith</span>
            </div>
            <span className="text-sm text-slate-500">© {new Date().getFullYear()} Fundsmith. Built for the Monad ecosystem.</span>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <a href="https://github.com/Divinedestiny123/fundsmith#readme" target="_blank" rel="noopener noreferrer" className="hover:text-monad-light transition-colors">Documentation</a>
            <a href="https://github.com/Divinedestiny123/fundsmith" target="_blank" rel="noopener noreferrer" className="hover:text-monad-light transition-colors">GitHub</a>
            <a href="https://monad.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-monad-light transition-colors">Monad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
