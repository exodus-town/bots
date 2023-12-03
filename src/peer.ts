import { PEER_URL } from "./config";

export async function getName(address: string): Promise<string> {
  const url = `${PEER_URL}/lambdas/profile/${address}`;
  const resp = await fetch(url);
  if (resp.ok) {
    const data: { avatars: { name: string }[] } = (await resp.json()) as any;
    if (data.avatars.length > 0) {
      return data.avatars[0].name;
    }
  }

  return address.slice(0, 6);
}
