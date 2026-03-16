import React from "react";

export function GameUI({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div style={{
      position: "relative",
      background: "#0d0d14",
      borderRadius: "0 0 12px 12px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      gap: "0",
      minHeight: 440,
      userSelect: "none",
    }}>
      {children}
    </div>
  );
}

export function HUD({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "0.5rem 1rem",
      background: "#13131a",
      color: "#f1f5f9",
      fontWeight: 700,
      fontSize: "0.9rem",
      borderBottom: "1px solid #1e1e2e",
      gap: "1rem",
    }}>
      {children}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  accent,
  disabled,
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  accent: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "0.5rem 1.2rem",
        background: disabled ? "#333" : accent,
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontWeight: 700,
        fontSize: "0.9rem",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.2s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
