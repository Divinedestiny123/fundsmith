const { ethers } = require("ethers");
async function main() {
  const provider = new ethers.JsonRpcProvider("https://rpc-mainnet.monadinfra.com");
  const balance = await provider.getBalance("0x3D4C5a1442EaBdF1494437670032042Cb0408844");
  console.log("Balance:", ethers.formatEther(balance));
}
main().catch(console.error);
