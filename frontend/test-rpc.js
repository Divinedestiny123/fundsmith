const { createPublicClient, http, parseEther } = require("viem");
const { monadTestnet } = require("viem/chains");

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
];

const CONTRACT_ADDRESS = "0x786946eA051A9054c07fBFf23A19c0Ba987aB14E";

const publicClient = createPublicClient({
  chain: {
    id: 10143,
    name: "Monad Testnet",
    nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
    rpcUrls: {
      default: { http: ["https://testnet-rpc.monad.xyz/"] },
      public: { http: ["https://testnet-rpc.monad.xyz/"] },
    }
  },
  transport: http()
});

async function main() {
  try {
    const estimatedGas = await publicClient.estimateContractGas({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "batchFund",
      args: [
        ["0x728063aB774402A3C4e086BBECf2c29cc580F8cD", "0x3D0FB447E3a2E2fd2c5088acFfCCEa1aF5441794"], 
        parseEther("2.98")
      ],
      value: parseEther("5.96"),
      account: "0x3D0FB447E3a2E2fd2c5088acFfCCEa1aF5441794", // just a dummy sender
    });
    console.log("Estimated gas:", estimatedGas);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
