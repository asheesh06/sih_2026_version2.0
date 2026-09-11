import React, { useState, useEffect } from "react";
import { COLORS } from "../theme.js";
import ProblemCard from "../components/ProblemCard.jsx";
import { api } from "../api.js";

function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 19, color: COLORS.charcoal, marginBottom: 14 }}>{children}</h2>;
}

export default function IndustryDash({ tab, lang, t, user, onOpen, refreshKey }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listProblems().then((d) => setProblems(d.problems)).finally(() => setLoading(false));
  }, [tab, refreshKey]);

  if (loading) return <div style={{ color: COLORS.ink, fontSize: 13.5 }}>{t.loading}</div>;

  const requests = problems.filter((p) => p.status === "industry_requested");
  const proposals = problems.filter((p) => p.industry === user.org_name && ["budget_review", "budget_rejected", "in_progress", "completed"].includes(p.status));

  if (tab === "requests") return (
    <div><SectionTitle>{t.nav_requests}</SectionTitle>
      {requests.length === 0 && <div style={{ color: COLORS.ink, fontSize: 13.5 }}>—</div>}
      {requests.map((p) => <ProblemCard key={p.id} p={p} lang={lang} t={t} onOpen={onOpen} />)}
    </div>
  );
  return (
    <div><SectionTitle>{t.nav_execution}</SectionTitle>
      {proposals.length === 0 && <div style={{ color: COLORS.ink, fontSize: 13.5 }}>—</div>}
      {proposals.map((p) => <ProblemCard key={p.id} p={p} lang={lang} t={t} onOpen={onOpen} />)}
    </div>
  );
}
