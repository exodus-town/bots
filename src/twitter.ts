import { Client as Twitter, auth } from "twitter-api-sdk";
import { SettledAuction, getLastSettledAuction } from "./graph";
import { getName } from "./peer";
import { getManaPrice, getTreasury } from "./treasury";
import { read, write } from "./storage";
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from "./config";

export type Token = {
  refresh_token?: string;
  access_token?: string;
  token_type?: string;
  expires_at?: number;
  scope?: string;
};

async function winner() {
  const token = await read<Token>("token");
  if (!token) {
    console.error(
      `There's no access token, you need to login with "bun run login".`
    );
    return;
  }

  const authClient = new auth.OAuth2User({
    client_id: TWITTER_CLIENT_ID,
    client_secret: TWITTER_CLIENT_SECRET,
    callback: "http://127.0.0.1:3123",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    token,
  });
  const client = new Twitter(authClient);

  const auction = await getLastSettledAuction();
  const lastAuction = await read<SettledAuction>("twitter");

  if (!lastAuction) {
    await write("twitter", auction);
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
      }\nWinner: ${winner}\nBid: ${
        auction.amount
      } MANA\n\nExodusDAO Treasury: ${treasury.toLocaleString(
        "en"
      )} MANA ($${Number((treasury * price).toFixed(2)).toLocaleString("en")})`;
      console.log(text);
      // const tweet = await client.tweets.createTweet({
      //   text,
      // });
      // console.log("tweet", tweet);
      await write("twitter", auction);
    } else {
      console.log(`Current auction still ongoing...`);
    }
  }
}

winner().catch(console.error);
