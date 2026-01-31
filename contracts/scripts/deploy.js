const hre = require("hardhat");

async function main() {
  console.log("Deploying PHRRegistry to Base Sepolia...");

  const PHRRegistry = await hre.ethers.getContractFactory("PHRRegistry");
  const phrRegistry = await PHRRegistry.deploy();

  await phrRegistry.waitForDeployment();

  const address = await phrRegistry.getAddress();
  console.log(`PHRRegistry deployed to: ${address}`);

  console.log("\nWaiting for block confirmations...");
  await phrRegistry.deploymentTransaction().wait(5);

  console.log("\nVerifying contract on BaseScan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Verification failed:", error.message);
  }

  console.log("\n=== Deployment Summary ===");
  console.log(`Contract Address: ${address}`);
  console.log(`Network: Base Sepolia (Chain ID: 84532)`);
  console.log(`Explorer: https://sepolia.basescan.org/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
