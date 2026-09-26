import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  AlertTriangle,
  PlayCircle,
  Award,
  BarChart3,
  Landmark,
  MapPin,
  Filter,
  CheckCircle,
  Building,
  Shield,
  Layers,
} from "lucide-react";
import { COLORS, CATEGORIES } from "../theme.js";
import { Badge, Btn } from "../components/ui.jsx";
import ProblemCard from "../components/ProblemCard.jsx";
import { api } from "../api.js";
import { getCategoryLabel } from "../i18n.js";

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 19, color: COLORS.charcoal, margin: 0 }}>
        {children}
      </h2>
      {right}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${COLORS.line}`,
        borderRadius: 12,
        padding: 16,
        flex: 1,
        minWidth: 150,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: color + "20",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Icon size={17} color={color} />
      </div>
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 22, color: COLORS.charcoal }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: COLORS.ink }}>{label}</div>
    </div>
  );
}

export default function GovernmentDash({ tab, lang, t, user, onOpen, refreshKey }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jurisdictionMode, setJurisdictionMode] = useState("my_area"); // 'my_area' | 'all'
  const [selectedBlockFilter, setSelectedBlockFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (jurisdictionMode === "all") {
      params.jurisdiction = "all";
    } else {
      params.jurisdiction = "my_area";
    }
    api.listProblems(params)
      .then((d) => setProblems(d.problems || []))
      .finally(() => setLoading(false));
  }, [tab, refreshKey, jurisdictionMode]);

  // Officer LGD profile details
  const officerName = user?.name || "District Innovation Officer";
  const officerDesignation = user?.designation || "District Innovation & Development Officer (DIO)";
  const officerDept = user?.department || "District Administration & Innovation Council";
  const officerLevel = user?.jurisdiction_level || "district";
  const officerDistrict = user?.district_name || (user?.district_code === "330" ? "Gumla" : user?.district_code === "325" ? "Dhanbad" : "Ranchi");
  const officerDistrictCode = user?.district_code || (user?.username?.includes("gumla") ? "330" : user?.username?.includes("dhanbad") ? "325" : "328");
  const officerBlock = user?.subdistrict_name || (user?.subdistrict_code ? "Kanke" : "All Blocks");
  const officerBlockCode = user?.subdistrict_code || null;

  // Filter problems by selected block if specified
  const displayedProblems = problems.filter((p) => {
    if (selectedBlockFilter !== "all" && p.subdistrict_code) {
      return p.subdistrict_code === selectedBlockFilter || p.subdistrict_name === selectedBlockFilter;
    }
    return true;
  });

  const pending = displayedProblems.filter((p) => p.status === "pending_review");
  const budget = displayedProblems.filter((p) => p.status === "budget_review");
  const inProgress = displayedProblems.filter((p) => p.status === "in_progress");
  const completed = displayedProblems.filter((p) => p.status === "completed");

  // Extract unique blocks from problems list for filter dropdown
  const availableBlocks = Array.from(
    new Set(
      problems
        .filter((p) => p.subdistrict_name)
        .map((p) => JSON.stringify({ code: p.subdistrict_code, name: p.subdistrict_name }))
    )
  ).map((s) => JSON.parse(s));

  if (loading) return <div style={{ color: COLORS.ink, fontSize: 13.5 }}>{t.loading}</div>;

  return (
    <div>
      {/* OFFICIAL GOVERNMENT IDENTITY & LGD JURISDICTION BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #1b3d2b, #244b36)",
          color: "#fff",
          borderRadius: 14,
          padding: "20px 24px",
          marginBottom: 24,
          boxShadow: "0 6px 20px rgba(27,61,43,0.18)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.gold,
              }}
            >
              <Landmark size={26} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 18, fontWeight: 800 }}>
                  {officerName}
                </span>
                <span
                  style={{
                    background: COLORS.gold,
                    color: "#1b3d2b",
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 12,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {officerLevel.toUpperCase()} LEVEL AUTHORITY
                </span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", marginTop: 2 }}>
                {officerDesignation} · {officerDept}
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                Officer Username: <code>{user?.username || user?.email}</code>
              </div>
            </div>
          </div>

          {/* LGD Jurisdiction Lineage Chips */}
          <div
            style={{
              background: "rgba(0,0,0,0.22)",
              borderRadius: 10,
              padding: "10px 14px",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 12,
            }}
          >
            <div style={{ color: COLORS.gold, fontWeight: 700, fontSize: 11, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              🏛️ Local Government Directory (LGD) Jurisdiction:
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>State: <b>{user?.state_name || "Jharkhand"}</b> (Code: {user?.state_code || "20"})</span>
              <span>•</span>
              <span>District: <b>{officerDistrict}</b> (LGD: {officerDistrictCode || "All"})</span>
              {officerBlockCode && (
                <>
                  <span>•</span>
                  <span>Sub-District / Block: <b>{officerBlock}</b> (LGD: {officerBlockCode})</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Jurisdiction Filter Switcher */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setJurisdictionMode("my_area")}
              style={{
                background: jurisdictionMode === "my_area" ? "#fff" : "rgba(255,255,255,0.12)",
                color: jurisdictionMode === "my_area" ? COLORS.forestDark : "#fff",
                border: "none",
                borderRadius: 8,
                padding: "7px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <MapPin size={14} />
              <span>📍 {t.myJurisdictionQueue || "My Area Complaint Queue"} ({officerDistrict})</span>
            </button>

            <button
              type="button"
              onClick={() => setJurisdictionMode("all")}
              style={{
                background: jurisdictionMode === "all" ? "#fff" : "rgba(255,255,255,0.12)",
                color: jurisdictionMode === "all" ? COLORS.forestDark : "#fff",
                border: "none",
                borderRadius: 8,
                padding: "7px 14px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <Layers size={14} />
              <span>🌐 {t.statewideFeed || "Statewide Feed (All Districts)"}</span>
            </button>
          </div>

          {availableBlocks.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)" }}>Filter Block:</span>
              <select
                value={selectedBlockFilter}
                onChange={(e) => setSelectedBlockFilter(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontSize: 12,
                }}
              >
                <option value="all" style={{ background: COLORS.forestDark }}>All Blocks in Area</option>
                {availableBlocks.map((b) => (
                  <option key={b.code} value={b.code} style={{ background: COLORS.forestDark }}>
                    {b.name} (LGD: {b.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {tab === "review" && (
        <div>
          <SectionTitle>
            <span>{t.nav_review}</span>
          </SectionTitle>
          <div style={{ fontSize: 13, color: COLORS.ink, marginBottom: 14 }}>
            Complaints routed to your authority queue via the <b>Authority Mapping Engine</b> awaiting assignment to a research university.
          </div>
          {pending.length === 0 && (
            <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: `1px solid ${COLORS.line}`, textAlign: "center", color: COLORS.ink, fontSize: 13.5 }}>
              No pending complaints in your jurisdiction review queue.
            </div>
          )}
          {pending.map((p) => (
            <ProblemCard key={p.id} p={p} lang={lang} t={t} onOpen={onOpen} />
          ))}
        </div>
      )}

      {tab === "budget" && (
        <div>
          <SectionTitle>
            <span>{t.nav_budget || "Tender Selection"}</span>
          </SectionTitle>
          <div style={{ fontSize: 13, color: COLORS.ink, marginBottom: 14 }}>
            Industry tenders submitted for societal solutions in your area awaiting official government selection and ground implementation start.
          </div>
          {budget.length === 0 && (
            <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: `1px solid ${COLORS.line}`, textAlign: "center", color: COLORS.ink, fontSize: 13.5 }}>
              No proposals awaiting tender selection in your jurisdiction.
            </div>
          )}
          {budget.map((p) => (
            <ProblemCard key={p.id} p={p} lang={lang} t={t} onOpen={onOpen} />
          ))}
        </div>
      )}

      {tab !== "review" && tab !== "budget" && (
        <div>
          <SectionTitle>
            <span>{t.dashboardOverview}</span>
          </SectionTitle>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 26 }}>
            <StatCard
              icon={ClipboardList}
              label={jurisdictionMode === "my_area" ? `Total in ${officerDistrict}` : t.totalProblems}
              value={displayedProblems.length}
              color={COLORS.forest}
            />
            <StatCard
              icon={AlertTriangle}
              label={t.pendingApproval}
              value={pending.length + budget.length}
              color={COLORS.ochre}
            />
            <StatCard
              icon={PlayCircle}
              label={t.inProgress}
              value={inProgress.length}
              color={COLORS.gold}
            />
            <StatCard
              icon={Award}
              label={t.completedCount}
              value={completed.length}
              color={COLORS.forest}
            />
          </div>

          <SectionTitle>
            <span>{t.byCategory || "By category"}</span>
          </SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
            {CATEGORIES.map((c) => {
              const n = displayedProblems.filter((p) => p.category === c).length;
              if (!n) return null;
              return (
                <Badge key={c} tone="neutral">
                  {getCategoryLabel(c, lang)}: {n}
                </Badge>
              );
            })}
          </div>

          <SectionTitle>
            <span>
              {jurisdictionMode === "my_area"
                ? `Jurisdiction Complaints Queue (${officerDistrict} · ${displayedProblems.length})`
                : `${t.allProblems || "All problems"} (${displayedProblems.length})`}
            </span>
          </SectionTitle>

          {displayedProblems.length === 0 && (
            <div style={{ background: "#fff", padding: 24, borderRadius: 12, border: `1px solid ${COLORS.line}`, textAlign: "center", color: COLORS.ink, fontSize: 13.5 }}>
              No complaints found in this jurisdiction filter.
            </div>
          )}

          {displayedProblems.map((p) => (
            <ProblemCard key={p.id} p={p} lang={lang} t={t} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}
