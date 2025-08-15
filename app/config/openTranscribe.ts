export type OpenTranscribeOptions = {
  /** BCP-47 code; defaults to en-US */
  language?: string;
  /** Called for interim partials */
  onPartial?: (text: string) => void;
  /** Called when Transcribe marks a segment final */
  onFinal: (text: string) => void;
  /** Called on any websocket or media error */
  onError?: (err: unknown) => void;
};

export type OpenTranscribeHandle = {
  /** Stop streaming, close WS, and release mic */
  stop: () => Promise<void>;
  /** Access to the live WebSocket (if connected) */
  socket: WebSocket | null;
  /** Access to the AudioContext (if created) */
  audioContext: AudioContext | null;
};

/**
 * Open a live microphone stream and send PCM16 frames to Amazon Transcribe
 * via a presigned WebSocket URL from `/api/transcribe/sign`.
 *
 * Requires:
 *   - `public/pcm-worker.js` registered as `pcm-processor` (AudioWorklet)
 */
export async function openTranscribe(
  opts: OpenTranscribeOptions
): Promise<OpenTranscribeHandle> {
  const language = opts.language ?? "en-US";

  // 1) Ask backend for a presigned Transcribe WS URL
  let url: string;
  try {
    const res = await fetch(
      `/api/transcribe/sign?language=${encodeURIComponent(language)}`
    );
    if (!res.ok)
      throw new Error(`sign failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    url = json.url;
  } catch (e) {
    opts.onError?.(e);
    throw e;
  }

  // 2) Open mic @ 16kHz
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: false,
    },
  });

  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)({ sampleRate: 16000 });
  await audioContext.audioWorklet.addModule("/pcm-worker.js");
  const source = audioContext.createMediaStreamSource(stream);
  const worklet = new AudioWorkletNode(audioContext, "pcm-processor");

  // 3) Open Transcribe WS
  const ws = new WebSocket(url);
  ws.binaryType = "arraybuffer";

  let closed = false;

  const safeClose = async () => {
    if (closed) return;
    closed = true;
    try {
      ws.close();
    } catch {}
    try {
      worklet.port.close();
    } catch {}
    try {
      source.disconnect();
    } catch {}
    try {
      audioContext.close();
    } catch {}
    try {
      stream.getTracks().forEach((t) => t.stop());
    } catch {}
  };

  // 4) Pump PCM frames into WS as they arrive from the worklet
  worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(e.data);
    }
  };

  // 5) Connect the nodes (no need to hear yourself; omit destination)
  source.connect(worklet);

  // 6) Handle WS events
  ws.onopen = () => {
    // Ready to stream; AudioWorklet already sending frames
  };

  ws.onerror = (evt) => {
    opts.onError?.(new Error(`Transcribe WS error`));
    void safeClose();
  };

  ws.onclose = () => {
    void safeClose();
  };

  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data as string);
      const result = msg?.Transcript?.Results?.[0];
      if (!result) return;
      const text: string | undefined = result.Alternatives?.[0]?.Transcript;
      if (!text) return;
      if (result.IsPartial) {
        opts.onPartial?.(text);
      } else {
        // Finalized segment
        opts.onFinal(text.trim());
      }
    } catch (e) {
      // Ignore non-JSON keepalives
    }
  };

  return {
    stop: safeClose,
    socket: ws,
    audioContext,
  };
}
