async function main() {
  const signers = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signers[0].address);
  console.log("Address:", signers[0].address);
  console.log("Balance:", ethers.formatEther(balance));
}
main().catch(console.error);
