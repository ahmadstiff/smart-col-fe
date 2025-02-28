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
      ? `$${TOKEN_OPTIONS.find((t) => t.address === tokenAddress)?.name}`
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
    <Card className="bg-slate-900/50 border-none shadow-xl p-4">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-slate-200">
          Lending Pool
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-slate-300 text-lg font-semibold">Collateral</div>
        <div className="grid grid-cols-12 gap-4 bg-[#161835] p-4 rounded-lg">
          {isCollateralTokenLoading || isBalanceLoading || isBorrowLoading ? (
            <Skeleton className="h-10 w-full col-span-12 bg-slate-400" />
          ) : (
            <>
              <div className="col-span-4 flex items-center gap-2">
                <Image
                  src={weth}
                  alt="Token logo"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="font-medium text-slate-400">
                  {isCollateralTokenLoading ? (
                    <Skeleton className="h-6 w-20 bg-slate-400" />
                  ) : (
                    getSymbol(collateralToken)
                  )}
                </span>
              </div>
              <div className="col-span-5 text-slate-400 flex items-center">
                {isBalanceLoading ? (
                  <Skeleton className="h-6 w-20 bg-slate-400" />
                ) : Number(collateralBalance) < 1 / 1e15 ? (
                  0
                ) : (
                  collateralBalance
                )}
              </div>
              <div className="col-span-3 flex items-center justify-end gap-2">
                {isCollateralTokenLoading ? (
                  <Skeleton className="h-8 w-20 bg-slate-400" />
                ) : (
                  <SupplyDialog token={getSymbol(collateralToken)} />
                )}
                <WithdrawDialog />
              </div>
            </>
          )}
        </div>

        <div className="text-slate-300 text-lg font-semibold mt-6">Borrow</div>
        <div className="grid grid-cols-12 gap-4 bg-[#161835] p-4 rounded-lg">
          {isBorrowLoading ? (
            <Skeleton className="h-10 w-full col-span-12 bg-slate-400" />
          ) : (
            <>
              <div className="col-span-4 flex items-center gap-2">
                <Image
                  src={usdc}
                  alt="USDC logo"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="font-medium text-slate-400">$USDC</span>
              </div>
              <div className="col-span-4 text-slate-400 mt-1">
                {isBorrowLoading ? (
                  <Skeleton className="h-6 w-20 bg-slate-400" />
                ) : (
                  userBorrowBalance
                )}
              </div>
              <div className="col-span-4 flex gap-2 justify-end">
                {isBorrowLoading ? (
                  <Skeleton className="h-8 w-20 bg-slate-400" />
                ) : (
                  <BorrowDialog token="USDC" />
                )}
                <RepayDialog />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
