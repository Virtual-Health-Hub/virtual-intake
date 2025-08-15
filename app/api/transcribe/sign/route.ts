import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const region = process.env.AWS_REGION || "us-east-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
const sessionToken = process.env.AWS_SESSION_TOKEN;

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("language") || "en-US";
  const host = `transcribestreaming.${region}.amazonaws.com:8443`;
  const amzDate =
    new Date()
      .toISOString()
      .replace(/[:-]|\.\d{3}/g, "")
      .slice(0, 15) + "Z";
  const date = amzDate.slice(0, 8);
  const scope = `${date}/${region}/transcribe/aws4_request`;

  const qs = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKeyId}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": "120",
    "X-Amz-SignedHeaders": "host",
    "language-code": lang,
    "media-encoding": "pcm",
    "sample-rate": "16000",
  });
  if (sessionToken) qs.set("X-Amz-Security-Token", sessionToken);

  const canonical = [
    "GET",
    "/stream-transcription-websocket",
    qs.toString(),
    `host:${host}\n`,
    "host",
    crypto.createHash("sha256").update("", "utf8").digest("hex"),
  ].join("\n");

  const strToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    crypto.createHash("sha256").update(canonical, "utf8").digest("hex"),
  ].join("\n");

  const hmac = (k: crypto.BinaryLike, d: string) =>
    crypto.createHmac("sha256", k).update(d, "utf8").digest();
  const kDate = hmac("AWS4" + secretAccessKey, date);
  const kRegion = hmac(kDate, region);
  const kSvc = hmac(kRegion, "transcribe");
  const kSign = hmac(kSvc, "aws4_request");
  const signature = crypto
    .createHmac("sha256", kSign)
    .update(strToSign, "utf8")
    .digest("hex");

  const url = `wss://${host}/stream-transcription-websocket?${qs.toString()}&X-Amz-Signature=${signature}`;
  return NextResponse.json({ url });
}
