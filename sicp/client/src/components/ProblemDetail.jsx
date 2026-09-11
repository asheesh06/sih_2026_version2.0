import React, { useState } from "react";
import {
  ArrowLeft, Volume2, MapPin, User, GraduationCap, Factory, CheckCircle2, XCircle,
  Users, HeartHandshake, Wallet, TrendingUp, Award, Check, RefreshCw,
} from "lucide-react";
import { COLORS } from "../theme.js";
import { Field, Btn, Badge, Stepper, inputStyle } from "./ui.jsx";
import { speak, getCategoryLabel } from "../i18n.js";
import { useTranslatedText } from "../translate.js";
import { api } from "../api.js";

export default function ProblemDetail({ p, lang, t, role, orgs, onClose, onChanged }) {
  const { translated: translatedTitle } = useTranslatedText(p.title, lang);
  const { translated: translatedDesc } = useTranslatedText(p.description, lang);
  const [mentor, setMentor] = useState(p.mentor || "");
  const [students, setStudents] = useState(p.students || "");
  const [proposal, setProposal] = useState(p.proposal || "");
  const [timeline, setTimeline] = useState(p.timeline || "");
  const [resources, setResources] = useState(p.resources || "");
  const [budgetAmount, setBudgetAmount] = useState(p.budget_amount || "");
  const [rejectReason, setRejectReason] = useState("");
  const [progressVal, setProgressVal] = useState(p.progress || 0);
  const [beneficiaries, setBeneficiaries] = useState(p.beneficiaries || "");
  const [impactSummary, setImpactSummary] = useState(p.impact_summary || "");
  const [showImpactForm, setShowImpactForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const universities = orgs.filter((o) => o.type === "university" && o.focus.includes(p.category));
  const [chosenUni, setChosenUni] = useState((universities[0] || orgs.find(o => o.type === "university"))?.name || "");
  const matchedIndustries = orgs.filter((o) => o.type === "industry" && o.focus.includes(p.category));

  async function run(action) {
    setBusy(true); setError("");
    try {
      await action();
      onChanged();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const statusLabel = {
    pending_review: t.statusPending, rejected: t.statusRejected, university_assigned: t.statusRouted,
    team_formed: t.statusTeam, industry_requested: t.statusIndReq, budget_review: t.statusBudget,
    budget_rejected: t.statusBudgetRej, in_progress: t.statusProgress, completed: t.statusDone,
  }[p.status];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,25,20,.45)", zIndex: 70, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ width: 520, maxWidth: "94vw", background: "#fff", height: "100%", overflowY: "auto", padding: "24px 26px 60px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <button onClick={onClose} style={{ border: "none", background: COLORS.plaster, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={16} />
          </button>
          <button onClick={() => speak(`${translatedTitle || p.title}. ${translatedDesc || p.description}`, lang)} style={{ border: `1.5px solid ${COLORS.forest}`, background: "#fff", color: COLORS.forest, borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12.5, fontWeight: 700 }}>
            <Volume2 size={14} /> {t.readAloud}
          </button>
        </div>

        <div style={{ fontSize: 11, color: COLORS.ink, fontWeight: 700 }}>{p.id}</div>
        <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 20, color: COLORS.charcoal, margin: "4px 0 8px" }}>
          {translatedTitle || p.title}
        </h2>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          <Badge tone="neutral">{getCategoryLabel(p.category, lang)}</Badge>
          {p.confidence != null && <Badge tone="neutral">{t.aiSuggested}: {p.confidence}% {t.confidence}</Badge>}
          <Badge tone={p.status === "completed" ? "good" : p.status.includes("reject") ? "bad" : "neutral"}>{statusLabel}</Badge>
        </div>
        <p style={{ fontSize: 13.5, color: COLORS.charcoal, lineHeight: 1.6 }}>
          {translatedDesc || p.description}
        </p>
        {p.photo_url && (
          <div style={{ marginBottom: 14 }}>
            <img
              src={p.photo_url}
              alt={p.title}
              style={{
                width: "100%",
                maxHeight: 280,
                objectFit: "cover",
                borderRadius: 10,
                border: `1.5px solid ${COLORS.line}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            />
          </div>
        )}
        <div style={{ fontSize: 12.5, color: COLORS.ink, display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={13} /> {p.location}</span>
        </div>

        <div style={{ background: COLORS.cream, borderRadius: 10, padding: 14, marginBottom: 18, overflowX: "auto" }}>
          <Stepper status={p.status} lang={lang} />
        </div>

        {(p.university || p.industry) && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {p.university && <div style={{ fontSize: 12, background: "#eef4ee", color: COLORS.forest, padding: "5px 10px", borderRadius: 8, display: "flex", alignItems: "center", gap: 5 }}><GraduationCap size={13} /> {p.university}</div>}
            {p.industry && <div style={{ fontSize: 12, background: "#f8ecd9", color: COLORS.ochreDark, padding: "5px 10px", borderRadius: 8, display: "flex", alignItems: "center", gap: 5 }}><Factory size={13} /> {p.industry}</div>}
          </div>
        )}

        {error && <div style={{ color: COLORS.danger, fontSize: 12.5, marginBottom: 12 }}>{error}</div>}

        {/* GOVERNMENT: pending review */}
        {role === "government" && p.status === "pending_review" && (
          <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 16 }}>
            <Field label={t.assignTo}>
              <select style={inputStyle} value={chosenUni} onChange={(e) => setChosenUni(e.target.value)}>
                {(universities.length ? universities : orgs.filter(o => o.type === "university")).map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </Field>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Btn icon={CheckCircle2} disabled={busy} onClick={() => run(() => api.approve(p.id, chosenUni))}>{t.approve}</Btn>
              <Btn icon={XCircle} variant="danger" disabled={busy} onClick={() => run(() => api.reject(p.id, rejectReason))}>{t.reject}</Btn>
            </div>
            <Field label={t.reason}><input style={{ ...inputStyle, marginTop: 8 }} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} /></Field>
          </div>
        )}

        {/* UNIVERSITY: assigned, needs team */}
        {role === "university" && p.status === "university_assigned" && (
          <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 16 }}>
            <Field label={t.mentor}><input style={inputStyle} value={mentor} onChange={(e) => setMentor(e.target.value)} /></Field>
            <Field label={t.students}><input style={inputStyle} value={students} onChange={(e) => setStudents(e.target.value)} placeholder={t.namesCommaSeparated} /></Field>
            <Field label={t.proposalSummary}><textarea style={{ ...inputStyle, minHeight: 70 }} value={proposal} onChange={(e) => setProposal(e.target.value)} /></Field>
            <Btn icon={Users} disabled={busy || !mentor.trim() || !students.trim()} onClick={() => run(() => api.formTeam(p.id, { mentor, students, proposal }))}>{t.acceptTeam}</Btn>
          </div>
        )}

        {/* UNIVERSITY: team formed, request industry */}
        {role === "university" && p.status === "team_formed" && (
          <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 16 }}>
            <div style={{ fontSize: 12.5, color: COLORS.ink, marginBottom: 10 }}>{t.matchedIndustry}: {matchedIndustries.map((i) => i.name).join(", ") || "—"}</div>
            <Btn icon={HeartHandshake} disabled={busy} onClick={() => run(() => api.requestIndustry(p.id))}>{t.requestIndustry}</Btn>
          </div>
        )}

        {/* UNIVERSITY: budget was rejected, resubmit */}
        {role === "university" && p.status === "budget_rejected" && (
          <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 16 }}>
            <Btn icon={RefreshCw} disabled={busy} onClick={() => run(() => api.resubmit(p.id))}>{t.resubmitBtn}</Btn>
          </div>
        )}

        {/* INDUSTRY: requested, submit proposal */}
        {role === "industry" && p.status === "industry_requested" && (
          <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 16 }}>
            <Field label={t.timeline}><input style={inputStyle} value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder={t.timelinePlaceholder} /></Field>
            <Field label={t.resources}><textarea style={{ ...inputStyle, minHeight: 60 }} value={resources} onChange={(e) => setResources(e.target.value)} /></Field>
            <Field label={t.budget}><input type="number" style={inputStyle} value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} /></Field>
            <Btn icon={Wallet} disabled={busy || !timeline || !budgetAmount} onClick={() => run(() => api.submitProposal(p.id, { timeline, resources, budget_amount: budgetAmount }))}>{t.submitProposal}</Btn>
          </div>
        )}

        {/* GOVERNMENT: budget review */}
        {role === "government" && p.status === "budget_review" && (
          <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 16 }}>
            <div style={{ background: COLORS.cream, borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 13 }}>
              <div><b>{t.timeline}:</b> {p.timeline}</div>
              <div><b>{t.resources}:</b> {p.resources}</div>
              <div><b>{t.budget}:</b> ₹{Number(p.budget_amount).toLocaleString("en-IN")}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn icon={CheckCircle2} disabled={busy} onClick={() => run(() => api.approveBudget(p.id))}>{t.approveBudget}</Btn>
              <Btn icon={XCircle} variant="danger" disabled={busy} onClick={() => run(() => api.rejectBudget(p.id))}>{t.rejectBudget}</Btn>
            </div>
          </div>
        )}

        {/* IN PROGRESS: university/industry update groundwork */}
        {(role === "university" || role === "industry") && p.status === "in_progress" && (
          <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 16 }}>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{t.groundwork}: {progressVal}%</div>
            <input type="range" min="0" max="100" value={progressVal} onChange={(e) => setProgressVal(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />
            {(p.milestones || []).map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 6 }}>
                <CheckCircle2 size={15} color={m.done ? COLORS.forest : COLORS.line} /> {m.title}
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Btn icon={TrendingUp} disabled={busy} onClick={() => run(() => api.updateProgress(p.id, progressVal))}>{t.updateProgress}</Btn>
              {role === "university" && <Btn variant="ochre" icon={Award} onClick={() => setShowImpactForm(true)}>{t.markComplete}</Btn>}
            </div>
            {showImpactForm && (
              <div style={{ marginTop: 16, background: COLORS.cream, padding: 14, borderRadius: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13.5 }}>{t.impactForm}</div>
                <Field label={t.beneficiaries}><input style={inputStyle} value={beneficiaries} onChange={(e) => setBeneficiaries(e.target.value)} /></Field>
                <Field label={t.impactSummary}><textarea style={{ ...inputStyle, minHeight: 70 }} value={impactSummary} onChange={(e) => setImpactSummary(e.target.value)} /></Field>
                <Btn icon={Check} disabled={busy || !beneficiaries || !impactSummary} onClick={() => run(() => api.complete(p.id, { beneficiaries, impact_summary: impactSummary }))}>{t.saveImpact}</Btn>
              </div>
            )}
          </div>
        )}

        {/* COMPLETED: impact display */}
        {p.status === "completed" && (
          <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 16 }}>
            <div style={{ background: "#eef4ee", border: `1px solid ${COLORS.forest}`, borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: COLORS.forest, fontWeight: 700, marginBottom: 8 }}>
                <Award size={16} /> {t.statusDone}
              </div>
              <div style={{ fontSize: 13, marginBottom: 6 }}><b>{t.beneficiaries}:</b> {p.beneficiaries}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55 }}>{p.impact_summary}</div>
            </div>
          </div>
        )}

        {p.history && p.history.length > 0 && (
          <div style={{ marginTop: 22, borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 8, color: COLORS.charcoal }}>{t.timeline || "Timeline"}</div>
            {p.history.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 12.5, color: COLORS.ink, marginBottom: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.ochre, marginTop: 5, flexShrink: 0 }} />
                {h}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
