import { Client, TextChannel } from "discord.js";
import { read, write } from "../lib/storage";
import { getAuctionSettledMessage, getBidMessage } from "../lib/message";
import {
  getBids,
  getLastSettledAuctionTokenId,
  getSettledAuction,
} from "../lib/graph";
import { DISCORD_CHANNEL_ID, DISCORD_TOKEN } from "../lib/config";
import { sleep } from "../lib/sleep";

const MAX_TIME = 10 * 60 * 1000; // 10 minutes
const SLEEP_TIME = 30 * 1000; // 30 seconds
const COOLDOWN = 1 * 1000; // 1 second

type DiscordData = {
  lastBidTimestamp: number | null;
  lastTokenId: number;
};

async function main() {
  const startTime = Date.now();

  console.log("startTime", startTime);
  console.log("DISCORD_TOKEN", DISCORD_TOKEN);
  console.log("DISCORD_CHANNEL_ID", DISCORD_CHANNEL_ID);

  const client = new Client({ intents: [] });
  console.log(`Logging in...`);
  await client.login(DISCORD_TOKEN);
  console.log(`Done!`);

  console.log(`Acquiring channel...`);
  const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
  console.log(`Done!`);

  if (channel instanceof TextChannel) {
    let elapsedTime = Date.now() - startTime;
    while (elapsedTime < MAX_TIME) {
      const timeLeft = MAX_TIME - elapsedTime;
      console.log(`Time left to run the bot: ${(timeLeft / 1000) | 0} seconds`);
      let lastBidTimestamp: number | null = null;
      let lastTokenId: number | null = null;
      console.log(`Fetching data from storage...`);
      const data = await read<DiscordData>("discord-last-bid");
      if (data) {
        console.log(`Done!`);
        lastBidTimestamp = data.lastBidTimestamp;
        lastTokenId = data.lastTokenId;
      } else {
        console.log(`Data not found, fetching latest data from indexer...`);
        const lastSettledAuctionTokenId = await getLastSettledAuctionTokenId();
        const bids = await getBids(lastSettledAuctionTokenId + 1);
        lastBidTimestamp = bids.length > 0 ? bids.pop()!.timestamp : null;
        lastTokenId = Number(lastSettledAuctionTokenId) + 1;
      }

      if (lastTokenId === null) {
        throw new Error(`Could not get last token id`);
      }

      console.log(`lastBidTimestamp:`, lastBidTimestamp);
      console.log(`lastTokenId:`, lastTokenId);

      const currentAuctionTokenId =
        Number(await getLastSettledAuctionTokenId()) + 1;
      console.log(`currentAuctionTokenId:`, currentAuctionTokenId);

      for (
        let tokenId = lastTokenId;
        tokenId <= currentAuctionTokenId;
        tokenId++
      ) {
        const bids = await getBids(tokenId.toString());
        console.log(`Bids for tokenId=${tokenId}:`, bids.length);
        const sinceLastTimestamp = bids.filter(
          (bid) =>
            lastBidTimestamp === null || bid.timestamp > lastBidTimestamp!
        );
        console.log(
          `Bids since lastBidTimestamp=${lastBidTimestamp}:`,
          sinceLastTimestamp.length
        );
        for (const bid of sinceLastTimestamp) {
          const message = await getBidMessage(bid);
          console.log(`Bid message:`, message);
          await channel.send(message);
          console.log(`Sent!`);
          lastBidTimestamp = bid.timestamp;
          await sleep(COOLDOWN);
        }

        if (tokenId < currentAuctionTokenId) {
          const settledAuction = await getSettledAuction(tokenId.toString());
          const message = await getAuctionSettledMessage(settledAuction);
          console.log(`Auction settled message:`, message);
          await channel.send(message);
          console.log(`Sent!`);
        }

        lastTokenId = tokenId;
      }
      console.log(`Saving auction data to storage...`);
      const auction = {
        lastBidTimestamp,
        lastTokenId,
      };
      await write("discord-last-bid", auction);
      console.log(`Done!`);

      if (timeLeft > SLEEP_TIME) {
        console.log(`Sleeping for ${(SLEEP_TIME / 1000) | 0} seconds`);
        await sleep(SLEEP_TIME);
      } else {
        console.log(`No more time left`);
      }

      elapsedTime = Date.now() - startTime;
    }
    console.log(`Exiting...`);
    process.exit(0);
  } else {
    throw new Error(`Invalid channel`);
  }
}

main().catch((error) => {
  console.error(error);
  console.log("Exit");
  process.exit(0);
});
