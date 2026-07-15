import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FundsmithModule = buildModule("FundsmithModule", (m) => {
  const fundsmith = m.contract("Fundsmith");

  return { fundsmith };
});

export default FundsmithModule;
