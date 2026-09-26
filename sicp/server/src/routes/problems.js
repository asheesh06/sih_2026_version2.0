const express = require("express");
const { nanoid } = require("nanoid");
const { Problem, Organisation, User, serializeProblem, serializeOrganisation } = require("../models");
const { requireAuth, requireRole } = require("../authMiddleware");
const { aiClassify } = require("../utils/aiClassify");
const { resolveLgdLocation, mapAuthority, LGD_STATES, KNOWN_DISTRICTS } = require("../lgdService");
const { asyncHandler } = require("../asyncHandler");

const router = express.Router();

async function getFullProblem(id) {
  const p = await Problem.findById(id);
  return serializeProblem(p);
}

function addHistory(problem, note) {
  problem.history.push(note);
}

// ---- LGD Directory & Resolution Utilities ----
router.get("/lgd/directory", (req, res) => {
  res.json({ states: LGD_STATES, districts: KNOWN_DISTRICTS });
});

router.get("/lgd/config", (req, res) => {
  const allowAllLocations = process.env.ALLOW_ALL_LOCATIONS !== "false";
  res.json({
    allow_all_locations: allowAllLocations,
    default_state: "Jharkhand",
    default_state_code: "20",
  });
});

router.post(
  "/lgd/resolve",
  asyncHandler(async (req, res) => {
    const { lat, lng, location, explicit } = req.body || {};
    const lgd = resolveLgdLocation(lat, lng, location, explicit || {});
    const officers = await User.find({ role: "government" });
    const authority = mapAuthority(lgd, req.body.category || "General", officers);
    res.json({ lgd, authority });
  })
);

// ---- List & read ----
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status, mine, jurisdiction, district_code, subdistrict_code, state_code } = req.query;
    let rows = await Problem.find().sort({ created_at: -1 });

    if (req.user.role === "citizen" && mine === "true") {
      rows = rows.filter((p) => p.citizen_id === req.user.id);
    }

    // Government Authority Complaint Queue filtering (State, District, Sub-District)
    if (req.user.role === "government") {
      const officer = await User.findById(req.user.id);
      const isMyArea = jurisdiction !== "all";

      if (isMyArea && officer) {
        if (officer.subdistrict_code) {
          // Sub-District / Block level officer (e.g. BDO): exact match on state, district, and subdistrict
          rows = rows.filter(
            (p) =>
              (!officer.state_code || p.state_code === officer.state_code) &&
              p.district_code === officer.district_code &&
              p.subdistrict_code === officer.subdistrict_code
          );
        } else if (officer.district_code) {
          // District level officer (e.g. DIO / DDC): exact match on state and district
          rows = rows.filter(
            (p) =>
              (!officer.state_code || p.state_code === officer.state_code) &&
              p.district_code === officer.district_code
          );
        } else if (officer.state_code) {
          // State level officer: matches state
          rows = rows.filter((p) => p.state_code === officer.state_code);
        }
        // If officer has no state_code (e.g. National Coordinator), they monitor all areas
      }
    }

    if (req.user.role === "university") {
      rows = rows.filter(
        (p) => p.status === "university_assigned" || p.university === req.user.org_name
      );
    }
    if (req.user.role === "industry") {
      rows = rows.filter((p) => {
        // Any problem forwarded for open industry tenders / bidding
        if (p.status === "industry_requested" || p.status === "budget_review") return true;
        // Any problem where this industry is awarded or assigned
        if (p.industry === req.user.org_name) return true;
        // Any problem where this industry has submitted a tender
        if (Array.isArray(p.tenders) && p.tenders.some((t) => t.industry_name === req.user.org_name)) return true;
        return false;
      });
    }

    if (district_code) {
      rows = rows.filter((p) => p.district_code === district_code);
    }
    if (subdistrict_code) {
      rows = rows.filter((p) => p.subdistrict_code === subdistrict_code);
    }
    if (status) rows = rows.filter((p) => p.status === status);

    res.json({ problems: rows.map(serializeProblem) });
  })
);

