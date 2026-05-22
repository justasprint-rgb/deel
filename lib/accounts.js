// lib/accounts.js
// ---------------------------------------------------------------------------
// Illustrative Deel-style account data + the expansion SIGNAL LOGIC.
// The account rows are synthetic and clearly labeled as such in the UI.
// The signal logic and the product-sequence reasoning are production-real:
// these are the actual events that reveal a customer is ready for the next
// product in Deel's graph.
// ---------------------------------------------------------------------------

// Deel's product graph and the monthly price anchors that make expansion
// economically meaningful ($49 contractor seat -> $599 EOR seat, etc.)
export const PRODUCTS = {
  contractors: { label: "Contractor Management", anchor: 49 },
  eor:         { label: "EOR (Employer of Record)", anchor: 599 },
  payroll:     { label: "Global Payroll", anchor: null },
  hr:          { label: "Deel HR (HRIS)", anchor: null },
  it:          { label: "Deel IT (devices/MDM)", anchor: null },
  benefits:    { label: "Deel Benefits", anchor: null },
  mobility:    { label: "Deel Mobility (visas)", anchor: null },
};

// ---------------------------------------------------------------------------
// SIGNAL DEFINITIONS
// Each signal is an event pattern in the customer's own usage that announces
// readiness for a product they do NOT yet have. weight feeds the score.
// ---------------------------------------------------------------------------
const SIGNAL_RULES = [
  {
    id: "eor_from_contractors",
    label: "Repeat contractors in a single country",
    target: "eor",
    weight: 32,
    detail: (a) =>
      `${a.maxContractorsOneCountry} contractors in ${a.topCountry} signals a permanent presence better served by EOR than contractor agreements (misclassification risk + cost).`,
    fires: (a) =>
      !a.products.includes("eor") && a.maxContractorsOneCountry >= 3,
  },
  {
    id: "it_from_fulltime",
    label: "Full-time hires without device management",
    target: "it",
    weight: 24,
    detail: (a) =>
      `${a.recentFullTimeHires} new full-time hires in the last quarter with no Deel IT devices assigned. Each new hire is an equipment + MDM trigger.`,
    fires: (a) =>
      !a.products.includes("it") && a.recentFullTimeHires >= 2,
  },
  {
    id: "payroll_consolidation",
    label: "Fragmented payroll across many countries",
    target: "payroll",
    weight: 28,
    detail: (a) =>
      `Running payroll across ${a.countries} countries through separate flows. Consolidation is the single most-cited reason customers stay on Deel.`,
    fires: (a) =>
      !a.products.includes("payroll") && a.countries >= 5,
  },
  {
    id: "mobility_from_sponsorship",
    label: "Hiring into visa-sponsorship markets",
    target: "mobility",
    weight: 18,
    detail: (a) =>
      `Open roles in ${a.sponsorshipMarkets.join(", ")} where the candidate pool needs visa sponsorship. Mobility attaches directly to the hire.`,
    fires: (a) =>
      !a.products.includes("mobility") && a.sponsorshipMarkets.length > 0,
  },
  {
    id: "hr_from_headcount",
    label: "Headcount past the spreadsheet threshold",
    target: "hr",
    weight: 16,
    detail: (a) =>
      `${a.headcount} people and ${a.qoqGrowthPct}% QoQ growth with no HRIS. Past ~40 heads, manual HR breaks and Deel HR becomes the system of record.`,
    fires: (a) =>
      !a.products.includes("hr") && a.headcount >= 40,
  },
  {
    id: "benefits_from_eor",
    label: "EOR employees without benefits administration",
    target: "benefits",
    weight: 14,
    detail: (a) =>
      `${a.eorSeats} EOR employees with no Deel Benefits. Competitive local benefits reduce EOR-employee attrition and deepen the account.`,
    fires: (a) =>
      a.products.includes("eor") && !a.products.includes("benefits") && a.eorSeats >= 3,
  },
];

