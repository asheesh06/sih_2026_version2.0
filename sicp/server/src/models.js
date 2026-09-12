const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: null },
    password_hash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["citizen", "university", "government", "industry"],
    },
    org_name: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const milestoneSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const tenderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    industry_name: { type: String, required: true },
    industry_id: { type: String, default: null },
    budget_amount: { type: Number, required: true },
    timeline: { type: String, required: true },
    resources: { type: String, default: null },
    proposal_notes: { type: String, default: null },
    status: { type: String, default: "submitted" }, // "submitted" | "selected" | "rejected"
    created_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    citizen_id: { type: String, required: true },
    category: { type: String, default: null },
    confidence: { type: Number, default: null },
    status: { type: String, required: true, default: "pending_review" },
    reject_reason: { type: String, default: null },
    university: { type: String, default: null },
    mentor: { type: String, default: null },
    students: { type: String, default: null },
    proposal: { type: String, default: null },
    industry: { type: String, default: null },
    timeline: { type: String, default: null },
    resources: { type: String, default: null },
    budget_amount: { type: Number, default: null },
    progress: { type: Number, default: 0 },
    beneficiaries: { type: String, default: null },
    impact_summary: { type: String, default: null },
    photo_url: { type: String, default: null },
    history: { type: [String], default: [] },
    milestones: { type: [milestoneSchema], default: [] },
    tenders: { type: [tenderSchema], default: [] },
    selected_tender_id: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const organisationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ["university", "industry"] },
  focus: { type: String, required: true },
});

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const LOCAL_DB_FILE = path.join(DATA_DIR, "local_mongoose_db.json");

let isMongoConnected = false;

function setMongoConnected(status) {
  isMongoConnected = !!status;
}

const memoryStore = {
  users: [],
  organisations: [],
  problems: [],
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadLocalStore() {
  try {
    ensureDataDir();
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const content = fs.readFileSync(LOCAL_DB_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed) {
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          memoryStore.users = parsed.users;
        }
        if (Array.isArray(parsed.organisations) && parsed.organisations.length > 0) {
          memoryStore.organisations = parsed.organisations;
        }
        if (Array.isArray(parsed.problems) && parsed.problems.length > 0) {
          memoryStore.problems = parsed.problems.map((p) => createProblemDoc(p));
        }
        console.log(
          `[Local Mongoose DB] Loaded ${memoryStore.users.length} users, ${memoryStore.problems.length} problems, ${memoryStore.organisations.length} orgs from ${LOCAL_DB_FILE}`
        );
      }
    }
  } catch (err) {
    console.warn("[Local Mongoose DB] Notice reading local store:", err.message);
  }
}

function persistLocalStore() {
  if (isMongoConnected) return;
  try {
    ensureDataDir();
    const data = {
      users: memoryStore.users,
      organisations: memoryStore.organisations,
      problems: memoryStore.problems,
      last_updated: new Date().toISOString(),
    };
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Local Mongoose DB] Notice writing local store:", err.message);
  }
}

// Initial load on startup
loadLocalStore();

const MongooseUser = mongoose.models.User || mongoose.model("User", userSchema);
const MongooseProblem = mongoose.models.Problem || mongoose.model("Problem", problemSchema);
const MongooseOrganisation =
  mongoose.models.Organisation || mongoose.model("Organisation", organisationSchema);

function createProblemDoc(item) {
  const doc = {
    ...item,
    photo_url: item.photo_url || null,
    created_at: item.created_at || new Date(),
    updated_at: item.updated_at || new Date(),
    milestones: (item.milestones || []).map((m) => ({ ...m })),
    history: [...(item.history || [])],
    tenders: (item.tenders || []).map((t) => ({ ...t })),
    selected_tender_id: item.selected_tender_id || null,
  };
  doc.save = async function () {
    this.updated_at = new Date();
    persistLocalStore();
    return this;
  };
  return doc;
}

const User = {
  findOne: async (query) => {
    if (isMongoConnected) return MongooseUser.findOne(query);
    if (query && query.email) {
      return (
        memoryStore.users.find(
          (u) => u.email && u.email.toLowerCase() === query.email.toLowerCase()
        ) || null
      );
    }
    if (query && query.phone) {
      return (
        memoryStore.users.find(
          (u) => u.phone && u.phone.trim() === query.phone.trim()
        ) || null
      );
    }
    return null;
  },
  findById: async (id) => {
    if (isMongoConnected) return MongooseUser.findById(id);
    return memoryStore.users.find((u) => u._id === id) || null;
  },
  create: async (data) => {
    if (isMongoConnected) return MongooseUser.create(data);
    const doc = { ...data, created_at: new Date(), updated_at: new Date() };
    memoryStore.users.push(doc);
    persistLocalStore();
    return doc;
  },
  insertMany: async (items) => {
    if (isMongoConnected) return MongooseUser.insertMany(items);
    items.forEach((item) => {
      const doc = {
        ...item,
        created_at: item.created_at || new Date(),
        updated_at: item.updated_at || new Date(),
      };
      memoryStore.users.push(doc);
    });
    persistLocalStore();
    return items;
  },
  countDocuments: async () => {
    if (isMongoConnected) return MongooseUser.countDocuments();
    return memoryStore.users.length;
  },
};

