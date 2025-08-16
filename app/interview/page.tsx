"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
    <svg width={120} height={120} viewBox="0 0 80 80" className="avatar">
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

  const runAssistant = useCallback(
    (userText: string) => {
      // Cancel any ongoing model stream
      cancelStreamRef.current?.();
      setAssistantLive("");

      // Collect the final assistant text for message list
      let finalText = "";
      const chunker = sentenceChunker((sentence) => {
        // Polly TTS for each sentence chunk + visemes
        void enqueueTTS(sentence, "Joanna", onViseme);
      });

      streamBedrock(userText, {
        modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        onToken: (tok) => {
          setAssistantLive((prev) => prev + tok);
          finalText += tok;
          chunker.feed(tok);
        },
        onDone: () => {
          chunker.flush();
          if (finalText.trim()) {
            setMessages((m) => [
              ...m,
              { role: "assistant", text: finalText.trim() },
            ]);
          }
          setAssistantLive("");
        },
        onError: (e) => console.error("bedrock stream error", e),
      }).then(({ cancel }) => {
        cancelStreamRef.current = cancel;
      });
    },
    [onViseme]
  );

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

      // Kick off the interview immediately with Bedrock + Polly
      runAssistant(
        "Start the patient intake interview for a Canadian primary care walk-in clinic. Greet the patient briefly, then ask only the first, most relevant question to begin triage (keep it short)."
      );
    } catch (e) {
      console.error(e);
    }
  }, [listening, runAssistant]);

  const stopListening = useCallback(async () => {
    cancelStreamRef.current?.();
    await txRef.current?.stop();
    txRef.current = null;
    setListening(false);
    setPartial("");
  }, []);

  return (
    <div className="intake-page">
      <header className="header">
        <div className="title">
          <h1>Clinic Intake Assistant</h1>
          <p className="muted">
            Voice-powered pre-visit interview using Transcribe, Bedrock, and
            Polly.
          </p>
        </div>
        <div className={`status ${listening ? "on" : "off"}`}>
          <span className="dot" /> {listening ? "Listening" : "Idle"}
        </div>
      </header>

      <section className="intro">
        <Avatar mouthPath={mouth} />
        <div className="helper">
          <div className="lead">I’ll guide you through a quick intake.</div>
          <div>
            {listening ?
              "I’m listening… answer out loud."
            : "Press Start to begin."}
          </div>
          {partial && (
            <div className="partial">
              <strong>You:</strong> {partial}
            </div>
          )}
        </div>
      </section>

      <div className="controls">
        {!listening ?
          <button
            onClick={startListening}
            className="btn primary"
            type="button"
          >
            Start
          </button>
        : <button onClick={stopListening} className="btn danger" type="button">
            Stop
          </button>
        }
      </div>

      <section
        className="chat"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role === "user" ? "user" : "ai"}`}>
            {m.text}
          </div>
        ))}
        {assistantLive && (
          <div className="msg ai">
            {assistantLive}
            <span className="blink" aria-hidden>
              ▌
            </span>
          </div>
        )}
      </section>

      <style jsx>{`
        .intake-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }
        .title h1 {
          font-size: 1.4rem;
          margin: 0 0 4px;
        }
        .title .muted {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 600;
        }
        .status .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          display: inline-block;
        }
        .status.on {
          background: #ecfdf5;
          color: #065f46;
        }
        .status.on .dot {
          background: #10b981;
        }
        .status.off {
          background: #f1f5f9;
          color: #334155;
        }
        .status.off .dot {
          background: #94a3b8;
        }

        .intro {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          margin-bottom: 12px;
        }
        .avatar {
          border-radius: 9999px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }
        .helper .lead {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .helper .partial {
          margin-top: 6px;
          font-style: italic;
          color: #334155;
        }

        .controls {
          display: flex;
          gap: 10px;
          margin: 12px 0 16px;
        }
        .btn.danger {
          background: #ef4444;
          color: #fff;
          border: none;
        }
        .btn.danger:hover {
          background: #dc2626;
        }

        .chat {
          display: grid;
          gap: 10px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #fcfcfc;
        }
        .msg {
          padding: 12px 14px;
          border-radius: 12px;
          line-height: 1.5;
          border: 1px solid transparent;
          white-space: pre-wrap;
        }
        .msg.user {
          justify-self: end;
          background: #eef6ff;
          border-color: #cfe4ff;
        }
        .msg.ai {
          justify-self: start;
          background: #f7f7f7;
          border-color: #e9e9e9;
        }

        .blink {
          animation: blink 1s steps(2, start) infinite;
        }
        @keyframes blink {
          to {
            visibility: hidden;
          }
        }
      `}</style>
    </div>
  );
}
