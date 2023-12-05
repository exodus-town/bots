import { formatCurrency, formatTime } from "./format";
import { SettledAuction, getBiddingWar } from "./graph";
import { getName } from "./peer";
import { getManaPrice, getTreasury } from "./treasury";

export async function getTweet(auction: SettledAuction) {
  const [
    winner,
    price,
    treasury,
    { totalBids, totalParticipants, totalWarBids, totalWarTime },
  ] = await Promise.all([
    getName(auction.winner),
    getManaPrice(),
    getTreasury(),
    getBiddingWar(auction.tokenId),
  ]);
  const biddingWar =
    totalWarBids > 3
      ? `, with a bidding battle of ${totalWarBids} bids during the last ${formatTime(
          totalWarTime
        )} 🔥!`
      : `.`;
  const text = `Auction Settled! 🎉\n\nParcel ${auction.coords[0]},${
    auction.coords[1]
  } has been claimed by ${winner} with a winning bid of ${formatCurrency(
    auction.amount
  )} MANA!\n\nThe auction saw a total of ${totalBids} ${
    totalBids === 1 ? "bid" : "bids"
  }${
    totalParticipants > 1
      ? ` coming from ${totalParticipants} participants`
      : ``
  }${biddingWar}\n\nThis activity has boosted the DAO treasury to ${formatCurrency(
    treasury
  )} MANA ($${formatCurrency(treasury * price, 2)}) 💰`;
  return text;
}
