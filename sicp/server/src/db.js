const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const { User, Problem, Organisation, setMongoConnected } = require("./models");

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
  const count = await User.countDocuments();
  if (count > 0) return;

  const hash = bcrypt.hashSync("password123", 8);
  await User.insertMany([
    { _id: "citizen-1", name: "Rakesh Mahato", email: "citizen@demo.gov.in", password_hash: hash, role: "citizen", org_name: null },
    { _id: "gov-1", name: "District Innovation Officer", email: "government@demo.gov.in", password_hash: hash, role: "government", org_name: "Dept. of Higher & Technical Education" },
    { _id: "univ-1", name: "Dr. S. Prasad", email: "university@demo.gov.in", password_hash: hash, role: "university", org_name: "BIT Mesra" },
    { _id: "ind-1", name: "Partnerships Desk", email: "industry@demo.gov.in", password_hash: hash, role: "industry", org_name: "Jharkhand IoT Systems" },
  ]);

  const seed = [
    {
      _id: "PS-1001",
      title: "Recurring monsoon waterlogging in Lalpur locality",
      description: "Every monsoon the drains near the Lalpur main road overflow, flooding the street and a government school compound. Stagnant water breeds mosquitoes and blocks access for over a week each time.",
      location: "Lalpur, Ranchi",
      citizen_id: "citizen-1",
      category: "Disaster Management",
      confidence: 91,
      status: "in_progress",
      university: "BIT Mesra",
      mentor: "Dr. S. Prasad",
      students: "A. Kumar, R. Singh, P. Tirkey, N. Oraon",
      proposal: "IoT-enabled smart drainage monitoring and early-warning system with GIS-mapped flood zones.",
      industry: "Jharkhand IoT Systems",
      timeline: "16 weeks",
      resources: "40 water-level sensors, GIS mapping team, mobile alert app",
      budget_amount: 1850000,
      progress: 65,
      history: [
        "Reported by citizen",
        "AI categorised as Disaster Management (91%)",
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
      description: "The roof of the government middle school in Basia block, Gumla, leaks badly during rains, damaging books and forcing classes to be cancelled.",
      location: "Basia, Gumla",
      citizen_id: "citizen-1",
      category: "Education",
      confidence: 78,
      status: "pending_review",
      history: ["Reported by citizen", "AI categorised as Education (78%)"],
      milestones: [],
    },
    {
      _id: "PS-1003",
      title: "Contaminated drinking water in Baghmara village",
      description: "The hand pump serving Baghmara village is drawing discoloured, foul-smelling water. Several children have reported stomach illness.",
      location: "Baghmara, Dhanbad",
      citizen_id: "citizen-1",
      category: "Water Resources",
      confidence: 88,
      status: "budget_review",
      university: "Central University of Jharkhand",
      mentor: "Dr. A. Bose",
      students: "K. Mahto, S. Devi, R. Ansari",
      proposal: "Water quality testing kit rollout with a low-cost filtration unit design for community hand pumps.",
      industry: "AquaTech Innovations",
      timeline: "10 weeks",
      resources: "Water testing kits, filtration units for 8 hand pumps, community training",
      budget_amount: 620000,
      progress: 0,
      history: [
        "Reported by citizen",
        "AI categorised as Water Resources (88%)",
        "Approved by Govt. and routed to Central University of Jharkhand",
        "Team formed, industry partner requested",
        "Proposal submitted by AquaTech Innovations — awaiting budget approval",
      ],
      milestones: [],
    },
    {
      _id: "PS-1004",
      title: "No safe road access to health sub-centre",
      description: "The only path to the Chandwa health sub-centre becomes impassable in the rains, delaying emergency care for pregnant women and the elderly.",
      location: "Chandwa, Latehar",
      citizen_id: "citizen-1",
      category: "Healthcare",
      confidence: 84,
      status: "completed",
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
      impact_summary: "All-weather access cut emergency travel time to the sub-centre from about 50 minutes to 12 minutes. Institutional deliveries at the sub-centre rose in the following two months.",
      history: [
        "Reported by citizen",
        "AI categorised as Healthcare (84%)",
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
