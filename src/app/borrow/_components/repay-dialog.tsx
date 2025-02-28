"use client";

import { useState, useEffect } from "react";
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
import { mockErc20Abi } from "@/lib/abi/mockErc20Abi";
import { poolAbi } from "@/lib/abi/poolAbi";
import { lendingPool, mockUsdc } from "@/constants/addresses";
import { useSupplyAssets, useSupplyShares } from "@/hooks/useTotalSuppy";
import { ArrowDown, CreditCard, DollarSign, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const useUSDCBalance = () => {
  const { address } = useAccount();
  const [balance, setBalance] = useState("0.00");

  const { data } = useReadContract({
    abi: mockErc20Abi,
    address: mockUsdc,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (data) {
      setBalance(
        Number.parseFloat(formatUnits(BigInt(data as bigint), 6)).toFixed(2)
      );
    }
  }, [data]);

  return balance;
};

const useBorrowBalance = () => {
  const { address } = useAccount();
  const { data: borrowBalance } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "userBorrowShares",
    args: [address],
  });

  return borrowBalance ? Number(borrowBalance) / 1e6 : "0.00";
};

const AmountInput = ({ value, onChange, token, balance, label }: any) => {
  const borrowBalance = useBorrowBalance();
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-slate-700">{label}</h3>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Repay
          </Badge>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium"
            placeholder="0.00"
          />
          <div className="flex items-center gap-1 bg-slate-200 px-3 py-1 rounded-md">
            <DollarSign className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-700">{token}</span>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
          <span className="text-sm text-blue-700">Debt :</span>
          <div className="flex items-center  text-xs  gap-2">
            <span>{borrowBalance} $USDC</span>
            <button
              className="text-xs p-0.5 text-blue-500 rounded-md border border-blue-500 hover:bg-blue-300"
              onClick={() => onChange(borrowBalance)}
            >
              Max
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const RepayDialog = () => {
  const supplyShares = useSupplyShares();
  const supplyAssets = useSupplyAssets();
  const borrowBalance = useBorrowBalance(); // Use the imported hook
  const { data: totalBorrowAssets } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "totalBorrowAssets",
    args: [],
  });

  const { data: totalBorrowShares } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "totalBorrowShares",
    args: [],
  });
  const [usdcAmount, setUsdcAmount] = useState("0");
  const [isOpen, setIsOpen] = useState(false);

  const usdcBalance = useUSDCBalance();

  const { writeContract, isPending } = useWriteContract();

  const handleApproveAndRepay = async () => {
    if (!usdcAmount || Number.parseFloat(usdcAmount) <= 0) {
      Error("Please enter a valid amount to repay");
      return;
    }

    setIsOpen(true); // Pastikan dialog tetap terbuka saat transaksi berlangsung

    const amount = Number(usdcAmount) * 1e6;
    const result = Math.round((amount * supplyAssets) / supplyShares + amount);

    try {
      // Approve transaction
      const approveTx = writeContract({
        address: mockUsdc,
        abi: mockErc20Abi,
        functionName: "approve",
        args: [lendingPool, BigInt(result)],
      });

      await approveTx;

      // Repay transaction
      const repayTx = writeContract({
        address: lendingPool,
        abi: poolAbi,
        functionName: "repayByPosition",
        args: [amount],
      });

      await repayTx;

      // Reset amount dan tutup dialog setelah transaksi sukses
      setUsdcAmount("0");
      setIsOpen(false);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const debtEquals = () => {
    if (
      !totalBorrowAssets ||
      !totalBorrowShares ||
      !borrowBalance ||
      Number(totalBorrowShares) === 0
    ) {
      return 0;
    }
    return Number(
      (Number(borrowBalance) * Number(totalBorrowAssets)) /
        Number(totalBorrowShares)
    );
  };

  return (
    <Dialog open={isOpen || isPending} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-blue-600 to-indigo-400 hover:from-blue-600 hover:to-indigo-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-lg border-0"
          size="lg"
        >
          Repay $USDC
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-slate-50 border-0 shadow-xl rounded-xl">
        <DialogHeader className="pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowDown className="h-6 w-6 text-blue-500" />
            <DialogTitle className="text-xl font-bold text-slate-800">
              Repay Loan
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <AmountInput
            value={usdcAmount}
            onChange={setUsdcAmount}
            token="Shares"
            balance={usdcBalance}
            label="Repay Amount"
          />

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <div className="bg-blue-100 p-1 rounded-full mr-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-medium text-blue-700 mb-1">
                  Repayment Information
                </h4>
                <p className="text-xs text-blue-600">
                  Repaying your loan will decrease your debt and increase your
                  available credit. This may affect your borrowing capacity.
                </p>
                <p className="text-xs text-blue-600 mt-3">
                  Debt: {borrowBalance} Shares
                  <br />
                  Equals to {debtEquals().toFixed(4)} USDC
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleApproveAndRepay}
            disabled={
              isPending || !usdcAmount || Number.parseFloat(usdcAmount) <= 0
            }
            className={`w-full h-12 text-base font-medium rounded-lg ${
              isPending
                ? "bg-slate-200 text-slate-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-600 hover:to-indigo-500 text-white shadow-md hover:shadow-lg"
            }`}
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Processing Repayment...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <ArrowDown className="mr-2 h-5 w-5" />
                <span>Repay</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
