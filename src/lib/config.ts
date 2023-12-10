import dotenv from "dotenv";
dotenv.config();

export const SUBGRAPH_URL = process.env.SUBGRAPH_URL!;
export const PEER_URL = "https://peer.decentraland.org";
export const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
export const BUCKET_NAME = process.env.BUCKET_NAME!;
export const BUCKET_ACCESS_KEY_ID = process.env.BUCKET_ACCESS_KEY_ID!;
export const BUCKET_SECRET_ACCESS_KEY = process.env.BUCKET_SECRET_ACCESS_KEY!;
export const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL!;
export const INFURA_RPC_URL = process.env.INFURA_RPC_URL!;
export const MANA_TOKEN_CONTRACT_ADDRESS =
  "0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4";
export const TOWN_TOKEN_CONTRACT_ADDRESS =
  "0xAE38E6d941Fb364c142CC90df285CEEF85713467";
export const EXODUS_DAO_CONTRACT_ADDRESS =
  "0x7E96f5242D1256E56E15b46EB2Fa1b1152dF5923";
export const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
export const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!;
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
export const DISCORD_CHANNEL_ID = "1141005876740759612";
