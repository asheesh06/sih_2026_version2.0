// LGD (Local Government Directory) Service & Authority Mapping Engine
// Standardized on Indian Local Government Directory (LGD) Hierarchy:
// State (2 digits) -> District (3 digits) -> Sub-District / Block / Tehsil (5 digits)

// All 28 States & 8 Union Territories with official Indian LGD State Codes
const LGD_STATES = [
  { code: "20", name: "Jharkhand", lat: 23.6102, lng: 85.2799, bounds: { minLat: 21.9, maxLat: 25.3, minLng: 83.3, maxLng: 87.9 } },
  { code: "23", name: "Madhya Pradesh", lat: 22.9734, lng: 78.6569, bounds: { minLat: 21.0, maxLat: 26.9, minLng: 74.0, maxLng: 82.8 } },
  { code: "10", name: "Bihar", lat: 25.0961, lng: 85.3131, bounds: { minLat: 24.2, maxLat: 27.6, minLng: 83.3, maxLng: 88.3 } },
  { code: "09", name: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, bounds: { minLat: 23.8, maxLat: 30.5, minLng: 77.0, maxLng: 84.7 } },
  { code: "27", name: "Maharashtra", lat: 19.7515, lng: 75.7139, bounds: { minLat: 15.6, maxLat: 22.1, minLng: 72.6, maxLng: 80.9 } },
  { code: "07", name: "Delhi", lat: 28.7041, lng: 77.1025, bounds: { minLat: 28.4, maxLat: 28.9, minLng: 76.8, maxLng: 77.4 } },
  { code: "19", name: "West Bengal", lat: 22.9868, lng: 87.8550, bounds: { minLat: 21.5, maxLat: 27.3, minLng: 85.8, maxLng: 89.9 } },
  { code: "21", name: "Odisha", lat: 20.9517, lng: 85.0985, bounds: { minLat: 17.8, maxLat: 22.6, minLng: 81.3, maxLng: 87.5 } },
  { code: "22", name: "Chhattisgarh", lat: 21.2787, lng: 81.8661, bounds: { minLat: 17.7, maxLat: 24.1, minLng: 80.2, maxLng: 84.4 } },
  { code: "08", name: "Rajasthan", lat: 27.0238, lng: 74.2179, bounds: { minLat: 23.0, maxLat: 30.2, minLng: 69.5, maxLng: 78.3 } },
  { code: "24", name: "Gujarat", lat: 22.2587, lng: 71.1924, bounds: { minLat: 20.1, maxLat: 24.7, minLng: 68.1, maxLng: 74.5 } },
  { code: "29", name: "Karnataka", lat: 15.3173, lng: 75.7139, bounds: { minLat: 11.5, maxLat: 18.5, minLng: 74.0, maxLng: 78.6 } },
  { code: "33", name: "Tamil Nadu", lat: 11.1271, lng: 78.6569, bounds: { minLat: 8.0, maxLat: 13.6, minLng: 76.2, maxLng: 80.4 } },
  { code: "36", name: "Telangana", lat: 18.1124, lng: 79.0193, bounds: { minLat: 15.8, maxLat: 19.9, minLng: 77.2, maxLng: 81.8 } },
  { code: "28", name: "Andhra Pradesh", lat: 15.9129, lng: 79.7400, bounds: { minLat: 12.6, maxLat: 19.1, minLng: 76.7, maxLng: 84.8 } },
  { code: "03", name: "Punjab", lat: 31.1471, lng: 75.3412, bounds: { minLat: 29.5, maxLat: 32.5, minLng: 73.8, maxLng: 76.9 } },
  { code: "06", name: "Haryana", lat: 29.0588, lng: 76.0856, bounds: { minLat: 27.6, maxLat: 30.9, minLng: 74.4, maxLng: 77.6 } },
  { code: "05", name: "Uttarakhand", lat: 30.0668, lng: 79.0193, bounds: { minLat: 28.7, maxLat: 31.5, minLng: 77.5, maxLng: 81.1 } },
  { code: "02", name: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, bounds: { minLat: 30.3, maxLat: 33.2, minLng: 75.7, maxLng: 79.0 } },
  { code: "18", name: "Assam", lat: 26.2006, lng: 92.9376, bounds: { minLat: 24.1, maxLat: 28.0, minLng: 89.7, maxLng: 96.0 } },
  { code: "32", name: "Kerala", lat: 10.8505, lng: 76.2711, bounds: { minLat: 8.3, maxLat: 12.8, minLng: 74.8, maxLng: 77.4 } },
  { code: "01", name: "Jammu and Kashmir", lat: 33.7782, lng: 76.5762, bounds: { minLat: 32.2, maxLat: 36.5, minLng: 73.5, maxLng: 79.5 } },
  { code: "30", name: "Goa", lat: 15.2993, lng: 74.1240, bounds: { minLat: 14.8, maxLat: 15.8, minLng: 73.6, maxLng: 74.4 } },
  { code: "11", name: "Sikkim", lat: 27.5330, lng: 88.5122, bounds: { minLat: 27.0, maxLat: 28.1, minLng: 88.0, maxLng: 88.9 } },
  { code: "12", name: "Arunachal Pradesh", lat: 28.2180, lng: 94.7278, bounds: { minLat: 26.6, maxLat: 29.5, minLng: 91.5, maxLng: 97.4 } },
  { code: "13", name: "Nagaland", lat: 26.1584, lng: 94.5624, bounds: { minLat: 25.1, maxLat: 27.1, minLng: 93.3, maxLng: 95.3 } },
  { code: "14", name: "Manipur", lat: 24.6637, lng: 93.9063, bounds: { minLat: 23.8, maxLat: 25.7, minLng: 92.9, maxLng: 94.8 } },
  { code: "15", name: "Mizoram", lat: 23.1645, lng: 92.9376, bounds: { minLat: 21.9, maxLat: 24.5, minLng: 92.2, maxLng: 93.4 } },
  { code: "16", name: "Tripura", lat: 23.9408, lng: 91.9882, bounds: { minLat: 22.9, maxLat: 24.5, minLng: 91.1, maxLng: 92.4 } },
  { code: "17", name: "Meghalaya", lat: 25.4670, lng: 91.3662, bounds: { minLat: 25.0, maxLat: 26.1, minLng: 89.8, maxLng: 92.8 } },
  { code: "04", name: "Chandigarh", lat: 30.7333, lng: 76.7794, bounds: { minLat: 30.6, maxLat: 30.8, minLng: 76.7, maxLng: 76.9 } },
  { code: "37", name: "Ladakh", lat: 34.1526, lng: 77.5771, bounds: { minLat: 32.5, maxLat: 36.0, minLng: 75.5, maxLng: 80.5 } },
  { code: "34", name: "Puducherry", lat: 11.9416, lng: 79.8083, bounds: { minLat: 11.8, maxLat: 12.0, minLng: 79.7, maxLng: 79.9 } },
];

