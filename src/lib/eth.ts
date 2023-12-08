import {
  PublicClient,
  createPublicClient,
  fallback,
  formatEther,
  formatUnits,
  http,
} from "viem";
import { ALCHEMY_RPC_URL, INFURA_RPC_URL } from "./config";
import { readContract } from "viem/actions";
import { erc20ABI } from "@exodus.town/contracts";

export function getClient(): PublicClient {
  const client = createPublicClient({
    transport: fallback([http(ALCHEMY_RPC_URL), http(INFURA_RPC_URL)]),
  });
  return client;
}

export async function getBalanceOf(
  token: string,
  owner: string,
  decimals = 18
): Promise<number> {
  const client = getClient();
  const balance = await readContract(client, {
    address: token as unknown as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [owner as unknown as `0x${string}`],
  });

  const formatted = formatUnits(balance, decimals);
  const parsed = parseInt(formatted);
  return parsed;
}
