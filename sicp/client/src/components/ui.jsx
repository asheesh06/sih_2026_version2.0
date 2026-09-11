import React from "react";
import { Check } from "lucide-react";
import { COLORS } from "../theme.js";
import { getStepLabels, stepIndex } from "../i18n.js";

export const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.line}`,
  fontFamily: "'Noto Sans',sans-serif", fontSize: 13.5, color: COLORS.charcoal, background: "#fff",
  outline: "none", boxSizing: "border-box",
};

export function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={{ fontFamily: "'Noto Sans',sans-serif", fontSize: 12.5, fontWeight: 700, color: COLORS.charcoal, marginBottom: 5 }}>{label}</div>
      {children}
    </label>
  );
}

export function Btn({ children, onClick, variant = "primary", icon: Icon, style, disabled, type = "button" }) {
  const variants = {
    primary: { background: COLORS.forest, color: "#fff", border: "none" },
    ochre: { background: COLORS.ochre, color: "#fff", border: "none" },
    outline: { background: "#fff", color: COLORS.forest, border: `1.5px solid ${COLORS.forest}` },
    ghost: { background: "transparent", color: COLORS.ink, border: "none" },
    danger: { background: "#fff", color: COLORS.danger, border: `1.5px solid ${COLORS.danger}` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...variants[variant], fontFamily: "'Noto Sans',sans-serif", fontWeight: 700, fontSize: 13.5,
      padding: "9px 16px", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex", alignItems: "center", gap: 7, opacity: disabled ? 0.5 : 1, ...style,
    }}>
      {Icon && <Icon size={15} />} {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#eef1ee", fg: COLORS.charcoal },
    good: { bg: "#e4efe4", fg: COLORS.forest },
    warn: { bg: "#f8ecd9", fg: COLORS.ochreDark },
    bad: { bg: "#f6e3dd", fg: COLORS.danger },
  };
  const c = tones[tone];
  return (
    <span style={{
      background: c.bg, color: c.fg, fontFamily: "'Noto Sans',sans-serif",
      fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "inline-block",
    }}>{children}</span>
  );
}

export function Stepper({ status, lang }) {
  const labels = getStepLabels(lang);
  const idx = stepIndex(status);
  const failed = status === "rejected" || status === "budget_rejected";
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
      {labels.map((label, i) => {
        const active = i <= idx;
        const isCurrent = i === idx;
        return (
          <React.Fragment key={label}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 74 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: failed && isCurrent ? COLORS.danger : active ? COLORS.forest : "#fff",
                border: `2px solid ${failed && isCurrent ? COLORS.danger : active ? COLORS.forest : COLORS.line}`,
                color: active ? "#fff" : COLORS.ink, fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>
                {active && !isCurrent ? <Check size={14} /> : i + 1}
              </div>
              <div style={{ fontSize: 10.5, textAlign: "center", marginTop: 4, color: active ? COLORS.charcoal : COLORS.ink, maxWidth: 78 }}>
                {label}
              </div>
            </div>
            {i < labels.length - 1 && (
              <div style={{ height: 2, width: 20, background: i < idx ? COLORS.forest : COLORS.line, marginBottom: 16 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
