import { formatEther } from "viem";
import { toCoords } from "./coords";
import { SUBGRAPH_URL } from "./config";

export type SettledAuction = {
  winner: string;
  amount: number;
  tokenId: string;
  coords: [number, number];
};

export async function getLastSettledAuction(): Promise<SettledAuction> {
  const query = `query {
    auctionSettleds(first: 1, orderBy: tokenId, orderDirection: desc) {
      tokenId
      winner
      amount
    }
  }`;

  const resp = await fetch(SUBGRAPH_URL, {
    method: "post",
    body: JSON.stringify({
      query,
    }),
  });

  if (resp.ok) {
    const result: {
      data: {
        auctionSettleds: { tokenId: string; winner: string; amount: string }[];
      };
    } = await resp.json();

    if (result.data.auctionSettleds.length > 0) {
      const data = result.data.auctionSettleds[0];
      const auction: SettledAuction = {
        tokenId: data.tokenId,
        winner: data.winner,
        amount: Number(formatEther(BigInt(data.amount))),
        coords: toCoords(data.tokenId),
      };
      return auction;
    }
  }

  throw new Error(`Error: ${await resp.text()}`);
}
