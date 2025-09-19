import { ethers } from "hardhat";

async function main() {
  console.log("Deploying RentalPayment contract...");

  const RentalPayment = await ethers.getContractFactory("RentalPayment");
  const rentalPayment = await RentalPayment.deploy();

  await rentalPayment.waitForDeployment();

  const address = await rentalPayment.getAddress();
  console.log("RentalPayment deployed to:", address);

  // Save the contract address and ABI for frontend use
  const fs = require('fs');
  const contractInfo = {
    address: address,
    abi: RentalPayment.interface.fragments
  };

  fs.writeFileSync(
    './src/lib/contract-info.json',
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("Contract info saved to src/lib/contract-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
