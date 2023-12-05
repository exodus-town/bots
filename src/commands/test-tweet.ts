import { getLastSettledAuction } from "../lib/graph";
import { getTweet } from "../lib/twitter";

async function showTweet() {
  const auciton = await getLastSettledAuction();
  const tweet = await getTweet(auciton);
  console.log(tweet);
}

showTweet().catch((error) => {
  console.error(error);
  process.exit(1);
});
