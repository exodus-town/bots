import { getToken } from "../lib/token";

async function refresh() {
  const token = await getToken();
  console.log("New token", token);
}

refresh().catch((error) => {
  console.error(error);
  process.exit(1);
});
