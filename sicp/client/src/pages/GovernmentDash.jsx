import React, { useState, useEffect } from "react";
import { ClipboardList, AlertTriangle, PlayCircle, Award, BarChart3 } from "lucide-react";
import { COLORS, CATEGORIES } from "../theme.js";
import { Badge } from "../components/ui.jsx";
import ProblemCard from "../components/ProblemCard.jsx";
import { api } from "../api.js";
import { getCategoryLabel } from "../i18n.js";

function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 19, color: COLORS.charcoal, marginBottom: 14 }}>{children}</h2>;
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 16, flex: 1, minWidth: 150 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <Icon size={17} color={color} />
      </div>
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 22, color: COLORS.charcoal }}>{value}</div>
      <div style={{ fontSize: 12, color: COLORS.ink }}>{label}</div>
    </div>
  );
}

export default function GovernmentDash({ tab, lang, t, onOpen, refreshKey }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listProblems().then((d) => setProblems(d.problems)).finally(() => setLoading(false));
  }, [tab, refreshKey]);

  const pending = problems.filter((p) => p.status === "pending_review");
  const budget = problems.filter((p) => p.status === "budget_review");
  const inProgress = problems.filter((p) => p.status === "in_progress");
  const completed = problems.filter((p) => p.status === "completed");

  if (loading) return <div style={{ color: COLORS.ink, fontSize: 13.5 }}>{t.loading}</div>;

  if (tab === "review") return (
    <div><SectionTitle>{t.nav_review}</SectionTitle>
      {pending.length === 0 && <div style={{ color: COLORS.ink, fontSize: 13.5 }}>—</div>}
      {pending.map((p) => <ProblemCard key={p.id} p={p} lang={lang} t={t} onOpen={onOpen} />)}
    </div>
  );
  if (tab === "budget") return (
    <div><SectionTitle>{t.nav_budget}</SectionTitle>
      {budget.length === 0 && <div style={{ color: COLORS.ink, fontSize: 13.5 }}>—</div>}
      {budget.map((p) => <ProblemCard key={p.id} p={p} lang={lang} t={t} onOpen={onOpen} />)}
    </div>
  );
  return (
    <div>
      <SectionTitle>{t.dashboardOverview}</SectionTitle>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 26 }}>
        <StatCard icon={ClipboardList} label={t.totalProblems} value={problems.length} color={COLORS.forest} />
        <StatCard icon={AlertTriangle} label={t.pendingApproval} value={pending.length + budget.length} color={COLORS.ochre} />
        <StatCard icon={PlayCircle} label={t.inProgress} value={inProgress.length} color={COLORS.gold} />
        <StatCard icon={Award} label={t.completedCount} value={completed.length} color={COLORS.forest} />
      </div>
      <SectionTitle>{t.byCategory || "By category"}</SectionTitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
        {CATEGORIES.map((c) => {
          const n = problems.filter((p) => p.category === c).length;
          if (!n) return null;
          return <Badge key={c} tone="neutral">{getCategoryLabel(c, lang)}: {n}</Badge>;
        })}
      </div>
      <SectionTitle>{t.allProblems || "All problems"}</SectionTitle>
      {problems.map((p) => <ProblemCard key={p.id} p={p} lang={lang} t={t} onOpen={onOpen} />)}
    </div>
  );
}
