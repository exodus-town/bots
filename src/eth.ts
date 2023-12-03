import { PublicClient, createPublicClient, fallback, http } from "viem";
import { ALCHEMY_RPC_URL, INFURA_RPC_URL } from "./config";

export function getClient(): PublicClient {
  const client = createPublicClient({
    transport: fallback([http(ALCHEMY_RPC_URL), http(INFURA_RPC_URL)]),
  });
  return client;
}
