"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  Wallet,
  HandCoins,
  TrendingUp,
  Coins,
  CircleDollarSign,
} from "lucide-react";
import AssetsToBorrow from "./asset-to-borrow";
import { useAccount, useReadContract } from "wagmi";
import { poolAbi } from "@/lib/abi/poolAbi";
import {
  lendingPool,
  mockUsdc,
  mockUsde,
  mockWbtc,
  mockWeth,
} from "@/constants/addresses";
import type { Address } from "viem";
import { TOKEN_OPTIONS } from "@/constants/tokenOption";
import PositionToken from "./PositionToken";
import { useBorrowBalance } from "@/hooks/useBorrowBalance";
import { Badge } from "@/components/ui/badge";

interface AssetItem {
  id: string;
  name: string;
  network: string;
  icon: string;
  available: number;
  apy: number;
  borrowed?: number;
}

const mockAssets: AssetItem[] = [
  {
    id: "usdc",
    name: "USDC",
    network: "ethereum",
    icon: "#usdc",
    available: 100,
    apy: 23.78,
    borrowed: 0.01,
  },
];

export default function BorrowPage() {
  const { address } = useAccount();
  const { data: totalSupplyAssets } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "totalSupplyAssets",
    args: [],
  });
  const { data: totalSupplyShares } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "totalSupplyShares",
    args: [],
  });

  const [isExpanded, setIsExpanded] = useState(true);

  /**
   * @dev Check Wallet Address
   */
  const { data: checkAvailability } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "addressPosition",
    args: [address],
  });
  const addressPosition = checkAvailability as `0x${string}` | undefined;
  /************************************************ */

  /**
   * @dev fit the collateral token name
   */
  const { data: collateralAddress } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "collateralToken",
  });
  const { data: borrowAddress } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "borrowToken",
  });
  /************************************************ */

  /**
   * @dev collaterals that user have in lending pool
   */
  const { data: userCollateral } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "userCollaterals",
    args: [address],
  });
  /************************************************ */
  /**
   * @dev borrow shares that user have in lending pool
   */
  const userBorrowShares = useBorrowBalance();
  /************************************************ */
  const findNameToken = (address: Address | unknown) => {
    const token = TOKEN_OPTIONS.find((asset) => asset.address === address);
    return token?.name;
  };

  const convertRealAmount = (amount: number | unknown, decimal: number) => {
    const realAmount = Number(amount) ? Number(amount) / decimal : 0; // convert to USDC
    return realAmount;
  };

  const convertBorrowShares = (amount: number | unknown, decimal: number) => {
    const realAmount = convertRealAmount(amount, decimal);
    if (Number(totalSupplyAssets) && Number(totalSupplyShares)) {
      const result =
        (realAmount * Number(totalSupplyAssets)) / Number(totalSupplyShares);
      return result.toFixed(2);
    }
  };
  /************************************************ */
  /**
   * @dev getPositionId
   */

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8 mt-5">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-3xl md:text-4xl font-bold text-white">
            <HandCoins className="h-8 w-8 md:h-12 md:w-12 text-blue-500" />
            <h1>Borrow</h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base">
            The Best DeFi Yields In 1-Click
          </p>
          <div className="flex justify-center gap-2">
            <Badge
              variant="outline"
              className="bg-blue-950/30 text-blue-400 border-blue-800 px-3 py-1"
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              High Yields
            </Badge>
            <Badge
              variant="outline"
              className="bg-emerald-950/30 text-emerald-400 border-emerald-800 px-3 py-1"
            >
              <Coins className="h-3.5 w-3.5 mr-1" />
              Multiple Assets
            </Badge>
          </div>
        </div>

        <Card className="bg-slate-900/50 border border-slate-800 shadow-lg overflow-hidden">
          <CardHeader className="pb-2 border-b border-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-xl text-white">
                  Your Position
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {isExpanded && (
            <CardContent className="p-4 md:p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800/30 rounded-lg">
                  <div className="space-y-2 text-center">
                    <div className="text-xs md:text-sm text-slate-400 flex items-center justify-center gap-1">
                      <Wallet className="h-3.5 w-3.5 text-blue-500" />
                      Collateral
                    </div>
                    <div className="text-base md:text-lg font-medium text-white">
                      {userCollateral
                        ? convertRealAmount(userCollateral, 1e18).toFixed(5)
                        : "0"}{" "}
                      <span className="text-blue-400">
                        ${findNameToken(collateralAddress)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="text-xs md:text-sm text-slate-400 flex items-center justify-center gap-1">
                      <HandCoins className="h-3.5 w-3.5 text-red-500" />
                      Debt
                    </div>
                    <div className="text-base md:text-lg font-medium text-white">
                      {userBorrowShares || "0"}{" "}
                      <span className="text-blue-400">
                        ${findNameToken(borrowAddress)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="text-xs md:text-sm text-slate-400 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                      APY
                    </div>
                    <div className="text-base md:text-lg font-medium text-green-400">
                      {userBorrowShares ? "14.45%" : "0%"}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  {checkAvailability ===
                  "0x0000000000000000000000000000000000000000" ? (
                    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                      <div className="bg-slate-800/50 p-4 rounded-full">
                        <Wallet className="h-10 w-10 text-slate-500" />
                      </div>
                      <span className="text-xl md:text-2xl text-slate-300">
                        No positions available
                      </span>
                      <p className="text-sm text-slate-500 max-w-md">
                        You don't have any active positions. Start by supplying
                        collateral and borrowing assets.
                      </p>
                      <Button className="mt-2 bg-blue-600 hover:bg-blue-700">
                        Create Position
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-800/50 text-sm font-medium text-slate-400">
                        <div className="pl-4">Assets</div>
                        <div className="text-center">Value</div>
                        <div className="text-center">Actions</div>
                      </div>
                      <div className="divide-y divide-slate-800/50">
                        {/* WETH */}
                        <PositionToken
                          name={findNameToken(mockWeth)}
                          address={mockWeth}
                          decimal={1e18}
                          addressPosition={addressPosition}
                        />
                        {/* WBTC */}
                        <PositionToken
                          name={findNameToken(mockWbtc)}
                          address={mockWbtc}
                          decimal={1e8}
                          addressPosition={addressPosition}
                        />
                        {/* USDE */}
                        <PositionToken
                          name={findNameToken(mockUsde)}
                          address={mockUsde}
                          decimal={1e8}
                          addressPosition={addressPosition}
                        />
                        {/* USDC */}
                        <PositionToken
                          name={findNameToken(mockUsdc)}
                          address={mockUsdc}
                          decimal={1e6}
                          addressPosition={addressPosition}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <AssetsToBorrow />
      </div>
    </div>
  );
}
