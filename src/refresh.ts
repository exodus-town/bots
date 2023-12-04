import { getToken } from "./token";

async function refresh() {
  const token = await getToken();
  console.log("New token", token);
}

refresh().catch((error) => console.error(error, error.code));
