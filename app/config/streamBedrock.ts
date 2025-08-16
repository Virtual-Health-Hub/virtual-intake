/**
 * Client-side helper to stream Bedrock tokens from our Next.js API route
 * `/api/bedrock/stream` which returns Server-Sent Events (SSE).
 *
 * Usage:
 *   const { cancel } = await streamBedrock(
 *     "Hello there",
 *     {
 *       modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
 *       onToken: (t) => console.log(t),
 *       onDone: () => console.log("done"),
 *       onError: (e) => console.error(e),
 *     }
 *   );
 *   // cancel(); // to abort
 */

export type StreamBedrockOptions = {
  modelId?: string;
  onToken: (token: string) => void;
  onDone?: () => void;
  onError?: (err: unknown) => void;
  /** Additional headers if needed (e.g., auth). */
  headers?: Record<string, string>;
};

export const DEFAULT_BEDROCK_MODEL_ID = "openai.gpt-oss-20b-1:0";

export async function streamBedrock(
  prompt: string,
  opts: StreamBedrockOptions
): Promise<{ cancel: () => void }> {
  const controller = new AbortController();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  const modelId = opts.modelId ?? DEFAULT_BEDROCK_MODEL_ID;

  const res = await fetch("/api/bedrock/stream", {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt, modelId }),
    signal: controller.signal,
  });

  if (!res.ok || !res.body) {
    let errorText = "";
    try {
      errorText = await res.text();
    } catch {}
    const err = new Error(
      `Bedrock stream failed: ${res.status} ${res.statusText}${errorText ? ` - ${errorText}` : ""}`
    );
    opts.onError?.(err);
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  (async () => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE frames separated by double newlines (\n\n or \r\n\r\n)
        let delimiterIndex: number;
        while (
          (delimiterIndex = buffer.indexOf("\n\n")) !== -1 ||
          (delimiterIndex = buffer.indexOf("\r\n\r\n")) !== -1
        ) {
          const rawEvent = buffer.slice(0, delimiterIndex);
          buffer = buffer.slice(
            delimiterIndex + (buffer[delimiterIndex] === "\r" ? 4 : 2)
          );

          if (!rawEvent.trim()) continue; // skip empty frames (keep-alives)

          const lines = rawEvent.split(/\r?\n/);
          let eventType = "";
          let dataLines: string[] = [];

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5));
            }
          }

          const data = dataLines.join("\n");

          if (eventType === "done") {
            opts.onDone?.();
            try {
              controller.abort();
            } catch {}
            return;
          } else if (data) {
            opts.onToken(data);
          }
        }
      }
      // End of stream
      opts.onDone?.();
    } catch (e) {
      // If aborted, surface as done; otherwise report
      if ((e as any)?.name === "AbortError") {
        opts.onDone?.();
      } else {
        opts.onError?.(e);
      }
    } finally {
      try {
        controller.abort();
      } catch {}
    }
  })();

  return { cancel: () => controller.abort() };
}
