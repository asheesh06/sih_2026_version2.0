import React, { useState, useEffect, useRef } from "react";
import { Camera, X, Check, RotateCcw, AlertCircle, RefreshCw, Upload, Image as ImageIcon } from "lucide-react";

export function CameraCaptureModal({ isOpen, onClose, onCapture, onFallbackUpload, lang = "en" }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // 'environment' | 'user'
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera tracks helper
  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
  }

  // Check if multiple camera devices exist
  useEffect(() => {
    if (!isOpen) return;
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, [isOpen]);

  // Start / restart camera stream
  async function startCamera(mode) {
    stopStream();
    setCameraError("");
    setLoadingCamera(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        lang === "khortha" || lang === "kht"
          ? "इ ब्राउजर में लाइव कैमरा नइखे चलत। कृपा करके फोटो अपलोड करा।"
          : lang === "hi"
          ? "इस ब्राउज़र में लाइव कैमरा समर्थित नहीं है। कृपया गैलरी से फोटो अपलोड करें।"
          : "Live camera is not supported in this browser. Please use photo upload."
      );
      setLoadingCamera(false);
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError(
          lang === "hi"
            ? "कैमरा अनुमति अस्वीकृत कर दी गई। कृपया ब्राउज़र सेटिंग्स में कैमरा अनुमति सक्षम करें।"
            : "Camera permission was denied. Please allow camera access in your browser address bar."
        );
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError(
          lang === "hi"
            ? "कोई कैमरा डिवाइस नहीं मिला। कृपया गैलरी से फोटो अपलोड करें।"
            : "No camera device found on this system. Please upload a photo from storage."
        );
      } else {
        setCameraError(
          lang === "hi"
            ? "कैमरा शुरू करने में असमर्थ। कृपया पुनः प्रयास करें या फोटो अपलोड करें।"
            : "Unable to start camera stream. Please try again or upload an image."
        );
      }
    } finally {
      setLoadingCamera(false);
    }
  }

  // Handle open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedImage(null);
      setCameraError("");
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  // Ensure video element receives stream whenever stream state changes
  useEffect(() => {
    if (stream && videoRef.current && !capturedImage) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, capturedImage]);

  // Capture snapshot from video
  function handleCapture() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (facingMode === "user") {
      // Mirror user front camera capture
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.90);
    setCapturedImage(dataUrl);
    stopStream();
  }

  function handleRetake() {
    setCapturedImage(null);
    startCamera(facingMode);
  }

  function handleConfirm() {
    if (capturedImage) {
      const fileName = `problem_cam_${Date.now()}.jpg`;
      onCapture(capturedImage, fileName);
      handleClose();
    }
  }

  function handleClose() {
    stopStream();
    setCapturedImage(null);
    onClose();
  }

  function toggleFacingMode() {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 18, 12, 0.85)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#161b17",
          color: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 540,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Camera size={18} color="#e5a93c" />
            <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Poppins',sans-serif" }}>
              {capturedImage
                ? (lang === "khortha" || lang === "kht" ? "फोटो पूर्वावलोकन (Preview)" : lang === "hi" ? "फोटो पूर्वावलोकन (Preview)" : "Captured Photo Preview")
                : (lang === "khortha" || lang === "kht" ? "लाइव कैमरा (Live Camera)" : lang === "hi" ? "लाइव कैमरा (Live Camera)" : "Live Camera Viewfinder")}
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#aaa",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Viewfinder area */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 380,
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {loadingCamera && !capturedImage && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#e5a93c" }}>
              <RefreshCw size={28} style={{ animation: "spin 1s linear infinite" }} />
              <div style={{ fontSize: 13, color: "#ccc" }}>
                {lang === "khortha" || lang === "kht" ? "कैमरा शुरू हो रहल हे..." : lang === "hi" ? "कैमरा शुरू हो रहा है..." : "Starting camera feed..."}
              </div>
            </div>
          )}

          {cameraError && !capturedImage && (
            <div
              style={{
                padding: "24px 20px",
                textAlign: "center",
                maxWidth: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "rgba(220,53,69,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertCircle size={28} color="#f87171" />
              </div>
              <div style={{ fontSize: 13.5, color: "#fca5a5", lineHeight: 1.5 }}>
                {cameraError}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <RefreshCw size={14} /> {lang === "khortha" || lang === "kht" ? "फेरु से कोशिश करा" : lang === "hi" ? "पुनः प्रयास करें" : "Try Again"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onFallbackUpload();
                  }}
                  style={{
                    background: "#2d5a3c",
                    border: "none",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Upload size={14} /> {lang === "khortha" || lang === "kht" ? "गैलरी से चुना" : lang === "hi" ? "गैलरी से चुनें" : "Upload from Device"}
                </button>
              </div>
            </div>
          )}

          {/* Live Video Stream */}
          {!capturedImage && !cameraError && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: facingMode === "user" ? "scaleX(-1)" : "none",
                }}
              />

              {/* Viewfinder Target Framing Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 32,
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderRadius: 14,
                  pointerEvents: "none",
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.25)",
                }}
              >
                {/* Target crosshairs / corners */}
                <div style={{ position: "absolute", top: -2, left: -2, width: 20, height: 20, borderTop: "3px solid #e5a93c", borderLeft: "3px solid #e5a93c", borderTopLeftRadius: 12 }} />
                <div style={{ position: "absolute", top: -2, right: -2, width: 20, height: 20, borderTop: "3px solid #e5a93c", borderRight: "3px solid #e5a93c", borderTopRightRadius: 12 }} />
                <div style={{ position: "absolute", bottom: -2, left: -2, width: 20, height: 20, borderBottom: "3px solid #e5a93c", borderLeft: "3px solid #e5a93c", borderBottomLeftRadius: 12 }} />
                <div style={{ position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderBottom: "3px solid #e5a93c", borderRight: "3px solid #e5a93c", borderBottomRightRadius: 12 }} />
                
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    letterSpacing: 0.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  {lang === "khortha" || lang === "kht" ? "समस्या के फ्रेम में राखा" : lang === "hi" ? "समस्या को फ्रेम में रखें" : "Align problem evidence in frame"}
                </div>
              </div>

              {/* Flip camera toggle if multiple cameras */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: "rgba(0,0,0,0.6)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                  title="Switch Camera"
                >
                  <RotateCcw size={18} />
                </button>
              )}
            </>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#000",
              }}
            />
          )}
        </div>

        {/* Footer Action Controls */}
        <div
          style={{
            padding: "16px 20px",
            background: "#1e2420",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onFallbackUpload();
                }}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#cbd5e1",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ImageIcon size={15} /> {lang === "khortha" || lang === "kht" ? "गैलरी से चुना" : lang === "hi" ? "गैलरी से चुनें" : "Choose from file"}
              </button>

              {/* Big Shutter Button */}
              <button
                type="button"
                onClick={handleCapture}
                disabled={!stream || !!cameraError || loadingCamera}
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: "50%",
                  background: "#fff",
                  border: "4px solid #e5a93c",
                  boxShadow: "0 0 16px rgba(229,169,60,0.4)",
                  cursor: !stream || cameraError ? "not-allowed" : "pointer",
                  opacity: !stream || cameraError ? 0.4 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.1s ease",
                }}
                onMouseDown={(e) => {
                  if (stream && !cameraError) e.currentTarget.style.transform = "scale(0.92)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    background: "#e5a93c",
                  }}
                />
              </button>

              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {lang === "khortha" || lang === "kht" ? "रद्द करा" : lang === "hi" ? "रद्द करें" : "Cancel"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "9px 18px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <RotateCcw size={16} /> {lang === "khortha" || lang === "kht" ? "दोबारा खींचा" : lang === "hi" ? "दोबारा खींचें" : "Retake Photo"}
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  background: "#2d5a3c",
                  border: "1px solid #3c7a52",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "9px 22px",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 8px rgba(45,90,60,0.5)",
                }}
              >
                <Check size={18} color="#86efac" /> {lang === "khortha" || lang === "kht" ? "इ फोटो के उपयोग करा" : lang === "hi" ? "इस फोटो का उपयोग करें" : "Use this Photo"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
