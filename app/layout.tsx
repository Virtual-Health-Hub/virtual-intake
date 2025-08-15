"use client";

import React from "react";
import { Amplify } from "aws-amplify";
import { Inter } from "next/font/google";
import "./app.css";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  useAuthenticator,
  Authenticator,
  ThemeProvider,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "@/amplify_outputs.json";

import Loader from "./loading";

const inter = Inter({ subsets: ["latin"] });

Amplify.configure(outputs);

const amplifyTheme = {
  name: "vhh-theme",
  tokens: {
    colors: {
      brand: {
        primary: {
          10: "#e0f2fe", // dashboard tint
          80: "#2563eb", // dashboard hover
          100: "#1d4ed8", // dashboard primary
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
  { href: "/", label: "Dashboard" },
  { href: "/interview", label: "Interview" },
  { href: "/forms", label: "Forms" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

function LayoutWithAuth({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const authLoading = false; // placeholder if needed for future loading state
  const router = useRouter();
  const pathname = usePathname();

  const [authChecked, setAuthChecked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setAuthChecked(true);
  }, []);

  React.useEffect(() => {
    if (!authChecked || authLoading) return;
    if (pathname !== "/login" && !user) {
      router.replace("/login");
    }
  }, [authChecked, authLoading, pathname, user, router]);

  async function handleLogout() {
    try {
      setLoading(true);
      await signOut();
      router.replace("/login");
    } catch (e) {
      console.error(e);
    }
  }

  // Let /login render publicly without shell
  if (pathname === "/login") {
    return <>{children}</>;
  }
  // For all other routes, require auth
  if (authLoading || !user) {
    return <Loader />; // redirect happens in useEffect (client-only)
  }
  if (loading) {
    return <Loader />;
  }
  return (
    <>
      <header className="app-header">
        <div className="container header-inner">
          <Link href="/" className="brand">
            <Image
              src="/amplify.svg"
              alt="Virtual Health Hub Logo"
              width={34}
              height={34}
            />
          </Link>
          <nav className="nav">
            {navLinks.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  className={`nav-link${isActive ? " active" : ""}`}
                  href={l.href}
                  aria-current={isActive ? "page" : undefined}
                >
                  {l.label}
                </Link>
              );
            })}
            <button
              className="nav-link logout-button"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="container content">{children}</main>

      <style>{`
        .app-header {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 50;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border-bottom: 1px solid var(--line);
        }
        .brand-mark {
          display: inline-grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #1d4ed8;
          color: #fff;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .brand-text {
          font-weight: 700;
          color: #1e293b;
        }
        .nav-link {
          text-decoration: none;
          color: #111827;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid transparent;
          font-weight: 500;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .nav-link:hover {
          background: #f1f5f9;
          color: #1d4ed8;
          border-color: transparent;
        }
        .nav-link.active {
          background: #e0f2fe;
          color: #1d4ed8;
          border-color: transparent;
        }
        .logout-button {
          background: transparent;
          border: none;
          color: #b91c1c;
          cursor: pointer;
          padding: 8px 10px;
          border-radius: 8px;
          font: inherit;
          font-weight: 500;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .logout-button:hover {
          background: #fee2e2;
          color: #b91c1c;
        }
        .app-footer {
          width: 100%;
          border-top: 1px solid var(--line);
          background: #f8fafc;
        }
        .muted {
          color: var(--muted);
          font-size: 0.875rem;
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
          .container { width: 100vw; height: 100vh; margin: 0 auto; padding: 20px; }
          .header-inner { display:flex; align-items:center; justify-content:space-between; height:64px; }
          .brand { display:flex; align-items:center; gap:10px; text-decoration:none; color:inherit; }
          .nav { display:flex; gap:14px; align-items:center; }
          .content {
            padding: 84px 20px 24px; /* 64px header + 20px breathing room */
            box-sizing: border-box;
          }
          /* Global button-like link styles */
          .btn { display: inline-block; text-decoration: none; line-height: 1.25; padding: 0.75rem 1.5rem; font-weight: 600; border-radius: 6px; transition: background-color 0.2s ease; }
          .btn:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; }
          .btn.primary { background: #1d4ed8; color: #ffffff; border: none; }
          .btn.primary:hover { background: #2563eb; }
          .btn.secondary { background: #f1f5f9; color: #1e293b; border: none; }
          .btn.secondary:hover { background: #e2e8f0; }
        `}</style>
      </body>
    </html>
  );
}
