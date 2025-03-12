"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BorrowDialog from "./borrow-dialog";
import { useReadContract } from "wagmi";
import { lendingPool } from "@/constants/addresses";
import { poolAbi } from "@/lib/abi/poolAbi";
import { useEffect, useState } from "react";
import SupplyDialog from "./supply-dialog-col";
import { RepayDialog } from "./repay-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TOKEN_OPTIONS } from "@/constants/tokenOption";
import { useSupplyAssets, useSupplyShares } from "@/hooks/useTotalSuppy";
import usdc from "../../../../public/usdc.png";
import weth from "../../../../public/weth.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { WithdrawDialog } from "./withdraw-dialog-col";
import { useBorrowBalance } from "@/hooks/useBorrowBalance";
import { ArrowDownUp, Info, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AssetsToBorrow() {
  const [hasPosition, setHasPosition] = useState(false);
  const [collateralBalance, setCollateralBalance] = useState<number | null>(
    null
  );
  const [borrowBalance, setBorrowBalance] = useState<number | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).ethereum?.selectedAddress
    ) {
      setUserAddress((window as any).ethereum.selectedAddress);
    }
  }, []);

  const { data: positionAddress, isLoading: isPositionLoading } =
    useReadContract({
      address: lendingPool,
      abi: poolAbi,
      functionName: "addressPosition",
      args: [userAddress],
    });

  useEffect(() => {
    if (
      positionAddress &&
      positionAddress !== "0x0000000000000000000000000000000000000000"
    ) {
      setHasPosition(true);
    } else {
      setHasPosition(false);
    }
  }, [positionAddress]);

  const { data: balance, isLoading: isBalanceLoading } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "userCollaterals",
    args: hasPosition ? [userAddress] : undefined,
  });

  const { data: collateralToken, isLoading: isCollateralTokenLoading } =
    useReadContract({
      address: lendingPool,
      abi: poolAbi,
      functionName: "collateralToken",
    });

  const getSymbol = (tokenAddress: any) => {
    return tokenAddress
      ? `${TOKEN_OPTIONS.find((t) => t.address === tokenAddress)?.name}`
      : undefined;
  };

  useEffect(() => {
    if (balance) {
      setCollateralBalance(Number(balance) / 10 ** 18);
    }
  }, [balance]);

  const { data: userBorrowShares, isLoading: isBorrowLoading } =
    useReadContract({
      address: lendingPool,
      abi: poolAbi,
      functionName: "userBorrowShares",
      args: userAddress ? [userAddress] : undefined,
    });

  useEffect(() => {
    if (userBorrowShares) {
      setBorrowBalance(Number(userBorrowShares));
    }
  }, [userBorrowShares]);

  const totalSupplyAssets = useSupplyAssets();
  const totalSupplyShares = useSupplyShares();
  const userBorrowBalance = useBorrowBalance();

  const convertBorrowShares = (amount: number | unknown, decimal: number) => {
    if (!amount || !totalSupplyShares) return "0.00";
    const realAmount = Number(amount) / decimal;
    const result = (realAmount * totalSupplyAssets) / totalSupplyShares;
    return result.toFixed(2);
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 shadow-xl overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-400 border-blue-500/30 mb-2"
            >
              DeFi
            </Badge>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Lending Pool
            </CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 border-slate-700">
                <p>Deposit collateral and borrow assets</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> APY
            </div>
            <div className="text-emerald-400 font-semibold">3.2%</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <ArrowDownUp className="h-3 w-3" /> LTV
            </div>
            <div className="text-blue-400 font-semibold">75%</div>
          </div>
        </div>

        {/* Collateral Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">
              Collateral
            </h3>
            <Badge
              variant="outline"
              className="text-xs bg-slate-800 border-slate-700 text-slate-400"
            >
              Supplied
            </Badge>
          </div>

          <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 overflow-hidden">
            {isCollateralTokenLoading || isBalanceLoading || isBorrowLoading ? (
              <div className="p-4">
                <Skeleton className="h-12 w-full bg-slate-700/50" />
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={weth || "/placeholder.svg"}
                        alt="Token logo"
                        width={36}
                        height={36}
                        className="rounded-full border border-slate-600"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full border border-slate-700 w-5 h-5 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-400">
                          $
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {isCollateralTokenLoading ? (
                          <Skeleton className="h-6 w-20 bg-slate-700" />
                        ) : (
                          getSymbol(collateralToken)
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        Collateral Asset
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {isBalanceLoading ? (
                        <Skeleton className="h-6 w-20 bg-slate-700" />
                      ) : Number(collateralBalance) < 1 / 1e15 ? (
                        "0.00"
                      ) : (
                        collateralBalance?.toFixed(4)
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {isBalanceLoading
                        ? ""
                        : `≈ $${(Number(collateralBalance || 0) * 3500).toFixed(
                            2
                          )}`}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <SupplyDialog token={getSymbol(collateralToken)}>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                    >
                      Supply
                    </Button>
                  </SupplyDialog>
                  <WithdrawDialog>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-slate-700 text-slate-300 hover:bg-slate-700/50"
                    >
                      Withdraw
                    </Button>
                  </WithdrawDialog>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Borrow Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">
              Borrow
            </h3>
            <Badge
              variant="outline"
              className="text-xs bg-slate-800 border-slate-700 text-slate-400"
            >
              Available
            </Badge>
          </div>

          <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 overflow-hidden">
            {isBorrowLoading ? (
              <div className="p-4">
                <Skeleton className="h-12 w-full bg-slate-700/50" />
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={usdc || "/placeholder.svg"}
                        alt="USDC logo"
                        width={36}
                        height={36}
                        className="rounded-full border border-slate-600"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full border border-slate-700 w-5 h-5 flex items-center justify-center">
                        <span className="text-xs font-bold text-green-400">
                          $
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">USDC</div>
                      <div className="text-xs text-slate-400">Borrow Asset</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {isBorrowLoading ? (
                        <Skeleton className="h-6 w-20 bg-slate-700" />
                      ) : (
                        userBorrowBalance
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {isBorrowLoading
                        ? ""
                        : `≈ $${Number(userBorrowBalance || 0).toFixed(2)}`}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <BorrowDialog token="USDC">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                    >
                      Borrow
                    </Button>
                  </BorrowDialog>
                  <RepayDialog>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-slate-700 text-slate-300 hover:bg-slate-700/50"
                    >
                      Repay
                    </Button>
                  </RepayDialog>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Health Factor */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 mt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-300">Health Factor</div>
            <div className="text-emerald-400 font-semibold">1.8</div>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
              style={{ width: "80%" }}
            ></div>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Safe · Liquidation at &lt; 1.0
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
