const express = require("express");
const { nanoid } = require("nanoid");
const { Problem, Organisation, serializeProblem, serializeOrganisation } = require("../models");
const { requireAuth, requireRole } = require("../authMiddleware");
const { aiClassify } = require("../utils/aiClassify");
const { asyncHandler } = require("../asyncHandler");

const router = express.Router();

async function getFullProblem(id) {
  const p = await Problem.findById(id);
  return serializeProblem(p);
}

function addHistory(problem, note) {
  problem.history.push(note);
}

// ---- List & read ----
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status, mine } = req.query;
    let rows = await Problem.find().sort({ created_at: -1 });

    if (req.user.role === "citizen" && mine === "true") {
      rows = rows.filter((p) => p.citizen_id === req.user.id);
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
    const { title, description, location, photo_url } = req.body || {};
    if (!title || !description || !location) {
      return res.status(400).json({ error: "title, description and location are required" });
    }
    const { category, confidence } = aiClassify(`${title} ${description}`);
    const id = "PS-" + nanoid(6).toUpperCase();
    const historyEntries = ["Reported by citizen (GPS verified)"];
    if (photo_url) historyEntries.push("Photo evidence attached");
    historyEntries.push(`AI categorised as ${category} (${confidence}%)`);
    historyEntries.push("Forwarded to Government Official for review & university allocation");

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
    });
    res.status(201).json({ problem: serializeProblem(problem) });
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
