const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

let aiClient = null;
function getAiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// In-memory cache for translated strings
const translationCache = new Map();

// Built-in dictionary for fast local lookups of common terms & phrases
const DICT = {
  khortha: {
    "Report a societal problem": "एकठो सामाजिक समस्या दरज करा",
    "Water Resources": "पानी-जल संसाधन",
    "Healthcare": "दवा-इलाज आउर स्वास्थ्य",
    "Education": "पढ़ाई-लिखाई आउर शिक्षा",
    "Rural Livelihoods": "गाँव-घरक रोजी-रोजगार",
    "Disaster Management": "आपदा आउर संकट प्रबंधन",
    "Urban Development": "शहर-बस्ती विकास",
    "Energy": "बिजली-ऊर्जा",
    "Environment": "पर्यावरण आउर रुख-गाछ",
    "Roads & Infrastructure": "सड़क आउर पुल-पुलिया",
    "Public Administration": "सरकारी काम-काज",
    "Agriculture": "खेती-बारी",
    "Waiting for government review": "सरकार के जाँच के अगोरल",
    "Assigned to university": "विश्वविद्यालय के सउंपल गेल",
    "Team formed, seeking industry partner": "टीम बैन गेल, उद्योग संगी खोजल जा रहल हे",
    "Looking for an industry partner": "उद्योग संगी के दरकार हे",
    "Budget under government review": "बजट सरकार के जाँच में हे",
    "Budget sent back for revision": "बजट सुधार खातिर घुरावल गेल",
    "Ground work in progress": "जमीनी काम चालू हे",
    "Completed": "काम पूरा भेल",
    "Not approved": "मंजूर नय भेल",
  },
  hi: {
    "Report a societal problem": "एक सामाजिक समस्या दर्ज करें",
    "Water Resources": "जल संसाधन",
    "Healthcare": "स्वास्थ्य सेवा",
    "Education": "शिक्षा",
    "Rural Livelihoods": "ग्रामीण आजीविका",
    "Disaster Management": "आपदा प्रबंधन",
    "Urban Development": "शहरी विकास",
    "Energy": "ऊर्जा",
    "Environment": "पर्यावरण",
    "Roads & Infrastructure": "सड़क एवं अवसंरचना",
    "Public Administration": "लोक प्रशासन",
    "Agriculture": "कृषि",
    "Waiting for government review": "सरकारी समीक्षा की प्रतीक्षा में",
    "Assigned to university": "विश्वविद्यालय को सौंपा गया",
    "Team formed, seeking industry partner": "टीम बनी, उद्योग साझेदार की तलाश",
    "Looking for an industry partner": "उद्योग साझेदार की तलाश जारी",
    "Budget under government review": "बजट सरकारी समीक्षा में",
    "Budget sent back for revision": "बजट संशोधन हेतु वापस भेजा गया",
    "Ground work in progress": "ज़मीनी कार्य जारी",
    "Completed": "पूर्ण",
    "Not approved": "स्वीकृत नहीं",
  }
};

router.post("/", async (req, res) => {
  const { text, targetLang = "en", context = "" } = req.body || {};

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.json({ translated: "" });
  }

  const trimmed = text.trim();
  const normalizedLang = targetLang.toLowerCase();

  // If already in English and target is English
  if (normalizedLang === "en" && /^[a-zA-Z0-9\s.,!?'"()#@₹%-]+$/.test(trimmed)) {
    return res.json({ translated: trimmed });
  }

  const cacheKey = `${normalizedLang}:${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return res.json({ translated: translationCache.get(cacheKey) });
  }

  // Check fast local dictionary
  if (DICT[normalizedLang] && DICT[normalizedLang][trimmed]) {
    const result = DICT[normalizedLang][trimmed];
    translationCache.set(cacheKey, result);
    return res.json({ translated: result });
  }

  // If target is English and source is in DICT values
  if (normalizedLang === "en") {
    for (const [langKey, table] of Object.entries(DICT)) {
      for (const [enKey, val] of Object.entries(table)) {
        if (val === trimmed) {
          translationCache.set(cacheKey, enKey);
          return res.json({ translated: enKey });
        }
      }
    }
  }

  // Use Gemini API if available
  const ai = getAiClient();
  if (ai) {
    try {
      let langInstruction = "English";
      if (normalizedLang === "hi") {
        langInstruction = "clear and natural standard Hindi in Devanagari script";
      } else if (normalizedLang === "khortha" || normalizedLang === "kht") {
        langInstruction = "authentic colloquial Khortha (a major language of Jharkhand) in Devanagari script";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an expert translator for the Jharkhand Government Societal Innovation Collaboration Portal (SICP).
Translate the following text into ${langInstruction}.
Maintain proper nouns, locations in Jharkhand (like Ranchi, Dhanbad, Bokaro, Hazaribagh, Dumka, etc.), and numerical values.
Return ONLY the direct translation without any explanation, markdown backticks, or quotation marks.

${context ? `Context: ${context}\n` : ""}Text to translate:
${trimmed}`,
              },
            ],
          },
        ],
      });

      const translated = response.text ? response.text.trim() : trimmed;
      translationCache.set(cacheKey, translated);
      return res.json({ translated });
    } catch (err) {
      console.warn("[Translation error with Gemini]:", err.message);
    }
  }

  // Fallback if AI not available or errored
  return res.json({ translated: trimmed });
});

module.exports = router;
