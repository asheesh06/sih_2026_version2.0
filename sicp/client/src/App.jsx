import React, { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Award, BarChart3, ClipboardList, Wallet, GraduationCap, HeartHandshake, Factory } from "lucide-react";
import { T } from "./i18n.js";
import { api, setToken } from "./api.js";
import Shell from "./components/Shell.jsx";
import Chatbot from "./components/Chatbot.jsx";
import ProblemDetail from "./components/ProblemDetail.jsx";
import Login from "./pages/Login.jsx";
import CitizenDash from "./pages/CitizenDash.jsx";
import GovernmentDash from "./pages/GovernmentDash.jsx";
import UniversityDash from "./pages/UniversityDash.jsx";
import IndustryDash from "./pages/IndustryDash.jsx";

const SESSION_KEY = "__sicp_session_memory__"; // kept only in module memory, not browser storage
let sessionMemory = null;

export default function App() {
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [openProblem, setOpenProblem] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [booting, setBooting] = useState(true);
  const t = T[lang];

  const bumpRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // restore session held in memory only (survives re-renders, not page reloads — no browser storage used)
  useEffect(() => {
    if (sessionMemory) {
      setToken(sessionMemory.token);
      setUser(sessionMemory.user);
      const defaults = { citizen: "mine", government: "overview", university: "assigned", industry: "requests" };
      setActiveTab(defaults[sessionMemory.user.role]);
    }
    setBooting(false);
  }, []);

  useEffect(() => {
    if (user) api.organisations().then((d) => setOrgs(d.organisations)).catch(() => {});
  }, [user]);

  function handleAuthed(token, u) {
    setToken(token);
    sessionMemory = { token, user: u };
    setUser(u);
    const defaults = { citizen: "mine", government: "overview", university: "assigned", industry: "requests" };
    setActiveTab(defaults[u.role]);
  }

  function handleLogout() {
    setToken(null);
    sessionMemory = null;
    setUser(null);
    setActiveTab(null);
  }

  async function refreshOpenProblem() {
    bumpRefresh();
    if (openProblem) {
      try {
        const { problem } = await api.getProblem(openProblem.id);
        setOpenProblem(problem);
      } catch {
        setOpenProblem(null);
      }
    }
  }

  if (booting) return null;
  if (!user) return <Login lang={lang} setLang={setLang} t={t} onAuthed={handleAuthed} />;

  const navByRole = {
    citizen: [
      { key: "mine", label: t.nav_mine, icon: FileText },
      { key: "new", label: t.nav_new, icon: Plus },
      { key: "impact", label: t.nav_impact, icon: Award },
    ],
    government: [
      { key: "overview", label: t.nav_overview, icon: BarChart3 },
      { key: "review", label: t.nav_review, icon: ClipboardList },
      { key: "budget", label: t.nav_budget, icon: Wallet },
    ],
    university: [
      { key: "assigned", label: t.nav_assigned, icon: ClipboardList },
      { key: "projects", label: t.nav_projects, icon: GraduationCap },
    ],
    industry: [
      { key: "requests", label: t.nav_requests, icon: HeartHandshake },
      { key: "proposals", label: t.nav_execution, icon: Factory },
    ],
  };

  const dashByRole = {
    citizen: <CitizenDash tab={activeTab} setActiveTab={setActiveTab} lang={lang} t={t} onOpen={setOpenProblem} refreshKey={refreshKey} bumpRefresh={bumpRefresh} />,
    government: <GovernmentDash tab={activeTab} lang={lang} t={t} onOpen={setOpenProblem} refreshKey={refreshKey} />,
    university: <UniversityDash tab={activeTab} lang={lang} t={t} user={user} onOpen={setOpenProblem} refreshKey={refreshKey} />,
    industry: <IndustryDash tab={activeTab} lang={lang} t={t} user={user} onOpen={setOpenProblem} refreshKey={refreshKey} />,
  };

  return (
    <Shell user={user} lang={lang} setLang={setLang} t={t} onLogout={handleLogout}
      navItems={navByRole[user.role]} activeTab={activeTab} setActiveTab={setActiveTab}>
      {dashByRole[user.role]}
      {openProblem && (
        <ProblemDetail p={openProblem} lang={lang} t={t} role={user.role} orgs={orgs}
          onClose={() => setOpenProblem(null)} onChanged={refreshOpenProblem} />
      )}
      <Chatbot lang={lang} t={t} />
    </Shell>
  );
}
