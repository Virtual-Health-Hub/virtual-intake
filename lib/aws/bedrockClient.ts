import https from "https";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

/**
 * Region comes from env; fall back to us-east-1 to match your Cognito/AppSync setup.
 */
const region = process.env.AWS_REGION || "us-east-1";

/**
 * Keep-alive agent for low latency under load.
 */
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 64 });

let _bedrock: BedrockRuntimeClient | null = null;

/**
 * Singleton Bedrock Runtime client (reused across requests).
 */
export function bedrockClient(): BedrockRuntimeClient {
  if (_bedrock) return _bedrock;
  _bedrock = new BedrockRuntimeClient({
    region,
    requestHandler: new NodeHttpHandler({
      httpsAgent,
      requestTimeout: 30_000, // overall request timeout
      connectionTimeout: 2_000, // initial TCP/TLS connect timeout
    }),
  });
  return _bedrock;
}

/**
 * Invoke a Bedrock model with a JSON body and return the raw JSON string.
 * Use for non-streaming calls (e.g., small tools or classification).
 */
export async function invokeBedrockJSON<T = unknown>(params: {
  modelId: string;
  body: unknown; // already shaped for the model family (Anthropic/OpenAI/etc.)
  accept?: string; // default application/json
  contentType?: string; // default application/json
}): Promise<T> {
  const client = bedrockClient();
  const cmd = new InvokeModelCommand({
    modelId: params.modelId,
    accept: params.accept ?? "application/json",
    contentType: params.contentType ?? "application/json",
    body: JSON.stringify(params.body),
  });
  const res = await client.send(cmd);
  const text = await res.body?.transformToString("utf-8");
  return text ? (JSON.parse(text) as T) : ({} as T);
}

/**
 * Stream tokens from a Bedrock model (Claude, etc.).
 * Parses Bedrock streaming events and calls onToken for each text delta.
 * Calls onDone once the stream completes.
 */
export async function streamBedrock(params: {
  modelId: string;
  body: unknown; // shaped for the target model family
  onToken: (token: string) => void;
  onDone?: () => void;
  onError?: (err: unknown) => void;
  signal?: AbortSignal; // allow caller to cancel
}): Promise<void> {
  const client = bedrockClient();
  try {
    const cmd = new InvokeModelWithResponseStreamCommand({
      modelId: params.modelId,
      accept: "application/json",
      contentType: "application/json",
      body: JSON.stringify(params.body),
    });
    const res = await client.send(cmd, { abortSignal: params.signal as any });

    for await (const event of res.body ?? []) {
      const bytes = event.chunk?.bytes;
      if (!bytes) continue;
      const jsonStr = new TextDecoder().decode(bytes);
      try {
        const json = JSON.parse(jsonStr);
        // Handle common Bedrock streaming shapes (Anthropic on Bedrock):
        // 1) { delta: { text: "..." } }
        // 2) { type: 'content_block_delta', delta: { type: 'text_delta', text: '...' } }
        // 3) { output_text: '...' } (final fallback in some impls)
        let token = "";
        if (json?.delta?.text) token = json.delta.text;
        else if (
          json?.type === "content_block_delta" &&
          json?.delta?.type === "text_delta" &&
          json?.delta?.text
        )
          token = json.delta.text;
        else if (json?.output_text) token = json.output_text;
        // Some providers may send arrays; try to pick first text element
        else if (
          Array.isArray(json?.output) &&
          json.output[0]?.content?.[0]?.text
        )
          token = json.output[0].content[0].text;
        if (token) params.onToken(token);
      } catch {
        // ignore malformed chunks
      }
    }
    params.onDone?.();
  } catch (err) {
    // If aborted, surface as done; otherwise report
    if ((err as any)?.name === "AbortError") params.onDone?.();
    else params.onError?.(err);
  }
}

/**
 * Convenience builder for Anthropic (Claude) JSON bodies on Bedrock.
 * Example:
 *   const body = anthropicBody([{ role: 'user', content: 'Hello' }], 512, 0.2);
 */
export function anthropicBody(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  maxTokens = 512,
  temperature = 0.2
) {
  return {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    temperature,
    messages,
  };
}