// Compute fired signals + an expansion-readiness score (0-100) for an account.
export function scoreAccount(a) {
  const fired = SIGNAL_RULES.filter((r) => r.fires(a)).map((r) => ({
    id: r.id,
    label: r.label,
    target: r.target,
    targetLabel: PRODUCTS[r.target].label,
    weight: r.weight,
    detail: r.detail(a),
  }));

  const raw = fired.reduce((s, f) => s + f.weight, 0);
  const score = Math.min(100, raw);

  // Primary opportunity = highest-weight fired signal
  const primary = fired.slice().sort((x, y) => y.weight - x.weight)[0] || null;

  const tier =
    score >= 60 ? "HOT" : score >= 35 ? "WARM" : score >= 15 ? "COOL" : "QUIET";

  return { ...a, signals: fired, score, primary, tier };
}

// ---------------------------------------------------------------------------
// SYNTHETIC ACCOUNTS (illustrative). Profiles are deliberately varied so
// different signals fire. Numbers are plausible, not real Deel data.
// ---------------------------------------------------------------------------
const RAW_ACCOUNTS = [
  {
    id: "acc_001",
    name: "Northwind Robotics",
    industry: "Hardware / Robotics",
    products: ["contractors"],
    headcount: 64,
    contractors: 22,
    eorSeats: 0,
    countries: 6,
    maxContractorsOneCountry: 5,
    topCountry: "Germany",
    recentFullTimeHires: 0,
    qoqGrowthPct: 31,
    sponsorshipMarkets: [],
  },
  {
    id: "acc_002",
    name: "Larkspur Health",
    industry: "Digital Health",
    products: ["contractors", "eor"],
    headcount: 38,
    contractors: 9,
    eorSeats: 7,
    countries: 4,
    maxContractorsOneCountry: 2,
    topCountry: "Spain",
    recentFullTimeHires: 4,
    qoqGrowthPct: 18,
    sponsorshipMarkets: [],
  },
  {
    id: "acc_003",
    name: "Cobalt & Finch",
    industry: "Design Agency",
    products: ["contractors"],
    headcount: 27,
    contractors: 19,
    eorSeats: 0,
    countries: 8,
    maxContractorsOneCountry: 4,
    topCountry: "Brazil",
    recentFullTimeHires: 0,
    qoqGrowthPct: 12,
    sponsorshipMarkets: [],
  },
  {
    id: "acc_004",
    name: "Meridian Labs",
    industry: "AI / ML",
    products: ["contractors", "eor", "hr"],
    headcount: 88,
    contractors: 14,
    eorSeats: 21,
    countries: 9,
    maxContractorsOneCountry: 2,
    topCountry: "United Kingdom",
    recentFullTimeHires: 6,
    qoqGrowthPct: 44,
    sponsorshipMarkets: ["United States", "Canada"],
  },
  {
    id: "acc_005",
    name: "Tideglass Studios",
    industry: "Gaming",
    products: ["contractors", "eor"],
    headcount: 52,
    contractors: 30,
    eorSeats: 11,
    countries: 7,
    maxContractorsOneCountry: 6,
    topCountry: "Poland",
    recentFullTimeHires: 3,
    qoqGrowthPct: 22,
    sponsorshipMarkets: ["Japan"],
  },
  {
    id: "acc_006",
    name: "Atlas Freight Co",
    industry: "Logistics",
    products: ["contractors", "payroll"],
    headcount: 120,
    contractors: 8,
    eorSeats: 0,
    countries: 3,
    maxContractorsOneCountry: 4,
    topCountry: "Mexico",
    recentFullTimeHires: 1,
    qoqGrowthPct: 7,
    sponsorshipMarkets: [],
  },
  {
    id: "acc_007",
    name: "Verdant Bio",
    industry: "Biotech",
    products: ["contractors", "eor", "it"],
    headcount: 46,
    contractors: 6,
    eorSeats: 9,
    countries: 5,
    maxContractorsOneCountry: 2,
    topCountry: "Switzerland",
    recentFullTimeHires: 2,
    qoqGrowthPct: 15,
    sponsorshipMarkets: [],
  },
  {
    id: "acc_008",
    name: "Pinecrest Media",
    industry: "Media / Content",
    products: ["contractors"],
    headcount: 19,
    contractors: 12,
    eorSeats: 0,
    countries: 4,
    maxContractorsOneCountry: 2,
    topCountry: "Argentina",
    recentFullTimeHires: 0,
    qoqGrowthPct: 9,
    sponsorshipMarkets: [],
  },
];

export const ACCOUNTS = RAW_ACCOUNTS.map(scoreAccount).sort(
  (a, b) => b.score - a.score
);
