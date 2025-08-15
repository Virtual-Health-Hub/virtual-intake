"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  openTranscribe,
  OpenTranscribeHandle,
} from "@/app/config/openTranscribe";
import { streamBedrock } from "@/app/config/streamBedrock";
import { sentenceChunker } from "@/app/config/sentenceChunker";
import { enqueueTTS, clearQueue } from "@/lib/audioQueue";

// --- Simple viseme → mouth path mapper ---
const VISEME_TO_SHAPE: Record<string, string> = {
  p: "M12,36 C25,38 55,38 68,36 C55,38 25,38 12,36Z", // M
  b: "M12,36 C25,38 55,38 68,36 C55,38 25,38 12,36Z",
  m: "M12,36 C25,38 55,38 68,36 C55,38 25,38 12,36Z",
  f: "M10,33 C20,37 60,37 70,33 L70,36 C60,44 20,44 10,36Z", // F/V
  v: "M10,33 C20,37 60,37 70,33 L70,36 C60,44 20,44 10,36Z",
  aa: "M10,30 C20,45 60,45 70,30 C60,60 20,60 10,30Z",
  ae: "M10,30 C20,45 60,45 70,30 C60,60 20,60 10,30Z",
  ah: "M10,30 C20,45 60,45 70,30 C60,60 20,60 10,30Z",
  eh: "M10,35 C20,40 60,40 70,35 C60,42 20,42 10,35Z",
  ey: "M10,35 C20,40 60,40 70,35 C60,42 20,42 10,35Z",
  ih: "M25,38 C30,40 50,40 55,38 C50,44 30,44 25,38Z",
  iy: "M25,38 C30,40 50,40 55,38 C50,44 30,44 25,38Z",
  ow: "M30,30 C30,50 50,50 50,30 C50,10 30,10 30,30Z",
  ao: "M30,30 C30,50 50,50 50,30 C50,10 30,10 30,30Z",
  uh: "M32,28 C32,48 48,48 48,28 C48,18 32,18 32,28Z",
  uw: "M32,28 C32,48 48,48 48,28 C48,18 32,18 32,28Z",
  w: "M22,32 C22,50 58,50 58,32 C58,20 22,20 22,32Z",
  r: "M22,32 C22,50 58,50 58,32 C58,20 22,20 22,32Z",
  l: "M10,34 C20,41 60,41 70,34 C60,48 20,48 10,34Z",
  sil: "M12,36 C26,36 54,36 68,36", // REST
};

function mouthPathForViseme(v: string) {
  return VISEME_TO_SHAPE[v] ?? VISEME_TO_SHAPE["sil"]; // default REST
}

function Avatar({ mouthPath }: { mouthPath: string }) {
  return (
    <svg
      width={120}
      height={120}
      viewBox="0 0 80 80"
      className="rounded-full shadow"
    >
      <circle cx="40" cy="40" r="36" fill="#f3ebe2" />
      <circle cx="28" cy="32" r="2.5" fill="#333" />
      <circle cx="52" cy="32" r="2.5" fill="#333" />
      <path d={mouthPath} fill="#d44" stroke="#922" strokeWidth={1.4} />
    </svg>
  );
}

type ChatMsg = { role: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState("");
  const [assistantLive, setAssistantLive] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [mouth, setMouth] = useState(mouthPathForViseme("sil"));
  const txRef = useRef<OpenTranscribeHandle | null>(null);
  const cancelStreamRef = useRef<null | (() => void)>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelStreamRef.current?.();
      txRef.current?.stop();
      clearQueue();
    };
  }, []);

  const onViseme = useCallback((v: string) => {
    setMouth(mouthPathForViseme(v));
  }, []);

  const startListening = useCallback(async () => {
    if (listening) return;
    setAssistantLive("");
    setPartial("");
    try {
      const handle = await openTranscribe({
        language: "en-US",
        onPartial: (t) => setPartial(t),
        onFinal: (t) => {
          setPartial("");
          setMessages((m) => [...m, { role: "user", text: t }]);
          runAssistant(t);
        },
        onError: (e) => console.error("transcribe error", e),
      });
      txRef.current = handle;
      setListening(true);
    } catch (e) {
      console.error(e);
    }
  }, [listening]);

  const stopListening = useCallback(async () => {
    if (!listening) return;
    cancelStreamRef.current?.();
    await txRef.current?.stop();
    txRef.current = null;
    setListening(false);
  }, [listening]);

  const runAssistant = useCallback(
    (userText: string) => {
      // Cancel any ongoing stream
      cancelStreamRef.current?.();
      setAssistantLive("");

      const chunker = sentenceChunker((sentence) => {
        void enqueueTTS(sentence, "Joanna", onViseme);
      });

      streamBedrock(userText, {
        modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        onToken: (tok) => {
          setAssistantLive((prev) => prev + tok);
          chunker.feed(tok);
        },
        onDone: () => {
          chunker.flush();
          setMessages((m) => [
            ...m,
            { role: "assistant", text: ((prev) => prev)("") },
          ]);
          // The above trick doesn't capture assistantLive; so use functional state read below
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              text: (
                document.getElementById("assistant-live")?.textContent || ""
              ).trim(),
            },
          ]);
          setAssistantLive("");
        },
        onError: (e) => console.error("bedrock stream error", e),
      }).then(({ cancel }) => {
        cancelStreamRef.current = cancel;
      });
    },
    [onViseme]
  );

  // Render
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        Clinic Intake Assistant
      </h1>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Avatar mouthPath={mouth} />
        <div style={{ fontSize: 14, color: "#555" }}>
          <div style={{ fontWeight: 600 }}>
            Hi! I can record your pre-visit details.
          </div>
          <div>
            {listening ? "Listening…" : "Click Start to begin speaking."}
          </div>
          {partial && (
            <div style={{ marginTop: 6, fontStyle: "italic", color: "#333" }}>
              You: {partial}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {!listening ? (
          <button onClick={startListening} style={btnStyle}>
            Start
          </button>
        ) : (
          <button onClick={stopListening} style={btnStopStyle}>
            Stop
          </button>
        )}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={m.role === "user" ? userBubble : aiBubble}>
            {m.text}
          </div>
        ))}
        {assistantLive && (
          <div id="assistant-live" style={aiBubble}>
            {assistantLive}
            <span className="blink">▌</span>
          </div>
        )}
      </div>

      <style>{`
        .blink { animation: blink 1s steps(2, start) infinite; }
        @keyframes blink { to { visibility: hidden; } }
        button { cursor: pointer; }
      `}</style>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #e2e2e2",
  background: "#0ea5e9",
  color: "white",
  fontWeight: 600,
};

const btnStopStyle: React.CSSProperties = {
  ...btnStyle,
  background: "#ef4444",
};

const baseBubble: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  lineHeight: 1.5,
};

const userBubble: React.CSSProperties = {
  ...baseBubble,
  background: "#eef6ff",
  border: "1px solid #cfe4ff",
  alignSelf: "end",
};

const aiBubble: React.CSSProperties = {
  ...baseBubble,
  background: "#f7f7f7",
  border: "1px solid #e9e9e9",
};
