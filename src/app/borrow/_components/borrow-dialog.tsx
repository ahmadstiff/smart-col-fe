"use client";

import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits } from "viem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { poolAbi } from "@/lib/abi/poolAbi";
import { lendingPool } from "@/constants/addresses";
import { Loader2 } from "lucide-react";

interface BorrowDialogProps {
  token: string;
}

export default function BorrowDialog({ token }: BorrowDialogProps) {
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hasPosition, setHasPosition] = useState(false);

  const { data: positionAddress, refetch: refetchPosition } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "addressPosition",
    args: [
      typeof window !== "undefined"
        ? (window as any).ethereum?.selectedAddress
        : undefined,
    ],
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

  const {
    data: writeHash,
    writeContract,
    isPending: isWritePending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeHash,
  });

  const handleBorrow = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        console.error("Please enter a valid borrow amount");
        return;
      }

      const decimals = 6;
      const parsedAmount = parseUnits(amount, decimals);

      if (!hasPosition) {
        console.log("🚀 Creating Position...");

        await writeContract({
          address: lendingPool,
          abi: poolAbi,
          functionName: "createPosition",
          args: [],
        });

        console.log("Position created successfully!");
        await refetchPosition();
      }

      console.log("💰 Borrowing...");

      await writeContract({
        address: lendingPool,
        abi: poolAbi,
        functionName: "borrowByPosition",
        args: [parsedAmount],
      });

      console.log(`Successfully borrowed ${amount} ${token}!`);
      setAmount("");
    } catch (error) {
      console.error("Borrow error:", error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
    }
  }, [isSuccess]);

  const isProcessing = isWritePending || isConfirming;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-teal-400 text-white">
          Borrow {token}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Borrow {token}</DialogTitle>
          {!hasPosition && (
            <DialogDescription>
              You need to create a position before borrowing.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 pt-4">
            <p className="text-sm text-slate-400">
              Borrow against your supplied collateral.
            </p>
            <div className="flex items-center space-x-2">
              <Input
                placeholder={`Enter amount of ${token} to borrow`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
                type="number"
                min="0"
                step="0.01"
              />
              <span>{token}</span>
            </div>
          </div>

          <Button
            onClick={handleBorrow}
            disabled={isProcessing || !amount}
            className={`w-full ${
              isProcessing ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Borrow ${token}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