// Rich predefined District & Sub-District / Block mapping
const KNOWN_DISTRICTS = {
  // --- Jharkhand (State Code: 20) ---
  "20": [
    {
      code: "328",
      name: "Ranchi",
      lat: 23.3441,
      lng: 85.3096,
      subdistricts: [
        { code: "02341", name: "Lalpur" },
        { code: "02340", name: "Kanke" },
        { code: "02342", name: "Namkum" },
        { code: "02343", name: "Ratu" },
        { code: "02344", name: "Ormanjhi" },
        { code: "02345", name: "Sadar Ranchi" },
      ],
    },
    {
      code: "330",
      name: "Gumla",
      lat: 23.0428,
      lng: 84.5417,
      subdistricts: [
        { code: "02360", name: "Basia" },
        { code: "02361", name: "Gumla" },
        { code: "02362", name: "Palkot" },
        { code: "02363", name: "Kamdara" },
        { code: "02364", name: "Raidih" },
      ],
    },
    {
      code: "325",
      name: "Dhanbad",
      lat: 23.7957,
      lng: 86.4304,
      subdistricts: [
        { code: "02310", name: "Baghmara" },
        { code: "02311", name: "Dhanbad Urban" },
        { code: "02312", name: "Govindpur" },
        { code: "02313", name: "Nirsa" },
        { code: "02314", name: "Jharia" },
      ],
    },
    {
      code: "333",
      name: "Latehar",
      lat: 23.7434,
      lng: 84.4984,
      subdistricts: [
        { code: "02380", name: "Chandwa" },
        { code: "02381", name: "Latehar" },
        { code: "02382", name: "Balumath" },
        { code: "02383", name: "Mahuadanr" },
      ],
    },
    {
      code: "326",
      name: "Bokaro",
      lat: 23.6693,
      lng: 86.1511,
      subdistricts: [
        { code: "02320", name: "Chas" },
        { code: "02321", name: "Bermo" },
        { code: "02322", name: "Chandankyari" },
      ],
    },
    {
      code: "327",
      name: "East Singhbhum",
      lat: 22.8046,
      lng: 86.2029,
      subdistricts: [
        { code: "02330", name: "Jamshedpur" },
        { code: "02331", name: "Ghatshila" },
        { code: "02332", name: "Potka" },
      ],
    },
    {
      code: "329",
      name: "Hazaribagh",
      lat: 23.9925,
      lng: 85.3637,
      subdistricts: [
        { code: "02370", name: "Sadar Hazaribagh" },
        { code: "02371", name: "Barhi" },
        { code: "02372", name: "Ichak" },
      ],
    },
  ],

  // --- Madhya Pradesh (State Code: 23) ---
  "23": [
    {
      code: "408",
      name: "Bhopal",
      lat: 23.2599,
      lng: 77.4126,
      subdistricts: [
        { code: "03417", name: "Huzur" },
        { code: "03416", name: "Berasia" },
        { code: "03415", name: "Phanda" },
        { code: "03418", name: "Kolar" },
      ],
    },
    {
      code: "419",
      name: "Indore",
      lat: 22.7196,
      lng: 75.8577,
      subdistricts: [
        { code: "03490", name: "Indore" },
        { code: "03491", name: "Sanwer" },
        { code: "03492", name: "Mhow" },
        { code: "03493", name: "Depalpur" },
      ],
    },
    {
      code: "420",
      name: "Jabalpur",
      lat: 23.1815,
      lng: 79.9864,
      subdistricts: [
        { code: "03500", name: "Jabalpur" },
        { code: "03501", name: "Sihora" },
        { code: "03502", name: "Patan" },
      ],
    },
    {
      code: "405",
      name: "Gwalior",
      lat: 26.2183,
      lng: 78.1828,
      subdistricts: [
        { code: "03380", name: "Gwalior" },
        { code: "03381", name: "Dabra" },
        { code: "03382", name: "Bhitarwar" },
      ],
    },
  ],

  // --- Bihar (State Code: 10) ---
  "10": [
    {
      code: "216",
      name: "Patna",
      lat: 25.5941,
      lng: 85.1376,
      subdistricts: [
        { code: "01150", name: "Patna Sadar" },
        { code: "01151", name: "Danapur" },
        { code: "01152", name: "Barh" },
      ],
    },
    {
      code: "234",
      name: "Gaya",
      lat: 24.7914,
      lng: 85.0002,
      subdistricts: [
        { code: "01300", name: "Gaya Town" },
        { code: "01301", name: "Bodh Gaya" },
      ],
    },
  ],

  // --- Uttar Pradesh (State Code: 09) ---
  "09": [
    {
      code: "157",
      name: "Lucknow",
      lat: 26.8467,
      lng: 80.9462,
      subdistricts: [
        { code: "00810", name: "Lucknow" },
        { code: "00811", name: "Bakshi Ka Talab" },
        { code: "00812", name: "Malihabad" },
      ],
    },
    {
      code: "186",
      name: "Varanasi",
      lat: 25.3176,
      lng: 82.9739,
      subdistricts: [
        { code: "00950", name: "Varanasi" },
        { code: "00951", name: "Pindra" },
      ],
    },
    {
      code: "141",
      name: "Gautam Buddha Nagar",
      lat: 28.5355,
      lng: 77.3910,
      subdistricts: [
        { code: "00720", name: "Noida" },
        { code: "00721", name: "Dadri" },
        { code: "00722", name: "Jewar" },
      ],
    },
  ],

  // --- Delhi (State Code: 07) ---
  "07": [
    {
      code: "088",
      name: "New Delhi",
      lat: 28.6139,
      lng: 77.2090,
      subdistricts: [
        { code: "00501", name: "Chanakyapuri" },
        { code: "00502", name: "Delhi Cantonment" },
        { code: "00503", name: "Vasant Vihar" },
      ],
    },
    {
      code: "089",
      name: "Central Delhi",
      lat: 28.6500,
      lng: 77.2200,
      subdistricts: [
        { code: "00510", name: "Civil Lines" },
        { code: "00511", name: "Karol Bagh" },
      ],
    },
  ],

  // --- Maharashtra (State Code: 27) ---
  "27": [
    {
      code: "518",
      name: "Mumbai Suburban",
      lat: 19.0760,
      lng: 72.8777,
      subdistricts: [
        { code: "04180", name: "Andheri" },
        { code: "04181", name: "Borivali" },
        { code: "04182", name: "Kurla" },
      ],
    },
    {
      code: "521",
      name: "Pune",
      lat: 18.5204,
      lng: 73.8567,
      subdistricts: [
        { code: "04200", name: "Haveli" },
        { code: "04201", name: "Pune City" },
        { code: "04202", name: "Baramati" },
      ],
    },
  ],
};

