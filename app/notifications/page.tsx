"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// Local storage keys (aligned with Settings)
const LS = {
  notifEmail: "pref.notifEmail",
  notifPush: "pref.notifPush",
};

// Notification types
export type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  createdAt: string; // ISO
  kind: "system" | "forms" | "appointment" | "message";
  href?: string; // where to go if clicked
};

// Mock seed if inbox is empty
const SEED: NotificationItem[] = [
  {
    id: "n1",
    title: "Welcome to Virtual Health Hub",
    body: "You can complete your pre-visit intake online to save time at the clinic.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    kind: "system",
    href: "/",
  },
  {
    id: "n2",
    title: "Forms requested",
    body: "Please complete PHQ-9 and demographic forms before your visit.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    kind: "forms",
    href: "/forms",
  },
  {
    id: "n3",
    title: "Message from Intake Assistant",
    body: "Your interview summary is ready for review.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    kind: "message",
    href: "/chat",
  },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationsPage() {
  const [inbox, setInbox] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [emailOn, setEmailOn] = useState<boolean>(true);
  const [pushOn, setPushOn] = useState<boolean>(false);

  // Load prefs and seed inbox on first mount
  useEffect(() => {
    try {
      const ne = localStorage.getItem(LS.notifEmail);
      if (ne) setEmailOn(ne === "1");
      const np = localStorage.getItem(LS.notifPush);
      if (np) setPushOn(np === "1");
    } catch {}

    setInbox((prev) => {
      if (prev.length) return prev;
      return SEED;
    });
  }, []);

  const unreadCount = useMemo(
    () => inbox.filter((n) => !n.read).length,
    [inbox]
  );
  const shown = useMemo(
    () => inbox.filter((n) => (filter === "unread" ? !n.read : true)),
    [inbox, filter]
  );

  function markAllRead() {
    setInbox((list) => list.map((n) => ({ ...n, read: true })));
  }

  function clearAll() {
    if (confirm("Clear all notifications?")) setInbox([]);
  }

  function toggleRead(id: string) {
    setInbox((list) =>
      list.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  }

  function removeItem(id: string) {
    setInbox((list) => list.filter((n) => n.id !== id));
  }

  function simulateNew() {
    const id = Math.random().toString(36).slice(2);
    const kinds: NotificationItem["kind"][] = [
      "system",
      "forms",
      "appointment",
      "message",
    ];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const item: NotificationItem = {
      id,
      title: kind === "appointment" ? "Appointment reminder" : "New update",
      body:
        kind === "appointment"
          ? "You have an appointment in 48 hours."
          : "There is a new intake update.",
      read: false,
      createdAt: new Date().toISOString(),
      kind,
      href: kind === "forms" ? "/forms" : kind === "message" ? "/chat" : "/",
    };
    setInbox((list) => [item, ...list]);
  }

  useEffect(() => {
    // Persist inbox to localStorage for demo continuity
    try {
      localStorage.setItem("notifications.inbox", JSON.stringify(inbox));
    } catch {}
  }, [inbox]);

  useEffect(() => {
    // Restore inbox if present
    try {
      const raw = localStorage.getItem("notifications.inbox");
      if (raw) {
        const parsed = JSON.parse(raw) as NotificationItem[];
        if (Array.isArray(parsed) && parsed.length) setInbox(parsed);
      }
    } catch {}
  }, []);

  return (
    <div className="notifications-page">
      <header className="hdr">
        <div>
          <h1>Notifications</h1>
          <div className="muted">{unreadCount} unread</div>
        </div>
        <div className="row gap">
          <button
            className={`tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`tab ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread
          </button>
          <div className="sep" />
          <button className="btn" onClick={markAllRead} disabled={!unreadCount}>
            Mark all read
          </button>
          <button
            className="btn ghost"
            onClick={clearAll}
            disabled={!inbox.length}
          >
            Clear all
          </button>
          <button className="btn ghost" onClick={simulateNew}>
            Simulate new
          </button>
        </div>
      </header>

      <section className="prefs card">
        <div className="grid two">
          <div className="check">
            <input
              id="prefEmail"
              type="checkbox"
              checked={emailOn}
              onChange={(e) => {
                setEmailOn(e.target.checked);
                try {
                  localStorage.setItem(
                    LS.notifEmail,
                    e.target.checked ? "1" : "0"
                  );
                } catch {}
              }}
            />
            <label htmlFor="prefEmail">Email notifications</label>
          </div>
          <div className="check">
            <input
              id="prefPush"
              type="checkbox"
              checked={pushOn}
              onChange={(e) => {
                setPushOn(e.target.checked);
                try {
                  localStorage.setItem(
                    LS.notifPush,
                    e.target.checked ? "1" : "0"
                  );
                } catch {}
              }}
            />
            <label htmlFor="prefPush">Push notifications</label>
          </div>
        </div>
        <div className="hint">
          Manage detailed preferences in <Link href="/settings">Settings</Link>.
        </div>
      </section>

      <section className="list">
        {shown.length === 0 ? (
          <div className="empty card">
            No notifications {filter === "unread" ? "to review." : "yet."}
          </div>
        ) : (
          shown.map((n) => (
            <article
              key={n.id}
              className={`item card ${n.read ? "read" : "unread"}`}
            >
              <div className={`dot ${n.read ? "off" : "on"}`} aria-hidden />
              <div className="main">
                <div className="row space">
                  <div className="row gap">
                    <span className={`pill ${n.kind}`}>{n.kind}</span>
                    <h3 className="title">{n.title}</h3>
                  </div>
                  <div className="time">{timeAgo(n.createdAt)}</div>
                </div>
                {n.body && <p className="body">{n.body}</p>}
                <div className="row gap">
                  {n.href && (
                    <Link className="btn small" href={n.href}>
                      Open
                    </Link>
                  )}
                  <button
                    className="btn small"
                    onClick={() => toggleRead(n.id)}
                  >
                    {n.read ? "Mark unread" : "Mark read"}
                  </button>
                  <button
                    className="btn small ghost"
                    onClick={() => removeItem(n.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <style>{`
        .notifications-page { display:grid; gap: 16px; padding: 32px; width: 100%; }
        .hdr { display:flex; align-items:center; justify-content:space-between; }
        h1 { margin:0; font-size:22px; }
        .muted { color:#64748b; }
        .row { display:flex; align-items:center; }
        .row.gap { gap:10px; }
        .row.space { justify-content:space-between; }
        .sep { width:1px; height:28px; background:#e5e7eb; margin:0 6px; }

        .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:14px; box-shadow: 0 8px 24px rgba(2,6,23,0.04); }
        .prefs .hint { margin-top:8px; color:#64748b; }

        .tab {
          padding:8px 10px;
          border-radius:8px;
          border:1px solid #cbd5e1;
          background:#f8fafc;
          color:#1e293b;
          font-weight:500;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .tab:hover:not(.active) {
          background: #e0e7ff;
          color: #1e293b;
        }
        .tab:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
        .tab.active {
          background:#2563eb;
          color:#fff;
          border-color:#2563eb;
        }

        .list { display:grid; gap:10px; }
        .item { display:grid; grid-template-columns: 10px 1fr; gap:10px; }
        .dot { width:10px; height:10px; border-radius:50%; margin-top:8px; }
        .dot.on { background:#22c55e; }
        .dot.off { background:#e5e7eb; }

        .title { margin:0; font-size:15px; }
        .body { margin:6px 0 8px; color:#475569; }
        .time { color:#6b7280; font-size:12px; }

        .pill { font-size:11px; padding:4px 8px; border-radius:999px; border:1px solid #e5e7eb; text-transform:capitalize; color:#334155; background:#f8fafc; }
        .pill.forms { background:#eef6ff; border-color:#cfe4ff; }
        .pill.appointment { background:#fff7ed; border-color:#ffedd5; }
        .pill.message { background:#f0fdf4; border-color:#dcfce7; }

        .btn {
          padding:8px 10px;
          border-radius:8px;
          font-weight:600;
          border:1px solid #cbd5e1;
          background:#f8fafc;
          color:#1e293b;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .btn:hover:not(:disabled) {
          background: #e0e7ff;
          color: #1e293b;
          border-color: #a5b4fc;
        }
        .btn:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn.primary {
          background: #2563eb;
          color: #fff;
          border-color: #2563eb;
        }
        .btn.primary:hover:not(:disabled) {
          background: #1e40af;
          border-color: #1e40af;
        }

        .btn.small {
          padding:6px 8px;
          font-size:12px;
        }
        .btn.ghost {
          background: transparent;
          color: #1e293b;
          border-color: transparent;
        }
        .btn.ghost:hover:not(:disabled) {
          background: #e0e7ff;
          color: #2563eb;
        }

        .empty { text-align:center; color:#64748b; }

        .check { display:flex; align-items:center; gap:8px; }
        .grid.two { display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 760px) { .grid.two { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
