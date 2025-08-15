"use client";

import type { Metadata } from "next";
import { Amplify } from "aws-amplify";
import { Inter } from "next/font/google";
import "./app.css";
import { useRouter, usePathname } from "next/navigation";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import {
  useAuthenticator,
  Authenticator,
  ThemeProvider,
} from "@aws-amplify/ui-react";
import { configureAmplify } from "@/app/config/amplify-config";
import "@aws-amplify/ui-react/styles.css";
import outputs from "@/amplify_outputs.json";

const inter = Inter({ subsets: ["latin"] });

Amplify.configure(outputs);

const amplifyTheme = {
  name: "vhh-theme",
  tokens: {
    colors: {
      brand: {
        primary: {
          10: "#eef2ff", // indigo-50
          80: "#4f46e5", // indigo-600
          100: "#4338ca", // indigo-700
        },
      },
      font: {
        interactive: "#111827",
      },
      border: {
        default: { value: "#e5e7eb" },
        focus: { value: "#c7d2fe" },
      },
    },
    radii: {
      small: "8px",
      medium: "12px",
      large: "16px",
    },
    components: {
      button: {
        borderRadius: { value: "12px" },
        primary: {
          backgroundColor: "{colors.brand.primary.100}",
          color: "#ffffff",
          _hover: { backgroundColor: "{colors.brand.primary.80}" },
        },
      },
      fieldcontrol: {
        borderColor: "{colors.border.default}",
        borderRadius: { value: "12px" },
        focus: {
          borderColor: "{colors.border.focus}",
          boxShadow: { value: "0 0 0 3px #e0e7ff" },
        },
      },
      tabs: {
        item: {
          _active: {
            color: "{colors.brand.primary.100}",
            borderColor: "{colors.brand.primary.100}",
          },
        },
      },
    },
  },
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/forms", label: "Forms" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

function LayoutWithAuth({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const pathname = usePathname();

  // Let /login render publicly without shell
  if (pathname === "/login") {
    return <>{children}</>;
  }
  // For all other routes, require auth
  if (!user) {
    router.replace("/login");
    return null;
  }
  return (
    <>
      <header className="app-header">
        <div className="container header-inner">
          <a href="/" className="brand">
            <span className="brand-mark">VHH</span>
            <span className="brand-text">Virtual Health Hub</span>
          </a>
          <nav className="nav">
            {navLinks.map((l) => (
              <a key={l.href} className="nav-link" href={l.href}>
                {l.label}
              </a>
            ))}
            <button
              className="nav-link logout-button"
              onClick={signOut}
              type="button"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="container content">{children}</main>
      <footer className="app-footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} Virtual Health Hub</span>
          <span className="muted">
            Secure. Private. HIPAA-style safeguards.
          </span>
        </div>
      </footer>
      <style>{`
        .logout-button {
          background: transparent;
          border: none;
          color: #111827;
          cursor: pointer;
          padding: 8px 10px;
          border-radius: 8px;
          font: inherit;
        }
        .logout-button:hover {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
        }
      `}</style>
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={amplifyTheme} colorMode="light">
          <Authenticator.Provider>
            <LayoutWithAuth>{children}</LayoutWithAuth>
          </Authenticator.Provider>
        </ThemeProvider>
        <style>{`
          :root { --bg:#0f172a; --card:#ffffff; --muted:#6b7280; --brand:#2563eb; --line:#e5e7eb; }
          * { box-sizing:border-box; }
          html, body { margin:0; padding:0; background:#f7f7fb; color:#0f172a; }
          .container { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
          .app-header { position: sticky; top: 0; z-index: 50; background: #ffffffcc; backdrop-filter: blur(8px); border-bottom:1px solid var(--line); }
          .header-inner { display:flex; align-items:center; justify-content:space-between; height:64px; }
          .brand { display:flex; align-items:center; gap:10px; text-decoration:none; color:inherit; }
          .brand-mark { display:inline-grid; place-items:center; width:34px; height:34px; border-radius:8px; background:var(--brand); color:#fff; font-weight:800; letter-spacing:0.5px; }
          .brand-text { font-weight:700; }
          .nav { display:flex; gap:14px; align-items:center; }
          .nav-link { text-decoration:none; color:#111827; padding:8px 10px; border-radius:8px; border:1px solid transparent; }
          .nav-link:hover { background:#f3f4f6; border-color:#e5e7eb; }
          .content { min-height: calc(100vh - 64px - 56px); padding: 20px; }
          .app-footer { border-top:1px solid var(--line); background:#fff; }
          .footer-inner { display:flex; gap:12px; align-items:center; justify-content:space-between; height:56px; }
          .muted { color: var(--muted); }
        `}</style>
      </body>
    </html>
  );
}
