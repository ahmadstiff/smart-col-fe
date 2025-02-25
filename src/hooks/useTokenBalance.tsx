"use client";

import { useAccount, useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import { formatUnits } from "viem/utils";
import { useState, useEffect } from "react";
import { mockUsdc, mockWeth,mockWbtc } from "@/constants/addresses";

export const USDCBalance = () => {
  const { address } = useAccount();
  const [balance, setBalance] = useState("0");

  const { data, isLoading } = useReadContract({
    abi: erc20Abi,
    address: mockUsdc,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (data) {
      const formattedBalance = parseFloat(formatUnits(BigInt(data), 6)).toFixed(
        2
      );
      setBalance(formattedBalance);
    }
  }, [data]);

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <p className="text-sm text-gray-100">{balance}</p>
      )}
    </div>
  );
}
export const WbtcBalance = () => {
  const { address } = useAccount();
  const [balance, setBalance] = useState("0");

  const { data, isLoading } = useReadContract({
    abi: erc20Abi,
    address: mockWbtc,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (data) {
      const formattedBalance = parseFloat(formatUnits(BigInt(data), 6)).toFixed(
        2
      );
      setBalance(formattedBalance);
    }
  }, [data]);

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <p className="text-sm text-gray-100">{balance}</p>
      )}
    </div>
  );
}
export const WethBalance = () => {
  const { address } = useAccount();
  const [balance, setBalance] = useState("0");

  const { data, isLoading } = useReadContract({
    abi: erc20Abi,
    address: mockWeth,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (data) {
      const formattedBalance = parseFloat(formatUnits(BigInt(data), 6)).toFixed(
        2
      );
      setBalance(formattedBalance);
    }
  }, [data]);

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <p className="text-sm text-gray-100">{balance}</p>
      )}
    </div>
  );
}
