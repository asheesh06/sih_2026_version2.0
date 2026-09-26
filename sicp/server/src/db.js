const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const { User, Problem, Organisation, setMongoConnected, persistLocalStore } = require("./models");

async function seedOrganisations() {
  const count = await Organisation.countDocuments();
  if (count > 0) return;
  const universities = [
    { _id: "u1", name: "BIT Mesra", type: "university", focus: "Disaster Management,Urban Development,Energy" },
    { _id: "u2", name: "Central University of Jharkhand", type: "university", focus: "Environment,Water Resources,Agriculture" },
    { _id: "u3", name: "IIT (ISM) Dhanbad", type: "university", focus: "Disaster Management,Energy,Urban Development" },
    { _id: "u4", name: "Ranchi University", type: "university", focus: "Education,Public Administration,Accessibility" },
    { _id: "u5", name: "Vinoba Bhave University", type: "university", focus: "Healthcare,Rural Livelihoods,Agriculture" },
  ];
  const industries = [
    { _id: "i1", name: "Jharkhand IoT Systems", type: "industry", focus: "Disaster Management,Urban Development" },
    { _id: "i2", name: "AquaTech Innovations", type: "industry", focus: "Water Resources,Environment" },
    { _id: "i3", name: "AgroNext Jharkhand", type: "industry", focus: "Agriculture,Rural Livelihoods" },
    { _id: "i4", name: "MediCare Solutions Pvt. Ltd.", type: "industry", focus: "Healthcare" },
    { _id: "i5", name: "GreenGrid Energy", type: "industry", focus: "Energy,Environment" },
    { _id: "i6", name: "Tata Steel Foundation (CSR)", type: "industry", focus: "Education,Rural Livelihoods,Public Administration" },
  ];
  await Organisation.insertMany([...universities, ...industries]);
}

