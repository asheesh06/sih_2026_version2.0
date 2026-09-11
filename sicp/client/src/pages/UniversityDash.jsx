import React, { useState, useEffect } from "react";
import { COLORS } from "../theme.js";
import ProblemCard from "../components/ProblemCard.jsx";
import { api } from "../api.js";

function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 19, color: COLORS.charcoal, marginBottom: 14 }}>{children}</h2>;
}

export default function UniversityDash({ tab, lang, t, user, onOpen, refreshKey }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listProblems().then((d) => setProblems(d.problems)).finally(() => setLoading(false));
  }, [tab, refreshKey]);

  if (loading) return <div style={{ color: COLORS.ink, fontSize: 13.5 }}>{t.loading}</div>;

  const assigned = problems.filter((p) => p.status === "university_assigned");
  const projects = problems.filter((p) => p.university === user.org_name && p.status !== "university_assigned" && p.status !== "pending_review");

  if (tab === "assigned") return (
    <div><SectionTitle>{t.nav_assigned}</SectionTitle>
      {assigned.length === 0 && <div style={{ color: COLORS.ink, fontSize: 13.5 }}>—</div>}
      {assigned.map((p) => <ProblemCard key={p.id} p={p} lang={lang} t={t} onOpen={onOpen} />)}
    </div>
  );
  return (
    <div><SectionTitle>{t.nav_projects}</SectionTitle>
      {projects.length === 0 && <div style={{ color: COLORS.ink, fontSize: 13.5 }}>—</div>}
      {projects.map((p) => <ProblemCard key={p.id} p={p} lang={lang} t={t} onOpen={onOpen} />)}
    </div>
  );
}
