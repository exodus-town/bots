import { readContract } from "viem/actions";
import { getClient } from "./eth";
import { erc20ABI } from "@exodus.town/contracts";
import {
  EXODUS_DAO_CONTRACT_ADDRESS,
  MANA_TOKEN_CONTRACT_ADDRESS,
} from "./config";
import { formatEther } from "viem";

export async function getManaPrice() {
  const resp = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=decentraland&vs_currencies=usd`
  );

  if (resp.ok) {
    const data = await resp.json();
    return (data as any)?.decentraland?.usd || null;
  }

  return null;
}

export async function getTreasury() {
  const client = getClient();
  const balance = await readContract(client, {
    address: MANA_TOKEN_CONTRACT_ADDRESS,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [EXODUS_DAO_CONTRACT_ADDRESS],
  });

  const formatted = formatEther(balance);
  const parsed = parseInt(formatted);
  return parsed;
}
