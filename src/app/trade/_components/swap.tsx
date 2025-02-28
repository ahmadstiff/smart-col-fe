"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { parseUnits } from "viem";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
  useReadContract,
} from "wagmi";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  lendingPool,
  mockEna,
  mockUsdc,
  mockUsde,
  mockWbtc,
  mockWeth,
  priceFeed,
} from "@/constants/addresses";
import { priceAbi } from "@/lib/abi/price-abi";
import { poolAbi } from "@/lib/abi/poolAbi";
import { positionAbi } from "@/lib/abi/positionAbi";

// Import token images
import usdc from "../../../../public/usdc.png";
import usde from "../../../../public/usde.png";
import weth from "../../../../public/weth.png";
import ena from "../../../../public/ena.png";
import wbtc from "../../../../public/wbtc.png";

const tokens = [
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    logo: wbtc,
    tokenAddress: mockWbtc,
    decimals: 8,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    logo: weth,
    tokenAddress: mockWeth,
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    logo: usdc,
    tokenAddress: mockUsdc,
    decimals: 6,
  },
  {
    symbol: "USDE",
    name: "USD Edge",
    logo: usde,
    tokenAddress: mockUsde,
    decimals: 6,
  },
  {
    symbol: "ENA",
    name: "Ethena",
    logo: ena,
    tokenAddress: mockEna,
    decimals: 18,
  },
];

