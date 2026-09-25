import { defineConfig } from "hardhat/config";
export default defineConfig({solidity:{version:"0.8.28",settings:{optimizer:{enabled:true,runs:200},evmVersion:"cancun"}},networks:{hardhatMainnet:{type:"edr-simulated",chainType:"l1",chainId:31337,hardfork:"cancun"}}});
