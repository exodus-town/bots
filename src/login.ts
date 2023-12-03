import future from "fp-future";
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from "./config";
import { auth } from "twitter-api-sdk";
import open from "open";
import { write } from "./storage";

async function login() {
  const code = future<string>();
  const server = Bun.serve({
    port: 3123,
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
  const authClient = new auth.OAuth2User({
    client_id: TWITTER_CLIENT_ID,
    client_secret: TWITTER_CLIENT_SECRET,
    callback: "http://127.0.0.1:3123",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  });
  const authUrl = authClient.generateAuthURL({
    code_challenge_method: "plain",
    code_challenge: "exodus.town",
    state: "exodus.town",
  });
  open(authUrl);
  const { token } = await authClient.requestAccessToken(await code);
  server.stop();
  await write("token", token);
}

login().catch(console.error);
