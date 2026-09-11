import React from "react";
import { MapPin } from "lucide-react";
import { COLORS } from "../theme.js";
import { Badge, Stepper } from "./ui.jsx";
import { getCategoryLabel } from "../i18n.js";
import { useTranslatedText } from "../translate.js";

export default function ProblemCard({ p, lang, t, onOpen }) {
  const { translated: translatedTitle } = useTranslatedText(p.title, lang);
  const statusTone = p.status === "rejected" || p.status === "budget_rejected" ? "bad"
    : p.status === "completed" ? "good"
    : p.status === "pending_review" ? "warn" : "neutral";
  const statusLabel = {
    pending_review: t.statusPending, rejected: t.statusRejected, university_assigned: t.statusRouted,
    team_formed: t.statusTeam, industry_requested: t.statusIndReq, budget_review: t.statusBudget,
    budget_rejected: t.statusBudgetRej, in_progress: t.statusProgress, completed: t.statusDone,
  }[p.status];

  return (
    <div onClick={() => onOpen(p)} style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 16, marginBottom: 12, cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: COLORS.ink, fontWeight: 700 }}>{p.id}</div>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15.5, color: COLORS.charcoal, margin: "3px 0 6px" }}>
            {translatedTitle || p.title}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
            <Badge tone="neutral">{getCategoryLabel(p.category, lang)}</Badge>
            <Badge tone={statusTone}>{statusLabel}</Badge>
          </div>
          <div style={{ fontSize: 12, color: COLORS.ink, display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={12} /> {p.location}
          </div>
        </div>
        {p.photo_url && (
          <img
            src={p.photo_url}
            alt={p.title}
            style={{
              width: 58,
              height: 58,
              borderRadius: 8,
              objectFit: "cover",
              border: `1px solid ${COLORS.line}`,
              flexShrink: 0,
            }}
          />
        )}
      </div>
      <div style={{ marginTop: 12, overflowX: "auto" }}><Stepper status={p.status} lang={lang} /></div>
    </div>
  );
}
