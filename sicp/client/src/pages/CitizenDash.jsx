import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Image as ImageIcon,
  ShieldCheck,
  Send,
  MapPin,
  RefreshCw,
  X,
  CheckCircle2,
  Upload,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { COLORS } from "../theme.js";
import { Field, Btn, Badge, inputStyle } from "../components/ui.jsx";
import ProblemCard from "../components/ProblemCard.jsx";
import { api } from "../api.js";
import { getCategoryLabel } from "../i18n.js";
import { CameraCaptureModal } from "../components/CameraCaptureModal.jsx";
import { compressImage } from "../utils/imageCompressor.js";

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 19, color: COLORS.charcoal, marginBottom: 14 }}>
      {children}
    </h2>
  );
}

export default function CitizenDash({ tab, setActiveTab, lang, t, onOpen, refreshKey, bumpRefresh }) {
  const [mine, setMine] = useState([]);
  const [impact, setImpact] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("loading"); // 'loading' | 'success' | 'fallback'

  // LGD Directory and Authority Mapping state
  const [lgdDirectory, setLgdDirectory] = useState(null);
  const [allowAllLocations, setAllowAllLocations] = useState(true);
  const [resolvedLgd, setResolvedLgd] = useState({
    state_code: "20",
    state_name: "Jharkhand",
    district_code: "328",
    district_name: "Ranchi",
    subdistrict_code: "02341",
    subdistrict_name: "Lalpur",
    lgd_hierarchy_code: "LGD-20-328-02341",
    is_allowed: true,
  });
  const [mappedAuthority, setMappedAuthority] = useState({
    authority_name: "Sri Arvind Kumar, IAS",
    authority_designation: "District Innovation & Development Officer (DIO)",
    authority_department: "District Collectorate & Innovation Council",
    authority_scope: "district",
    matched_level: "District",
  });
  const [showLgdPicker, setShowLgdPicker] = useState(false);

  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [optimizingImage, setOptimizingImage] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(null);
  const galleryInputRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Load LGD directory & location restriction config from backend
  useEffect(() => {
    api.lgdDirectory()
      .then((d) => {
        if (d) setLgdDirectory(d);
      })
      .catch((err) => console.warn("LGD Directory load error:", err));

    api.lgdConfig()
      .then((cfg) => {
        if (cfg && typeof cfg.allow_all_locations === "boolean") {
          setAllowAllLocations(cfg.allow_all_locations);
        }
      })
      .catch((err) => console.warn("LGD Config load notice:", err));
  }, []);

  // Resolve LGD and mapped authority whenever coordinates or location string updates
  async function triggerLgdResolution(lat, lng, locStr, explicit = null) {
    try {
      const res = await api.resolveLgd({
        lat,
        lng,
        location: locStr,
        explicit: explicit || undefined,
        category: title ? "General" : undefined,
      });
      if (res?.lgd) setResolvedLgd(res.lgd);
      if (res?.authority) setMappedAuthority(res.authority);
    } catch (e) {
      console.warn("LGD resolution error:", e);
    }
  }

  // Auto-fetch GPS coordinates directly and reverse geocode address codes
  function fetchGpsLocation() {
    setGpsStatus("loading");
    if (!navigator.geolocation) {
      const fallbackLoc = "Ranchi, Jharkhand (23.3441° N, 85.3096° E)";
      setLocation(fallbackLoc);
      setCoords({ lat: 23.3441, lng: 85.3096 });
      setGpsStatus("fallback");
      triggerLgdResolution(23.3441, 85.3096, fallbackLoc);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;
        setCoords({ lat, lng, accuracy: acc });

        let detectedLoc = `(${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
        let explicitHints = {};
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const stateName = addr.state || "";
            const districtName = addr.county || addr.state_district || addr.district || "";
            const townName = addr.city || addr.town || addr.village || addr.suburb || addr.neighbourhood || "";
            const subdistrictName = addr.tehsil || addr.subdistrict || addr.county || townName || "Central";

            const parts = [townName, subdistrictName, districtName, stateName].filter(Boolean);
            const uniqueParts = [...new Set(parts)];
            detectedLoc = `${uniqueParts.join(", ")} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
            explicitHints = {
              state_name: stateName,
              district_name: districtName,
              subdistrict_name: subdistrictName,
            };
          }
        } catch {
          // fallback
        }

        setLocation(detectedLoc);
        setGpsStatus("success");
        triggerLgdResolution(lat, lng, detectedLoc, explicitHints);
      },
      (err) => {
        console.warn("Geolocation fallback:", err.message);
        const fallbackLoc = "Ranchi, Jharkhand (23.3441° N, 85.3096° E)";
        setLocation(fallbackLoc);
        setCoords({ lat: 23.3441, lng: 85.3096 });
        setGpsStatus("fallback");
        triggerLgdResolution(23.3441, 85.3096, fallbackLoc);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
  }

  // Predefined states and districts helpers
  const statesList = lgdDirectory?.states || [
    { code: "20", name: "Jharkhand" },
    { code: "23", name: "Madhya Pradesh" },
    { code: "10", name: "Bihar" },
    { code: "09", name: "Uttar Pradesh" },
    { code: "07", name: "Delhi" },
    { code: "27", name: "Maharashtra" },
    { code: "19", name: "West Bengal" },
    { code: "21", name: "Odisha" },
  ];

  const currentDistricts = (lgdDirectory?.districts?.[resolvedLgd.state_code] || lgdDirectory?.districts?.["20"] || []);
  const currentDistrictObj = currentDistricts.find((d) => d.code === resolvedLgd.district_code) || currentDistricts[0];
  const currentSubdistricts = currentDistrictObj?.subdistricts || [];

  // Manually select State from LGD Directory
  function handleSelectLgdState(stateCode) {
    const st = statesList.find((s) => s.code === stateCode);
    if (!st) return;
    const dists = lgdDirectory?.districts?.[stateCode] || [];
    const dist = dists[0] || { code: "101", name: `${st.name} Central`, subdistricts: [{ code: "01001", name: "Central" }] };
    const sub = dist.subdistricts?.[0] || { code: "01001", name: "Central" };
    const explicit = {
      state_code: st.code,
      state_name: st.name,
      district_code: dist.code,
      district_name: dist.name,
      subdistrict_code: sub.code,
      subdistrict_name: sub.name,
    };
    setLocation(`${sub.name}, ${dist.name}, ${st.name}`);
    triggerLgdResolution(st.lat || 23.6, st.lng || 85.2, `${sub.name}, ${dist.name}`, explicit);
  }

  // Manually select District from LGD Directory
  function handleSelectLgdDistrict(distCode) {
    const dist = currentDistricts.find((d) => d.code === distCode);
    if (!dist) return;
    const sub = dist.subdistricts?.[0] || { code: "01001", name: "Central" };
    const explicit = {
      state_code: resolvedLgd.state_code,
      state_name: resolvedLgd.state_name,
      district_code: dist.code,
      district_name: dist.name,
      subdistrict_code: sub.code,
      subdistrict_name: sub.name,
    };
    setLocation(`${sub.name}, ${dist.name}, ${resolvedLgd.state_name}`);
    triggerLgdResolution(dist.lat, dist.lng, `${sub.name}, ${dist.name}`, explicit);
  }

  // Manually select Sub-District (Block / Tehsil) from LGD Directory
  function handleSelectLgdSubdistrict(subCode) {
    const sub = currentSubdistricts.find((s) => s.code === subCode);
    if (!sub) return;
    const explicit = {
      state_code: resolvedLgd.state_code,
      state_name: resolvedLgd.state_name,
      district_code: resolvedLgd.district_code,
      district_name: resolvedLgd.district_name,
      subdistrict_code: sub.code,
      subdistrict_name: sub.name,
    };
    setLocation(`${sub.name}, ${resolvedLgd.district_name}, ${resolvedLgd.state_name}`);
    triggerLgdResolution(coords?.lat, coords?.lng, `${sub.name}, ${resolvedLgd.district_name}`, explicit);
  }

  useEffect(() => {
    if (tab === "new" && !location) {
      fetchGpsLocation();
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    if (tab === "impact") {
      api.publicImpact().then((d) => setImpact(d.problems)).finally(() => setLoading(false));
    } else if (tab === "mine") {
      api.listProblems({ mine: "true" }).then((d) => setMine(d.problems)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tab, refreshKey]);

  async function handleImageFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(lang === "hi" ? "कृपया केवल एक फोटो चुनें।" : "Please select an image file.");
      return;
    }
    setOptimizingImage(true);
    setError("");
    try {
      const compressedDataUrl = await compressImage(file, 1280, 1280, 0.80);
      setPhotoUrl(compressedDataUrl);
      setPhotoName(file.name || "uploaded_evidence.jpg");
    } catch (err) {
      console.error("Compression error:", err);
      setError(lang === "hi" ? "फोटो प्रोसेस करने में त्रुटि हुई।" : "Failed to process photo.");
    } finally {
      setOptimizingImage(false);
    }
  }

  if (tab === "new") {
    return (
      <div>
        <SectionTitle>{t.submitTitle}</SectionTitle>

        {/* Prominent Forwarded-to-Government Success Banner with Architectural Flow */}
        {submittedSuccess && (
          <div
            style={{
              background: "#eef7ee",
              border: `1.5px solid ${COLORS.forest}`,
              borderRadius: 14,
              padding: "20px 22px",
              marginBottom: 24,
              maxWidth: 580,
              boxShadow: "0 6px 18px rgba(45,90,60,0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: COLORS.forest,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#fff",
                }}
              >
                <CheckCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.forestDark, marginBottom: 4 }}>
                  {lang === "hi"
                    ? "समस्या दर्ज हुई — LGD एवं प्राधिकारी मैपिंग संपन्न!"
                    : "Problem Registered & Authority Queue Mapped!"}
                </div>
                <div style={{ fontSize: 13, color: COLORS.charcoal, marginBottom: 12, lineHeight: 1.5 }}>
                  {lang === "hi"
                    ? `शिकायत #${submittedSuccess.id} को LGD निर्देशिका से सत्यापित कर संबंधित क्षेत्र के सरकारी अधिकारी की कतार में स्थानांतरित कर दिया गया है।`
                    : `Complaint #${submittedSuccess.id} resolved via LGD Directory and routed to designated Government Official.`}
                </div>

                {/* Architectural Pipeline Status Diagram */}
                <div
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${COLORS.line}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    marginBottom: 14,
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: 700, color: COLORS.forestDark, marginBottom: 8, fontSize: 12.5 }}>
                    📍 Architecture Execution Flow:
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: "#e8f0fe", color: "#1a73e8", padding: "1px 6px", borderRadius: 4, fontWeight: 700, fontSize: 10.5 }}>STEP 1</span>
                      <span style={{ color: COLORS.charcoal }}><b>Location Service:</b> {submittedSuccess.lgd_hierarchy_code || "LGD Verified"}</span>
                    </div>

                    <div style={{ paddingLeft: 18, fontSize: 11.5, color: COLORS.ink }}>
                      ↳ {submittedSuccess.state_name || "Jharkhand"} ({submittedSuccess.state_code || "20"}) → {submittedSuccess.district_name || "Ranchi"} ({submittedSuccess.district_code || "328"}) → Sub-District: {submittedSuccess.subdistrict_name || "Lalpur"} ({submittedSuccess.subdistrict_code || "02341"})
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: "#fef3c7", color: "#b45309", padding: "1px 6px", borderRadius: 4, fontWeight: 700, fontSize: 10.5 }}>STEP 2</span>
                      <span style={{ color: COLORS.charcoal }}><b>AI Classification:</b> {submittedSuccess.category} ({submittedSuccess.confidence || 90}% confidence)</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: "#e0eee0", color: COLORS.forest, padding: "1px 6px", borderRadius: 4, fontWeight: 700, fontSize: 10.5 }}>STEP 3</span>
                      <span style={{ color: COLORS.charcoal }}>
                        <b>Authority Mapping Engine:</b> {submittedSuccess.assigned_authority_designation || "District Innovation Officer"}
                      </span>
                    </div>

                    <div style={{ paddingLeft: 18, fontSize: 11.5, color: COLORS.forest, fontWeight: 600 }}>
                      ↳ Officer: {submittedSuccess.assigned_authority_name || "District Innovation Officer"} (Username: <code>{submittedSuccess.assigned_authority_username || "officer.ranchi"}</code>)
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: "#f3e8ff", color: "#7e22ce", padding: "1px 6px", borderRadius: 4, fontWeight: 700, fontSize: 10.5 }}>STEP 4</span>
                      <span style={{ color: COLORS.charcoal }}><b>Complaint Queue:</b> Active in {submittedSuccess.assigned_authority_scope ? submittedSuccess.assigned_authority_scope.toUpperCase() : "AREA"} Official Queue</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: "#ecfdf5", color: "#047857", padding: "1px 6px", borderRadius: 4, fontWeight: 700, fontSize: 10.5 }}>STEP 5</span>
                      <span style={{ color: COLORS.charcoal }}><b>Status / Tracking:</b> Live Tracking Active</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {setActiveTab && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("mine");
                        setSubmittedSuccess(null);
                      }}
                      style={{
                        background: COLORS.forest,
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 14px",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span>{lang === "hi" ? "मेरी शिकायतें देखें" : "View in My Complaints"}</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSubmittedSuccess(null)}
                    style={{
                      background: "#fff",
                      color: COLORS.charcoal,
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {lang === "hi" ? "एक और समस्या दर्ज करें" : "Report Another Issue"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 20, maxWidth: 560 }}>
          <Field label={t.fieldTitle}>
            <input
              style={inputStyle}
              value={title}
              placeholder={lang === "hi" ? "उदा. मुख्य सड़क पर सौर स्ट्रीट लाइट खराब है" : "e.g. Solar street lights non-functional on main road"}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          <Field label={t.fieldDesc}>
            <textarea
              style={{ ...inputStyle, minHeight: 100 }}
              value={desc}
              placeholder={lang === "hi" ? "समस्या का विस्तार से वर्णन करें..." : "Describe the problem in detail..."}
              onChange={(e) => setDesc(e.target.value)}
            />
          </Field>

          {/* GPS Auto-Location Card — directly fetched without asking user to enter location */}
          <Field label={lang === "hi" ? "स्थान (जीपीएस द्वारा स्वतः प्राप्त)" : "Location (Auto-fetched via GPS)"}>
            <div style={{
              background: gpsStatus === "success" ? "#f2f7f2" : COLORS.cream,
              border: `1.5px solid ${gpsStatus === "success" ? COLORS.forest : COLORS.line}`,
              borderRadius: 10,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: gpsStatus === "success" ? "#e0eee0" : COLORS.plaster,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <MapPin size={18} color={gpsStatus === "success" ? COLORS.forest : COLORS.ink} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.charcoal,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {location || (gpsStatus === "loading" ? t.gpsDetecting : "Ranchi, Jharkhand")}
                  </div>
                  <div style={{ fontSize: 11.5, color: COLORS.ink, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                    {gpsStatus === "success" && <CheckCircle2 size={12} color={COLORS.forest} />}
                    <span>
                      {gpsStatus === "loading"
                        ? t.gpsDetecting
                        : gpsStatus === "success"
                        ? t.gpsVerified
                        : t.gpsUseDefault}
                    </span>
                    {coords?.accuracy && (
                      <span style={{ color: COLORS.ink }}>• ±{Math.round(coords.accuracy)}m</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchGpsLocation}
                disabled={gpsStatus === "loading"}
                title={t.gpsRefresh}
                style={{
                  background: "#fff",
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 8,
                  padding: "7px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.forest,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <RefreshCw size={13} style={{ animation: gpsStatus === "loading" ? "spin 1s linear infinite" : "none" }} />
                <span>{t.gpsRefresh}</span>
              </button>
            </div>

            {/* LOCATION RESTRICTION STATUS INDICATOR */}
            {!allowAllLocations && resolvedLgd?.state_code !== "20" ? (
              <div
                style={{
                  marginTop: 10,
                  background: "#fff5f5",
                  border: "1.5px solid #e53e3e",
                  borderRadius: 10,
                  padding: "11px 14px",
                  color: "#9b2c2c",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <AlertTriangle size={16} color="#e53e3e" />
                  <span>Reporting Restricted to Jharkhand State Only</span>
                </div>
                <div>
                  Your location is detected in <b>{resolvedLgd.state_name}</b> (LGD State Code: <code>{resolvedLgd.state_code}</code>).
                  By administrator configuration (<code>ALLOW_ALL_LOCATIONS=false</code> in <code>.env</code>), problem submissions from other states are blocked.
                </div>
                <div style={{ marginTop: 4, fontSize: 11.5, color: "#742a2a" }}>
                  To allow problem reporting from any state or location across India, set <code>ALLOW_ALL_LOCATIONS=true</code> in <code>.env</code>.
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginTop: 8,
                  padding: "6px 10px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 8,
                  color: "#166534",
                  fontSize: 11.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={14} color="#16a34a" />
                  <span>
                    {resolvedLgd?.state_code === "20"
                      ? "Location verified inside Jharkhand state"
                      : `Nationwide reporting enabled (.env: ALLOW_ALL_LOCATIONS=true) — Verified in ${resolvedLgd?.state_name}`}
                  </span>
                </div>
                <span style={{ fontSize: 10.5, background: "#dcfce7", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                  LGD Validated
                </span>
              </div>
            )}

            {/* LOCATION SERVICE & LGD DIRECTORY HIERARCHY CARD */}
            <div
              style={{
                marginTop: 10,
                background: "#f8fbf8",
                border: `1.5px solid #c8dec8`,
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.forestDark, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📍 {t.lgdDirectoryTitle || "Local Government Directory (LGD)"}</span>
                  <span style={{ fontSize: 10, background: "#d1ead1", color: COLORS.forestDark, padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                    {resolvedLgd.lgd_hierarchy_code || `LGD-${resolvedLgd.state_code || "20"}-${resolvedLgd.district_code || "328"}-${resolvedLgd.subdistrict_code || "02341"}`}
                  </span>
                </div>
                {lgdDirectory && (
                  <button
                    type="button"
                    onClick={() => setShowLgdPicker(!showLgdPicker)}
                    style={{
                      background: "none",
                      border: "none",
                      color: COLORS.forest,
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {showLgdPicker ? "Hide Hierarchy Selectors" : "Pinpoint State / District / Block"}
                  </button>
                )}
              </div>

              {/* LGD Breadcrumb Lineage */}
              <div style={{ fontSize: 11.5, color: COLORS.charcoal, lineHeight: 1.5, background: "#fff", padding: "8px 10px", borderRadius: 6, border: `1px solid ${COLORS.line}` }}>
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                  <span style={{ fontWeight: 600 }}>State:</span> <b>{resolvedLgd.state_name || "Jharkhand"}</b> <code style={{ fontSize: 10, color: COLORS.ink }}>[{resolvedLgd.state_code || "20"}]</code>
                  <span style={{ color: COLORS.ink }}>→</span>
                  <span style={{ fontWeight: 600 }}>District:</span> <b>{resolvedLgd.district_name || "Ranchi"}</b> <code style={{ fontSize: 10, color: COLORS.ink }}>[{resolvedLgd.district_code || "328"}]</code>
                  <span style={{ color: COLORS.ink }}>→</span>
                  <span style={{ fontWeight: 600 }}>Sub-District / Block:</span> <b>{resolvedLgd.subdistrict_name || "Lalpur"}</b> <code style={{ fontSize: 10, color: COLORS.ink }}>[{resolvedLgd.subdistrict_code || "02341"}]</code>
                </div>
              </div>

              {/* Optional Manual LGD Hierarchy Selectors (State -> District -> Sub-District) */}
              {showLgdPicker && lgdDirectory && (
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, background: "#fff", padding: 10, borderRadius: 8, border: `1px solid ${COLORS.line}` }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.ink, display: "block", marginBottom: 3 }}>
                      State:
                    </label>
                    <select
                      style={{ ...inputStyle, padding: "5px 8px", fontSize: 12 }}
                      value={resolvedLgd.state_code || "20"}
                      onChange={(e) => handleSelectLgdState(e.target.value)}
                    >
                      {statesList.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.ink, display: "block", marginBottom: 3 }}>
                      District:
                    </label>
                    <select
                      style={{ ...inputStyle, padding: "5px 8px", fontSize: 12 }}
                      value={resolvedLgd.district_code || ""}
                      onChange={(e) => handleSelectLgdDistrict(e.target.value)}
                    >
                      {currentDistricts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.ink, display: "block", marginBottom: 3 }}>
                      Block / Sub-District:
                    </label>
                    <select
                      style={{ ...inputStyle, padding: "5px 8px", fontSize: 12 }}
                      value={resolvedLgd.subdistrict_code || ""}
                      onChange={(e) => handleSelectLgdSubdistrict(e.target.value)}
                    >
                      {currentSubdistricts.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* AUTHORITY MAPPING ENGINE PREVIEW */}
              {mappedAuthority && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "8px 10px",
                    background: "#eaf3ea",
                    borderRadius: 6,
                    border: `1px dashed ${COLORS.forest}`,
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: COLORS.forestDark }}>
                        🏛️ {t.authorityMappingTitle || "Authority Mapping Engine"}:
                      </span>{" "}
                      <span style={{ color: COLORS.charcoal }}>
                        Assigned to <b>{mappedAuthority.authority_designation || "District Innovation Officer"}</b> ({mappedAuthority.authority_name})
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        background: COLORS.forest,
                        color: "#fff",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontWeight: 700,
                      }}
                    >
                      Target Queue: {mappedAuthority.matched_level || "District"} Level
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Field>

          {/* Photo / Visual Evidence Upload with Camera and File Upload */}
          <Field label={t.photoEvidence}>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
              }}
            />

            {!photoUrl ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
                }}
                style={{
                  border: `1.5px dashed ${dragOver ? COLORS.forest : COLORS.line}`,
                  borderRadius: 12,
                  padding: "18px 16px",
                  background: dragOver ? "#f0f7f2" : COLORS.cream,
                  textAlign: "center",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.charcoal, marginBottom: 4 }}>
                  {lang === "khortha" || lang === "kht"
                    ? "कैमरा से फोटो खींचा चाहे डिवाइस से अपलोड करा"
                    : lang === "hi"
                    ? "कैमरा से फोटो लें या डिवाइस से अपलोड करें"
                    : "Capture photo with camera or upload image"}
                </div>
                <div style={{ fontSize: 11.5, color: COLORS.ink, marginBottom: 14 }}>
                  {lang === "khortha" || lang === "kht"
                    ? "लाइव कैमरा से फोटो खींचा चाहे फाइल खींचके हिंया छोड़ऽ"
                    : lang === "hi"
                    ? "लाइव कैमरा से फोटो खींचें या फाइल खींचकर यहाँ छोड़ें"
                    : "Open live camera viewfinder or drag & drop files here"}
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  {/* Distinct Option 1: Open Live Camera Viewfinder */}
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    style={{
                      background: COLORS.forest,
                      border: "none",
                      borderRadius: 8,
                      padding: "9px 16px",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(45,90,60,0.25)",
                    }}
                  >
                    <Camera size={16} /> {t.attachCamera}
                  </button>

                  {/* Distinct Option 2: Upload File / Gallery */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    style={{
                      background: "#fff",
                      border: `1.5px solid ${COLORS.line}`,
                      borderRadius: 8,
                      padding: "9px 16px",
                      color: COLORS.charcoal,
                      fontWeight: 600,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Upload size={16} color={COLORS.forest} /> {t.attachGallery}
                  </button>
                </div>

                {optimizingImage && (
                  <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(45,90,60,0.08)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12, color: COLORS.forest, fontWeight: 600 }}>
                    <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
                    <span>{lang === "hi" ? "फोटो को संपीड़ित एवं तैयार किया जा रहा है..." : "Optimizing photo for fast submission..."}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                border: `1.5px solid ${COLORS.line}`,
                borderRadius: 10,
                padding: 12,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src={photoUrl}
                    alt="Problem attachment"
                    style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: `1px solid ${COLORS.line}` }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.charcoal, display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={15} color={COLORS.forest} /> {t.photoAttached}
                    </div>
                    <div style={{ fontSize: 11.5, color: COLORS.ink, marginTop: 2, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {photoName || "evidence_photo.jpg"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    style={{
                      background: "transparent",
                      border: `1px solid ${COLORS.line}`,
                      borderRadius: 6,
                      padding: "6px 10px",
                      color: COLORS.charcoal,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Camera size={13} /> {lang === "khortha" || lang === "kht" ? "फेरु से खींचा" : lang === "hi" ? "पुनः लें" : "Retake"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPhotoUrl(null); setPhotoName(""); }}
                    style={{
                      background: "transparent",
                      border: `1px solid #fed7d7`,
                      borderRadius: 6,
                      padding: "6px 10px",
                      color: COLORS.danger,
                      fontSize: 12,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      cursor: "pointer",
                    }}
                  >
                    <X size={14} /> {t.removePhoto}
                  </button>
                </div>
              </div>
            )}
          </Field>

          {error && <div style={{ color: COLORS.danger, fontSize: 12.5, marginBottom: 12 }}>{error}</div>}

          <Btn
            icon={Send}
            disabled={
              busy ||
              optimizingImage ||
              !title ||
              !desc ||
              !location ||
              (!allowAllLocations && resolvedLgd?.state_code !== "20")
            }
            onClick={async () => {
              setBusy(true);
              setError("");
              setSubmittedSuccess(null);
              try {
                const res = await api.submitProblem({
                  title,
                  description: desc,
                  location,
                  lat: coords?.lat,
                  lng: coords?.lng,
                  photo_url: photoUrl || undefined,
                  state_code: resolvedLgd?.state_code,
                  district_code: resolvedLgd?.district_code,
                  district_name: resolvedLgd?.district_name,
                  subdistrict_code: resolvedLgd?.subdistrict_code,
                  subdistrict_name: resolvedLgd?.subdistrict_name,
                });
                setTitle("");
                setDesc("");
                setPhotoUrl(null);
                setPhotoName("");
                setSubmittedSuccess(res.problem);
                bumpRefresh();
              } catch (e) {
                setError(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy
              ? (lang === "hi" ? "जमा हो रहा है..." : "Submitting...")
              : !allowAllLocations && resolvedLgd?.state_code !== "20"
              ? (lang === "hi" ? "स्थान प्रतिबंधित (केवल झारखंड)" : "Blocked: Outside Jharkhand State")
              : t.submit}
          </Btn>

          <div style={{ marginTop: 14, fontSize: 11.5, color: COLORS.ink, display: "flex", gap: 6, alignItems: "flex-start" }}>
            <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            {lang === "khortha" || lang === "kht"
              ? "जमा करते ही समस्या सरकारी समीक्षा हेतु अग्रेषित हो जाई और एआई श्रेणी सुझावत।"
              : lang === "hi"
              ? "जमा करते ही समस्या सरकारी समीक्षा हेतु अग्रेषित हो जाएगी और एआई स्वतः श्रेणी सुझाएगा।"
              : "Upon submission, your issue is immediately routed to the Government Official review queue."}
          </div>
        </div>

        {/* Live Camera Viewfinder Modal */}
        <CameraCaptureModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onCapture={async (dataUrl, name) => {
            setOptimizingImage(true);
            try {
              const compressed = await compressImage(dataUrl, 1280, 1280, 0.80);
              setPhotoUrl(compressed);
              setPhotoName(name);
              setError("");
            } catch {
              setPhotoUrl(dataUrl);
              setPhotoName(name);
            } finally {
              setOptimizingImage(false);
            }
          }}
          onFallbackUpload={() => galleryInputRef.current?.click()}
          lang={lang}
        />
      </div>
    );
  }

  if (tab === "impact") {
    return (
      <div>
        <SectionTitle>{t.nav_impact}</SectionTitle>
        {loading && <div style={{ color: COLORS.ink, fontSize: 13.5 }}>{t.loading}</div>}
        {!loading && impact.length === 0 && <div style={{ color: COLORS.ink, fontSize: 13.5 }}>—</div>}
        {impact.map((p) => (
          <div key={p.id} onClick={() => onOpen(p)} style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 16, marginBottom: 12, cursor: "pointer" }}>
            <Badge tone="good">{getCategoryLabel(p.category, lang)}</Badge>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15.5, margin: "8px 0 4px" }}>{p.title}</div>
            <div style={{ fontSize: 12.5, color: COLORS.ink, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {p.location}</div>
            <div style={{ fontSize: 13, color: COLORS.charcoal }}>{p.impact_summary}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <SectionTitle>{t.nav_mine}</SectionTitle>
      {loading && <div style={{ color: COLORS.ink, fontSize: 13.5 }}>{t.loading}</div>}
      {!loading && mine.length === 0 && <div style={{ color: COLORS.ink, fontSize: 13.5 }}>{lang === "hi" ? "अभी तक कोई रिपोर्ट नहीं।" : "No reports yet — use 'Report a Problem' to submit one."}</div>}
      {mine.map((p) => <ProblemCard key={p.id} p={p} lang={lang} t={t} onOpen={onOpen} />)}
    </div>
  );
}
