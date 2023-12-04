import open from "open";
import future from "fp-future";
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from "../lib/config";
import { write } from "../lib/storage";
import { TwitterApi } from "twitter-api-v2";
import { Token } from "../lib/token";

const CALLBACK_PORT = 3123;
const CALLBACK_URL = `http://127.0.0.1:${CALLBACK_PORT}`;

async function login() {
  // initialize twitter client
  const client = new TwitterApi({
    clientId: TWITTER_CLIENT_ID,
    clientSecret: TWITTER_CLIENT_SECRET,
  });

  // receive callback
  const code = future<string>();
  const server = Bun.serve({
    port: CALLBACK_PORT,
    fetch(request) {
      const url = new URL(request.url);
      const param = url.searchParams.get("code");
      if (param) {
        code.resolve(param);
        return new Response("You can close this window");
      }
      return new Response("Invalid code");
    },
  });
  console.log(`Listening on port: ${server.port}`);

  const { url, codeVerifier } = client.generateOAuth2AuthLink(CALLBACK_URL, {
    scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  });
  open(url);

  // login
  const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2(
    { code: await code, codeVerifier, redirectUri: CALLBACK_URL }
  );

  // stop server
  server.stop();

  // store token
  const token: Token = { accessToken, refreshToken: refreshToken! };
  console.log("token", token);
  await write("twitter-token", token);

  // success!
  console.log("Login successful!");
  return token;
}

login().catch(console.error);
