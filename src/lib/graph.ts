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
      sender
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
        auctionBids: { sender: string }[];
        auctionExtendeds: { endTime: string }[];
      };
    };
    const participants = result.data.auctionBids.reduce(
      (set, bid) => set.add(bid.sender),
      new Set<string>()
    );
    const totalParticipants = participants.size;
    const totalBids = result.data.auctionBids.length;
    const totalWarBids = result.data.auctionExtendeds.length;
    const totalWarTime =
      totalWarBids > 0
        ? Number(result.data.auctionExtendeds[0].endTime) -
          Number(result.data.auctionExtendeds[totalWarBids - 1].endTime) +
          300
        : 0;

    return { totalParticipants, totalBids, totalWarBids, totalWarTime };
  }

  throw new Error(`Error: ${await resp.text()}`);
}