const Organisation = {
  countDocuments: async () => {
    if (isMongoConnected) return MongooseOrganisation.countDocuments();
    return memoryStore.organisations.length;
  },
  insertMany: async (items) => {
    if (isMongoConnected) return MongooseOrganisation.insertMany(items);
    memoryStore.organisations.push(...items);
    persistLocalStore();
    return items;
  },
  find: () => {
    if (isMongoConnected) return MongooseOrganisation.find();
    return Promise.resolve([...memoryStore.organisations]);
  },
  findOne: async (query) => {
    if (isMongoConnected) return MongooseOrganisation.findOne(query);
    if (query && query.name) {
      return memoryStore.organisations.find((o) => o.name === query.name) || null;
    }
    return null;
  },
};

const Problem = {
  countDocuments: async () => {
    if (isMongoConnected) return MongooseProblem.countDocuments();
    return memoryStore.problems.length;
  },
  insertMany: async (items) => {
    if (isMongoConnected) return MongooseProblem.insertMany(items);
    items.forEach((item) => memoryStore.problems.push(createProblemDoc(item)));
    persistLocalStore();
    return items;
  },
  find: (query) => {
    if (isMongoConnected) return MongooseProblem.find(query);
    let list = memoryStore.problems;
    if (query && query.status) {
      list = list.filter((p) => p.status === query.status);
    }
    const p = Promise.resolve([...list]);
    p.sort = (sortObj) => {
      const key = Object.keys(sortObj)[0];
      const dir = sortObj[key];
      const sorted = [...list].sort((a, b) => {
        const va = a[key] ? new Date(a[key]).getTime() || a[key] : 0;
        const vb = b[key] ? new Date(b[key]).getTime() || b[key] : 0;
        return dir === -1 ? (vb > va ? 1 : vb < va ? -1 : 0) : va > vb ? 1 : va < vb ? -1 : 0;
      });
      return Promise.resolve(sorted);
    };
    return p;
  },
  findById: async (id) => {
    if (isMongoConnected) return MongooseProblem.findById(id);
    const found = memoryStore.problems.find((p) => p._id === id);
    return found || null;
  },
  create: async (data) => {
    if (isMongoConnected) return MongooseProblem.create(data);
    const doc = createProblemDoc(data);
    memoryStore.problems.unshift(doc);
    persistLocalStore();
    return doc;
  },
};

function serializeUser(u) {
  if (!u) return null;
  const row = u.toObject ? u.toObject() : u;
  return {
    id: row._id,
    name: row.name,
    email: row.email,
    phone: row.phone || null,
    role: row.role,
    org_name: row.org_name || null,
  };
}

function serializeProblem(p) {
  if (!p) return null;
  const row = p.toObject ? p.toObject() : p;
  return {
    id: row._id,
    title: row.title,
    description: row.description,
    location: row.location,
    citizen_id: row.citizen_id,
    category: row.category,
    confidence: row.confidence,
    status: row.status,
    reject_reason: row.reject_reason ?? null,
    university: row.university ?? null,
    mentor: row.mentor ?? null,
    students: row.students ?? null,
    proposal: row.proposal ?? null,
    industry: row.industry ?? null,
    timeline: row.timeline ?? null,
    resources: row.resources ?? null,
    budget_amount: row.budget_amount ?? null,
    progress: row.progress ?? 0,
    beneficiaries: row.beneficiaries ?? null,
    impact_summary: row.impact_summary ?? null,
    photo_url: row.photo_url || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    history: row.history || [],
    milestones: (row.milestones || []).map((m) => ({
      id: m.id,
      title: m.title,
      done: !!m.done,
    })),
    tenders: (row.tenders || []).map((t) => ({
      id: t.id,
      industry_name: t.industry_name,
      industry_id: t.industry_id || null,
      budget_amount: t.budget_amount,
      timeline: t.timeline,
      resources: t.resources || null,
      proposal_notes: t.proposal_notes || null,
      status: t.status || "submitted",
      created_at: t.created_at || null,
    })),
    selected_tender_id: row.selected_tender_id || null,
  };
}

function serializeOrganisation(o) {
  if (!o) return null;
  const row = o.toObject ? o.toObject() : o;
  return { id: row._id, name: row.name, type: row.type, focus: row.focus };
}

module.exports = {
  User,
  Problem,
  Organisation,
  setMongoConnected,
  serializeUser,
  serializeProblem,
  serializeOrganisation,
};
