import { TwitterApi } from "twitter-api-v2";
import { SettledAuction, getLastSettledAuction } from "../lib/graph";
import { getName } from "../lib/peer";
import { getManaPrice, getTreasury } from "../lib/treasury";
import { read, write } from "../lib/storage";
import { format } from "../lib/format";
import { getToken } from "../lib/token";

async function winner() {
  console.log("Generating token...");
  const token = await getToken();

  const client = new TwitterApi(token.accessToken);

  const auction = await getLastSettledAuction();
  const lastAuction = await read<SettledAuction>("twitter-last-auction");

  if (!lastAuction) {
    await write("twitter-last-auction", auction);
    console.log(
      "There was no record of the previous auction, storing current auction as the latest"
    );
  } else {
    console.log("Token ID from last auction:", lastAuction!.tokenId);
    console.log("Token ID from current auction:", auction.tokenId);
    if (Number(auction.tokenId) > Number(lastAuction.tokenId)) {
      const [winner, price, treasury] = await Promise.all([
        getName(auction.winner),
        getManaPrice(),
        getTreasury(),
      ]);
      const text = `Auction Settled! 🎉\n\nParcel: ${auction.coords[0]},${
        auction.coords[1]
      }\nWinner: ${winner}\nBid: ${format(
        auction.amount
      )} MANA\nTreasury: ${format(treasury)} MANA ($${format(
        treasury * price,
        2
      )})`;
      console.log(`\n${text}\n`);
      const tweet = await client.v2.tweet(text);
      console.log("Tweet: ", tweet);
      console.log("Updating auction cache...");
      await write("twitter", auction);
      console.log("Updated auction cache!");
    } else {
      console.log(`Current auction still ongoing...`);
    }
  }
}

winner().catch((error) => console.error(error, (error as any).error));
