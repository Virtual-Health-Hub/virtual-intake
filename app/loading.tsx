"use client";

import React from "react";

export default function Loader() {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <div style={styles.label}>Loading…</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(3px)",
    zIndex: 1000,
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #e5e7eb",
    borderTop: "5px solid #4338ca", // dashboard primary
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  label: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#475569",
    fontWeight: 500,
  },
};