async function seedDemoUsersAndProblems() {
  const hash = bcrypt.hashSync("password123", 8);

  const officialAccounts = [
    {
      _id: "citizen-1",
      name: "Rakesh Mahato",
      email: "citizen@demo.gov.in",
      password_hash: hash,
      role: "citizen",
      org_name: null,
    },
    {
      _id: "gov-ranchi",
      username: "officer.ranchi",
      name: "Sri Arvind Kumar, IAS",
      email: "officer.ranchi@jharkhand.gov.in",
      password_hash: hash,
      role: "government",
      designation: "District Innovation & Development Officer (DIO)",
      department: "District Collectorate & Innovation Council",
      state_code: "20",
      state_name: "Jharkhand",
      district_code: "328",
      district_name: "Ranchi",
      subdistrict_code: null,
      subdistrict_name: null,
      jurisdiction_level: "district",
      org_name: "District Innovation Office - Ranchi",
    },
    {
      _id: "gov-kanke",
      username: "bdo.kanke",
      name: "Smt. Priyanka Soren, JPSC",
      email: "bdo.kanke@jharkhand.gov.in",
      password_hash: hash,
      role: "government",
      designation: "Block Development Officer (BDO) - Kanke",
      department: "Rural Development & Panchayati Raj",
      state_code: "20",
      state_name: "Jharkhand",
      district_code: "328",
      district_name: "Ranchi",
      subdistrict_code: "02340",
      subdistrict_name: "Kanke",
      jurisdiction_level: "subdistrict",
      org_name: "Block Office Kanke, Ranchi",
    },
    {
      _id: "gov-gumla-basia",
      username: "bdo.basia",
      name: "Sri Manoj Tirkey",
      email: "bdo.basia@jharkhand.gov.in",
      password_hash: hash,
      role: "government",
      designation: "Block Development Officer (BDO) - Basia",
      department: "Rural Development & Infrastructure",
      state_code: "20",
      state_name: "Jharkhand",
      district_code: "330",
      district_name: "Gumla",
      subdistrict_code: "02360",
      subdistrict_name: "Basia",
      jurisdiction_level: "subdistrict",
      org_name: "Block Office Basia, Gumla",
    },
    {
      _id: "gov-gumla-district",
      username: "officer.gumla",
      name: "Sri Shashi Ranjan, IAS",
      email: "officer.gumla@jharkhand.gov.in",
      password_hash: hash,
      role: "government",
      designation: "Deputy Commissioner & District Magistrate",
      department: "District Administration Gumla",
      state_code: "20",
      state_name: "Jharkhand",
      district_code: "330",
      district_name: "Gumla",
      subdistrict_code: null,
      subdistrict_name: null,
      jurisdiction_level: "district",
      org_name: "District Collectorate Gumla",
    },
    {
      _id: "gov-dhanbad",
      username: "officer.dhanbad",
      name: "Sri Rajeshwar Singh",
      email: "officer.dhanbad@jharkhand.gov.in",
      password_hash: hash,
      role: "government",
      designation: "District Development Commissioner (DDC)",
      department: "District Administration & Water Board",
      state_code: "20",
      state_name: "Jharkhand",
      district_code: "325",
      district_name: "Dhanbad",
      subdistrict_code: null,
      subdistrict_name: null,
      jurisdiction_level: "district",
      org_name: "District Administration Dhanbad",
    },
    {
      _id: "gov-state",
      username: "director.state",
      name: "State Nodal Innovation Officer",
      email: "government@demo.gov.in",
      password_hash: hash,
      role: "government",
      designation: "State Nodal Innovation Officer",
      department: "Dept. of Higher & Technical Education",
      state_code: "20",
      state_name: "Jharkhand",
      district_code: null,
      district_name: null,
      subdistrict_code: null,
      subdistrict_name: null,
      jurisdiction_level: "state",
      org_name: "Jharkhand State Innovation Directorate",
    },
    {
      _id: "gov-national",
      username: "officer.national",
      name: "Central Grievance & Innovation Authority",
      email: "national.innovation@gov.in",
      password_hash: hash,
      role: "government",
      designation: "National Innovation Coordinator",
      department: "Ministry of Science & Technology / NITI Aayog",
      state_code: null,
      state_name: "National / Multi-State",
      district_code: null,
      district_name: null,
      subdistrict_code: null,
      subdistrict_name: null,
      jurisdiction_level: "state",
      org_name: "National Innovation Council",
    },
    {
      _id: "univ-1",
      name: "Dr. S. Prasad",
      email: "university@demo.gov.in",
      password_hash: hash,
      role: "university",
      org_name: "BIT Mesra",
    },
    {
      _id: "ind-1",
      name: "Partnerships Desk",
      email: "industry@demo.gov.in",
      password_hash: hash,
      role: "industry",
      org_name: "Jharkhand IoT Systems",
    },
  ];

  // Upsert or insert official accounts so they are always accessible
  for (const acc of officialAccounts) {
    let existing = await User.findOne({ email: acc.email });
    if (!existing && acc.username) {
      existing = await User.findOne({ username: acc.username });
    }
    if (!existing) {
      await User.create(acc);
    } else if (acc.role === "government") {
      // Remove village fields from existing official record
      delete existing.village_code;
      delete existing.village_name;
      // Update LGD fields on existing user doc
      Object.assign(existing, {
        username: acc.username,
        designation: acc.designation,
        department: acc.department,
        state_code: acc.state_code,
        state_name: acc.state_name,
        district_code: acc.district_code,
        district_name: acc.district_name,
        subdistrict_code: acc.subdistrict_code,
        subdistrict_name: acc.subdistrict_name,
        jurisdiction_level: acc.jurisdiction_level,
      });
      if (existing.save) await existing.save();
    }
  }

  const problemCount = await Problem.countDocuments();
  if (problemCount === 0) {
    const seed = [
      {
        _id: "PS-1001",
        title: "Recurring monsoon waterlogging in Lalpur locality",
        description:
          "Every monsoon the drains near the Lalpur main road overflow, flooding the street and a government school compound. Stagnant water breeds mosquitoes and blocks access for over a week each time.",
        location: "Lalpur, Ranchi",
        citizen_id: "citizen-1",
        category: "Disaster Management",
        confidence: 91,
        status: "in_progress",
        state_code: "20",
        state_name: "Jharkhand",
        district_code: "328",
        district_name: "Ranchi",
        subdistrict_code: "02341",
        subdistrict_name: "Lalpur",
        panchayat_code: "374001",
        panchayat_name: "Lalpur Gram Panchayat",
        village_code: "374001",
        village_name: "Lalpur",
        lgd_hierarchy_code: "LGD-20-328-02341-374001",
        assigned_authority_id: "gov-ranchi",
        assigned_authority_name: "Sri Arvind Kumar, IAS",
        assigned_authority_username: "officer.ranchi",
        assigned_authority_designation: "District Innovation & Development Officer (DIO)",
        assigned_authority_department: "District Collectorate & Innovation Council",
        assigned_authority_scope: "district",
        university: "BIT Mesra",
        mentor: "Dr. S. Prasad",
        students: "A. Kumar, R. Singh, P. Tirkey, N. Oraon",
        proposal:
          "IoT-enabled smart drainage monitoring and early-warning system with GIS-mapped flood zones.",
        industry: "Jharkhand IoT Systems",
        timeline: "16 weeks",
        resources: "40 water-level sensors, GIS mapping team, mobile alert app",
        budget_amount: 1850000,
        progress: 65,
        history: [
          "Reported by citizen with GPS coordinates (23.3441° N, 85.3096° E)",
          "LGD Directory matched: Jharkhand (20) → Ranchi (328) → Lalpur (02341) → Lalpur (374001)",
          "AI categorised as Disaster Management (91%)",
          "Authority Mapping Engine: Assigned to District Innovation & Development Officer (Ranchi, LGD: 328)",
          "Approved by Govt. and routed to BIT Mesra",
          "Team formed, industry partner requested",
          "Proposal submitted by Jharkhand IoT Systems",
          "Budget approved by Govt.",
          "Ground work started",
        ],
        milestones: [
          { id: nanoid(8), title: "Sensor installation at 5 drainage points", done: true },
          { id: nanoid(8), title: "Model calibration through one monsoon", done: true },
          { id: nanoid(8), title: "Integration with District Disaster Mgmt. control room", done: false },
          { id: nanoid(8), title: "City-wide scale-up plan", done: false },
        ],
      },
      {
        _id: "PS-1002",
        title: "Leaking roof at government middle school",
        description:
          "The roof of the government middle school in Basia block, Gumla, leaks badly during rains, damaging books and forcing classes to be cancelled.",
        location: "Basia, Gumla",
        citizen_id: "citizen-1",
        category: "Education",
        confidence: 78,
        status: "pending_review",
        state_code: "20",
        state_name: "Jharkhand",
        district_code: "330",
        district_name: "Gumla",
        subdistrict_code: "02360",
        subdistrict_name: "Basia",
        panchayat_code: "376101",
        panchayat_name: "Basia Gram Panchayat",
        village_code: "376101",
        village_name: "Basia Khas",
        lgd_hierarchy_code: "LGD-20-330-02360-376101",
        assigned_authority_id: "gov-gumla-basia",
        assigned_authority_name: "Sri Manoj Tirkey",
        assigned_authority_username: "bdo.basia",
        assigned_authority_designation: "Block Development Officer (BDO) - Basia",
        assigned_authority_department: "Rural Development & Infrastructure",
        assigned_authority_scope: "block",
        history: [
          "Reported by citizen with GPS location",
          "LGD Directory matched: Jharkhand (20) → Gumla (330) → Basia Block (02360) → Basia Khas (376101)",
          "AI categorised as Education (78%)",
          "Authority Mapping Engine: Assigned to Block Development Officer (BDO) - Basia, Gumla",
          "Complaint entered into Basia Block Officer's queue",
        ],
        milestones: [],
      },
      {
        _id: "PS-1003",
        title: "Contaminated drinking water in Baghmara village",
        description:
          "The hand pump serving Baghmara village is drawing discoloured, foul-smelling water. Several children have reported stomach illness.",
        location: "Baghmara, Dhanbad",
        citizen_id: "citizen-1",
        category: "Water Resources",
        confidence: 88,
        status: "budget_review",
        state_code: "20",
        state_name: "Jharkhand",
        district_code: "325",
        district_name: "Dhanbad",
        subdistrict_code: "02310",
        subdistrict_name: "Baghmara",
        panchayat_code: "372050",
        panchayat_name: "Baghmara Gram Panchayat",
        village_code: "372050",
        village_name: "Baghmara",
        lgd_hierarchy_code: "LGD-20-325-02310-372050",
        assigned_authority_id: "gov-dhanbad",
        assigned_authority_name: "Sri Rajeshwar Singh",
        assigned_authority_username: "officer.dhanbad",
        assigned_authority_designation: "District Development Commissioner (DDC)",
        assigned_authority_department: "District Administration & Water Board",
        assigned_authority_scope: "district",
        university: "Central University of Jharkhand",
        mentor: "Dr. A. Bose",
        students: "K. Mahto, S. Devi, R. Ansari",
        proposal:
          "Water quality testing kit rollout with a low-cost filtration unit design for community hand pumps.",
        industry: "AquaTech Innovations",
        timeline: "10 weeks",
        resources: "Water testing kits, filtration units for 8 hand pumps, community training",
        budget_amount: 620000,
        progress: 0,
        history: [
          "Reported by citizen with GPS location",
          "LGD Directory matched: Jharkhand (20) → Dhanbad (325) → Baghmara (02310) → Baghmara (372050)",
          "AI categorised as Water Resources (88%)",
          "Authority Mapping Engine: Assigned to District Development Commissioner, Dhanbad",
          "Approved by Govt. and routed to Central University of Jharkhand",
          "Team formed, industry partner requested",
          "Proposal submitted by AquaTech Innovations — awaiting budget approval",
        ],
        milestones: [],
      },
      {
        _id: "PS-1004",
        title: "No safe road access to health sub-centre",
        description:
          "The only path to the Chandwa health sub-centre becomes impassable in the rains, delaying emergency care for pregnant women and the elderly.",
        location: "Chandwa, Latehar",
        citizen_id: "citizen-1",
        category: "Healthcare",
        confidence: 84,
        status: "completed",
        state_code: "20",
        state_name: "Jharkhand",
        district_code: "333",
        district_name: "Latehar",
        subdistrict_code: "02380",
        subdistrict_name: "Chandwa",
        panchayat_code: "378010",
        panchayat_name: "Chandwa Gram Panchayat",
        village_code: "378010",
        village_name: "Chandwa Gram",
        lgd_hierarchy_code: "LGD-20-333-02380-378010",
        assigned_authority_id: "gov-state",
        assigned_authority_name: "State Nodal Innovation Officer",
        assigned_authority_username: "director.state",
        assigned_authority_designation: "State Nodal Innovation Officer",
        assigned_authority_department: "Dept. of Higher & Technical Education",
        assigned_authority_scope: "state",
        university: "Vinoba Bhave University",
        mentor: "Dr. P. Sinha",
        students: "T. Kumari, D. Mahato",
        proposal: "All-weather raised pathway with solar lighting, built with local labour.",
        industry: "MediCare Solutions Pvt. Ltd.",
        timeline: "8 weeks",
        resources: "Raised pathway construction, 12 solar lamps",
        budget_amount: 410000,
        progress: 100,
        beneficiaries: "1,150 residents across 4 hamlets",
        impact_summary:
          "All-weather access cut emergency travel time to the sub-centre from about 50 minutes to 12 minutes. Institutional deliveries at the sub-centre rose in the following two months.",
        history: [
          "Reported by citizen with GPS location",
          "LGD Directory matched: Jharkhand (20) → Latehar (333) → Chandwa (02380) → Chandwa Gram (378010)",
          "AI categorised as Healthcare (84%)",
          "Authority Mapping Engine: Assigned to Latehar District / State Innovation Authority",
          "Approved and routed to Vinoba Bhave University",
          "Industry partner matched: MediCare Solutions",
          "Budget approved by Govt.",
          "Ground work completed",
          "Impact recorded and published",
        ],
        milestones: [
          { id: nanoid(8), title: "Pathway survey & design", done: true },
          { id: nanoid(8), title: "Construction with local labour", done: true },
          { id: nanoid(8), title: "Solar lighting installed", done: true },
        ],
      },
    ];

    await Problem.insertMany(seed);
  } else {
    // Backfill LGD details on any existing problems if missing
    const existingProblems = await Problem.find();
    for (const p of existingProblems) {
      if (!p.district_code || !p.assigned_authority_name) {
        if (p.location && p.location.includes("Basia")) {
          p.state_code = "20";
          p.district_code = "330";
          p.district_name = "Gumla";
          p.subdistrict_code = "02360";
          p.subdistrict_name = "Basia";
          p.village_code = "376101";
          p.village_name = "Basia Khas";
          p.lgd_hierarchy_code = "LGD-20-330-02360-376101";
          p.assigned_authority_id = "gov-gumla-basia";
          p.assigned_authority_name = "Sri Manoj Tirkey";
          p.assigned_authority_username = "bdo.basia";
          p.assigned_authority_designation = "Block Development Officer (BDO) - Basia";
          p.assigned_authority_scope = "block";
        } else if (p.location && p.location.includes("Baghmara")) {
          p.state_code = "20";
          p.district_code = "325";
          p.district_name = "Dhanbad";
          p.subdistrict_code = "02310";
          p.subdistrict_name = "Baghmara";
          p.village_code = "372050";
          p.village_name = "Baghmara";
          p.lgd_hierarchy_code = "LGD-20-325-02310-372050";
          p.assigned_authority_id = "gov-dhanbad";
          p.assigned_authority_name = "Sri Rajeshwar Singh";
          p.assigned_authority_username = "officer.dhanbad";
          p.assigned_authority_designation = "District Development Commissioner (DDC)";
          p.assigned_authority_scope = "district";
        } else if (p.location && p.location.includes("Chandwa")) {
          p.state_code = "20";
          p.district_code = "333";
          p.district_name = "Latehar";
          p.subdistrict_code = "02380";
          p.subdistrict_name = "Chandwa";
          p.village_code = "378010";
          p.village_name = "Chandwa Gram";
          p.lgd_hierarchy_code = "LGD-20-333-02380-378010";
          p.assigned_authority_id = "gov-state";
          p.assigned_authority_name = "State Nodal Innovation Officer";
          p.assigned_authority_username = "director.state";
          p.assigned_authority_designation = "State Nodal Innovation Officer";
          p.assigned_authority_scope = "state";
        } else {
          p.state_code = "20";
          p.district_code = "328";
          p.district_name = "Ranchi";
          p.subdistrict_code = "02341";
          p.subdistrict_name = "Lalpur";
          p.village_code = "374001";
          p.village_name = "Lalpur";
          p.lgd_hierarchy_code = "LGD-20-328-02341-374001";
          p.assigned_authority_id = "gov-ranchi";
          p.assigned_authority_name = "Sri Arvind Kumar, IAS";
          p.assigned_authority_username = "officer.ranchi";
          p.assigned_authority_designation = "District Innovation & Development Officer (DIO)";
          p.assigned_authority_scope = "district";
        }
        if (p.save) await p.save();
      }
    }
  }
  if (persistLocalStore) persistLocalStore();
}

async function connectDb() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sicp_local";
  const isCloudUri = Boolean(process.env.MONGODB_URI);
  try {
    mongoose.set("strictQuery", true);
    mongoose.set("bufferCommands", false);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: isCloudUri ? 10000 : 1500 });
    setMongoConnected(true);
    console.log(`[Database] Connected successfully to MongoDB at ${uri.split("@")[1] || uri}`);
    await seedOrganisations();
    await seedDemoUsersAndProblems();
  } catch (err) {
    console.log(
      `[Database] No external MongoDB reachable (${err.message}) — using persistent local JSON database at data/local_mongoose_db.json`
    );
    setMongoConnected(false);
    await seedOrganisations();
    await seedDemoUsersAndProblems();
  }
}

module.exports = { connectDb };
