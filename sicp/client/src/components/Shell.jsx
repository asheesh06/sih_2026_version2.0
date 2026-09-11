import React from "react";
import { User, GraduationCap, Landmark, Factory, LogOut } from "lucide-react";
import { COLORS } from "../theme.js";
import LanguageDropdown from "./LanguageDropdown.jsx";

const ROLE_ICON = { citizen: User, university: GraduationCap, government: Landmark, industry: Factory };

export default function Shell({ user, lang, setLang, t, onLogout, navItems, activeTab, setActiveTab, children }) {
  const RoleIcon = ROLE_ICON[user.role];
  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, fontFamily: "'Noto Sans',sans-serif", display: "flex" }}>
      <style>{`::-webkit-scrollbar{width:8px;height:8px;} ::-webkit-scrollbar-thumb{background:${COLORS.line};border-radius:8px;}
        input,select,textarea,button{font-family:'Noto Sans',sans-serif;}`}</style>
      <aside style={{ width: 224, background: COLORS.forestDark, flexShrink: 0, display: "flex", flexDirection: "column", padding: "20px 0", position: "relative", zIndex: 60 }}>
        <div style={{ padding: "0 18px 18px", borderBottom: "1px solid rgba(255,255,255,.12)", marginBottom: 10 }}>
          <div style={{ color: COLORS.gold, fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 15 }}>SICP</div>
          <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11 }}>Jharkhand</div>
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <button key={item.key} onClick={() => setActiveTab(item.key)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 18px",
              background: activeTab === item.key ? "rgba(255,255,255,.12)" : "transparent",
              borderTop: "none",
              borderRight: "none",
              borderBottom: "none",
              borderLeftWidth: 3,
              borderLeftStyle: "solid",
              borderLeftColor: activeTab === item.key ? COLORS.gold : "transparent",
              color: "#fff", cursor: "pointer", fontSize: 13.5, fontWeight: 600, textAlign: "left",
            }}>
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "14px 18px 0", borderTop: "1px solid rgba(255,255,255,.12)", display: "flex", flexDirection: "column", gap: 8 }}>
          <LanguageDropdown lang={lang} setLang={setLang} variant="sidebar" />
          <button onClick={onLogout} style={{
            width: "100%", background: "transparent", color: "rgba(255,255,255,.75)", border: "1px solid rgba(255,255,255,.25)",
            borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
          }}><LogOut size={14} /> {t.logout}</button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <header style={{ background: "#fff", borderBottom: `1px solid ${COLORS.line}`, padding: "14px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "relative", zIndex: 50 }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: COLORS.charcoal, fontSize: 16 }}>{t.appName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <LanguageDropdown lang={lang} setLang={setLang} variant="header" />
            <div style={{ display: "flex", alignItems: "center", gap: 9, paddingLeft: 10, borderLeft: `1px solid ${COLORS.line}` }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: COLORS.plaster, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RoleIcon size={17} color={COLORS.forest} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.charcoal }}>{user.name}</div>
                <div style={{ fontSize: 11, color: COLORS.ink, textTransform: "capitalize" }}>{t[user.role]}</div>
              </div>
            </div>
          </div>
        </header>
        <main style={{ padding: "26px 30px 60px", maxWidth: 1080 }}>{children}</main>
      </div>
    </div>
  );
}