router.get(
  "/public/impact",
  asyncHandler(async (req, res) => {
    const rows = await Problem.find({ status: "completed" }).sort({ updated_at: -1 });
    res.json({ problems: rows.map(serializeProblem) });
  })
);

router.get(
  "/public/feed",
  asyncHandler(async (req, res) => {
    const { category, district_code, search, limit = 20 } = req.query;
    let allRows = await Problem.find().sort({ created_at: -1 });

    const stats = {
      total: allRows.length,
      resolved: allRows.filter((p) => p.status === "completed").length,
      under_research: allRows.filter((p) =>
        p.status === "university_assigned" ||
        p.status === "team_formed" ||
        p.status === "industry_requested"
      ).length,
      active_execution: allRows.filter((p) =>
        p.status === "in_progress" ||
        p.status === "budget_review"
      ).length,
    };

    let filtered = allRows;
    if (category && category !== "All") {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (district_code) {
      filtered = filtered.filter((p) => p.district_code === district_code);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.district_name && p.district_name.toLowerCase().includes(q))
      );
    }

    const maxItems = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const problems = filtered.slice(0, maxItems).map(serializeProblem);

    res.json({ problems, stats });
  })
);

router.get(
  "/public/problems/:id",
  asyncHandler(async (req, res) => {
    const p = await getFullProblem(req.params.id);
    if (!p) return res.status(404).json({ error: "Problem not found" });
    res.json({ problem: p });
  })
);

router.get(
  "/organisations",
  asyncHandler(async (req, res) => {
    const organisations = await Organisation.find();
    res.json({ organisations: organisations.map(serializeOrganisation) });
  })
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const p = await getFullProblem(req.params.id);
    if (!p) return res.status(404).json({ error: "Problem not found" });
    res.json({ problem: p });
  })
);

// ---- Citizen: submit ----
router.post(
  "/",
  requireAuth,
  requireRole("citizen"),
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      location,
      photo_url,
      lat,
      lng,
      coords,
      state_code,
      district_code,
      district_name,
      subdistrict_code,
      subdistrict_name,
      village_code,
      village_name,
    } = req.body || {};

    if (!title || !description || !location) {
      return res.status(400).json({ error: "title, description and location are required" });
    }

    const actualLat = lat != null ? lat : coords?.lat;
    const actualLng = lng != null ? lng : coords?.lng;

    // Step 1: Resolve LGD Directory Hierarchy (State -> District -> Sub-District)
    const lgdData = resolveLgdLocation(actualLat, actualLng, location, {
      state_code,
      district_code,
      district_name,
      subdistrict_code,
      subdistrict_name,
      village_name,
    });

    // Check location restriction variable from .env
    const allowAllLocations = process.env.ALLOW_ALL_LOCATIONS !== "false";
    if (!allowAllLocations && lgdData.state_code !== "20") {
      return res.status(403).json({
        error: `Problem reporting is currently restricted to Jharkhand state only. Your detected location is in ${lgdData.state_name} (State Code: ${lgdData.state_code}). To allow reporting from any location, set ALLOW_ALL_LOCATIONS=true in .env.`,
        lgd: lgdData,
      });
    }

    // Step 2: Problem / AI Classification
    const { category, confidence } = aiClassify(`${title} ${description}`);

    // Step 3: Authority Mapping Engine
    // Query registered government body officials to match area jurisdiction
    const officers = await User.find({ role: "government" });
    const mappedAuthority = mapAuthority(lgdData, category, officers);

    const id = "PS-" + nanoid(6).toUpperCase();
    const historyEntries = [
      `Reported by citizen with GPS location: ${location}`,
    ];
    if (photo_url) historyEntries.push("Photo evidence attached");
    historyEntries.push(
      `LGD Directory mapped: State: ${lgdData.state_name} (${lgdData.state_code}) → District: ${lgdData.district_name} (${lgdData.district_code}) → Sub-District: ${lgdData.subdistrict_name} (${lgdData.subdistrict_code})`
    );
    historyEntries.push(`AI categorised as ${category} (${confidence}%)`);
    historyEntries.push(
      `Authority Mapping Engine: Assigned to ${mappedAuthority.authority_designation} (${mappedAuthority.authority_name}) [${mappedAuthority.authority_department}]`
    );
    historyEntries.push(
      `Complaint entered into ${mappedAuthority.authority_designation} official complaint queue`
    );

    const problem = await Problem.create({
      _id: id,
      title,
      description,
      location,
      citizen_id: req.user.id,
      category,
      confidence,
      photo_url: photo_url || null,
      status: "pending_review",
      history: historyEntries,
      // LGD hierarchy details
      state_code: lgdData.state_code,
      state_name: lgdData.state_name,
      district_code: lgdData.district_code,
      district_name: lgdData.district_name,
      subdistrict_code: lgdData.subdistrict_code,
      subdistrict_name: lgdData.subdistrict_name,
      panchayat_code: null,
      panchayat_name: null,
      village_code: null,
      village_name: village_name || null,
      lgd_hierarchy_code: lgdData.lgd_hierarchy_code,
      // Matched Authority
      assigned_authority_id: mappedAuthority.authority_id,
      assigned_authority_name: mappedAuthority.authority_name,
      assigned_authority_username: mappedAuthority.authority_username,
      assigned_authority_designation: mappedAuthority.authority_designation,
      assigned_authority_department: mappedAuthority.authority_department,
      assigned_authority_scope: mappedAuthority.authority_scope,
    });

    res.status(201).json({
      problem: serializeProblem(problem),
      lgd: lgdData,
      authority: mappedAuthority,
    });
  })
);

