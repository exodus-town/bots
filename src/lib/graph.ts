import { formatEther } from "viem";
import { SUBGRAPH_URL } from "./config";

export type SettledAuction = {
  winner: string;
  amount: number;
  tokenId: string;
};

export type Bid = {
  bidder: string;
  amount: number;
  tokenId: string;
  timestamp: number;
};

export async function request<T extends object>(query: string) {
  const resp = await fetch(SUBGRAPH_URL, {
    method: "post",
    body: JSON.stringify({
      query,
    }),
  });

  if (resp.ok) {
    const result = (await resp.json()) as unknown as {
      data: T;
    };

    return result.data;
  }

  throw new Error(`Error: ${await resp.text()}`);
}

export async function getLastSettledAuctionTokenId(): Promise<string> {
  const { auctionSettleds } = await request<{
    auctionSettleds: { tokenId: string }[];
  }>(`query {
    auctionSettleds(first: 1, orderBy: tokenId, orderDirection: desc) {
      tokenId
    }
  }`);
  if (auctionSettleds.length === 1) {
    return auctionSettleds[0].tokenId;
  }
  throw new Error(`Could not get last settled auction token id`);
}

export async function getSettledAuction(
  tokenId: string
): Promise<SettledAuction> {
  const { auctionSettleds } = await request<{
    auctionSettleds: { tokenId: string; winner: string; amount: string }[];
  }>(`query {
    auctionSettleds(where: { tokenId: "${tokenId}"}, orderBy: tokenId, orderDirection: desc) {
      tokenId
      winner
      amount
    }
  }`);

  if (auctionSettleds.length > 0) {
    const { tokenId, winner, amount } = auctionSettleds[0];
    const auction: SettledAuction = {
      tokenId: tokenId,
      winner: winner,
      amount: Number(formatEther(BigInt(amount))),
    };
    return auction;
  }

  throw new Error(`Could not get settled auction for tokenId=${tokenId}`);
}

export async function getBiddingWar(tokenId: string) {
  const { auctionBids, auctionExtendeds } = await request<{
    auctionBids: { sender: string }[];
    auctionExtendeds: { endTime: string }[];
  }>(`query {
    auctionBids(first: 1000, where: { tokenId: "${tokenId}" }, orderBy: blockNumber, orderDirection: desc) {
      sender
    }
    auctionExtendeds(first: 1000, where: { tokenId: "${tokenId}" }, orderBy: endTime, orderDirection: desc) {
      endTime
    }
  }`);

  const participants = auctionBids.reduce(
    (set, bid) => set.add(bid.sender),
    new Set<string>()
  );
  const totalParticipants = participants.size;
  const totalBids = auctionBids.length;
  const totalWarBids = auctionExtendeds.length;
  const totalWarTime =
    totalWarBids > 0
      ? Number(auctionExtendeds[0].endTime) -
        Number(auctionExtendeds[totalWarBids - 1].endTime) +
        300
      : 0;

  return { totalParticipants, totalBids, totalWarBids, totalWarTime };
}

export async function getBids(tokenId: string): Promise<Bid[]> {
  const { auctionBids } = await request<{
    auctionBids: { sender: string; value: string; blockTimestamp: string }[];
  }>(`query {
    auctionBids(first: 1000, where: { tokenId: "${tokenId}" }, orderBy: blockNumber, orderDirection: asc) {
      sender
      value
      blockTimestamp
    }
  }`);

  return auctionBids.map(({ sender, value, blockTimestamp }) => {
    return {
      bidder: sender,
      amount: Number(formatEther(BigInt(value))),
      timestamp: Number(blockTimestamp) * 1000,
      tokenId,
    };
  });
}

export async function getHighestBid(): Promise<number> {
  const { auctionBids } = await request<{
    auctionBids: { value: string }[];
  }>(`query {
    auctionBids(first: 1, orderBy: value, orderDirection: desc) {
      value
    }
  }`);
  const highestBid =
    auctionBids.length > 0
      ? Number(formatEther(BigInt(auctionBids[0].value)))
      : 0;
  return highestBid;
}

export async function getAuctionsWon(address: string): Promise<number> {
  const { auctionSettleds } = await request<{
    auctionSettleds: { id: string }[];
  }>(`query {
    auctionSettleds(first: 1000, where: { winner: "${address.toLowerCase()}" }) {
      id
    }
  }`);
  return auctionSettleds.length;
}
