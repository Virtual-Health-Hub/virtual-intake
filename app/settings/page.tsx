"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut, fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

// --- Simple local preference keys ---
const LS_KEYS = {
  voiceId: "pref.voiceId",
  language: "pref.language",
  captions: "pref.captions",
  reducedMotion: "pref.reducedMotion",
  notifEmail: "pref.notifEmail",
  notifPush: "pref.notifPush",
  dataRetentionDays: "pref.dataRetentionDays",
} as const;

const VOICES = [
  { id: "Joanna", label: "Joanna (US English)" },
  { id: "Matthew", label: "Matthew (US English)" },
  { id: "Kendra", label: "Kendra (US English)" },
  { id: "Justin", label: "Justin (US English)" },
  { id: "Amy", label: "Amy (British English)" },
  { id: "Brian", label: "Brian (British English)" },
  { id: "Emma", label: "Emma (British English)" },
];

const LANGS = [
  { id: "en-US", label: "English (United States)" },
  { id: "en-GB", label: "English (United Kingdom)" },
];

export default function SettingsPage() {
  // Account
  const [userEmail, setUserEmail] = useState<string>("");
  const [userSub, setUserSub] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const me = await getCurrentUser();
        setUserSub(me.userId);
        // Pull email from tokens if available
        const session = await fetchAuthSession();
        const email = (session.tokens?.idToken?.payload?.email as string) || "";
        setUserEmail(email);
      } catch {}
    })();
  }, []);

  // Preferences (load from localStorage)
  const [voiceId, setVoiceId] = useState<string>(VOICES[0].id);
  const [language, setLanguage] = useState<string>(LANGS[0].id);
  const [captions, setCaptions] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [notifEmail, setNotifEmail] = useState<boolean>(true);
  const [notifPush, setNotifPush] = useState<boolean>(false);
  const [dataRetentionDays, setDataRetentionDays] = useState<number>(14);

  useEffect(() => {
    try {
      const v = localStorage.getItem(LS_KEYS.voiceId);
      if (v) setVoiceId(v);
      const l = localStorage.getItem(LS_KEYS.language);
      if (l) setLanguage(l);
      const c = localStorage.getItem(LS_KEYS.captions);
      if (c) setCaptions(c === "1");
      const rm = localStorage.getItem(LS_KEYS.reducedMotion);
      if (rm) setReducedMotion(rm === "1");
      const ne = localStorage.getItem(LS_KEYS.notifEmail);
      if (ne) setNotifEmail(ne === "1");
      const np = localStorage.getItem(LS_KEYS.notifPush);
      if (np) setNotifPush(np === "1");
      const dr = localStorage.getItem(LS_KEYS.dataRetentionDays);
      if (dr) setDataRetentionDays(parseInt(dr, 10));
    } catch {}
  }, []);

  const savePrefs = () => {
    localStorage.setItem(LS_KEYS.voiceId, voiceId);
    localStorage.setItem(LS_KEYS.language, language);
    localStorage.setItem(LS_KEYS.captions, captions ? "1" : "0");
    localStorage.setItem(LS_KEYS.reducedMotion, reducedMotion ? "1" : "0");
    localStorage.setItem(LS_KEYS.notifEmail, notifEmail ? "1" : "0");
    localStorage.setItem(LS_KEYS.notifPush, notifPush ? "1" : "0");
    localStorage.setItem(LS_KEYS.dataRetentionDays, String(dataRetentionDays));
    alert("Preferences saved");
  };

  // --- Voice preview using /api/tts ---
  const [previewing, setPreviewing] = useState(false);
  const preview = async () => {
    try {
      setPreviewing(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "This is your selected voice for the virtual intake assistant.",
          voiceId,
        }),
      });
      const { audioBase64 } = await res.json();
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      await audio.play();
    } catch (e) {
      console.error(e);
      alert("Voice preview failed.");
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <div className="container settings-page">
      <h1>Settings</h1>

      {/* Account */}
      <section className="card">
        <header>
          <h2>Account</h2>
        </header>
        <div className="grid two">
          <div>
            <label className="label">Email</label>
            <div className="value">{userEmail || "—"}</div>
          </div>
          <div>
            <label className="label">User ID</label>
            <div className="value mono">{userSub || "—"}</div>
          </div>
        </div>
        <div className="row end">
          <button className="btn ghost" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </section>

      {/* Preferences */}
      <section className="card">
        <header>
          <h2>App Preferences</h2>
        </header>
        <div className="grid two">
          <div>
            <label htmlFor="voice" className="label">
              Assistant Voice
            </label>
            <select
              id="voice"
              className="input"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
            >
              {VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <div className="row gap">
              <button className="btn" onClick={preview} disabled={previewing}>
                {previewing ? "Previewing…" : "Preview voice"}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="language" className="label">
              Language
            </label>
            <select
              id="language"
              className="input"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid two">
          <div className="check">
            <input
              id="captions"
              type="checkbox"
              checked={captions}
              onChange={(e) => setCaptions(e.target.checked)}
            />
            <label htmlFor="captions">Show captions during playback</label>
          </div>
          <div className="check">
            <input
              id="reducedMotion"
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
            />
            <label htmlFor="reducedMotion">Reduce motion/animations</label>
          </div>
        </div>

        <div className="row end">
          <button className="btn primary" onClick={savePrefs}>
            Save preferences
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="card">
        <header>
          <h2>Notifications</h2>
        </header>
        <div className="grid two">
          <div className="check">
            <input
              id="notifEmail"
              type="checkbox"
              checked={notifEmail}
              onChange={(e) => setNotifEmail(e.target.checked)}
            />
            <label htmlFor="notifEmail">
              Email reminders (appointments & forms)
            </label>
          </div>
          <div className="check">
            <input
              id="notifPush"
              type="checkbox"
              checked={notifPush}
              onChange={(e) => setNotifPush(e.target.checked)}
            />
            <label htmlFor="notifPush">Push notifications</label>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="card">
        <header>
          <h2>Privacy & Data</h2>
        </header>
        <div className="grid two">
          <div>
            <label htmlFor="retention" className="label">
              Transcript retention (days)
            </label>
            <input
              id="retention"
              type="number"
              min={0}
              max={90}
              className="input"
              value={dataRetentionDays}
              onChange={(e) =>
                setDataRetentionDays(parseInt(e.target.value || "0", 10))
              }
            />
            <p className="hint">
              Shorter is more private. 0 keeps only structured summaries.
            </p>
          </div>
          <div>
            <label className="label">Data export</label>
            <div className="row gap">
              <button
                className="btn ghost"
                onClick={() =>
                  alert("We will implement export to FHIR JSON / PDF next.")
                }
              >
                Export my data
              </button>
              <button
                className="btn ghost"
                onClick={() => alert("We will implement delete request next.")}
              >
                Request deletion
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="card danger">
        <header>
          <h2>Danger Zone</h2>
        </header>
        <p className="hint">
          Deleting your account removes your profile and interview history. This
          action cannot be undone.
        </p>
        <button
          className="btn danger"
          onClick={() =>
            alert("Account deletion flow will be implemented here.")
          }
        >
          Delete my account
        </button>
      </section>

      <style>{`
        .settings-page { display:grid; gap: 18px; }
        h1 { font-size: 22px; margin: 0 0 8px; }
        h2 { font-size: 16px; margin: 0; }
        .card { background:#fff; border:1px solid #e5e7eb; border-radius: 14px; padding: 14px; box-shadow: 0 8px 24px rgba(2,6,23,0.04); }
        .card.danger { border-color:#fecaca; }
        .settings-page .card > header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; }
        .grid.two { display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .row { display:flex; align-items:center; }
        .row.end { justify-content:flex-end; }
        .row.gap { gap: 10px; }
        .label { display:block; font-weight:600; margin-bottom:6px; }
        .value { background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:10px; }
        .value.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .input { width:100%; padding:10px; border:1px solid #e5e7eb; border-radius:10px; background:#fff; }
        .check { display:flex; align-items:center; gap:8px; }
        .hint { color:#64748b; font-size: 13px; margin-top: 6px; }
        .btn { padding:10px 14px; border-radius:10px; font-weight:600; border:1px solid #e5e7eb; background:#fff; }
        .btn.primary { background:#4338ca; color:#fff; border-color:#4338ca; }
        .btn.ghost { background:#fff; }
        .btn.danger { background:#ef4444; color:#fff; border-color:#ef4444; }
        @media (max-width: 760px) { .grid.two { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
