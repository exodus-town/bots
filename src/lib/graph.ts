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
    const result = (await resp.json()) as unknown as {
      data: {
        auctionSettleds: { tokenId: string; winner: string; amount: string }[];
      };
    };

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

export async function getBiddingWar(tokenId: string) {
  const query = `query {
    auctionBids(first: 1000, where: { tokenId: "${tokenId}" }, orderBy: blockNumber, orderDirection: desc) {
      id
    }
    auctionExtendeds(first: 1000, where: { tokenId: "${tokenId}" }, orderBy: endTime, orderDirection: desc) {
      endTime
    }
  }`;

  const resp = await fetch(SUBGRAPH_URL, {
    method: "post",
    body: JSON.stringify({
      query,
    }),
  });

  if (resp.ok) {
    const result = (await resp.json()) as unknown as {
      data: {
        auctionBids: { id: string }[];
        auctionExtendeds: { endTime: string }[];
      };
    };

    const totalBids = result.data.auctionBids.length;
    const totalExtends = result.data.auctionExtendeds.length;
    const totalWarTime =
      totalExtends > 0
        ? Number(result.data.auctionExtendeds[0].endTime) -
          Number(result.data.auctionExtendeds[totalExtends - 1].endTime) +
          300
        : 0;
    const totalWarBids = totalExtends > 0 ? totalExtends + 1 : 0;

    return { totalBids, totalWarBids, totalWarTime };
  }

  throw new Error(`Error: ${await resp.text()}`);
}
