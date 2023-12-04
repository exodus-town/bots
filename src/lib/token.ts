import { TwitterApi } from "twitter-api-v2";
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from "./config";
import { read, write } from "./storage";

export type Token = {
  refreshToken: string;
  accessToken: string;
};

export async function getToken(): Promise<Token> {
  console.log("Fetching token from store...");
  const token = await read<Token>("twitter-token");
  if (!token) {
    throw new Error(
      `There's no access token, you need to login with "bun run login".`
    );
  }
  console.log("Done!");
  console.log("Refreshing token...");
  const client = new TwitterApi({
    clientId: TWITTER_CLIENT_ID,
    clientSecret: TWITTER_CLIENT_SECRET,
  });
  const { accessToken, refreshToken } = await client.refreshOAuth2Token(
    token.refreshToken
  );
  const newToken: Token = { accessToken, refreshToken: refreshToken! };
  console.log("Done!");
  console.log("Saving new access token...");
  await write("twitter-token", newToken);
  console.log("Done!");
  return newToken;
}
