import { factoryAbi } from "@/lib/abi/collateralAbi";
import { factory } from "./contractAddress";

export const factoryId = {
  address: factory,
  abi: factoryAbi,
} as const;
