import dotenv from "dotenv";
dotenv.config();

export const SUBGRAPH_URL = process.env.SUBGRAPH_URL!;
export const PEER_URL = process.env.PEER_URL!;
export const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
export const BUCKET_NAME = process.env.BUCKET_NAME!;
export const BUCKET_ACCESS_KEY_ID = process.env.BUCKET_ACCESS_KEY_ID!;
export const BUCKET_SECRET_ACCESS_KEY = process.env.BUCKET_SECRET_ACCESS_KEY!;
export const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL!;
export const INFURA_RPC_URL = process.env.INFURA_RPC_URL!;
export const MANA_TOKEN_CONTRACT_ADDRESS = process.env
  .MANA_TOKEN_CONTRACT_ADDRESS! as `0x${string}`;
export const EXODUS_DAO_CONTRACT_ADDRESS = process.env
  .EXODUS_DAO_CONTRACT_ADDRESS! as `0x${string}`;
export const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
export const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!;