// ---- Government: approve & route / reject ----
router.post(
  "/:id/approve",
  requireAuth,
  requireRole("government"),
  asyncHandler(async (req, res) => {
    const { university } = req.body || {};
    const p = await Problem.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Problem not found" });
    if (p.status !== "pending_review") return res.status(409).json({ error: "This problem is not awaiting review" });
    if (!university) return res.status(400).json({ error: "university is required" });

    p.status = "university_assigned";
    p.university = university;
    addHistory(p, `Approved by Govt. and routed to ${university}`);
    await p.save();
    res.json({ problem: serializeProblem(p) });
  })
);

router.post(
  "/:id/reject",
  requireAuth,
  requireRole("government"),
  asyncHandler(async (req, res) => {
    const { reason } = req.body || {};
    const p = await Problem.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Problem not found" });
    if (p.status !== "pending_review") return res.status(409).json({ error: "This problem is not awaiting review" });

    p.status = "rejected";
    p.reject_reason = reason || null;
    addHistory(p, `Rejected by Govt.${reason ? ": " + reason : ""}`);
    await p.save();
    res.json({ problem: serializeProblem(p) });
  })
);

// ---- University: submit solution & research plan (Directly forwards to registered industries) ----
router.post(
  "/:id/form-team",
  requireAuth,
  requireRole("university"),
  asyncHandler(async (req, res) => {
    const { mentor, students, proposal } = req.body || {};
    const p = await Problem.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Problem not found" });
    if (p.status !== "university_assigned") {
      return res.status(409).json({ error: "This problem is not at the assignment stage" });
    }
    if (!mentor || !students) return res.status(400).json({ error: "mentor and students are required" });

    // Directly forward solution to registered industries on the portal
    p.status = "industry_requested";
    p.mentor = mentor;
    p.students = students;
    p.proposal = proposal || null;
    p.university = req.user.org_name || p.university;
    addHistory(
      p,
      `Technical solution submitted by ${p.university}. Directly forwarded to registered industries for tender submissions.`
    );
    await p.save();
    res.json({ problem: serializeProblem(p) });
  })
);

// ---- University: request industry partner (fallback) ----
router.post(
  "/:id/request-industry",
  requireAuth,
  requireRole("university"),
  asyncHandler(async (req, res) => {
    const p = await Problem.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Problem not found" });
    p.status = "industry_requested";
    addHistory(p, "Open for registered industry tender submissions");
    await p.save();
    res.json({ problem: serializeProblem(p) });
  })
);

