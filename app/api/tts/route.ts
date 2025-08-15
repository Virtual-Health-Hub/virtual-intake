import { NextRequest, NextResponse } from "next/server";
import https from "https";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { NodeHttpHandler } from "@smithy/node-http-handler";

const agent = new https.Agent({ keepAlive: true, maxSockets: 64 });
const polly = new PollyClient({
  region: process.env.AWS_REGION || "us-east-1",
  requestHandler: new NodeHttpHandler({ httpsAgent: agent }),
});

export async function POST(req: NextRequest) {
  const { text, voiceId = "Joanna" } = await req.json();

  const audioCmd = new SynthesizeSpeechCommand({
    Text: text,
    VoiceId: voiceId,
    Engine: "neural",
    OutputFormat: "mp3",
    SampleRate: "22050",
  });
  const marksCmd = new SynthesizeSpeechCommand({
    Text: text,
    VoiceId: voiceId,
    Engine: "neural",
    OutputFormat: "json",
    SpeechMarkTypes: ["viseme", "word"],
  });

  const [aRes, mRes] = await Promise.all([
    polly.send(audioCmd),
    polly.send(marksCmd),
  ]);
  const audioBytes = await aRes.AudioStream?.transformToByteArray();
  const marksStr = await mRes.AudioStream?.transformToString();
  const speechMarks =
    marksStr
      ?.trim()
      .split("\n")
      .map((l) => JSON.parse(l)) ?? [];

  return NextResponse.json({
    audioBase64: Buffer.from(audioBytes || []).toString("base64"),
    speechMarks,
  });
}
