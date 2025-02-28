"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { poolAbi } from "@/lib/abi/poolAbi";
import { lendingPool } from "@/constants/addresses";
import { ArrowUpRight, Loader2, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useSupplyAssets,
  useSupplyShares,
  useSupplyUser,
} from "@/hooks/useTotalSuppy";

export const WithdrawDialog = () => {
  const [shares, setShares] = useState("0");
  const [isOpen, setIsOpen] = useState(false);

  const { writeContract, isPending } = useWriteContract();
  const supply = useSupplyUser();

  const handleWithdraw = async () => {
    if (!shares || Number.parseFloat(shares) <= 0) {
      Error("Please enter a valid amount of shares to withdraw");
      return;
    }

    const sharesAmount = BigInt(parseUnits(shares, 6));
    try {
      await writeContract({
        address: lendingPool,
        abi: poolAbi,
        functionName: "withdraw",
        args: [sharesAmount],
      });

      setShares("0");
      setIsOpen(false);
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  // uint256 amount = ((shares * totalSupplyAssets) / totalSupplyShares);
  const totalSupplyAssets = useSupplyAssets();
  const totalSupplyShares = useSupplyShares();
  const amount =
    (Number(shares) * Number(totalSupplyAssets)) / Number(totalSupplyShares);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-purple-500 to-indigo-400 hover:from-purple-600 hover:to-indigo-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-lg border-0"
          size="sm"
        >
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-slate-50 border-0 shadow-xl rounded-xl">
        <DialogHeader className="pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-6 w-6 text-purple-500" />
            <DialogTitle className="text-xl font-bold text-slate-800">
              Withdraw
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-slate-700">
                  Withdraw Shares
                </h3>
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  Withdraw
                </Badge>
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <Input
                  value={shares}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      setShares(value);
                    }
                  }}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium"
                  placeholder="0.00"
                />

                <div className="flex items-center gap-1 bg-slate-200 px-3 py-1 rounded-md">
                  <Wallet className="h-4 w-4 text-slate-700" />
                  <span className="font-semibold text-slate-700">Shares</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex mt-2 -mb-5 justify-between items-center">
            <span className="text-sm text-gray-700">Your Shares</span>
            <span className="text-sm text-gray-700">{supply} $Shares</span>
          </div>
          <div className="flex mt-0 justify-between items-center">
            <span className="text-sm text-gray-700">You Will Got</span>
            <span className="text-sm text-gray-700">
              {Number(shares)
                ? (
                    (Number(shares) * Number(totalSupplyAssets)) /
                    Number(totalSupplyShares)
                  ).toFixed(6)
                : 0}{" "}
              $USDC
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleWithdraw}
            disabled={isPending || !shares || Number.parseFloat(shares) <= 0}
            className={`w-full h-12 text-base font-medium rounded-lg ${
              isPending
                ? "bg-slate-200 text-slate-500"
                : "bg-gradient-to-r from-purple-500 to-indigo-400 hover:from-purple-600 hover:to-indigo-500 text-white shadow-md hover:shadow-lg"
            }`}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ArrowUpRight className="mr-2 h-5 w-5" />
            )}
            Withdraw
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