// ---- Industry: send / submit tender ----
async function handleTenderSubmission(req, res) {
  const { timeline, resources, budget_amount, proposal_notes } = req.body || {};
  const p = await Problem.findById(req.params.id);
  if (!p) return res.status(404).json({ error: "Problem not found" });
  if (p.status !== "industry_requested" && p.status !== "budget_review") {
    return res.status(409).json({ error: "This problem is not currently open for industry tenders" });
  }
  if (!timeline || !budget_amount) {
    return res.status(400).json({ error: "timeline and budget_amount are required" });
  }

  if (!Array.isArray(p.tenders)) {
    p.tenders = [];
  }

  const tenderId = "TND-" + nanoid(6).toUpperCase();
  const indName = req.user.org_name || req.user.name;
  const newTender = {
    id: tenderId,
    industry_name: indName,
    industry_id: req.user.id,
    budget_amount: Number(budget_amount),
    timeline,
    resources: resources || null,
    proposal_notes: proposal_notes || null,
    status: "submitted",
    created_at: new Date(),
  };

  const existingIdx = p.tenders.findIndex((t) => t.industry_name === indName);
  if (existingIdx >= 0) {
    p.tenders[existingIdx] = newTender;
  } else {
    p.tenders.push(newTender);
  }

  p.status = "budget_review"; // Forwarded to Government for tender selection
  p.timeline = timeline;
  p.resources = resources || null;
  p.budget_amount = Number(budget_amount);
  if (!p.industry) p.industry = indName;

  addHistory(
    p,
    `Tender of ₹${Number(budget_amount).toLocaleString("en-IN")} submitted by ${indName} (${timeline}). Forwarded to Government Official for tender selection.`
  );
  await p.save();
  res.json({ problem: serializeProblem(p), tender: newTender });
}

router.post("/:id/tender", requireAuth, requireRole("industry"), asyncHandler(handleTenderSubmission));
router.post("/:id/submit-proposal", requireAuth, requireRole("industry"), asyncHandler(handleTenderSubmission));

// ---- Government: select any one tender and start ground implementation ----
async function handleTenderSelection(req, res) {
  const { tender_id } = req.body || {};
  const p = await Problem.findById(req.params.id);
  if (!p) return res.status(404).json({ error: "Problem not found" });
  if (p.status !== "budget_review" && p.status !== "industry_requested") {
    return res.status(409).json({ error: "This problem is not awaiting tender selection" });
  }

  let selectedTender = null;
  if (Array.isArray(p.tenders) && p.tenders.length > 0) {
    if (tender_id) {
      selectedTender = p.tenders.find((t) => t.id === tender_id);
    }
    if (!selectedTender) {
      selectedTender = p.tenders[0];
    }
  }

  if (!selectedTender) {
    selectedTender = {
      id: "TND-DEF",
      industry_name: p.industry || "Industry Partner",
      budget_amount: p.budget_amount || 0,
      timeline: p.timeline || "12 weeks",
      resources: p.resources || "Ground technical resources",
    };
  }

  if (Array.isArray(p.tenders)) {
    p.tenders.forEach((t) => {
      t.status = t.id === selectedTender.id ? "selected" : "rejected";
    });
  }

  p.status = "in_progress"; // Ground implementation started!
  p.progress = Math.max(p.progress || 0, 5);
  p.selected_tender_id = selectedTender.id;
  p.industry = selectedTender.industry_name;
  p.budget_amount = selectedTender.budget_amount;
  p.timeline = selectedTender.timeline;
  p.resources = selectedTender.resources;

  if (!p.milestones || p.milestones.length === 0) {
    p.milestones = [
      {
        id: nanoid(8),
        title: `Tender awarded to ${selectedTender.industry_name} (₹${Number(selectedTender.budget_amount).toLocaleString("en-IN")})`,
        done: true,
      },
      { id: nanoid(8), title: "Ground mobilization & equipment setup", done: false },
      { id: nanoid(8), title: "Prototype testing & field execution", done: false },
      { id: nanoid(8), title: "Final community verification & handover", done: false },
    ];
  } else {
    p.milestones.unshift({
      id: nanoid(8),
      title: `Tender awarded to ${selectedTender.industry_name}`,
      done: true,
    });
  }

  addHistory(
    p,
    `Government Official selected tender from ${selectedTender.industry_name} (₹${Number(selectedTender.budget_amount).toLocaleString("en-IN")}, ${selectedTender.timeline}). Ground implementation started!`
  );

  await p.save();
  res.json({ problem: serializeProblem(p), selectedTender });
}

