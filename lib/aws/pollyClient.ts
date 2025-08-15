import https from "https";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import {
  PollyClient,
  SynthesizeSpeechCommand,
  SynthesizeSpeechCommandInput,
  type VoiceId,
} from "@aws-sdk/client-polly";

const region = process.env.AWS_REGION || "us-east-1";
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 64 });

let _polly: PollyClient | null = null;

/**
 * Singleton Polly client (keep-alive) for low latency.
 */
export function pollyClient(): PollyClient {
  if (_polly) return _polly;
  _polly = new PollyClient({
    region,
    requestHandler: new NodeHttpHandler({ httpsAgent }),
  });
  return _polly;
}

export interface SynthesizeOptions {
  voiceId?: VoiceId; // e.g., "Joanna"
  engine?: "neural" | "standard"; // default neural
  outputFormat?: "mp3" | "ogg_vorbis" | "pcm"; // audio container
  sampleRate?: string; // e.g., "22050" (Hz as string, Polly style)
  textType?: "text" | "ssml";
}

export interface PollySynthesisResult {
  audioBase64: string; // base64-encoded audio
  speechMarks: Array<any>; // viseme/word JSONL parsed into objects
  contentType: string | undefined; // e.g., audio/mpeg
  sampleRateHz?: number; // derived from options
}

/**
 * High-level helper: synthesize audio + viseme/word speech marks in parallel.
 */
export async function synthesizeWithVisemes(
  text: string,
  opts: SynthesizeOptions = {}
): Promise<PollySynthesisResult> {
  const client = pollyClient();
  const defaultVoice: VoiceId = "Joanna" as VoiceId;
  const voiceId: VoiceId = (opts.voiceId ?? defaultVoice) as VoiceId;
  const engine = opts.engine ?? "neural";
  const outputFormat = opts.outputFormat ?? "mp3";
  const sampleRate =
    opts.sampleRate ?? (outputFormat === "pcm" ? "16000" : "22050");
  const textType = opts.textType ?? "text";

  const audioParams: SynthesizeSpeechCommandInput = {
    Text: text,
    VoiceId: voiceId,
    Engine: engine,
    OutputFormat: outputFormat,
    SampleRate: sampleRate,
    TextType: textType,
  };

  const marksParams: SynthesizeSpeechCommandInput = {
    Text: text,
    VoiceId: voiceId,
    Engine: engine,
    OutputFormat: "json",
    SpeechMarkTypes: ["viseme", "word"],
    TextType: textType,
  };

  const [audioRes, marksRes] = await Promise.all([
    client.send(new SynthesizeSpeechCommand(audioParams)),
    client.send(new SynthesizeSpeechCommand(marksParams)),
  ]);

  const audioBytes = await audioRes.AudioStream?.transformToByteArray();
  const audioBase64 = Buffer.from(audioBytes || []).toString("base64");

  const marksText = await marksRes.AudioStream?.transformToString("utf-8");
  const speechMarks = (marksText || "")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean) as any[];

  const contentType = audioRes.ContentType;
  const sampleRateHz = Number(sampleRate);

  return { audioBase64, speechMarks, contentType, sampleRateHz };
}
