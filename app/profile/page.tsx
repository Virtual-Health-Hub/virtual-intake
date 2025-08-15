"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  fetchAuthSession,
  updateUserAttributes,
  sendUserAttributeVerificationCode,
  confirmUserAttribute,
} from "aws-amplify/auth";

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
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthdate] = useState("");

  // Email verify flow
  const [emailPending, setEmailPending] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  const displayName = useMemo(() => {
    const n = `${givenName} ${familyName}`.trim();
    return n || email || username || "User";
  }, [givenName, familyName, email, username]);

  // Load current user + attributes from ID token
  useEffect(() => {
    (async () => {
      try {
        const me = await getCurrentUser();
        setUserId(me.userId);
        setUsername(me.username);
        const session = await fetchAuthSession();
        const p: any = session.tokens?.idToken?.payload || {};
        setEmail(String(p.email || ""));
        setEmailVerified(Boolean(p.email_verified));
        setGivenName(String(p.given_name || ""));
        setFamilyName(String(p.family_name || ""));
        setPhone(String(p.phone_number || ""));
        setAddress(String(p.address || ""));
        setBirthdate(String(p.birthdate || ""));
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    })();
  }, []);

  async function saveProfile() {
    try {
      // Update non-email attributes. Email often requires a separate verification flow.
      await updateUserAttributes({
        userAttributes: {
          given_name: givenName || undefined,
          family_name: familyName || undefined,
          phone_number: phone || undefined,
          address: address || undefined,
          birthdate: birthdate || undefined,
        },
      });
      alert("Profile updated.");
    } catch (e) {
      console.error(e);
      alert("Update failed. Please try again.");
    }
  }

  async function startEmailChange() {
    if (!email) return alert("Please enter an email.");
    try {
      await updateUserAttributes({ userAttributes: { email } });
      await sendUserAttributeVerificationCode({ userAttributeKey: "email" });
      setEmailPending(true);
      alert("Verification code sent to your email.");
    } catch (e) {
      console.error(e);
      alert("Could not start email verification.");
    }
  }

  async function verifyEmail() {
    if (!verifyCode)
      return alert("Enter the verification code that was emailed to you.");
    try {
      await confirmUserAttribute({
        userAttributeKey: "email",
        confirmationCode: verifyCode,
      });
      setEmailPending(false);
      setVerifyCode("");
      setEmailVerified(true);
      alert("Email verified.");
    } catch (e) {
      console.error(e);
      alert("Verification failed. Check the code and try again.");
    }
  }

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
            <div className="row gap">
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <button className="btn" onClick={startEmailChange}>
                Update
              </button>
            </div>
            <div className="hint">
              Status:{" "}
              {emailVerified
                ? "Verified"
                : emailPending
                ? "Pending verification"
                : "Unverified"}
            </div>
            {emailPending && (
              <div className="row gap" style={{ marginTop: 8 }}>
                <input
                  className="input"
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="Enter verification code"
                />
                <button className="btn primary" onClick={verifyEmail}>
                  Verify
                </button>
              </div>
            )}
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
        <div className="row end">
          <button className="btn primary" onClick={saveProfile}>
            Save changes
          </button>
        </div>
      </section>

      {/* Compliance note */}
      <section className="card subtle">
        <p className="hint">
          We store only what's necessary for your pre-visit intake. You can
          request an export or deletion from the Settings page.
        </p>
      </section>

      <style>{`
        .profile-page { display:grid; gap: 18px; width: 100%; }
        .top { display:flex; align-items:center; gap:14px; }
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