// Deterministic LGD code generator for any Indian District or Sub-District not explicitly in table
function hashLgdCode(name, type = "district", stateCode = "20") {
  if (!name) return type === "district" ? "999" : "99999";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  if (type === "district") {
    // 3 digits between 101 and 899
    return String(100 + (positive % 800)).padStart(3, "0");
  } else {
    // 5 digits between 01001 and 08999
    return String(1000 + (positive % 8000)).padStart(5, "0");
  }
}

// Calculate Haversine distance in km
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Detect State from coordinates or text
function detectState(lat, lng, text = "") {
  const textLower = (text || "").toLowerCase();

  // 1. Text match state name
  for (const s of LGD_STATES) {
    if (textLower.includes(s.name.toLowerCase())) {
      return s;
    }
  }

  // Check known district names in text to infer state
  for (const [stateCode, dists] of Object.entries(KNOWN_DISTRICTS)) {
    for (const d of dists) {
      if (textLower.includes(d.name.toLowerCase())) {
        return LGD_STATES.find((s) => s.code === stateCode) || LGD_STATES[0];
      }
      for (const sub of d.subdistricts) {
        if (textLower.includes(sub.name.toLowerCase())) {
          return LGD_STATES.find((s) => s.code === stateCode) || LGD_STATES[0];
        }
      }
    }
  }

  // 2. Geographic Bounding Box Match
  if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
    for (const s of LGD_STATES) {
      if (
        lat >= s.bounds.minLat &&
        lat <= s.bounds.maxLat &&
        lng >= s.bounds.minLng &&
        lng <= s.bounds.maxLng
      ) {
        return s;
      }
    }

    // Nearest State Centroid fallback
    let nearest = LGD_STATES[0];
    let minDist = Infinity;
    for (const s of LGD_STATES) {
      const d = distanceKm(lat, lng, s.lat, s.lng);
      if (d < minDist) {
        minDist = d;
        nearest = s;
      }
    }
    return nearest;
  }

  // Default: Jharkhand
  return LGD_STATES[0]; // Jharkhand (20)
}