export default function TokenSwap() {
  const [fromToken, setFromToken] = useState<any>("");
  const [toToken, setToToken] = useState<any>("");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isManualInput, setIsManualInput] = useState<"from" | "to" | null>(
    null
  );

  const [isLimitOrder, setIsLimitOrder] = useState(false);
  const [limitPrice, setLimitPrice] = useState("");

  const { address } = useAccount();
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).ethereum?.selectedAddress
    ) {
      setUserAddress((window as any).ethereum.selectedAddress);
    }
  }, []);

  const { data: positionAddress, refetch: refetchPosition } = useReadContract({
    address: lendingPool,
    abi: poolAbi,
    functionName: "addressPosition",
    args: userAddress ? [userAddress] : undefined,
  });

  const { data: tokenBalance } = useReadContract({
    address: positionAddress as `0x${string}`,
    abi: positionAbi,
    functionName: "tokenBalances",
    args: [mockUsdc],
  });

  const { data: decimal } = useReadContract({
    abi: priceAbi,
    address: priceFeed,
    functionName: "getQuoteDecimal",
    args: toToken ? [toToken.tokenAddress] : undefined,
    query: {
      enabled: Boolean(toToken),
    },
  });

  const { data: price } = useReadContract({
    abi: priceAbi,
    address: priceFeed,
    functionName: "getPriceTrade",
    args:
      fromToken && toToken
        ? [fromToken.tokenAddress, toToken.tokenAddress]
        : undefined,
    query: {
      enabled: Boolean(fromToken && toToken),
    },
  }) as unknown as { data: readonly [bigint, bigint] };

  const {
    data: swapHash,
    writeContract: writeSwap,
    isPending: isSwapPending,
  } = useWriteContract();

  const { isLoading: isSwapLoading } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  const switchTokens = () => {
    setIsManualInput(null);
    const tempFromToken = fromToken;
    const tempToToken = toToken;
    const tempFromAmount = fromAmount;
    const tempToAmount = toAmount;

    setFromToken(tempToToken);
    setToToken(tempFromToken);
    setFromAmount(tempToAmount);
    setToAmount(tempFromAmount);
  };

  useEffect(() => {
    if (
      fromToken &&
      toToken &&
      fromAmount &&
      price &&
      decimal &&
      isManualInput === "from"
    ) {
      setIsCalculating(true);
      const calculatedAmount =
        (Number(fromAmount) * Number(price[0])) / Number(price[1]);
      setToAmount(calculatedAmount.toFixed(6));
      setLimitPrice(calculatedAmount.toFixed(6));
      setIsCalculating(false);
    }
  }, [fromToken, toToken, fromAmount, price, decimal, isManualInput]);

  useEffect(() => {
    if (
      fromToken &&
      toToken &&
      toAmount &&
      price &&
      decimal &&
      isManualInput === "to"
    ) {
      setIsCalculating(true);
      const calculatedAmount =
        (Number(toAmount) * Number(price[1])) / Number(price[0]);
      setFromAmount(calculatedAmount.toFixed(6));
      setIsCalculating(false);
    }
  }, [fromToken, toToken, toAmount, price, decimal, isManualInput]);

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (Number(value) >= 0 && !value.startsWith("-"))) {
      setIsManualInput("from");
      setFromAmount(value);
    }
  };

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (Number(value) >= 0 && !value.startsWith("-"))) {
      setIsManualInput("to");
      setToAmount(value);
    }
  };

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (Number(value) >= 0 && !value.startsWith("-"))) {
      setLimitPrice(value);

      // If we have both tokens and a limit price, calculate the to amount
      if (fromToken && toToken && fromAmount && value) {
        const calculatedAmount = Number(fromAmount) * Number(value);
        setToAmount(calculatedAmount.toFixed(6));
      }
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || Number(fromAmount) <= 0) {
      Error("Please enter valid swap details");
      return;
    }

    try {
      const amountIn = parseUnits(fromAmount, fromToken.decimals);

      // Regular market swap
      await writeSwap({
        address: lendingPool,
        abi: poolAbi,
        functionName: "swapTokenByPosition",
        args: [toToken.tokenAddress, fromToken.tokenAddress, amountIn],
      });
    } catch (error) {
      console.error("Swap error:", error);
    }
  };

  return (
    <div className=" overflow-hidden h-full flex flex-col">
      <div className=" px-4 py-3">
        <h2 className="text-white text-lg font-medium">Swap</h2>
      </div>

      <div className="p-4 space-y-4 flex-grow">
        <div className="space-y-2">
          <Label htmlFor="from-amount" className="text-gray-400 text-sm">
            From
          </Label>
          <div className="flex space-x-2">
            <Input
              id="from-amount"
              type="number"
              placeholder="0.0"
              className="flex-grow bg-[#0d0e24] border border-[#1a1b3a] text-white placeholder:text-gray-500  focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 h-12"
              value={fromAmount}
              onChange={handleFromAmountChange}
              disabled={!fromToken}
              min="0"
              step="any"
            />
            <Select
              onValueChange={(value) =>
                setFromToken(tokens.find((t) => t.symbol === value))
              }
              value={fromToken?.symbol}
            >
              <SelectTrigger className="w-[120px] bg-[#0d0e24] border border-[#1a1b3a] text-white focus:ring-0 focus:border-[#2f3366] h-12">
                <SelectValue placeholder={toToken ? undefined : "Select"}>
                  {fromToken && (
                    <div className="flex items-center space-x-2">
                      {fromToken.logo && (
                        <Image
                          src={fromToken.logo || "/placeholder.svg"}
                          alt={fromToken.name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      )}
                      <span>{fromToken.symbol}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#0d0e24] border border-[#1a1b3a] text-white">
                {tokens.map((token) => (
                  <SelectItem
                    key={token.symbol}
                    value={token.symbol}
                    className="focus:bg-[#7d81dc] hover:bg-[#1a1b3a]"
                  >
                    <div className="flex items-center space-x-2">
                      <Image
                        src={token.logo || "/placeholder.svg"}
                        alt={token.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span>{token.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className=" relative rounded-full h-10 w-10 backdrop-blur-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-purple-400 transition-all duration-300 transform hover:scale-110 hover:rotate-180 group"
            onClick={switchTokens}
            disabled={!fromToken || !toToken}
          >
            <ArrowDownUp className="h-4 w-4 group-hover:stroke-purple-400 transition-colors" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="to-amount" className="text-gray-400 text-sm">
            To
          </Label>
          <div className="flex space-x-2">
            <Input
              id="to-amount"
              type="number"
              placeholder="0.0"
              className="flex-grow bg-[#0d0e24] border border-[#1a1b3a] text-white placeholder:text-gray-500 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 h-12"
              value={toAmount}
              onChange={handleToAmountChange}
              disabled={!toToken}
              min="0"
              step="any"
            />
            <Select
              onValueChange={(value) =>
                setToToken(tokens.find((t) => t.symbol === value))
              }
              value={toToken?.symbol}
            >
              <SelectTrigger className="w-[120px] bg-[#0d0e24] border border-[#1a1b3a] text-white focus:ring-0 focus:border-[#2f3366] h-12">
                <SelectValue placeholder={toToken ? undefined : "Select"}>
                  {toToken && (
                    <div className="flex items-center space-x-2">
                      {toToken.logo && (
                        <Image
                          src={toToken.logo || "/placeholder.svg"}
                          alt={toToken.name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      )}
                      <span>{toToken.symbol}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#0d0e24] border border-[#1a1b3a] text-white">
                {tokens.map((token) => (
                  <SelectItem
                    key={token.symbol}
                    value={token.symbol}
                    className="focus:bg-[#7d81dc] hover:bg-[#1a1b3a]"
                  >
                    <div className="flex items-center space-x-2">
                      <Image
                        src={token.logo || "/placeholder.svg"}
                        alt={token.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span>{token.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Label
            htmlFor="limit-toggle"
            className="text-gray-400 text-sm cursor-pointer"
          >
            Limit Order
          </Label>
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
              isLimitOrder ? "bg-blue-500" : "bg-gray-700"
            }`}
            onClick={() => setIsLimitOrder(!isLimitOrder)}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                isLimitOrder ? "translate-x-6" : ""
              }`}
            />
          </div>
        </div>

        {isLimitOrder && (
          <div className="space-y-2 mt-4">
            <Label htmlFor="limit-price" className="text-gray-400 text-sm">
              Limit Price (1 {fromToken?.symbol} = X {toToken?.symbol})
            </Label>
            <Input
              id="limit-price"
              type="number"
              placeholder="0.0"
              className="flex-grow bg-[#0d0e24] border border-[#1a1b3a] text-white placeholder:text-gray-500 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 h-12"
              value={limitPrice}
              onChange={handleLimitPriceChange}
              disabled={!fromToken || !toToken}
              min="0"
              step="any"
            />
          </div>
        )}

        {fromToken && toToken && fromAmount && toAmount && (
          <div className="text-sm text-gray-400 px-1 text-right">
            1 {fromToken.symbol} ={" "}
            {(Number(toAmount) / Number(fromAmount) || 0).toFixed(6)}{" "}
            {toToken.symbol}
          </div>
        )}

        <Button
          className="w-full bg-gradient-to-r from-blue-800 to-blue-500 hover:from-blue-600 hover:to-blue-800 text-white font-medium py-6 rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:translate-y-[-2px]"
          onClick={handleSwap}
          disabled={
            !fromToken ||
            !toToken ||
            !fromAmount ||
            isSwapPending ||
            isSwapLoading
          }
        >
          {isSwapPending || isSwapLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isLimitOrder ? "Creating Limit Order..." : "Swapping..."}
            </div>
          ) : isLimitOrder ? (
            "Create Limit Orderx"
          ) : (
            "Swap"
          )}
        </Button>

        {/* Additional information to fill the space */}
        <div className="mt-10 space-y-4">
          <div className="bg-[#252547] rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Rate</span>
              <span className="text-white">
                {fromToken &&
                  toToken &&
                  (isLimitOrder
                    ? limitPrice
                    : fromAmount && toAmount
                    ? `1 ${fromToken.symbol} = ${(
                        Number(toAmount) / Number(fromAmount)
                      ).toFixed(6)} ${toToken.symbol}`
                    : "-")}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">
                {isLimitOrder ? "Order Type" : "Price Impact"}
              </span>
              <span
                className={isLimitOrder ? "text-blue-400" : "text-green-400"}
              >
                {isLimitOrder ? "Limit" : "~0.05%"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                {isLimitOrder ? "Execution" : "Minimum Received"}
              </span>
              <span className="text-white">
                {isLimitOrder
                  ? "When price reaches target"
                  : toAmount && toToken
                  ? `${(Number(toAmount) * 0.995).toFixed(6)} ${toToken.symbol}`
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
