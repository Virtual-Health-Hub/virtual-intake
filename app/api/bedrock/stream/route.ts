import { NextRequest } from "next/server";
import https from "https";
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NodeHttpHandler } from "@smithy/node-http-handler";

const agent = new https.Agent({ keepAlive: true, maxSockets: 64 });
const bedrock = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || process.env.AWS_REGION || "us-east-1",
  requestHandler: new NodeHttpHandler({ httpsAgent: agent }),
});

const DEFAULT_MODEL_ID =
  process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20240620-v1:0";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "BadRequest", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const {
    prompt,
    modelId = DEFAULT_MODEL_ID,
    maxTokens = 512,
    temperature = 0.2,
  } = body || {};

  if (typeof prompt !== "string" || !prompt.trim()) {
    return Response.json(
      { error: "BadRequest", message: "'prompt' is required" },
      { status: 400 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        const cmd = new InvokeModelWithResponseStreamCommand({
          modelId,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: maxTokens,
            temperature,
            messages: [
              { role: "user", content: [{ type: "text", text: prompt }] },
            ],
          }),
        });

        const res = await bedrock.send(cmd);
        if (!res.body) {
          controller.enqueue(
            enc.encode(
              `event:error\ndata:${JSON.stringify({
                error: "NoStream",
                message: "No response body returned by Bedrock",
              })}\n\n`
            )
          );
          controller.enqueue(enc.encode("event:done\ndata:1\n\n"));
          controller.close();
          return;
        }

        for await (const evt of res.body) {
          const chunk = evt.chunk?.bytes;
          if (!chunk) continue;
          const decoded = new TextDecoder().decode(chunk);
          let json: any;
          try {
            json = JSON.parse(decoded);
          } catch {
            // Not JSON? Skip.
            continue;
          }

          // Anthropic on Bedrock streams multiple event shapes; handle the common ones
          let token = "";
          if (json?.delta?.text) {
            token = json.delta.text; // content_block_delta with text
          } else if (json?.output_text) {
            token = json.output_text; // final output convenience field
          } else if (
            json?.type === "content_block_delta" &&
            json?.delta?.type === "text_delta" &&
            typeof json?.delta?.text === "string"
          ) {
            token = json.delta.text;
          }

          if (token) {
            controller.enqueue(enc.encode(`data:${token}\n\n`));
          }
        }

        controller.enqueue(enc.encode("event:done\ndata:1\n\n"));
        controller.close();
      } catch (e: any) {
        const payload = {
          error: e?.name || "Error",
          message: e?.message || "Failed to stream from Bedrock",
          status: e?.$metadata?.httpStatusCode || 500,
        };
        controller.enqueue(
          enc.encode(`event:error\ndata:${JSON.stringify(payload)}\n\n`)
        );
        controller.enqueue(enc.encode("event:done\ndata:1\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
