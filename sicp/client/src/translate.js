import { useState, useEffect } from "react";
import { api } from "./api.js";
import { getCategoryLabel } from "./i18n.js";

// Client-side translation cache
const memoryCache = {
  en: new Map(),
  hi: new Map(),
  khortha: new Map(),
};

/**
 * Translate arbitrary text to target language via /api/translate
 */
export async function translateText(text, targetLang = "en", context = "") {
  if (!text || typeof text !== "string" || !text.trim()) return "";
  const langKey = targetLang === "kht" ? "khortha" : targetLang;

  // If already in English and English requested, avoid network call
  if (langKey === "en" && /^[a-zA-Z0-9\s.,!?'"()#@₹%-]+$/.test(text)) {
    return text;
  }

  // Check client cache
  const cache = memoryCache[langKey] || memoryCache.en;
  if (cache.has(text)) {
    return cache.get(text);
  }

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: langKey, context }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.translated) {
        cache.set(text, data.translated);
        return data.translated;
      }
    }
  } catch (err) {
    console.warn("Translation failed:", err);
  }

  return text;
}

/**
 * React hook to automatically render any dynamic text in the current language
 */
export function useTranslatedText(text, lang = "en", context = "") {
  const langKey = lang === "kht" ? "khortha" : lang;
  const cache = memoryCache[langKey] || memoryCache.en;
  const cachedVal = cache.has(text) ? cache.get(text) : null;

  const [translated, setTranslated] = useState(cachedVal || text);
  const [loading, setLoading] = useState(!cachedVal && langKey !== "en" && Boolean(text));

  useEffect(() => {
    if (!text) {
      setTranslated("");
      setLoading(false);
      return;
    }

    if (langKey === "en" && /^[a-zA-Z0-9\s.,!?'"()#@₹%-]+$/.test(text)) {
      setTranslated(text);
      setLoading(false);
      return;
    }

    if (cache.has(text)) {
      setTranslated(cache.get(text));
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    translateText(text, langKey, context).then((res) => {
      if (isMounted) {
        setTranslated(res);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, langKey, context]);

  return { translated, loading };
}
