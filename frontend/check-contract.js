const { createPublicClient, http } = require("viem");

const publicClient = createPublicClient({
  chain: {
    id: 10143,
    name: "Monad Testnet",
    nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
    rpcUrls: {
      default: { http: ["https://testnet-rpc.monad.xyz/"] },
    }
  },
  transport: http()
});

async function main() {
  const code = await publicClient.getBytecode({ address: "0x786946eA051A9054c07fBFf23A19c0Ba987aB14E" });
  console.log("Contract Code:", code ? "Deployed" : "Not Deployed", code);
}

main().catch(console.error);
