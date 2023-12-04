import { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from "./config";
import { auth } from "twitter-api-sdk";
import { read, write } from "./storage";
import { Token } from "./types";

export async function getToken(): Promise<Token> {
  const token = await read<Token>("token");
  if (!token) {
    throw new Error(
      `There's no access token, you need to login with "bun run login".`
    );
  }

  const authClient = new auth.OAuth2User({
    client_id: TWITTER_CLIENT_ID,
    client_secret: TWITTER_CLIENT_SECRET,
    callback: "http://127.0.0.1:3123",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    token,
  });

  console.log("Is token expired?", authClient.isAccessTokenExpired());
  authClient.generateAuthURL({
    code_challenge_method: "plain",
    code_challenge: "exodus.town",
    state: "exodus.town",
  });
  console.log("Refreshing access token...");
  const { token: newToken } = await authClient.refreshAccessToken();
  console.log("Done!");
  console.log("Saving new access token...");
  await write("token", newToken);
  console.log("Done!");
  return newToken;
}
