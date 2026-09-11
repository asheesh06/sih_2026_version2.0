const KEYWORD_MAP = {
  "Disaster Management": ["flood", "flooding", "drain", "waterlog", "cyclone", "landslide", "fire", "earthquake", "rescue"],
  Education: ["school", "teacher", "classroom", "student", "book", "college", "syllabus"],
  Healthcare: ["hospital", "doctor", "medicine", "disease", "health", "clinic", "ambulance"],
  Agriculture: ["crop", "farmer", "irrigation", "seed", "farming", "harvest", "soil"],
  "Water Resources": ["water", "well", "handpump", "borewell", "drinking", "contaminated", "supply"],
  Environment: ["pollution", "forest", "tree", "waste", "garbage", "dump", "air quality"],
  "Urban Development": ["road", "street light", "footpath", "sewage", "traffic", "encroachment"],
  Accessibility: ["disabled", "wheelchair", "ramp", "blind", "accessibility"],
  "Rural Livelihoods": ["livelihood", "employment", "wages", "self help group", "artisan"],
  "Public Administration": ["ration", "certificate", "office", "corruption", "delay", "pension"],
  Energy: ["electricity", "power cut", "transformer", "solar", "voltage"],
};

function aiClassify(text) {
  const lower = (text || "").toLowerCase();
  let best = { category: "Public Administration", hits: 0 };
  Object.entries(KEYWORD_MAP).forEach(([cat, words]) => {
    const hits = words.filter((w) => lower.includes(w)).length;
    if (hits > best.hits) best = { category: cat, hits };
  });
  const confidence = best.hits > 0 ? Math.min(96, 55 + best.hits * 14) : 40;
  return { category: best.category, confidence };
}

module.exports = { aiClassify, CATEGORIES: Object.keys(KEYWORD_MAP) };
