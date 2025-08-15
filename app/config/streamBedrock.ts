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

export async function streamBedrock(
  prompt: string,
  opts: StreamBedrockOptions
): Promise<{ cancel: () => void }> {
  const controller = new AbortController();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  const res = await fetch("/api/bedrock/stream", {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt, modelId: opts.modelId }),
    signal: controller.signal,
  });

  if (!res.ok || !res.body) {
    const err = new Error(
      `Bedrock stream failed: ${res.status} ${res.statusText}`
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

        // SSE frames are separated by double newlines. We'll parse line-by-line.
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, idx).trimEnd();
          buffer = buffer.slice(idx + 1);

          if (!line) continue; // skip keep-alives

          if (line.startsWith("event:")) {
            // Example: event:done (we expect a following data: line but we gracefully handle either)
            const evt = line.slice(6).trim();
            if (evt === "done") {
              // Drain remaining lines
              opts.onDone?.();
              try {
                controller.abort();
              } catch {}
              return;
            }
            continue;
          }

          if (line.startsWith("data:")) {
            const payload = line.slice(5);
            // Our server streams raw token text as data: lines
            if (payload) opts.onToken(payload);
            continue;
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
