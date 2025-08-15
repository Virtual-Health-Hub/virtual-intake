import { NextRequest } from "next/server";
import https from "https";
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NodeHttpHandler } from "@smithy/node-http-handler";

const agent = new https.Agent({ keepAlive: true, maxSockets: 64 });
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  requestHandler: new NodeHttpHandler({ httpsAgent: agent }),
});

export async function POST(req: NextRequest) {
  const { prompt, modelId = "anthropic.claude-3-5-sonnet-20240620-v1:0" } =
    await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const cmd = new InvokeModelWithResponseStreamCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 512,
          temperature: 0.2,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const res = await bedrock.send(cmd);
      for await (const evt of res.body!) {
        const chunk = evt.chunk?.bytes;
        if (!chunk) continue;
        const json = JSON.parse(new TextDecoder().decode(chunk));
        const token = json.delta?.text ?? json.output_text ?? "";
        if (token) controller.enqueue(enc.encode(`data:${token}\n\n`));
      }
      controller.enqueue(enc.encode("event:done\ndata:1\n\n"));
      controller.close();
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
