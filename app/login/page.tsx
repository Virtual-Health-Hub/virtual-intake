"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Authenticator,
  useAuthenticator,
  Heading,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

function Header() {
  return (
    <div style={{ textAlign: "center" }}>
      <Image
        src="/amplify.svg"
        alt="Virtual Intake Logo"
        width={56}
        height={56}
        style={{
          display: "block",
          margin: "0 auto 8px",
        }}
      />
      <span
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: "#2563eb",
        }}
      >
        Virtual Intake
      </span>
    </div>
  );
}

function Footer() {
  return (
    <div
      style={{
        textAlign: "center",
        fontSize: 12,
        color: "#64748b",
        marginTop: 16,
      }}
    >
      © {new Date().getFullYear()} Virtual Health Hub
    </div>
  );
}

export default function LoginPage() {
  return (
    <Authenticator components={{ Header, Footer }}>
      <LoginHandler />
    </Authenticator>
  );
}

function LoginHandler() {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (typeof window !== "undefined") {
        // Hard refresh so the whole app (including Server Components) re-initializes with the signed-in user
        window.location.replace("/");
      }
    }
  }, [user]);

  return null;
}
