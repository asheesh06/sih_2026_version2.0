import React, { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  Landmark,
  Factory,
  Plus,
  Search,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Award,
  Layers,
  Activity,
  FileText,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
  HelpCircle,
  Eye,
  Filter,
  Send,
  Brain,
  GitBranch,
  Rocket,
} from "lucide-react";
import { COLORS } from "../theme.js";
import { CATEGORIES, getCategoryLabel } from "../i18n.js";
import { api } from "../api.js";
import LanguageDropdown from "../components/LanguageDropdown.jsx";
import ProblemDetail from "../components/ProblemDetail.jsx";
import Login from "./Login.jsx";

const JHARKHAND_DISTRICTS = [
  "Ranchi", "Dhanbad", "Giridih", "East Singhbhum", "Bokaro", "Palamu",
  "Hazaribagh", "Deoghar", "Garhwa", "Dumka", "Godda", "Sahebganj",
  "Seraikela Kharsawan", "Chatra", "Gumla", "Ramgarh", "Pakur", "Jamtara",
  "Latehar", "Lohardaga", "Simdega", "Khunti", "Koderma", "West Singhbhum"
];

export default function GuestLayout({ lang, setLang, t, onAuthed, orgs = [] }) {
  // Feed state
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    under_research: 0,
    active_execution: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [activeStep, setActiveStep] = useState(1);

  // Modals state
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    role: "citizen",
    mode: "login",
    bannerNotice: null,
    targetAction: null,
  });
  const [previewProblem, setPreviewProblem] = useState(null);

  // Fetch public feed and stats
  useEffect(() => {
    let cancelled = false;
    setLoadingFeed(true);
    const params = {};
    if (selectedCategory && selectedCategory !== "All") params.category = selectedCategory;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    api.publicFeed(params)
      .then((res) => {
        if (!cancelled && res) {
          let list = res.problems || [];
          if (selectedDistrict) {
            list = list.filter((p) =>
              (p.district_name && p.district_name.toLowerCase().includes(selectedDistrict.toLowerCase())) ||
              (p.location && p.location.toLowerCase().includes(selectedDistrict.toLowerCase()))
            );
          }
          setProblems(list);
          if (res.stats) setStats(res.stats);
        }
      })
      .catch((err) => {
        console.warn("Could not load public feed:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingFeed(false);
      });

    return () => { cancelled = true; };
  }, [selectedCategory, selectedDistrict, searchQuery]);

  function openRegisterProblemAuth() {
    setAuthModal({
      isOpen: true,
      role: "citizen",
      mode: "register",
      bannerNotice: {
        title: lang === "hi" ? "समस्या दर्ज करने के लिए साइन इन या पंजीकरण करें" : "Sign In or Register to Submit a Problem",
        text: lang === "hi"
          ? "जीपीएस लोकेशन और फोटो प्रमाण के साथ जमीनी समस्या दर्ज करने के लिए कृपया अपने नागरिक खाते में लॉग इन करें या तुरंत नया खाता बनाएँ।"
          : "To geotag and report a ground-level issue with photo evidence to local block authorities, please sign in or register as a citizen. Your submission form will open automatically.",
      },
      targetAction: "register_problem",
    });
  }

  function openRoleAuth(roleKey, mode = "login") {
    setAuthModal({
      isOpen: true,
      role: roleKey,
      mode: mode,
      bannerNotice: null,
      targetAction: null,
    });
  }

  function handleAuthedSuccess(token, user, targetAction) {
    setAuthModal({ isOpen: false, role: "citizen", mode: "login", bannerNotice: null, targetAction: null });
    onAuthed(token, user, targetAction);
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, fontFamily: "'Noto Sans',sans-serif", color: COLORS.charcoal }}>
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.line}; border-radius: 8px; }
        input, select, textarea, button { font-family: 'Noto Sans', sans-serif; }
        .guest-nav-link:hover { color: ${COLORS.gold} !important; }
        .guest-card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(21,50,41,0.08) !important; border-color: ${COLORS.forest} !important; }
        .hero-btn-primary:hover { background: ${COLORS.ochreDark} !important; transform: translateY(-1px); }
        .hero-btn-sec:hover { background: rgba(255,255,255,0.18) !important; }
        .step-circle:hover { transform: scale(1.05); border-color: ${COLORS.forest} !important; }
        @media (max-width: 860px) {
          .pipeline-line { display: none !important; }
          .metrics-card-divider { border-left: none !important; border-top: 1px solid ${COLORS.line}; padding-top: 14px; }
        }
      `}</style>

      {/* ================= STICKY TOP NAVIGATION ================= */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 80,
          background: "#fff",
          borderBottom: `1px solid ${COLORS.line}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Brand Emblem */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: COLORS.forestDark,
                color: COLORS.gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 16,
                letterSpacing: 0.5,
                boxShadow: "0 2px 6px rgba(21,50,41,0.25)",
              }}
            >
              SICP
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 800,
                  fontSize: 15.5,
                  color: COLORS.forestDark,
                  lineHeight: 1.2,
                }}
              >
                {t.appName || "Societal Innovation Collaboration Portal"}
              </div>
              <div style={{ fontSize: 11, color: COLORS.ink, display: "flex", alignItems: "center", gap: 6 }}>
                <span>Govt. of Jharkhand</span>
                <span aria-hidden="true">·</span>
                <span>Higher & Technical Education</span>
              </div>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <nav style={{ display: "flex", alignItems: "center", gap: 20 }} className="hidden-mobile">
            <a
              href="#challenges"
              style={{ color: COLORS.charcoal, textDecoration: "none", fontSize: 13.5, fontWeight: 600 }}
              className="guest-nav-link"
            >
              {lang === "hi" ? "सार्वजनिक चुनौतियाँ" : "Public Challenges"}
            </a>
            <a
              href="#how-it-works"
              style={{ color: COLORS.charcoal, textDecoration: "none", fontSize: 13.5, fontWeight: 600 }}
              className="guest-nav-link"
            >
              {lang === "hi" ? "कार्यप्रणाली" : "How It Works"}
            </a>
            <a
              href="#stakeholders"
              style={{ color: COLORS.charcoal, textDecoration: "none", fontSize: 13.5, fontWeight: 600 }}
              className="guest-nav-link"
            >
              {lang === "hi" ? "हितधारक पोर्टल" : "Stakeholders"}
            </a>
          </nav>

          {/* Actions: Language, Sign In, and Register Problem */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LanguageDropdown lang={lang} setLang={setLang} variant="header" />

            <button
              type="button"
              onClick={() => openRoleAuth("citizen", "login")}
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.line}`,
                borderRadius: 8,
                padding: "8px 14px",
                color: COLORS.charcoal,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.plaster)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {t.login || "Sign In"}
            </button>

            {/* Prominent Register Problem CTA */}
            <button
              type="button"
              onClick={openRegisterProblemAuth}
              className="hero-btn-primary"
              style={{
                background: COLORS.ochre,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(193,122,63,0.3)",
                transition: "all 0.15s ease",
              }}
            >
              <Plus size={16} />
              <span>{lang === "hi" ? "समस्या दर्ज करें" : "Register a Problem"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section
        style={{
          background: `linear-gradient(135deg, ${COLORS.forestDark} 0%, ${COLORS.forest} 100%)`,
          color: "#fff",
          padding: "54px 20px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle geometric line pattern inspired by Sohrai art */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            pointerEvents: "none",
            backgroundImage: `repeating-linear-gradient(45deg, ${COLORS.gold} 0 2px, transparent 2px 24px)`,
          }}
        />

        <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{ maxWidth: 840 }}>
            {/* Editorial Eyebrow */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 12px",
                background: "rgba(255,255,255,0.12)",
                borderRadius: 6,
                color: COLORS.gold,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              <ShieldCheck size={14} />
              <span>
                {lang === "hi"
                  ? "झारखंड सामाजिक नवाचार एवं सहयोग मंच"
                  : "Collaborative Civic & Innovation Platform · Jharkhand"}
              </span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontFamily: "'Poppins',sans-serif",
                fontSize: "clamp(26px, 4vw, 42px)",
                fontWeight: 800,
                lineHeight: 1.2,
                margin: "0 0 16px 0",
                color: "#fff",
              }}
            >
              {lang === "hi"
                ? "नागरिक समस्याओं को अकादमिक शोध और जमीनी समाधान से जोड़ना"
                : "Bridging Grassroots Challenges with Research Innovation & Civic Action"}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(14px, 1.8vw, 16.5px)",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.9)",
                margin: "0 0 28px 0",
                maxWidth: 760,
              }}
            >
              {lang === "hi"
                ? "नागरिक अपनी पंचायत और वार्ड की जल, सड़क, कृषि व स्वास्थ्य समस्याओं को फोटो और जीपीएस के साथ दर्ज करते हैं। स्थानीय प्रशासन इसे सत्यापित करता है, राज्य के प्रमुख विश्वविद्यालय तकनीकी समाधान तैयार करते हैं और उद्योग साझेदार जमीन पर क्रियान्वयन करते हैं।"
                : "A unified portal connecting citizens' real ground challenges directly with District & Block administrations for official routing, Jharkhand's premier universities (BIT Mesra, NIT Jamshedpur, IIT ISM) for technical R&D, and industry partners for deployed solutions."}
            </p>

            {/* Hero CTAs */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={openRegisterProblemAuth}
                className="hero-btn-primary"
                style={{
                  background: COLORS.ochre,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "14px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(193,122,63,0.35)",
                  transition: "all 0.15s ease",
                }}
              >
                <Plus size={18} />
                <span>{lang === "hi" ? "समस्या दर्ज करें (लॉगिन / नया खाता)" : "Register a Problem (Sign In / Register)"}</span>
              </button>

              <a
                href="#challenges"
                className="hero-btn-sec"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 10,
                  padding: "14px 22px",
                  fontSize: 14.5,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Search size={16} />
                <span>{lang === "hi" ? "दर्ज समस्याएँ देखें" : "Explore Reported Issues"}</span>
              </a>

              <a
                href="#stakeholders"
                style={{
                  color: COLORS.gold,
                  fontSize: 13.5,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  textDecoration: "underline",
                  padding: "10px",
                }}
              >
                <span>{lang === "hi" ? "अधिकारी / शोधकर्ता प्रवेश" : "Official & Researcher Portals"}</span>
                <ChevronRight size={15} />
              </a>
            </div>
          </div>

          {/* Live Stats Strip */}
          <div
            style={{
              marginTop: 44,
              paddingTop: 28,
              borderTop: "1px solid rgba(255,255,255,0.15)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>
                {lang === "hi" ? "कुल दर्ज समस्याएँ" : "Total Reported"}
              </div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 28, fontWeight: 800, color: COLORS.gold, marginTop: 4 }}>
                {stats.total || problems.length || 0}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                LGD Geotagged across Jharkhand
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>
                {lang === "hi" ? "विश्वविद्यालय अनुसंधान में" : "In Academic R&D"}
              </div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 4 }}>
                {stats.under_research || 0}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                Student & faculty prototypes
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>
                {lang === "hi" ? "उद्योग निविदा व कार्य" : "Industry Execution"}
              </div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", marginTop: 4 }}>
                {stats.active_execution || 0}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                Funded & ground work active
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>
                {lang === "hi" ? "सत्यापित एवं समाधानित" : "Resolved & Verified"}
              </div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 28, fontWeight: 800, color: "#8be78b", marginTop: 4 }}>
                {stats.resolved || 0}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                Beneficiaries impacted
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS: 5-STAGE PIPELINE (LIGHT COLOURS PALETTE) ================= */}
      <section
        id="how-it-works"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #f8fbf9 50%, #f4f8f6 100%)",
          borderTop: `1px solid #e5ede7`,
          borderBottom: `1px solid #e5ede7`,
          padding: "64px 20px 72px",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          {/* Header Tag + Title + Subtitle */}
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 700,
                color: "#059669",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              <Sparkles size={13} color="#059669" />
              <span>{lang === "hi" ? "पारदर्शी कार्यप्रणाली" : "HOW IT WORKS · 5-STAGE PIPELINE"}</span>
            </div>

            <h2
              style={{
                fontFamily: "'Poppins',sans-serif",
                fontSize: "clamp(26px, 3.5vw, 36px)",
                fontWeight: 800,
                color: COLORS.forestDark,
                margin: "0 0 12px 0",
                lineHeight: 1.25,
              }}
            >
              {lang === "hi" ? "शिकायत से लेकर जमीनी समाधान तक" : "From Complaint to Deployed Solution"}
            </h2>

            <p
              style={{
                fontSize: "clamp(14px, 1.8vw, 15.5px)",
                color: COLORS.ink,
                maxWidth: 680,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              {lang === "hi"
                ? "एक सहज, एआई-संचालित प्रक्रिया जो नागरिक समस्याओं को रिपोर्टिंग से लेकर वास्तविक प्रभाव तक पहुँचाती है — किसी भी पारंपरिक प्रक्रिया से कहीं अधिक तेज।"
                : "A seamless, AI-powered pipeline that moves civic problems from submission to real-world impact — faster than any manual process."}
            </p>
          </div>

          {/* 5 Connected Step Nodes with Light Colors */}
          <div style={{ position: "relative", marginBottom: 32 }}>
            {/* Soft, light connecting track */}
            <div
              className="pipeline-line"
              style={{
                position: "absolute",
                top: 42,
                left: "8%",
                right: "8%",
                height: 3,
                background: "linear-gradient(90deg, #a7f3d0 0%, #fde68a 25%, #bfdbfe 50%, #ddd6fe 75%, #99f6e4 100%)",
                borderRadius: 4,
                zIndex: 1,
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                position: "relative",
                zIndex: 2,
              }}
            >
              {[
                {
                  num: 1,
                  title: lang === "hi" ? "नागरिक रिपोर्ट दर्ज" : "Citizen Submits",
                  actor: lang === "hi" ? "नागरिक एवं पंचायत" : "Citizens & Panchayats",
                  desc: lang === "hi"
                    ? "वेब या मोबाइल से फोटो, जीपीएस लोकेशन और विवरण के साथ स्थानीय समस्या दर्ज करें।"
                    : "Report a local problem via web or mobile with photos, location, and supporting documents.",
                  icon: Send,
                  iconRotate: "-10deg",
                  cardBg: "#f9fdfa",
                  cardBorder: activeStep === 1 ? "#059669" : "#e1f3e7",
                  circleBg: "#ecfdf5",
                  circleBorder: "#a7f3d0",
                  iconColor: "#059669",
                  badgeBg: "#dcfce7",
                  badgeText: "#15803d",
                  badgeBorder: "#bbf7d0",
                  pillBg: "#f0fdf4",
                  pillText: "#166534",
                  sla: "< 2 mins",
                  deliverable: "Geotagged Problem Ticket",
                },
                {
                  num: 2,
                  title: lang === "hi" ? "एआई वर्गीकरण" : "AI Classifies",
                  actor: lang === "hi" ? "जेमिनी एआई कोर" : "Gemini AI Engine",
                  desc: lang === "hi"
                    ? "जेमिनी एआई समस्या को स्वतः श्रेणीबद्ध करता है, डुप्लीकेट जांचता है और प्राथमिकता तय करता है।"
                    : "Gemini AI auto-categorizes the submission, checks for duplicates, and assigns a priority score.",
                  icon: Brain,
                  cardBg: "#fffdfa",
                  cardBorder: activeStep === 2 ? "#d97706" : "#fef3c7",
                  circleBg: "#fffbeb",
                  circleBorder: "#fde68a",
                  iconColor: "#d97706",
                  badgeBg: "#fef3c7",
                  badgeText: "#b45309",
                  badgeBorder: "#fde68a",
                  pillBg: "#fffbeb",
                  pillText: "#92400e",
                  sla: "< 60 secs",
                  deliverable: "Category & Urgency Score",
                },
                {
                  num: 3,
                  title: lang === "hi" ? "प्रशासनिक आवंटन" : "Admin Routes",
                  actor: lang === "hi" ? "प्रखंड / जिला प्रशासन" : "Govt. Officers & BDOs",
                  desc: lang === "hi"
                    ? "सरकार सत्यापित कर विषय विशेषज्ञता के आधार पर सबसे उपयुक्त विश्वविद्यालय को सौंपती है।"
                    : "Government validates and routes to the university best matched by domain expertise.",
                  icon: GitBranch,
                  cardBg: "#f8faff",
                  cardBorder: activeStep === 3 ? "#2563eb" : "#dbeafe",
                  circleBg: "#eff6ff",
                  circleBorder: "#bfdbfe",
                  iconColor: "#2563eb",
                  badgeBg: "#dbeafe",
                  badgeText: "#1d4ed8",
                  badgeBorder: "#bfdbfe",
                  pillBg: "#eff6ff",
                  pillText: "#1e40af",
                  sla: "24 - 48 hrs",
                  deliverable: "Administrative Validation",
                },
                {
                  num: 4,
                  title: lang === "hi" ? "विश्वविद्यालय निर्माण" : "University Builds",
                  actor: lang === "hi" ? "संकाय व छात्र शोध दल" : "Faculty & Student Labs",
                  desc: lang === "hi"
                    ? "संकाय और छात्र टीम बनाकर प्रस्ताव तैयार करते हैं और माइलस्टोन के साथ परियोजना पूरी करते हैं।"
                    : "Faculty and students form a team, develop a proposal, and execute the project with milestones.",
                  icon: GraduationCap,
                  cardBg: "#fbf9ff",
                  cardBorder: activeStep === 4 ? "#7c3aed" : "#ede9fe",
                  circleBg: "#f5f3ff",
                  circleBorder: "#ddd6fe",
                  iconColor: "#7c3aed",
                  badgeBg: "#ede9fe",
                  badgeText: "#6d28d9",
                  badgeBorder: "#ddd6fe",
                  pillBg: "#f5f3ff",
                  pillText: "#5b21b6",
                  sla: "2 - 6 weeks",
                  deliverable: "Working Engineering Prototype",
                },
                {
                  num: 5,
                  title: lang === "hi" ? "तैनाती व प्रभाव मापन" : "Deployed & Measured",
                  actor: lang === "hi" ? "उद्योग व सीएसआर साथी" : "Industry Partners & CSR",
                  desc: lang === "hi"
                    ? "उद्योग निविदा फंडिंग करता है। वास्तविक सामाजिक प्रभाव की ट्रैकिंग के साथ समाधान लाइव होता है।"
                    : "Industry funds deployment. Solutions go live with measurable social impact tracked in real time.",
                  icon: Rocket,
                  cardBg: "#f4fcf9",
                  cardBorder: activeStep === 5 ? "#0d9488" : "#ccfbf1",
                  circleBg: "#f0fdfa",
                  circleBorder: "#99f6e4",
                  iconColor: "#0d9488",
                  badgeBg: "#ccfbf1",
                  badgeText: "#0f766e",
                  badgeBorder: "#99f6e4",
                  pillBg: "#f0fdfa",
                  pillText: "#115e59",
                  sla: "Live Ongoing",
                  deliverable: "Turnkey Asset & Public Sign-off",
                },
              ].map((s) => {
                const IconComp = s.icon;
                const isSelected = activeStep === s.num;
                return (
                  <div
                    key={s.num}
                    onClick={() => setActiveStep(s.num)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveStep(s.num); }}
                    style={{
                      background: isSelected ? "#ffffff" : s.cardBg,
                      border: `1.5px solid ${s.cardBorder}`,
                      borderRadius: 14,
                      padding: "20px 14px 18px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: isSelected
                        ? "0 10px 24px rgba(21,50,41,0.09)"
                        : "0 2px 8px rgba(21,50,41,0.03)",
                      transform: isSelected ? "translateY(-3px)" : "none",
                      position: "relative",
                    }}
                  >
                    {/* Circle & Number Badge */}
                    <div style={{ position: "relative", width: 68, height: 68, margin: "0 auto 12px" }}>
                      <div
                        className="step-circle"
                        style={{
                          width: 68,
                          height: 68,
                          borderRadius: "50%",
                          background: "#ffffff",
                          border: `2px solid ${s.circleBorder}`,
                          boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: "50%",
                            background: s.circleBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconComp
                            size={22}
                            color={s.iconColor}
                            style={s.iconRotate ? { transform: `rotate(${s.iconRotate})` } : undefined}
                          />
                        </div>
                      </div>

                      {/* Light-colored, high-legibility Step Badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: -2,
                          right: -2,
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: s.badgeBg,
                          color: s.badgeText,
                          border: `1.5px solid ${s.badgeBorder}`,
                          fontSize: 12,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                        }}
                      >
                        {s.num}
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3
                      style={{
                        fontFamily: "'Poppins',sans-serif",
                        fontWeight: 700,
                        fontSize: 15.5,
                        color: COLORS.charcoal,
                        margin: "0 0 6px",
                      }}
                    >
                      {s.title}
                    </h3>

                    {/* Quiet Actor Pill */}
                    <div
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        background: s.pillBg,
                        color: s.pillText,
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        marginBottom: 10,
                      }}
                    >
                      {s.actor}
                    </div>

                    {/* Step Description */}
                    <p
                      style={{
                        fontSize: 12.5,
                        color: COLORS.ink,
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {s.desc}
                    </p>

                    {/* Interactive Indicator */}
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 11,
                        fontWeight: 700,
                        color: isSelected ? s.iconColor : "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <span>{isSelected ? (lang === "hi" ? "चयनित विवरण ▼" : "Selected Phase") : (lang === "hi" ? "विवरण देखें" : "Click to Inspect")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Step Deep Dive Box (Light & Friendly UI) */}
          {(() => {
            const stepDetails = {
              1: {
                title: lang === "hi" ? "चरण 1: नागरिक द्वारा समस्या दर्ज" : "Phase 1: Citizen Submits Ground Reality",
                desc: lang === "hi"
                  ? "नागरिक अपने स्मार्टफोन या स्थानीय प्रज्ञा केंद्र से सड़क, पेयजल, बिजली या विद्यालय संबंधी समस्या दर्ज करते हैं। फोटो प्रमाण और स्वचालित जीपीएस लोकेशन के साथ शिकायत सीधे संबंधित ब्लॉक एवं पंचायत से जुड़ जाती है।"
                  : "Citizens easily file issues using their phone with on-site photos and auto-detected GPS coordinates. The report is verified against Jharkhand's Local Government Directory (LGD) to match the appropriate Panchayat and Block.",
                badge: lang === "hi" ? "समय: < 2 मिनट" : "Turnaround: < 2 mins",
                deliverable: lang === "hi" ? "मुख्य निर्गम: जियोटैग्ड शिकायत टोकन" : "Output: Geotagged Issue Ticket",
                ctaText: lang === "hi" ? "+ अपनी समस्या दर्ज करें" : "+ Submit a Problem Now",
                action: openRegisterProblemAuth,
                accentColor: "#059669",
                bg: "#f0fdf4",
                border: "#bbf7d0",
              },
              2: {
                title: lang === "hi" ? "चरण 2: जेमिनी एआई द्वारा तत्काल विश्लेषण" : "Phase 2: Multimodal Gemini AI Classification",
                desc: lang === "hi"
                  ? "अपलोड की गई फोटो और विवरण का तुरंत जेमिनी मल्टीमॉडल एआई द्वारा विश्लेषण होता है। यह डुप्लीकेट शिकायतों को पहचानता है, समस्या की गंभीरता (Priority Score) तय करता है और सही प्रशासनिक विभाग निर्धारित करता है।"
                  : "Uploaded images and civic descriptions are processed in seconds by Gemini 2.5 Flash. The engine checks for duplicates across nearby wards, flags structural risks, assigns severity scores, and tags the target department.",
                badge: lang === "hi" ? "समय: < 60 सेकंड" : "Processing: < 60 seconds",
                deliverable: lang === "hi" ? "मुख्य निर्गम: प्राथमिकता व विभाग वर्गीकरण" : "Output: AI Priority & Domain Vector",
                ctaText: lang === "hi" ? "सार्वजनिक समस्याएँ देखें" : "Explore Public Challenges",
                action: () => {
                  const el = document.getElementById("challenges");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                },
                accentColor: "#d97706",
                bg: "#fffbeb",
                border: "#fef3c7",
              },
              3: {
                title: lang === "hi" ? "चरण 3: प्रशासनिक सत्यापन एवं आवंटन" : "Phase 3: Administrative Verification & Routing",
                desc: lang === "hi"
                  ? "प्रखंड विकास पदाधिकारी (BDO) और जिला नोडल अधिकारी अपने डैशबोर्ड पर सत्यापित समस्या को देखते हैं। प्रशासनिक स्वीकृति के बाद समस्या को राज्य के प्रमुख तकनीकी विश्वविद्यालय (BIT Mesra, NIT Jamshedpur आदि) को शोध हेतु सौंपा जाता है।"
                  : "Block Development Officers (BDOs) and District Nodal Officers review verified issues mapped to their LGD jurisdiction. Upon initial sanction, challenges are formally assigned to relevant engineering institutions for technical problem-solving.",
                badge: lang === "hi" ? "समय: 24 - 48 घंटे" : "Turnaround: 24 - 48 Hours",
                deliverable: lang === "hi" ? "मुख्य निर्गम: विश्वविद्यालय असाइनमेंट आदेश" : "Output: Official Assignment Order",
                ctaText: lang === "hi" ? "सरकारी डेस्क में लॉग इन" : "Government Desk Login",
                action: () => openRoleAuth("government", "login"),
                accentColor: "#2563eb",
                bg: "#eff6ff",
                border: "#dbeafe",
              },
              4: {
                title: lang === "hi" ? "चरण 4: विश्वविद्यालय अनुसंधान एवं प्रोटोटाइप" : "Phase 4: University Research & Prototype Engineering",
                desc: lang === "hi"
                  ? "विश्वविद्यालय के संकाय संरक्षक और इंजीनियरिंग छात्र टीम बनाकर स्थानीय परिस्थितियों के अनुकूल तकनीकी समाधान, सीएडी मॉडल या शोध रिपोर्ट तैयार करते हैं। माइलस्टोन पूरा होने पर समाधान परीक्षण के लिए तैयार होता है।"
                  : "Faculty mentors and student engineering squads adopt the assigned brief. They develop low-cost, durable engineering solutions (e.g. solar water filters, bamboo-reinforced bridges, IoT sensors) with verifiable milestone deliverables.",
                badge: lang === "hi" ? "समय: 2 से 6 सप्ताह" : "Timeline: 2 - 6 Weeks",
                deliverable: lang === "hi" ? "मुख्य निर्गम: तकनीकी प्रोटोटाइप व डीपीआर" : "Output: Working Prototype & DPR",
                ctaText: lang === "hi" ? "विश्वविद्यालय पोर्टल में प्रवेश" : "University Portal Login",
                action: () => openRoleAuth("university", "login"),
                accentColor: "#7c3aed",
                bg: "#f5f3ff",
                border: "#ede9fe",
              },
              5: {
                title: lang === "hi" ? "चरण 5: उद्योग निविदा, ऑन-ग्राउंड कार्य एवं सत्यापन" : "Phase 5: Industry Execution, Deployment & Citizen Sign-off",
                desc: lang === "hi"
                  ? "अनुमोदित प्रोटोटाइप के आधार पर उद्योग साझेदार व सीएसआर फाउंडेशन निविदा प्रस्तुत करते हैं और जमीन पर निर्माण/कार्यान्वयन करते हैं। समाधान पूरा होने के बाद नागरिक और अधिकारी मिलकर संतुष्टि सत्यापित करते हैं।"
                  : "Empaneled contractors and corporate CSR partners submit competitive execution tenders, finance deployment, and execute field construction. Citizens and government officers conduct final joint sign-off before closure.",
                badge: lang === "hi" ? "समय: लाइव ट्रैकिंग" : "Timeline: Turnkey Execution",
                deliverable: lang === "hi" ? "मुख्य निर्गम: पूर्ण समाधान व सामाजिक प्रभाव" : "Output: Verified Deployment & Beneficiary Impact",
                ctaText: lang === "hi" ? "उद्योग पोर्टल में प्रवेश" : "Industry Portal Login",
                action: () => openRoleAuth("industry", "login"),
                accentColor: "#0d9488",
                bg: "#f0fdfa",
                border: "#ccfbf1",
              },
            }[activeStep] || null;

            if (!stepDetails) return null;

            return (
              <div
                style={{
                  background: stepDetails.bg,
                  border: `1.5px solid ${stepDetails.border}`,
                  borderRadius: 14,
                  padding: "20px 24px",
                  marginBottom: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 18,
                  boxShadow: "0 3px 12px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontFamily: "'Poppins',sans-serif",
                        fontWeight: 800,
                        fontSize: 16.5,
                        color: stepDetails.accentColor,
                      }}
                    >
                      {stepDetails.title}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "#fff",
                        border: `1px solid ${stepDetails.border}`,
                        fontSize: 11,
                        fontWeight: 700,
                        color: stepDetails.accentColor,
                      }}
                    >
                      {stepDetails.badge}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "#fff",
                        border: `1px solid ${stepDetails.border}`,
                        fontSize: 11,
                        fontWeight: 600,
                        color: COLORS.charcoal,
                      }}
                    >
                      {stepDetails.deliverable}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: 13, color: COLORS.charcoal, lineHeight: 1.55 }}>
                    {stepDetails.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={stepDetails.action}
                  style={{
                    background: stepDetails.accentColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "9px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <span>{stepDetails.ctaText}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })()}

          {/* Metrics Row (Rendered in Fresh, Soft Light Pastel Cards) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {/* Metric 1: Mint/Green light card */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 14,
                padding: "22px 20px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(34,197,94,0.04)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: "clamp(26px, 3.2vw, 32px)",
                  fontWeight: 800,
                  color: "#15803d",
                  lineHeight: 1.1,
                }}
              >
                &lt; 60 sec
              </div>
              <div style={{ fontSize: 13.5, color: "#166534", fontWeight: 700, marginTop: 8 }}>
                {lang === "hi" ? "एआई वर्गीकरण गति" : "AI Classification Speed"}
              </div>
              <div style={{ fontSize: 11.5, color: "#4ade80", marginTop: 4, fontWeight: 600 }}>
                Gemini 2.5 Flash Multimodal Pipeline
              </div>
            </div>

            {/* Metric 2: Soft Gold/Amber light card */}
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: 14,
                padding: "22px 20px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(245,158,11,0.04)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: "clamp(26px, 3.2vw, 32px)",
                  fontWeight: 800,
                  color: "#b45309",
                  lineHeight: 1.1,
                }}
              >
                94%
              </div>
              <div style={{ fontSize: 13.5, color: "#92400e", fontWeight: 700, marginTop: 8 }}>
                {lang === "hi" ? "स्वतः श्रेणीबद्धता सटीकता" : "Auto-categorization Accuracy"}
              </div>
              <div style={{ fontSize: 11.5, color: "#d97706", marginTop: 4, fontWeight: 600 }}>
                Duplicate detection across wards & blocks
              </div>
            </div>

            {/* Metric 3: Soft Azure/Sky light card */}
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 14,
                padding: "22px 20px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(59,130,246,0.04)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: "clamp(26px, 3.2vw, 32px)",
                  fontWeight: 800,
                  color: "#1d4ed8",
                  lineHeight: 1.1,
                }}
              >
                3× faster
              </div>
              <div style={{ fontSize: 13.5, color: "#1e40af", fontWeight: 700, marginTop: 8 }}>
                {lang === "hi" ? "पारंपरिक प्रक्रिया से तेज" : "Faster than Manual Routing"}
              </div>
              <div style={{ fontSize: 11.5, color: "#60a5fa", marginTop: 4, fontWeight: 600 }}>
                Direct LGD Block & District Officer dispatch
              </div>
            </div>

            {/* Metric 4: Soft Teal light card */}
            <div
              style={{
                background: "#f0fdfa",
                border: "1px solid #99f6e4",
                borderRadius: 14,
                padding: "22px 20px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(20,184,166,0.04)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: "clamp(26px, 3.2vw, 32px)",
                  fontWeight: 800,
                  color: "#0f766e",
                  lineHeight: 1.1,
                }}
              >
                100%
              </div>
              <div style={{ fontSize: 13.5, color: "#115e59", fontWeight: 700, marginTop: 8 }}>
                {lang === "hi" ? "शुरुआत से अंत तक ट्रैक" : "Tracked End-to-End"}
              </div>
              <div style={{ fontSize: 11.5, color: "#2dd4bf", marginTop: 4, fontWeight: 600 }}>
                Transparent public audit from submission to fix
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PUBLIC CHALLENGES EXPLORER ================= */}
      <section
        id="challenges"
        style={{
          background: "#fff",
          borderTop: `1px solid ${COLORS.line}`,
          borderBottom: `1px solid ${COLORS.line}`,
          padding: "54px 20px 64px",
        }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.ochre, textTransform: "uppercase", letterSpacing: 1.5 }}>
                {lang === "hi" ? "लाइव नागरिक समस्याएँ" : "Live Community Challenges"}
              </div>
              <h2
                style={{
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: "clamp(22px, 2.5vw, 28px)",
                  fontWeight: 800,
                  color: COLORS.forestDark,
                  margin: "4px 0 0",
                }}
              >
                {lang === "hi" ? "झारखंड की दर्ज समस्याएँ व स्थिति" : "Public Challenges in Jharkhand"}
              </h2>
            </div>

            {/* Direct CTA to register a problem from within the feed */}
            <button
              type="button"
              onClick={openRegisterProblemAuth}
              style={{
                background: COLORS.forest,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 18px",
                fontSize: 13.5,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(21,50,41,0.2)",
              }}
            >
              <Plus size={16} />
              <span>{lang === "hi" ? "+ अपनी समस्या दर्ज करें" : "+ Report New Problem"}</span>
            </button>
          </div>

          {/* Filter Bar: Search + District Dropdown */}
          <div
            style={{
              background: COLORS.cream,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 220, background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 12px" }}>
              <Search size={16} color={COLORS.ink} />
              <input
                type="text"
                placeholder={lang === "hi" ? "शीर्षक, स्थान या विवरण से खोजें..." : "Search issues by keyword, locality, or title..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: 13.5,
                  background: "transparent",
                  color: COLORS.charcoal,
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{ background: "none", border: "none", color: COLORS.ink, cursor: "pointer", fontSize: 12 }}
                >
                  Clear
                </button>
              )}
            </div>

            <div style={{ minWidth: 200 }}>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{
                  width: "100%",
                  background: "#fff",
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 8,
                  padding: "9px 12px",
                  fontSize: 13,
                  color: COLORS.charcoal,
                  cursor: "pointer",
                }}
              >
                <option value="">— All Districts (सम्पूर्ण झारखंड) —</option>
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Category Segmented Tabs (Buttons with click handlers per frontend-design) */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 8,
              marginBottom: 24,
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                border: `1px solid ${selectedCategory === "All" ? COLORS.forest : COLORS.line}`,
                background: selectedCategory === "All" ? COLORS.forest : "#fff",
                color: selectedCategory === "All" ? "#fff" : COLORS.charcoal,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              All Categories ({stats.total || problems.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: `1px solid ${selectedCategory === cat ? COLORS.forest : COLORS.line}`,
                  background: selectedCategory === cat ? COLORS.forest : "#fff",
                  color: selectedCategory === cat ? "#fff" : COLORS.charcoal,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {getCategoryLabel(cat, lang)}
              </button>
            ))}
          </div>

          {/* Problems Grid */}
          {loadingFeed ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: COLORS.ink }}>
              <div style={{ fontSize: 14 }}>Loading public challenges...</div>
            </div>
          ) : problems.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: COLORS.cream,
                borderRadius: 14,
                border: `1px dashed ${COLORS.line}`,
              }}
            >
              <HelpCircle size={36} color={COLORS.ink} style={{ marginBottom: 10 }} />
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.charcoal }}>
                No challenges found matching your filters
              </div>
              <p style={{ color: COLORS.ink, fontSize: 13.5, maxWidth: 440, margin: "6px auto 18px" }}>
                Be the first citizen or community member to register an issue in this category or district.
              </p>
              <button
                type="button"
                onClick={openRegisterProblemAuth}
                className="hero-btn-primary"
                style={{
                  background: COLORS.ochre,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Plus size={16} />
                <span>Register a Problem Here</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 18,
              }}
            >
              {problems.map((p) => {
                const statusHuman = {
                  pending_review: "Awaiting Govt. Review",
                  rejected: "Declined",
                  university_assigned: "University R&D Assigned",
                  team_formed: "Lab Team Assembled",
                  industry_requested: "Open for Industry Tenders",
                  budget_review: "Budget Review Underway",
                  budget_rejected: "Budget Revision Requested",
                  in_progress: "Tender Awarded · Groundwork In Progress",
                  completed: "Completed & Verified",
                }[p.status] || p.status;

                return (
                  <div
                    key={p.id}
                    className="guest-card"
                    style={{
                      background: "#fff",
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: 14,
                      padding: "20px 20px 18px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div>
                      {/* Quiet unboxed metadata line per zero-pill discipline */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: COLORS.ink,
                          marginBottom: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontWeight: 700, color: COLORS.forest }}>
                          {getCategoryLabel(p.category, lang)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{p.district_name ? `${p.district_name} (LGD ${p.district_code || "328"})` : "Jharkhand"}</span>
                        {p.subdistrict_name && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{p.subdistrict_name}</span>
                          </>
                        )}
                      </div>

                      {/* Problem Title */}
                      <h3
                        style={{
                          fontFamily: "'Poppins',sans-serif",
                          fontWeight: 700,
                          fontSize: 16.5,
                          color: COLORS.charcoal,
                          margin: "0 0 8px 0",
                          lineHeight: 1.35,
                        }}
                      >
                        {p.title}
                      </h3>

                      {/* Problem Snippet */}
                      <p
                        style={{
                          fontSize: 13,
                          color: COLORS.ink,
                          lineHeight: 1.55,
                          margin: "0 0 14px 0",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {p.description}
                      </p>

                      {/* Location snippet */}
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: COLORS.charcoal, marginBottom: 12 }}>
                        <MapPin size={13} color={COLORS.ochre} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.location || "Jharkhand"}
                        </span>
                      </div>
                    </div>

                    {/* Footer strip: Status + Action */}
                    <div
                      style={{
                        paddingTop: 12,
                        borderTop: `1px solid ${COLORS.line}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: p.status === "completed" ? "#1f7a3f" : COLORS.forestDark }}>
                        {statusHuman}
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewProblem(p)}
                        style={{
                          background: COLORS.plaster,
                          color: COLORS.charcoal,
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= STAKEHOLDER PORTAL GATEWAYS ================= */}
      <section
        id="stakeholders"
        style={{
          padding: "60px 20px 70px",
          maxWidth: 1160,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 38 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.ochre, textTransform: "uppercase", letterSpacing: 1.5 }}>
            {lang === "hi" ? "हितधारक द्वार" : "Stakeholder Access Portals"}
          </div>
          <h2
            style={{
              fontFamily: "'Poppins',sans-serif",
              fontSize: "clamp(22px, 3vw, 28px)",
              fontWeight: 800,
              color: COLORS.forestDark,
              margin: "6px 0 10px",
            }}
          >
            {lang === "hi" ? "अपनी भूमिका के अनुसार पोर्टल में प्रवेश करें" : "Sign In or Register According to Your Role"}
          </h2>
          <p style={{ color: COLORS.ink, fontSize: 14, maxWidth: 620, margin: "0 auto" }}>
            Each stakeholder role has a dedicated dashboard with real-time jurisdictional filters, research project workspaces, or competitive bidding tools.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
          }}
        >
          {/* Citizen Card */}
          <div
            className="guest-card"
            style={{
              background: "#fff",
              border: `1.5px solid ${COLORS.line}`,
              borderRadius: 14,
              padding: "26px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.2s ease",
            }}
          >
            <div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: COLORS.plaster,
                  color: COLORS.forest,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <User size={24} />
              </div>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.charcoal, margin: "0 0 8px 0" }}>
                {t.citizen || "Citizen"}
              </h3>
              <p style={{ fontSize: 13, color: COLORS.ink, lineHeight: 1.55, margin: "0 0 20px" }}>
                Report community challenges, submit GPS & photo proof, track grievance progress through 6 stages, and sign off on completed work.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openRoleAuth("citizen", "login")}
              style={{
                width: "100%",
                background: COLORS.forest,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>{lang === "hi" ? "नागरिक पोर्टल" : "Citizen Portal"}</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* University Card */}
          <div
            className="guest-card"
            style={{
              background: "#fff",
              border: `1.5px solid ${COLORS.line}`,
              borderRadius: 14,
              padding: "26px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.2s ease",
            }}
          >
            <div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: COLORS.plaster,
                  color: COLORS.forest,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <GraduationCap size={24} />
              </div>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.charcoal, margin: "0 0 8px 0" }}>
                {t.university || "University & R&D Labs"}
              </h3>
              <p style={{ fontSize: 13, color: COLORS.ink, lineHeight: 1.55, margin: "0 0 20px" }}>
                Faculty mentors & student engineering teams adopt government-assigned challenges to design innovative technical solutions and prototypes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openRoleAuth("university", "login")}
              style={{
                width: "100%",
                background: COLORS.forest,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>{lang === "hi" ? "विश्वविद्यालय पोर्टल" : "University Portal"}</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Government Card */}
          <div
            className="guest-card"
            style={{
              background: "#fff",
              border: `1.5px solid ${COLORS.line}`,
              borderRadius: 14,
              padding: "26px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.2s ease",
            }}
          >
            <div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: COLORS.plaster,
                  color: COLORS.forest,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Landmark size={24} />
              </div>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.charcoal, margin: "0 0 8px 0" }}>
                {t.government || "Government Officials"}
              </h3>
              <p style={{ fontSize: 13, color: COLORS.ink, lineHeight: 1.55, margin: "0 0 20px" }}>
                BDOs, District Officers & State Nodal Desks review complaints under their LGD jurisdiction, route to institutions, and approve field budgets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openRoleAuth("government", "login")}
              style={{
                width: "100%",
                background: COLORS.forest,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>{lang === "hi" ? "सरकारी अधिकारी डेस्क" : "Government Desk"}</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Industry Card */}
          <div
            className="guest-card"
            style={{
              background: "#fff",
              border: `1.5px solid ${COLORS.line}`,
              borderRadius: 14,
              padding: "26px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.2s ease",
            }}
          >
            <div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: COLORS.plaster,
                  color: COLORS.forest,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Factory size={24} />
              </div>
              <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.charcoal, margin: "0 0 8px 0" }}>
                {t.industry || "Industry Partners"}
              </h3>
              <p style={{ fontSize: 13, color: COLORS.ink, lineHeight: 1.55, margin: "0 0 20px" }}>
                Corporate CSR, technology partners & contractors submit competitive tenders, execute on-ground engineering, and log milestone proofs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openRoleAuth("industry", "login")}
              style={{
                width: "100%",
                background: COLORS.forest,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span>{lang === "hi" ? "उद्योग साझेदार पोर्टल" : "Industry Portal"}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer
        style={{
          background: COLORS.forestDark,
          color: "rgba(255,255,255,0.8)",
          padding: "48px 20px 32px",
          borderTop: `1px solid rgba(255,255,255,0.1)`,
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 32,
            marginBottom: 36,
          }}
        >
          <div>
            <div style={{ color: COLORS.gold, fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
              SICP Jharkhand
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", margin: 0 }}>
              Societal Innovation Collaboration Portal, an initiative under the Department of Higher & Technical Education, Government of Jharkhand.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 13.5, marginBottom: 12 }}>
              Quick Navigation
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
              <a href="#challenges" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>Public Challenges Feed</a>
              <a href="#how-it-works" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>The 4-Way Collaborative Framework</a>
              <a href="#stakeholders" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>Stakeholder Portals</a>
              <button
                type="button"
                onClick={openRegisterProblemAuth}
                style={{ background: "none", border: "none", padding: 0, textAlign: "left", color: COLORS.gold, cursor: "pointer", fontWeight: 700 }}
              >
                + Register a Ground Problem
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 13.5, marginBottom: 12 }}>
              Administrative Integration
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "rgba(255,255,255,0.7)" }}>
              Standardized with Ministry of Panchayati Raj Local Government Directory (LGD) Hierarchy: State (20) → 24 Districts → 263 Subdistricts / Blocks.
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 13.5, marginBottom: 12 }}>
              Portal Access
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                onClick={() => openRoleAuth("citizen", "login")}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 6,
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                Sign In to Your Account
              </button>
              <button
                type="button"
                onClick={openRegisterProblemAuth}
                style={{
                  background: COLORS.ochre,
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                Create Citizen Account
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <div>
            © {new Date().getFullYear()} Government of Jharkhand · Societal Innovation Collaboration Portal. All rights reserved.
          </div>
          <div>
            Authentic Sohrai & Khovar Earthen Palette Design
          </div>
        </div>
      </footer>

      {/* ================= AUTH MODAL (LOGIN / REGISTER) ================= */}
      {authModal.isOpen && (
        <Login
          lang={lang}
          setLang={setLang}
          t={t}
          onAuthed={handleAuthedSuccess}
          initialRole={authModal.role}
          initialMode={authModal.mode}
          bannerNotice={authModal.bannerNotice}
          targetAction={authModal.targetAction}
          isModal={true}
          onClose={() => setAuthModal({ isOpen: false, role: "citizen", mode: "login", bannerNotice: null, targetAction: null })}
        />
      )}

      {/* ================= PROBLEM DETAIL PREVIEW MODAL ================= */}
      {previewProblem && (
        <ProblemDetail
          p={previewProblem}
          lang={lang}
          t={t}
          role="guest"
          orgs={orgs}
          onClose={() => setPreviewProblem(null)}
          onChanged={() => {}}
          onRequestAuth={(roleKey, mode = "login", targetAction = null) => {
            setAuthModal({
              isOpen: true,
              role: roleKey || "citizen",
              mode: mode,
              bannerNotice: targetAction === "register_problem" ? {
                title: "Register a Ground Problem",
                text: "Sign in or register your citizen account to submit a societal problem with GPS coordinates and camera evidence.",
              } : null,
              targetAction: targetAction,
            });
          }}
        />
      )}
    </div>
  );
}
