import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { LANGUAGES } from "../i18n.js";
import { COLORS } from "../theme.js";

export default function LanguageDropdown({ lang, setLang, variant = "banner" }) {
  const [open, setOpen] = useState(false);
  const [horizontalAlign, setHorizontalAlign] = useState("right");
  const containerRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      // Determine best horizontal alignment based on button screen position
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // If button is in the left 240px of screen, align dropdown to left
        if (rect.left < 240) {
          setHorizontalAlign("left");
        } else {
          setHorizontalAlign("right");
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Styling presets for different UI contexts
  const stylesByVariant = {
    banner: {
      btn: {
        width: 140,
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.18)",
        color: "#ffffff",
        border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: "9999px",
        padding: "6px 14px",
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
      menu: {
        top: "calc(100% + 8px)",
      },
    },
    header: {
      btn: {
        width: 132,
        justifyContent: "space-between",
        background: COLORS.cream,
        color: COLORS.charcoal,
        border: `1px solid ${COLORS.line}`,
        borderRadius: "8px",
        padding: "6px 12px",
        fontSize: 12.5,
        fontWeight: 600,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      },
      menu: {
        top: "calc(100% + 6px)",
      },
    },
    sidebar: {
      btn: {
        width: "100%",
        background: "rgba(255,255,255,0.12)",
        color: "#ffffff",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: 13,
        fontWeight: 600,
      },
      menu: {
        bottom: "calc(100% + 8px)",
      },
    },
  };

  const currentVariant = stylesByVariant[variant] || stylesByVariant.banner;

  const menuPosStyle = variant === "sidebar"
    ? { left: 0, bottom: "calc(100% + 8px)" }
    : horizontalAlign === "left"
    ? { left: 0, top: currentVariant.menu.top }
    : { right: 0, top: currentVariant.menu.top };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-block", zIndex: 900 }}
      id={`language-selector-${variant}`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Select Portal Language"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          transition: "all 0.15s ease",
          outline: "none",
          userSelect: "none",
          ...currentVariant.btn,
        }}
        onMouseEnter={(e) => {
          if (variant === "banner") {
            e.currentTarget.style.background = "rgba(255,255,255,0.28)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)";
          } else if (variant === "header") {
            e.currentTarget.style.borderColor = COLORS.forest;
          } else if (variant === "sidebar") {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
          }
        }}
        onMouseLeave={(e) => {
          if (variant === "banner") {
            e.currentTarget.style.background = currentVariant.btn.background;
            e.currentTarget.style.borderColor = currentVariant.btn.border.split(" ")[2];
          } else if (variant === "header") {
            e.currentTarget.style.borderColor = COLORS.line;
          } else if (variant === "sidebar") {
            e.currentTarget.style.background = currentVariant.btn.background;
          }
        }}
      >
        <Globe size={15} style={{ flexShrink: 0 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span>{currentLang.flag}</span>
          <span>{currentLang.native}</span>
        </span>
        <ChevronDown
          size={14}
          style={{
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.85,
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            minWidth: 195,
            maxHeight: "85vh",
            overflowY: "auto",
            background: "#ffffff",
            color: COLORS.charcoal,
            borderRadius: 12,
            boxShadow: "0 18px 45px rgba(0,0,0,0.25), 0 4px 14px rgba(0,0,0,0.12)",
            border: `1.5px solid ${COLORS.line}`,
            padding: "6px",
            zIndex: 99999,
            animation: "sicpFadeIn 0.15s ease-out",
            ...menuPosStyle,
          }}
        >
          <div
            style={{
              padding: "6px 10px 4px",
              fontSize: 10.5,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: COLORS.ink,
              borderBottom: `1px solid ${COLORS.line}`,
              marginBottom: 4,
            }}
          >
            Language / भाषा
          </div>

          {LANGUAGES.map((item) => {
            const isSelected = item.code === lang;
            return (
              <button
                key={item.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLang(item.code);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 11px",
                  borderRadius: 8,
                  background: isSelected ? "rgba(46, 125, 50, 0.09)" : "transparent",
                  color: isSelected ? COLORS.forestDark : COLORS.charcoal,
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 16 }}>{item.flag}</span>
                  <div>
                    <div style={{ lineHeight: 1.2 }}>{item.native}</div>
                    <div style={{ fontSize: 10.5, color: COLORS.ink, opacity: 0.8 }}>
                      {item.label}
                    </div>
                  </div>
                </div>
                {isSelected && <Check size={16} color={COLORS.forest} strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
