import { TwitterApi } from "twitter-api-v2";
import {
  SettledAuction,
  getLastSettledAuctionTokenId,
  getSettledAuction,
} from "../lib/graph";
import { read, write } from "../lib/storage";
import { getToken } from "../lib/token";
import { getAuctionSettledMessage } from "../lib/message";

async function main() {
  console.log("Generating token...");
  const token = await getToken();

  const client = new TwitterApi(token.accessToken);

  const tokenId = await getLastSettledAuctionTokenId();
  const auction = await getSettledAuction(tokenId);
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
      const text = await getAuctionSettledMessage(auction);
      console.log(`\n${text}\n`);
      const tweet = await client.v2.tweet(text);
      console.log("Tweet: ", tweet);
      console.log("Updating auction cache...");
      await write("twitter-last-auction", auction);
      console.log("Updated auction cache!");
    } else {
      console.log(`Current auction still ongoing...`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