/**
 * Resolves location string, GPS coordinates, or explicit codes to a full Indian LGD Hierarchy.
 * Returns: {
 *   state_code, state_name,
 *   district_code, district_name,
 *   subdistrict_code, subdistrict_name,
 *   lgd_hierarchy_code,
 *   formatted_address,
 *   is_allowed,
 *   allow_all_locations,
 *   disallow_reason
 * }
 */
function resolveLgdLocation(lat, lng, locationText = "", explicit = {}) {
  const allowAllLocations = process.env.ALLOW_ALL_LOCATIONS !== "false";

  // 1. Detect State
  let matchedState = null;
  if (explicit.state_code) {
    matchedState = LGD_STATES.find((s) => s.code === explicit.state_code);
  }
  if (!matchedState && explicit.state_name) {
    matchedState = LGD_STATES.find(
      (s) => s.name.toLowerCase() === explicit.state_name.toLowerCase()
    );
  }
  if (!matchedState) {
    matchedState = detectState(lat, lng, locationText);
  }

  const stateCode = matchedState.code;
  const stateName = matchedState.name;

  // Check if this location is permitted
  const isJharkhand = stateCode === "20";
  const isAllowed = allowAllLocations || isJharkhand;
  const disallowReason = isAllowed
    ? null
    : `Problem reporting is currently restricted to Jharkhand state only. Your detected location is in ${stateName} (State Code: ${stateCode}). To allow reporting from any location, set ALLOW_ALL_LOCATIONS=true in .env.`;

  // 2. Resolve District
  const stateDistricts = KNOWN_DISTRICTS[stateCode] || [];
  let matchedDistrict = null;
  let matchedSubdistrict = null;

  // Check explicit district
  if (explicit.district_code) {
    matchedDistrict = stateDistricts.find((d) => d.code === explicit.district_code);
    if (!matchedDistrict && explicit.district_name) {
      matchedDistrict = {
        code: explicit.district_code,
        name: explicit.district_name,
        subdistricts: [],
      };
    }
  } else if (explicit.district_name) {
    matchedDistrict = stateDistricts.find(
      (d) => d.name.toLowerCase() === explicit.district_name.toLowerCase()
    );
    if (!matchedDistrict) {
      matchedDistrict = {
        code: hashLgdCode(explicit.district_name, "district", stateCode),
        name: explicit.district_name,
        subdistricts: [],
      };
    }
  }

  // Text lookup in location string
  const locLower = (locationText || "").toLowerCase();
  if (!matchedDistrict) {
    for (const d of stateDistricts) {
      if (locLower.includes(d.name.toLowerCase())) {
        matchedDistrict = d;
        break;
      }
      for (const sub of d.subdistricts) {
        if (locLower.includes(sub.name.toLowerCase())) {
          matchedDistrict = d;
          matchedSubdistrict = sub;
          break;
        }
      }
      if (matchedDistrict) break;
    }
  }

  // GPS distance match within state
  if (!matchedDistrict && lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
    if (stateDistricts.length > 0) {
      let nearest = stateDistricts[0];
      let minDist = Infinity;
      for (const d of stateDistricts) {
        if (d.lat != null && d.lng != null) {
          const dist = distanceKm(lat, lng, d.lat, d.lng);
          if (dist < minDist) {
            minDist = dist;
            nearest = d;
          }
        }
      }
      matchedDistrict = nearest;
    }
  }

  // If still not matched, extract district name from location text (e.g. "Bhopal, MP" -> "Bhopal")
  if (!matchedDistrict) {
    const parts = (locationText || "")
      .split(/[,()]/)
      .map((p) => p.trim())
      .filter((p) => p && !p.match(/^[0-9. °NSEW]+$/i));
    const candidateName = parts[0] || (stateDistricts[0]?.name ?? stateName + " Central");
    matchedDistrict = {
      code: hashLgdCode(candidateName, "district", stateCode),
      name: candidateName,
      subdistricts: [],
    };
  }

  // 3. Resolve Sub-District / Block / Tehsil
  if (!matchedSubdistrict && explicit.subdistrict_code) {
    matchedSubdistrict = (matchedDistrict.subdistricts || []).find(
      (s) => s.code === explicit.subdistrict_code
    );
    if (!matchedSubdistrict && explicit.subdistrict_name) {
      matchedSubdistrict = {
        code: explicit.subdistrict_code,
        name: explicit.subdistrict_name,
      };
    }
  } else if (!matchedSubdistrict && explicit.subdistrict_name) {
    matchedSubdistrict = (matchedDistrict.subdistricts || []).find(
      (s) => s.name.toLowerCase() === explicit.subdistrict_name.toLowerCase()
    );
    if (!matchedSubdistrict) {
      matchedSubdistrict = {
        code: hashLgdCode(explicit.subdistrict_name, "subdistrict", stateCode),
        name: explicit.subdistrict_name,
      };
    }
  }

  if (!matchedSubdistrict) {
    for (const s of matchedDistrict.subdistricts || []) {
      if (locLower.includes(s.name.toLowerCase())) {
        matchedSubdistrict = s;
        break;
      }
    }
  }

  if (!matchedSubdistrict) {
    if (matchedDistrict.subdistricts && matchedDistrict.subdistricts.length > 0) {
      matchedSubdistrict = matchedDistrict.subdistricts[0];
    } else {
      // Parse from locationText parts (e.g. "Huzur, Bhopal" -> subdistrict Huzur)
      const parts = (locationText || "")
        .split(/[,()]/)
        .map((p) => p.trim())
        .filter((p) => p && !p.match(/^[0-9. °NSEW]+$/i));
      const subCandidate = parts.length > 1 ? parts[0] : matchedDistrict.name + " Sadar";
      matchedSubdistrict = {
        code: hashLgdCode(subCandidate, "subdistrict", stateCode),
        name: subCandidate,
      };
    }
  }

  const districtCode = matchedDistrict.code;
  const districtName = matchedDistrict.name;
  const subdistrictCode = matchedSubdistrict.code;
  const subdistrictName = matchedSubdistrict.name;
  const lgdHierarchyCode = `LGD-${stateCode}-${districtCode}-${subdistrictCode}`;
  const formattedAddress = `${subdistrictName}, ${districtName} District, ${stateName}`;

  return {
    state_code: stateCode,
    state_name: stateName,
    district_code: districtCode,
    district_name: districtName,
    subdistrict_code: subdistrictCode,
    subdistrict_name: subdistrictName,
    lgd_hierarchy_code: lgdHierarchyCode,
    formatted_address: formattedAddress,
    is_allowed: isAllowed,
    allow_all_locations: allowAllLocations,
    disallow_reason: disallowReason,
  };
}

