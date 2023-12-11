import { TOWN_TOKEN_CONTRACT_ADDRESS } from "./config";
import { toCoords } from "./coords";
import { getBalanceOf } from "./eth";
import { formatCurrency, formatTime } from "./format";
import {
  Bid,
  SettledAuction,
  getAuctionsWon,
  getBiddingWar,
  getHighestBid,
} from "./graph";
import { getName } from "./peer";
import { getManaPrice, getTreasury } from "./treasury";

export async function getAuctionSettledMessage(auction: SettledAuction) {
  const [
    winner,
    price,
    treasury,
    balance,
    record,
    { totalBids, totalParticipants, totalWarBids, totalWarTime },
  ] = await Promise.all([
    getName(auction.winner),
    getManaPrice(),
    getTreasury(),
    getAuctionsWon(auction.winner),
    getHighestBid(),
    getBiddingWar(auction.tokenId),
  ]);

  const [x, y] = toCoords(auction.tokenId);
  const isRecord = auction.amount > record;
  const hasBattle = totalWarBids > 3;
  const biddingWar = hasBattle
    ? `, with a bidding battle of ${totalWarBids} bids during the last ${formatTime(
        totalWarTime
      )} 🔥!`
    : `.`;

  const treasuryMessage = hasBattle
    ? ""
    : `\n\nThis activity has boosted the DAO treasury to ${formatCurrency(
        treasury
      )} MANA ($${formatCurrency(treasury * price, 2)}) 💰`;
  const text = `Auction Settled! 🎉\n\nParcel ${x},${y} has been claimed by ${winner} with a winning bid of ${formatCurrency(
    auction.amount
  )} MANA${
    isRecord ? ", this is a new record 🔥" : ""
  }!\n\nCongratulations on winning your ${balance}${
    balance === 1 ? "st" : balance === 2 ? "nd" : balance === 3 ? "rd" : "th"
  } parcel!\n\nThe auction saw a total of ${totalBids} ${
    totalBids === 1 ? "bid" : "bids"
  }${
    totalParticipants > 1
      ? ` coming from ${totalParticipants} participants`
      : ``
  }${biddingWar}${treasuryMessage}`;
  return text;
}

export async function getBidMessage(bid: Bid) {
  const [bidder, balance, record] = await Promise.all([
    getName(bid.bidder),
    getBalanceOf(TOWN_TOKEN_CONTRACT_ADDRESS, bid.bidder, 0),
    getHighestBid(),
  ]);
  const [x, y] = toCoords(bid.tokenId);
  const isRecord = bid.amount > record;
  return `Parcel ${x},${y} got a bid of ${bid.amount} MANA by ${bidder}${
    isRecord
      ? ", this is a new record! 🔥"
      : balance > 0
      ? `, who already owns ${balance} ${balance === 1 ? "parcel" : "parcels"}`
      : ``
  }.`;
}
