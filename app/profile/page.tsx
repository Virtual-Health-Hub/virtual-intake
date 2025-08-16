"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

export default function ProfilePage() {
  // Account identity
  const [userId, setUserId] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  // Attributes
  const [email, setEmail] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthdate] = useState("");

  const { user } = useAuthenticator((ctx) => [ctx.user]);

  useEffect(() => {
    if (!user) return;
    setUserId(user.userId ?? "");
    setUsername(user.username ?? "");
    // Best-effort email: Amplify UI exposes loginId when username is email
    const loginId = (user as any)?.signInDetails?.loginId ?? "";
    setEmail(String(loginId));
  }, [user]);

  const displayName = useMemo(() => {
    const n = `${givenName} ${familyName}`.trim();
    return n || email || username || "User";
  }, [givenName, familyName, email, username]);

  return (
    <div className="profile-page">
      <header className="top">
        <div className="avatar" aria-hidden>
          <span>{initialsFrom(displayName)}</span>
        </div>
        <div className="id">
          <h1>Profile</h1>
          <div className="muted">
            User ID: <span className="mono">{userId || "—"}</span>
          </div>
        </div>
      </header>

      {/* Account basics */}
      <section className="card">
        <h2>Account</h2>
        <div className="grid two">
          <div>
            <label className="label">Username</label>
            <div className="value mono">{username || "—"}</div>
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              disabled
              readOnly
              placeholder="you@example.com"
            />
          </div>
        </div>
      </section>

      {/* Personal details */}
      <section className="card">
        <h2>Personal Details</h2>
        <div className="grid two">
          <div>
            <label className="label">First name</label>
            <input
              className="input"
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Last name</label>
            <input
              className="input"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="label">Birthdate</label>
            <input
              className="input"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Address</label>
            <textarea
              className="input"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Compliance note */}
      <section className="card subtle">
        <p className="hint">
          We store only what&#39;s necessary for your pre-visit intake. You can
          request an export or deletion from the Settings page.
        </p>
      </section>

      <style>{`
        .profile-page { display:flex; flex-direction: column; gap: 18px; padding: 32px; box-sizing: border-box; }
        .top { display:flex; align-items:center; gap:14px; background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:14px; box-shadow: 0 8px 24px rgba(2,6,23,0.04); }
        .avatar { width:60px; height:60px; border-radius:14px; background:#2563eb; color:white; display:grid; place-items:center; font-weight:800; font-size:18px; }
        .id .muted { color:#64748b; }
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

        .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:14px; box-shadow: 0 8px 24px rgba(2,6,23,0.04); }
        .card.subtle { background:#f8fafc; }
        h1 { margin:0; font-size:22px; }
        h2 { margin:0 0 8px; font-size:16px; }

        .grid.two { display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
        .row { display:flex; align-items:center; }
        .row.gap { gap:10px; }
        .row.end { justify-content:flex-end; }

        .label { display:block; font-weight:600; margin-bottom:6px; }
        .input { width:100%; padding:10px; border:1px solid #e5e7eb; border-radius:10px; background:#fff; }
        textarea.input { resize: vertical; }
        .value { background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:10px; }
        .hint { color:#64748b; font-size:13px; }
        .btn { padding:10px 14px; border-radius:10px; font-weight:600; border:1px solid #e5e7eb; background:#fff; }
        .btn.primary { background:#2563eb; color:#fff; border-color:#2563eb; }

        @media (max-width: 760px) { .grid.two { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
