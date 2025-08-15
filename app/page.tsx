"use client";

import Link from "next/link";
import React from "react";

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>Start your pre-visit interview online</h1>
            <p className="lead">
              Save time at the clinic. Our secure AI assistant guides you
              through a short, adaptive interview and required forms—so your
              provider is prepared before you arrive.
            </p>
            <div className="cta-row">
              <Link href="/chat" className="btn btn-primary">
                Start AI Interview
              </Link>
              <Link href="/forms" className="btn btn-ghost">
                Fill Required Forms
              </Link>
            </div>
            <ul className="trust">
              <li>Encrypted in transit & at rest</li>
              <li>Consent-first workflow</li>
              <li>Clinician-ready summary</li>
            </ul>
          </div>
          <div className="hero-card">
            <div className="preview">
              <div className="avatar">
                <div className="head" />
                <div className="mouth" />
              </div>
              <div className="chat">
                <div className="bubble ai">
                  Hello! I'll help collect your pre-visit details. What brings
                  you in today?
                </div>
                <div className="bubble user">
                  I've had a persistent cough for a week.
                </div>
                <div className="bubble ai">
                  Thanks. Any fever, chest pain, or shortness of breath?
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features-grid">
          <div className="card">
            <h3>Adaptive Questions</h3>
            <p>
              The assistant follows up only where needed and highlights red
              flags for the care team.
            </p>
          </div>
          <div className="card">
            <h3>Required Forms</h3>
            <p>
              PHQ-9, GAD-7, demographics, and consents—organized and ready for
              review.
            </p>
          </div>
          <div className="card">
            <h3>Voice + Text</h3>
            <p>
              Speak naturally from your browser or type—audio is summarized and
              stored with short retention.
            </p>
          </div>
          <div className="card">
            <h3>Clinic-Ready Summary</h3>
            <p>
              Concise handoff including symptoms, timeline, meds/allergies, and
              risk notes.
            </p>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="cta">
        <div className="cta-inner">
          <h2>Be ready before you arrive</h2>
          <p>Start now. It usually takes 5–7 minutes.</p>
          <div className="cta-row">
            <Link href="/chat" className="btn btn-primary">
              Start AI Interview
            </Link>
            <Link href="/forms" className="btn btn-ghost">
              Complete Forms
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .landing { display:grid; gap: 48px; }
        .hero { padding: 28px 0 8px; }
        .hero-grid { display:grid; grid-template-columns: 1.05fr 0.95fr; gap: 24px; align-items: center; }
        .hero-copy h1 { font-size: 36px; margin: 0 0 10px; line-height: 1.15; }
        .lead { color:#334155; font-size: 16px; margin: 8px 0 16px; }
        .cta-row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin: 12px 0 10px; }
        .trust { display:flex; gap:16px; padding:0; margin: 10px 0 0; list-style:none; color:#64748b; font-size: 13px; }

        .hero-card { background:#fff; border:1px solid #e5e7eb; border-radius: 16px; padding: 16px; box-shadow: 0 10px 30px rgba(2,6,23,0.06); }
        .preview { display:grid; grid-template-columns: 120px 1fr; gap: 14px; align-items:flex-start; }
        .avatar { width:120px; height:120px; display:grid; place-items:center; background: linear-gradient(180deg, #f8fafc, #eef2ff); border-radius: 12px; border:1px solid #e5e7eb; }
        .head { width:72px; height:72px; border-radius:50%; background:#fde68a; border:3px solid #f59e0b; }
        .mouth { width:28px; height:6px; background:#ef4444; border-radius:3px; margin-top:-10px; }
        .chat { display:grid; gap:8px; }
        .bubble { padding:10px 12px; border-radius:12px; font-size:14px; line-height:1.4; }
        .bubble.ai { background:#f7f7f7; border:1px solid #e9e9e9; }
        .bubble.user { background:#eef6ff; border:1px solid #cfe4ff; justify-self:start; }

        .features { padding: 4px 0 8px; }
        .features-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:16px; min-height: 120px; box-shadow: 0 8px 24px rgba(2,6,23,0.04); }
        .card h3 { margin:0 0 6px; font-size:16px; }
        .card p { margin:0; color:#475569; font-size:14px; }

        .cta { background:#fff; border:1px solid #e5e7eb; border-radius:16px; padding: 20px; }
        .cta-inner { text-align:center; }
        .cta h2 { margin:0 0 6px; font-size:24px; }
        .cta p { margin:0 0 10px; color:#475569; }

        .btn { display:inline-flex; align-items:center; justify-content:center; padding:10px 14px; border-radius:10px; font-weight:600; text-decoration:none; border:1px solid transparent; }
        .btn-primary { background:#2563eb; color:#fff; }
        .btn-primary:hover { filter: brightness(0.95); }
        .btn-ghost { background:#fff; color:#111827; border-color:#e5e7eb; }
        .btn-ghost:hover { background:#f9fafb; }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .features-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
