"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DollarSign, Wallet } from "lucide-react";
import Image from "next/image";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { factoryId } from "../../../utils/readUtils";
import { tokenOptions } from "../../../utils/tokenOptions";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { lendingAbi } from "@/lib/abi/lendingAbi";

export default function LendingPage() {
  const [amount, setAmount] = useState<number | string>("");
  const [poolDest, setPoolDest] = useState("");

  const {
    data: hashTransaction,
    isPending: isTransactionPending,
    writeContract: writeTransaction,
  } = useWriteContract();
  const { isLoading: isTransactionLoading, isSuccess } =
    useWaitForTransactionReceipt({
      hash: hashTransaction,
    });
  const handleSupply =  () => {
    const newAmount = Number(amount) * 10 ** 6;
    try {
      writeTransaction({
        abi: lendingAbi,
        address: poolDest as `0x${string}`,
        functionName: "supply",
        args: [BigInt(newAmount)], // USDC is fixed as token2
      });
    } catch {
      console.log("error");
    }
  };
  useEffect(() => {
    if (isSuccess) {
      // Reset form to default values after successful transaction.
      setAmount("");
      setPoolDest("");
    }
  }, [isSuccess]);

  const { data: id } = useReadContract({
    ...factoryId,
    functionName: "id",
  });
  const { data: poolId }: { data: string[] | undefined } = useReadContract({
    ...factoryId,
    functionName: "lendingPoolId",
    args: [id],
  });

  const findImage = (name: string | undefined) => {
    return name == "MANTA" ? tokens[1].icon : "";
  };

  const findName = (address: string | undefined) => {
    return tokenOptions.find((token) => token.address === address)?.name;
  };

  const usdcAmount = (e: any) => {
    setAmount(Number(e.target.value));
    setPoolDest(poolId ? String(poolId[2]) : "");
  };

  const isButtonDisabled = isTransactionPending || isTransactionLoading;
  return (
    <div className="min-h-screen  p-8">
      <div className="mx-auto max-w-6xl space-y-8 mt-5">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-4xl font-bold text-white">
            <Wallet className="h-12 w-12 text-blue-500" />
            <h1>Lending</h1>
          </div>
          <p className="text-slate-400">The Best DeFi Yields In 1-Click</p>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-900/50 p-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-sm text-slate-400">Total Lendings</p>
              <p className="text-xl font-bold text-white">$29,137,920</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-slate-400">Liquidity Total Supply</p>
              <p className="text-xl font-bold text-white">$63,857,824</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {tokens.map((token) => (
            <Card
              key={token.name}
              className="bg-slate-900/50 backdrop-blur border-slate-800"
            >
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-blue-400">{token.symbol}</span>
                  <span className="text-white font-bold">${token.balance}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative h-24 w-24">
                    <Image
                      src={token.icon || "/placeholder.svg"}
                      alt={token.name}
                      width={96}
                      height={96}
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Earnings</span>
                    <span>-</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Net APR</span>
                    <span className="text-white font-bold">{token.apr}%</span>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger className="w-full bg-blue-500 hover:bg-blue-700 p-2 rounded-xl text-white duration-300">
                    START EARNING
                  </DialogTrigger>
                  <DialogContent className=" bg-blue-700">
                    <DialogHeader>
                      <DialogTitle>EARN</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-slate-900/50 backdrop-blur border-slate-800">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-lg text-blue-400">
                  {poolId && Array.isArray(poolId) && poolId.length > 0
                    ? `${
                        tokenOptions.find(
                          (token) => token.address === String(poolId[0])
                        )?.name ?? "unknown"
                      } Pool`
                    : "unknown"}
                </span>
                <span className="text-white font-bold">
                  0.00 {findName(String(poolId ? poolId[1] : ""))}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="relative h-24 w-24">
                  <Image
                    src={
                      poolId
                        ? findImage(
                            tokenOptions.find(
                              (token) => token.address === String(poolId[0])
                            )?.name
                          )
                        : "/placeholder.svg"
                    }
                    alt={String(poolId)}
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-white text-center">
                  {findName(String(poolId ? poolId[1] : ""))}
                </p>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Earnings</span>
                  <span>-</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Net APR</span>
                  <span className="text-white font-bold">
                    {Number(tokens[0].apr) + 8.23}%
                  </span>
                </div>
              </div>

              <Dialog>
                <DialogTrigger className="w-full bg-blue-500 hover:bg-blue-700 p-2 rounded-xl text-white duration-300">
                  START EARNING
                </DialogTrigger>
                <DialogContent className=" bg-slate-400">
                  <DialogHeader>
                    <DialogTitle>EARN</DialogTitle>
                    <DialogDescription>
                      <Input
                        id="USDC"
                        placeholder="USDC Amount"
                        type="number"
                        onChange={usdcAmount}
                        value={amount === 0 ? "" : amount}
                        className="bg-slate-200 duration-300"
                      />
                      {poolDest}
                      <Button
                        onClick={handleSupply}
                        disabled={isButtonDisabled}
                        className="mt-3"
                      >
                        {isButtonDisabled ? "Processing..." : "Supply"}
                      </Button>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const tokens = [
  {
    name: "Ethereum",
    symbol: "0 ETH",
    balance: "0.00",
    apr: "1.44",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/800px-Ethereum-icon-purple.svg.png",
  },
  {
    name: "USD Coin",
    symbol: "0 USDC",
    balance: "0.00",
    apr: "9.72",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/1200px-Circle_USDC_Logo.svg.png",
  },
  {
    name: "Tether USD",
    symbol: "0 USDT",
    balance: "0.00",
    apr: "10.75",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Tether_USDT.png/1024px-Tether_USDT.png",
  },
  {
    name: "MANTA",
    symbol: "0 USDT",
    balance: "0.00",
    apr: "10.75",
    icon: "https://docs.manta.network/img/manta2.png",
  },
];
