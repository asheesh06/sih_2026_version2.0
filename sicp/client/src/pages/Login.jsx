import React, { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  Landmark,
  Factory,
  Globe,
  ChevronRight,
  Info,
  CheckCircle2,
  Mail,
  ArrowRight,
  Settings,
  X,
  Lock,
} from "lucide-react";
import { COLORS } from "../theme.js";
import { Field, Btn, inputStyle } from "../components/ui.jsx";
import { api } from "../api.js";
import LanguageDropdown from "../components/LanguageDropdown.jsx";
import {
  signInWithGoogleViaFirebase,
  isFirebaseConfigured,
} from "../firebase.js";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

export default function Login({ lang, setLang, t, onAuthed }) {
  const [role, setRole] = useState("citizen");
  const [mode, setMode] = useState("login"); // login | register
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Email / Password credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgs, setOrgs] = useState([]);

  // Google System Account Chooser modal
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [showManualGoogleInput, setShowManualGoogleInput] = useState(false);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // System Google accounts discovered on user device
  const systemGoogleAccounts = [
    {
      name: "Asheesh Patel",
      email: "asheeshpatel06@gmail.com",
      avatarLetter: "A",
      bgColor: "#4285F4",
      tag: "Current User",
    },
    {
      name: "Citizen Contributor",
      email: "citizen.jharkhand@gmail.com",
      avatarLetter: "C",
      bgColor: "#0F9D58",
      tag: "Citizen Account",
    },
  ];

  useEffect(() => {
    if (role === "university") {
      api.organisations().then((d) => setOrgs(d.organisations.filter((o) => o.type === role))).catch(() => {});
    } else {
      setOrgs([]);
    }
  }, [role]);

  const roles = [
    { key: "citizen", icon: User, label: t.citizen, desc: t.citizenDesc },
    { key: "university", icon: GraduationCap, label: t.university, desc: t.universityDesc },
    { key: "government", icon: Landmark, label: t.government, desc: t.governmentDesc },
    { key: "industry", icon: Factory, label: t.industry, desc: t.industryDesc },
  ];

  // Standard email & password submission
  async function submitEmailAuth() {
    setError(""); setBusy(true);
    try {
      let resp;
      if (mode === "login") {
        resp = await api.login({ email, password });
      } else {
        resp = await api.register({ name, email, password, role, org_name: orgName || undefined });
      }
      onAuthed(resp.token, resp.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const [authNotice, setAuthNotice] = useState(null);

  // Google Login and Signup trigger
  async function handleGoogleAuthClick() {
    setError("");
    setAuthNotice(null);
    setBusy(true);

    if (isFirebaseConfigured()) {
      try {
        const user = await signInWithGoogleViaFirebase();
        const resp = await api.googleAuth({
          email: user.email,
          name: user.name,
          role: role || "citizen",
          org_name: (role === "university" || role === "industry" || role === "government") ? orgName : undefined,
        });
        onAuthed(resp.token, resp.user);
        return;
      } catch (err) {
        console.error("Firebase Google Auth error:", err);
        const code = err.code || "";
        const host = typeof window !== "undefined" ? window.location.host : "";

        if (code === "auth/unauthorized-domain") {
          setAuthNotice({
            type: "domain",
            title: "Domain Not Authorized in Firebase",
            message: `Firebase blocked the Google window because "${host}" has not been added to your Firebase project's Authorized Domains.`,
            action: "Go to Firebase Console → Authentication → Settings → Authorized domains and add this domain.",
          });
        } else if (code === "auth/popup-blocked") {
          setAuthNotice({
            type: "popup",
            title: "Popup Blocked by Browser",
            message: "Your browser or the preview iframe blocked the Google account window.",
            action: "Click 'Open in New Tab' above or enable popups in your browser address bar.",
          });
        } else if (code === "auth/operation-not-allowed") {
          setAuthNotice({
            type: "provider",
            title: "Google Sign-In Disabled in Firebase",
            message: "The Google provider is not yet enabled in your Firebase project.",
            action: "Go to Firebase Console → Authentication → Sign-in method → Click Google → Toggle Enable → Save.",
          });
        } else if (code === "auth/popup-closed-by-user") {
          setError("Google sign-in popup was closed before completing.");
        } else {
          setError(err.message || "Could not complete Google authentication.");
        }
      } finally {
        setBusy(false);
      }
    } else {
      setBusy(false);
      setShowGoogleChooser(true);
    }
  }

  // Authenticate with chosen Google ID
  async function selectGoogleAccount(selectedEmail, selectedName) {
    setError("");
    setBusy(true);
    try {
      const resp = await api.googleAuth({
        email: selectedEmail,
        name: selectedName || selectedEmail.split("@")[0],
        role: role || "citizen",
        org_name: (role === "university" || role === "industry" || role === "government") ? orgName : undefined,
      });
      setShowGoogleChooser(false);
      onAuthed(resp.token, resp.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, fontFamily: "'Noto Sans',sans-serif" }}>
      {/* Header Banner */}
      <div style={{
        background: `linear-gradient(120deg, ${COLORS.forestDark}, ${COLORS.forest})`,
        padding: "42px 8vw 60px",
        position: "relative",
        zIndex: 40,
        overflow: "visible",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.10,
          overflow: "hidden",
          pointerEvents: "none",
          backgroundImage: `repeating-linear-gradient(45deg, ${COLORS.gold} 0 2px, transparent 2px 26px)`
        }} />
        <div style={{
          maxWidth: 880,
          margin: "0 auto",
          position: "relative",
          zIndex: 41,
        }}>
          {/* Top Bar with Tag and Fixed Language Selector */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}>
            <div style={{
              color: COLORS.gold,
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontWeight: 600,
              lineHeight: 1.4,
            }}>
              {t.appTag}
            </div>
            <div style={{ flexShrink: 0, marginLeft: "auto", position: "relative", zIndex: 42 }}>
              <LanguageDropdown lang={lang} setLang={setLang} variant="banner" />
            </div>
          </div>

          {/* Portal Title Heading */}
          <div>
            <h1 style={{
              color: "#fff",
              fontFamily: "'Poppins',sans-serif",
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.25,
            }}>
              {t.appName}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Login / Signup Card */}
      <div style={{ maxWidth: 880, margin: "-30px auto 0", padding: "0 20px 60px", position: "relative", zIndex: 10 }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 10px 30px rgba(20,30,20,.12)", padding: "32px 32px 36px", border: `1px solid ${COLORS.line}` }}>
          
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", color: COLORS.charcoal, fontSize: 22, fontWeight: 700, margin: 0 }}>
              {t.chooseRole}
            </h2>
            <p style={{ color: COLORS.ink, fontSize: 13.5, margin: "6px auto 0", maxWidth: 520 }}>
              {t.selectRolePrompt}
            </p>
          </div>

          {/* Role selector */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
            {roles.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => { setRole(r.key); setOrgName(""); setError(""); }}
                style={{
                  textAlign: "center",
                  padding: "18px 16px",
                  borderRadius: 12,
                  cursor: "pointer",
                  border: `2px solid ${role === r.key ? COLORS.forest : COLORS.line}`,
                  background: role === r.key ? "#eef4ee" : "#fff",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: COLORS.plaster, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <r.icon size={22} color={COLORS.forest} />
                </div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15.5, color: COLORS.charcoal, textAlign: "center" }}>{r.label}</div>
                <div style={{ fontSize: 12.5, color: COLORS.ink, marginTop: 3, lineHeight: 1.4, textAlign: "center" }}>{r.desc}</div>
              </button>
            ))}
          </div>

          {role && (
            <div style={{ borderTop: `1px dashed ${COLORS.line}`, paddingTop: 26, maxWidth: 480, margin: "0 auto" }}>
              
              {/* Selected Role Tag */}
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 20,
                  background: "#eef4ee",
                  border: `1px solid ${COLORS.forest}`,
                  color: COLORS.forest,
                  fontSize: 13,
                  fontWeight: 700,
                }}>
                  {t.selectedRole} {t[role] || role}
                </span>
              </div>
              
              {/* Optional Org specification for university */}
              {role === "university" && (
                <div style={{ marginBottom: 18 }}>
                  <Field label={t.selectUniversity}>
                    <select style={inputStyle} value={orgName} onChange={(e) => setOrgName(e.target.value)}>
                      <option value="">— {t.chooseFromRegistry} —</option>
                      {orgs.map((o) => <option key={o.id} value={o.name}>{o.name}</option>)}
                    </select>
                  </Field>
                </div>
              )}

              {role === "government" && (
                <div style={{ marginBottom: 18 }}>
                  <Field label={t.departmentName}>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Dept. of Higher & Technical Education"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </Field>
                </div>
              )}

              {/* PRIMARY ACTION: Continue with Google */}
              <div style={{ marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={handleGoogleAuthClick}
                  disabled={busy}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    padding: "13px 20px",
                    borderRadius: 12,
                    background: "#fff",
                    border: `1.5px solid #dadce0`,
                    color: "#3c4043",
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "0 2px 5px rgba(60,64,67,.15)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 3px 8px rgba(60,64,67,.25)";
                    e.currentTarget.style.background = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 5px rgba(60,64,67,.15)";
                    e.currentTarget.style.background = "#fff";
                  }}
                >
                  <GoogleIcon />
                  <span>
                    {t.continueWithGoogleAs} {t[role] || role}
                  </span>
                </button>

                <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: COLORS.ink }}>
                  {t.instantGoogleTag}
                </div>
              </div>

              {/* Actionable notice when Google popup encounters domain / browser restrictions */}
              {authNotice && (
                <div
                  style={{
                    background: "#fef7e0",
                    border: "1px solid #f9ab00",
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 16,
                    fontSize: 12.5,
                    color: "#5f4300",
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <Info size={16} color="#d97706" /> {authNotice.title}
                  </div>
                  <div style={{ marginBottom: 6 }}>{authNotice.message}</div>
                  <div style={{ background: "#fff", padding: "8px 10px", borderRadius: 6, border: "1px solid #fde68a", fontWeight: 600, color: COLORS.charcoal, marginBottom: 8, wordBreak: "break-all" }}>
                    {authNotice.action}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setShowGoogleChooser(true)}
                      style={{
                        background: COLORS.forest,
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Bypass & select test account
                    </button>
                    <a
                      href={typeof window !== "undefined" ? window.location.href : "#"}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: "#fff",
                        color: COLORS.forest,
                        border: `1px solid ${COLORS.forest}`,
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      Open in new tab
                    </a>
                  </div>
                </div>
              )}

              {error && (
                <div style={{ color: COLORS.danger, fontSize: 13, background: "#ffebee", padding: "8px 12px", borderRadius: 8, marginBottom: 14, textAlign: "center" }}>
                  {error}
                </div>
              )}

              {/* Toggle alternative email / password login */}
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: COLORS.forest,
                    fontWeight: 600,
                    textDecoration: "underline",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Mail size={15} />
                  <span>{showEmailForm ? "Hide email / password options" : "Or use email & password / credentials"}</span>
                </button>
              </div>

              {/* Email / Password Form (Alternative) */}
              {showEmailForm && (
                <div style={{
                  marginTop: 18,
                  padding: "18px 20px",
                  background: COLORS.cream,
                  borderRadius: 12,
                  border: `1px solid ${COLORS.line}`,
                }}>
                  <div style={{ display: "flex", gap: 14, marginBottom: 14, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 8 }}>
                    <button
                      type="button"
                      onClick={() => { setMode("login"); setError(""); }}
                      style={{
                        background: "none",
                        borderTop: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        borderBottomWidth: 2,
                        borderBottomStyle: "solid",
                        borderBottomColor: mode === "login" ? COLORS.forest : "transparent",
                        cursor: "pointer",
                        color: mode === "login" ? COLORS.forest : COLORS.ink,
                        fontWeight: 700,
                        paddingBottom: 4,
                      }}
                    >
                      {t.login}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode("register"); setError(""); }}
                      style={{
                        background: "none",
                        borderTop: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        borderBottomWidth: 2,
                        borderBottomStyle: "solid",
                        borderBottomColor: mode === "register" ? COLORS.forest : "transparent",
                        cursor: "pointer",
                        color: mode === "register" ? COLORS.forest : COLORS.ink,
                        paddingBottom: 4,
                      }}
                    >
                      {t.registerBtn}
                    </button>
                  </div>

                  {mode === "register" && (
                    <Field label={t.yourName}>
                      <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
                    </Field>
                  )}
                  <Field label={t.email}>
                    <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Field>
                  <Field label={t.password}>
                    <input type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
                  </Field>

                  <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                    <Btn
                      icon={ChevronRight}
                      disabled={busy || !email || !password || (mode === "register" && !name)}
                      onClick={submitEmailAuth}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      {busy ? "Authenticating..." : (mode === "login" ? t.login : t.registerBtn)}
                    </Btn>
                  </div>

                  {mode === "login" && (
                    <div style={{ marginTop: 12, fontSize: 11.5, color: COLORS.ink, textAlign: "center" }}>
                      Demo accounts: <code>citizen@demo.gov.in</code>, <code>government@demo.gov.in</code> (pw: <code>demo1234</code>)
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Google System Account Chooser Modal (showing discovered Google IDs) */}
      {showGoogleChooser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,25,20,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 90,
            padding: 16,
          }}
          onClick={() => setShowGoogleChooser(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "24px 28px",
              width: 440,
              maxWidth: "94vw",
              boxShadow: "0 20px 40px rgba(0,0,0,0.24)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <GoogleIcon />
                <h3 style={{ fontFamily: "'Poppins',sans-serif", margin: 0, fontSize: 18, color: COLORS.charcoal }}>
                  {t.googleAccountChooser || "Select Google Account"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleChooser(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.ink, padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: COLORS.ink, lineHeight: 1.5, marginTop: 0, marginBottom: 18 }}>
              {lang === "khortha" || lang === "kht"
                ? `पोर्टल पर ${t[role] || role} के रूप में साइन इन चाहे खाता बनावे खातिर अपन गूगल खाता चुना:`
                : lang === "hi"
                ? `पोर्टल पर ${t[role] || role} के रूप में साइन इन या पंजीकृत होने के लिए अपना गूगल खाता चुनें:`
                : `Select a verified Google account to sign in or register as ${t[role] || role}:`}
            </p>

            {/* List of system Google accounts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {systemGoogleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={busy}
                  onClick={() => selectGoogleAccount(acc.email, acc.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${COLORS.line}`,
                    background: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.plaster)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: acc.bgColor,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {acc.avatarLetter}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.charcoal }}>{acc.name}</span>
                      {acc.tag && (
                        <span style={{ fontSize: 10.5, background: "#e8f0fe", color: "#1a73e8", padding: "1px 6px", borderRadius: 10, fontWeight: 600 }}>
                          {acc.tag}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: COLORS.ink, textOverflow: "ellipsis", overflow: "hidden" }}>
                      {acc.email}
                    </div>
                  </div>
                  <ArrowRight size={16} color={COLORS.ink} />
                </button>
              ))}
            </div>

            {/* Toggle custom account entry */}
            {!showManualGoogleInput ? (
              <button
                type="button"
                onClick={() => setShowManualGoogleInput(true)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: `1px dashed ${COLORS.line}`,
                  borderRadius: 8,
                  padding: "10px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.forest,
                  cursor: "pointer",
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                + Use another Google account
              </button>
            ) : (
              <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 14, marginBottom: 14 }}>
                <Field label="Google Email Address">
                  <input
                    type="email"
                    style={inputStyle}
                    placeholder="name@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  />
                </Field>
                <Field label="Name (Optional)">
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="e.g. Rahul Sharma"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                  />
                </Field>
                <Btn
                  icon={ArrowRight}
                  disabled={busy || !customGoogleEmail || !customGoogleEmail.includes("@")}
                  onClick={() => selectGoogleAccount(customGoogleEmail, customGoogleName)}
                >
                  Verify and Sign In
                </Btn>
              </div>
            )}

            {error && <div style={{ color: COLORS.danger, fontSize: 12.5, marginTop: 10 }}>{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
