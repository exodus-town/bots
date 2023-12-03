import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  BUCKET_ACCESS_KEY_ID,
  BUCKET_NAME,
  BUCKET_SECRET_ACCESS_KEY,
  CLOUDFLARE_ACCOUNT_ID,
} from "./config";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: BUCKET_ACCESS_KEY_ID,
    secretAccessKey: BUCKET_SECRET_ACCESS_KEY,
  },
});

export async function exists(key: string) {
  const command = new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  try {
    await S3.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

export async function read<T>(key: string) {
  if (await exists(key)) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const obj = await S3.send(command);
    const body = await obj.Body?.transformToString("utf-8");
    if (body) {
      try {
        return JSON.parse(body) as T;
      } catch (error) {
        // skip
      }
    }
  }
  return null;
}

export async function write<T>(key: string, value: T) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(value),
    ContentType: "application/json",
  });
  await S3.send(command);
}
