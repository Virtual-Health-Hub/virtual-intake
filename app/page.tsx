"use client";

import React from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";

const inter = Inter({ subsets: ["latin"] });

function LayoutWithAuth({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  if (!user) {
    return (
      <div className="login-wrapper">
        <Authenticator />
        <style>{`
          .login-wrapper {
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            background: #f9fafb;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <header>
        <nav className="container nav">
          <Link href="/" className="nav-logo">
            Virtual Intake
          </Link>
          <ul className="nav-links">
            <li>
              <Link href="/chat">Chat</Link>
            </li>
            <li>
              <Link href="/forms">Forms</Link>
            </li>
            <li>
              <button onClick={signOut} className="btn-logout">
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </header>
      <main className="container content">{children}</main>
      <footer className="container footer">
        <p>© 2024 Virtual Intake. All rights reserved.</p>
      </footer>

      <style>{`
        .container {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 16px;
        }
        header {
          background: #2563eb;
          color: white;
          padding: 16px 0;
        }
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          font-weight: 700;
          font-size: 20px;
          color: white;
          text-decoration: none;
        }
        .nav-links {
          list-style: none;
          display: flex;
          gap: 16px;
          margin: 0;
          padding: 0;
          align-items: center;
        }
        .nav-links a {
          color: white;
          text-decoration: none;
          font-weight: 600;
        }
        .btn-logout {
          background: transparent;
          border: 1px solid white;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-logout:hover {
          background: white;
          color: #2563eb;
          border-color: #2563eb;
        }
        main.content {
          padding: 24px 0;
          min-height: calc(100vh - 144px); /* header + footer approx */
        }
        footer {
          text-align: center;
          padding: 16px 0;
          border-top: 1px solid #e5e7eb;
          color: #64748b;
          font-size: 14px;
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
        <LayoutWithAuth>{children}</LayoutWithAuth>
      </body>
    </html>
  );
}
