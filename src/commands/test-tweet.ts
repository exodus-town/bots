import { getLastSettledAuctionTokenId, getSettledAuction } from "../lib/graph";
import { getAuctionSettledMessage } from "../lib/message";

async function showTweet() {
  const tokenId = await getLastSettledAuctionTokenId();
  const auciton = await getSettledAuction(tokenId);
  const tweet = await getAuctionSettledMessage(auciton);
  console.log(tweet);
}

showTweet().catch((error) => {
  console.error(error);
  process.exit(1);
});
