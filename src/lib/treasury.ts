import { getBalanceOf } from "./eth";
import {
  EXODUS_DAO_CONTRACT_ADDRESS,
  MANA_TOKEN_CONTRACT_ADDRESS,
} from "./config";

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
  return getBalanceOf(MANA_TOKEN_CONTRACT_ADDRESS, EXODUS_DAO_CONTRACT_ADDRESS);
}