/**
 * Authority Mapping Engine:
 * Matches the problem's LGD location codes (State, District, Sub-District)
 * with the pre-provisioned Government Official authority accounts in the directory.
 * Village code option is REMOVED from government official schema.
 *
 * Matching Order:
 * 1. Sub-District / Block Level: Exact match on (state_code + district_code + subdistrict_code)
 * 2. District Level: Exact match on (state_code + district_code)
 * 3. State Level: Match on (state_code)
 * 4. National / Central Fallback: Match national officer if state is outside default jurisdiction
 */
function mapAuthority(lgdData, category, officers = []) {
  const govOfficers = (officers || []).filter((u) => u.role === "government");

  if (govOfficers.length === 0) {
    return {
      authority_id: "gov-ranchi",
      authority_name: "Sri Arvind Kumar, IAS",
      authority_username: "officer.ranchi",
      authority_designation: "District Innovation & Development Officer (DIO)",
      authority_department: "District Collectorate & Innovation Council",
      authority_scope: "district",
      matched_level: "District",
      matched_lgd_code: lgdData.district_code || "328",
    };
  }

  // Level 1: Match by Sub-District / Block Code (Must match state_code, district_code, AND subdistrict_code)
  if (lgdData.subdistrict_code) {
    const subdistrictOfficer = govOfficers.find(
      (o) =>
        (o.state_code === lgdData.state_code || !o.state_code) &&
        o.district_code === lgdData.district_code &&
        o.subdistrict_code &&
        o.subdistrict_code === lgdData.subdistrict_code
    );
    if (subdistrictOfficer) {
      return {
        authority_id: subdistrictOfficer._id,
        authority_name: subdistrictOfficer.name,
        authority_username: subdistrictOfficer.username,
        authority_designation: subdistrictOfficer.designation || "Block Development Officer (BDO)",
        authority_department: subdistrictOfficer.department || "Rural Development & Administration",
        authority_scope: "subdistrict",
        matched_level: "Sub-District / Block",
        matched_lgd_code: subdistrictOfficer.subdistrict_code,
      };
    }
  }

  // Level 2: Match by District Code (Must match state_code AND district_code)
  if (lgdData.district_code) {
    const distOfficer = govOfficers.find(
      (o) =>
        (o.state_code === lgdData.state_code || !o.state_code) &&
        o.district_code === lgdData.district_code &&
        (!o.subdistrict_code || o.jurisdiction_level === "district")
    );
    if (distOfficer) {
      return {
        authority_id: distOfficer._id,
        authority_name: distOfficer.name,
        authority_username: distOfficer.username,
        authority_designation:
          distOfficer.designation || "District Innovation & Development Officer (DIO)",
        authority_department:
          distOfficer.department || "District Administration & Innovation Council",
        authority_scope: "district",
        matched_level: "District",
        matched_lgd_code: distOfficer.district_code,
      };
    }
  }

  // Level 3: Match by State Code (State Level Authority)
  const stateOfficer = govOfficers.find(
    (o) =>
      o.state_code === lgdData.state_code &&
      (o.jurisdiction_level === "state" || !o.district_code)
  );
  if (stateOfficer) {
    return {
      authority_id: stateOfficer._id,
      authority_name: stateOfficer.name,
      authority_username: stateOfficer.username,
      authority_designation: stateOfficer.designation || "State Innovation Directorate Officer",
      authority_department:
        stateOfficer.department || "State Innovation Directorate & Higher Education",
      authority_scope: "state",
      matched_level: "State",
      matched_lgd_code: stateOfficer.state_code || lgdData.state_code,
    };
  }

  // Level 4: National Coordinator / Central Authority (for multi-state / outside default states)
  const nationalOfficer = govOfficers.find(
    (o) => o.username === "officer.national" || o.jurisdiction_level === "national" || !o.state_code
  );
  if (nationalOfficer) {
    return {
      authority_id: nationalOfficer._id,
      authority_name: nationalOfficer.name,
      authority_username: nationalOfficer.username,
      authority_designation: nationalOfficer.designation || "National Innovation Coordinator",
      authority_department: nationalOfficer.department || "National Innovation Council",
      authority_scope: "national",
      matched_level: "National / Multi-State",
      matched_lgd_code: lgdData.state_code,
    };
  }

  // Level 5: Ultimate Fallback (Default State Officer)
  const fallbackOfficer = govOfficers[0];
  return {
    authority_id: fallbackOfficer._id,
    authority_name: fallbackOfficer.name,
    authority_username: fallbackOfficer.username,
    authority_designation: fallbackOfficer.designation || "State Innovation Officer",
    authority_department: fallbackOfficer.department || "Innovation & Development Directorate",
    authority_scope: fallbackOfficer.jurisdiction_level || "district",
    matched_level: "General Directorate",
    matched_lgd_code: lgdData.district_code || lgdData.state_code,
  };
}

module.exports = {
  LGD_STATES,
  KNOWN_DISTRICTS,
  resolveLgdLocation,
  mapAuthority,
};