router.post("/:id/select-tender", requireAuth, requireRole("government"), asyncHandler(handleTenderSelection));
router.post("/:id/approve-budget", requireAuth, requireRole("government"), asyncHandler(handleTenderSelection));

router.post(
  "/:id/reject-budget",
  requireAuth,
  requireRole("government"),
  asyncHandler(async (req, res) => {
    const p = await Problem.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Problem not found" });
    if (p.status !== "budget_review") return res.status(409).json({ error: "This problem is not awaiting budget approval" });

    p.status = "budget_rejected";
    addHistory(p, "Tenders sent back for revision by Govt. Official");
    await p.save();
    res.json({ problem: serializeProblem(p) });
  })
);

router.post(
  "/:id/resubmit",
  requireAuth,
  requireRole("university"),
  asyncHandler(async (req, res) => {
    const p = await Problem.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Problem not found" });
    if (p.status !== "budget_rejected") return res.status(409).json({ error: "This problem was not sent back for revision" });

    p.status = "industry_requested";
    addHistory(p, "University resubmitted for a revised industry proposal");
    await p.save();
    res.json({ problem: serializeProblem(p) });
  })
);

// ---- University / Industry: update ground-work progress ----
router.post(
  "/:id/progress",
  requireAuth,
  requireRole("university", "industry"),
  asyncHandler(async (req, res) => {
    const { progress, milestone } = req.body || {};
    const p = await Problem.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Problem not found" });
    if (p.status !== "in_progress") return res.status(409).json({ error: "This problem is not in ground-work stage" });

    if (typeof progress === "number") {
      p.progress = Math.max(0, Math.min(100, progress));
      addHistory(p, `Progress updated to ${progress}% by ${req.user.role}`);
    }
    if (milestone && milestone.title) {
      p.milestones.push({ id: nanoid(8), title: milestone.title, done: !!milestone.done });
      addHistory(p, `Milestone added: ${milestone.title}`);
    }
    await p.save();
    res.json({ problem: serializeProblem(p) });
  })
);

router.post(
  "/:id/milestones/:milestoneId/toggle",
  requireAuth,
  requireRole("university", "industry"),
  asyncHandler(async (req, res) => {
    const p = await Problem.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Problem not found" });
    const m = p.milestones.find((item) => item.id === req.params.milestoneId);
    if (!m) return res.status(404).json({ error: "Milestone not found" });
    m.done = !m.done;
    addHistory(p, `Milestone "${m.title}" marked ${m.done ? "done" : "not done"}`);
    await p.save();
    res.json({ problem: serializeProblem(p) });
  })
);

// ---- University: mark completed + record impact ----
router.post(
  "/:id/complete",
  requireAuth,
  requireRole("university"),
  asyncHandler(async (req, res) => {
    const { beneficiaries, impact_summary } = req.body || {};
    const p = await Problem.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Problem not found" });
    if (p.status !== "in_progress") return res.status(409).json({ error: "This problem is not in ground-work stage" });
    if (!beneficiaries || !impact_summary) {
      return res.status(400).json({ error: "beneficiaries and impact_summary are required" });
    }

    p.status = "completed";
    p.progress = 100;
    p.beneficiaries = beneficiaries;
    p.impact_summary = impact_summary;
    addHistory(p, "Marked completed; impact published");
    await p.save();
    res.json({ problem: serializeProblem(p) });
  })
);

module.exports = router;
