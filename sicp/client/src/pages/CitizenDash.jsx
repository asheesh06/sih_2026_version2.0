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

  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [optimizingImage, setOptimizingImage] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(null);
  const galleryInputRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Auto-fetch GPS coordinates directly without asking user to manually enter location
  function fetchGpsLocation() {
    setGpsStatus("loading");
    if (!navigator.geolocation) {
      const fallbackLoc = "Ranchi, Jharkhand (23.3441° N, 85.3096° E)";
      setLocation(fallbackLoc);
      setCoords({ lat: 23.3441, lng: 85.3096 });
      setGpsStatus("fallback");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;
        setCoords({ lat, lng, accuracy: acc });

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            const town = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || "Jharkhand";
            const dist = data.address?.county || data.address?.state_district || "Jharkhand";
            setLocation(`${town}, ${dist} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
            setGpsStatus("success");
            return;
          }
        } catch {
          // fallback to coordinate string if reverse geocoding is offline
        }

        setLocation(`Jharkhand (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
        setGpsStatus("success");
      },
      (err) => {
        console.warn("Geolocation fallback:", err.message);
        const fallbackLoc = "Ranchi, Jharkhand (23.3441° N, 85.3096° E)";
        setLocation(fallbackLoc);
        setCoords({ lat: 23.3441, lng: 85.3096 });
        setGpsStatus("fallback");
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
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

        {/* Prominent Forwarded-to-Government Success Banner */}
        {submittedSuccess && (
          <div
            style={{
              background: "#eef7ee",
              border: `1.5px solid ${COLORS.forest}`,
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 20,
              maxWidth: 560,
              boxShadow: "0 4px 14px rgba(45,90,60,0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: COLORS.forest,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#fff",
                }}
              >
                <CheckCircle size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.forestDark, marginBottom: 4 }}>
                  {lang === "hi"
                    ? "समस्या दर्ज हुई और सरकारी अधिकारी को भेजी गई!"
                    : lang === "khortha" || lang === "kht"
                    ? "समस्या दरज भेल आर सरकारी अधिकारी के भेजल गेल!"
                    : "Problem Submitted & Forwarded to Government Official!"}
                </div>
                <div style={{ fontSize: 13, color: COLORS.charcoal, marginBottom: 8, lineHeight: 1.5 }}>
                  {lang === "hi"
                    ? `आपकी समस्या #${submittedSuccess.id} दर्ज कर ली गई है और समीक्षा हेतु सरकारी अधिकारी के पोर्टल पर अग्रेषित कर दी गई है।`
                    : `Your issue (ID: ${submittedSuccess.id}) with attached photo evidence has been forwarded to Government Officials for review and university allocation.`}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(45,90,60,0.12)",
                    color: COLORS.forest,
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  <Clock size={13} />
                  <span>
                    {lang === "hi"
                      ? "वर्तमान स्थिति: सरकारी समीक्षाधीन (Pending Govt. Review)"
                      : "Current Status: Pending Government Official Review"}
                  </span>
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
                      <span>{lang === "hi" ? "मेरी समस्याएं देखें" : "View in My Problems"}</span>
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
            disabled={busy || optimizingImage || !title || !desc || !location}
            onClick={async () => {
              setBusy(true);
              setError("");
              setSubmittedSuccess(null);
              try {
                const res = await api.submitProblem({
                  title,
                  description: desc,
                  location,
                  photo_url: photoUrl || undefined,
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
            {busy ? (lang === "hi" ? "जमा हो रहा है..." : "Submitting...") : t.submit}
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
