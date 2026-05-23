// lib/accounts.js
// ---------------------------------------------------------------------------
// Illustrative Deel-style account data + the expansion SIGNAL LOGIC.
// The account rows are synthetic and clearly labeled as such in the UI.
// The signal logic and the product-sequence reasoning are production-real:
// these are the actual events that reveal a customer is ready for the next
// product in Deel's graph.
//
// Account profiles are grounded in real Deel corridor data (GB, DE, MX, PL,
// AR, PH) and real Deel ICP archetypes: Series B SaaS, fintech, gaming,
// logistics, healthtech. One account (Archon Data) mirrors the Safeguard
// migration cohort: an account recently moved off a legacy payroll provider
// into Deel's stack, now showing the expansion signals that follow migration.
// ---------------------------------------------------------------------------

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
      `${a.recentFullTimeHires} new full-time hires in the last quarter with no Deel IT devices assigned. Each new hire is an equipment and MDM trigger.`,
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
  const primary = fired.slice().sort((x, y) => y.weight - x.weight)[0] || null;
  const tier =
    score >= 60 ? "HOT" : score >= 35 ? "WARM" : score >= 15 ? "COOL" : "QUIET";

  return { ...a, signals: fired, score, primary, tier };
}

// ---------------------------------------------------------------------------
// ACCOUNT PROFILES
// Grounded in real Deel ICP archetypes and the corridor data (GB, DE, MX,
// PL, AR) from 659 classified Trustpilot reviews.
// ---------------------------------------------------------------------------
const RAW_ACCOUNTS = [
  {
    // Series B SaaS company, European engineering expansion. The Germany
    // contractor cluster mirrors the DE corridor (9 payment complaints,
    // 50% of DE negatives). Classic land-and-expand setup.
    id: "acc_001",
    name: "Cascade Labs",
    industry: "B2B SaaS · Series B",
    products: ["contractors"],
    headcount: 28,
    contractors: 11,
    eorSeats: 0,
    countries: 3,
    maxContractorsOneCountry: 4,
    topCountry: "Germany",
    recentFullTimeHires: 3,
    qoqGrowthPct: 38,
    sponsorshipMarkets: [],
  },
  {
    // Gaming studio with a large Poland contractor base converting to
    // full-time. Poland is a documented Deel high-volume corridor.
    // Multiple signals fire simultaneously, making this the hottest account.
    id: "acc_002",
    name: "Blackmoor Studios",
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
    // Post-acquisition cohort. Recently migrated from a legacy global payroll
    // provider (Safeguard origin) onto Deel. Now showing the IT, mobility and
    // benefits signals that follow a successful EOR migration at this scale.
    id: "acc_003",
    name: "Archon Data",
    industry: "Data / AI (migrated from legacy payroll provider)",
    products: ["contractors", "eor", "payroll"],
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
    // UK healthtech, contractor-heavy in the GB corridor. GB is the highest
    // Safeguard-overlap corridor in the risk model (90% footprint estimate,
    // 37 payment complaints, 55% of GB negatives). EOR here is both an
    // expansion opportunity and a misclassification risk.
    id: "acc_004",
    name: "Sunstone Health",
    industry: "Healthtech",
    products: ["contractors", "hr"],
    headcount: 34,
    contractors: 16,
    eorSeats: 0,
    countries: 2,
    maxContractorsOneCountry: 5,
    topCountry: "United Kingdom",
    recentFullTimeHires: 3,
    qoqGrowthPct: 31,
    sponsorshipMarkets: [],
  },
  {
    // Fintech expanding from EMEA into LATAM. New FTEs in 3 countries,
    // one visa-dependent hire flagged. Mobility attaches cleanly at the
    // point of hire, not months later.
    id: "acc_005",
    name: "Vanta Fintech",
    industry: "Fintech",
    products: ["eor"],
    headcount: 18,
    contractors: 6,
    eorSeats: 8,
    countries: 3,
    maxContractorsOneCountry: 2,
    topCountry: "Netherlands",
    recentFullTimeHires: 4,
    qoqGrowthPct: 27,
    sponsorshipMarkets: ["United States"],
  },
  {
    // Cross-border logistics, headcount well above the spreadsheet threshold.
    // Mexico contractor cluster mirrors MX corridor (6 complaints, 67% of
    // MX negatives). No HRIS despite 120 people, a clear gap.
    id: "acc_006",
    name: "Meridian Freight",
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
    // LATAM-first e-commerce, contractor base building in Mexico and
    // Argentina. Both corridors are documented in the review data (MX:
    // 67% payment complaint rate, AR: 64%). EOR reduces misclassification
    // exposure as they formalize the LATAM operation.
    id: "acc_007",
    name: "Orinoco Commerce",
    industry: "E-commerce · LATAM",
    products: ["contractors"],
    headcount: 19,
    contractors: 13,
    eorSeats: 0,
    countries: 4,
    maxContractorsOneCountry: 4,
    topCountry: "Mexico",
    recentFullTimeHires: 0,
    qoqGrowthPct: 14,
    sponsorshipMarkets: [],
  },
  {
    // Small design agency, stable team, no meaningful expansion signals.
    // Included as the control case: the engine should NOT flag every account,
    // and the generate button is disabled here to make that explicit.
    id: "acc_008",
    name: "Pinetree Creative",
    industry: "Design Agency",
    products: ["contractors"],
    headcount: 11,
    contractors: 7,
    eorSeats: 0,
    countries: 2,
    maxContractorsOneCountry: 2,
    topCountry: "France",
    recentFullTimeHires: 0,
    qoqGrowthPct: 4,
    sponsorshipMarkets: [],
  },
];

export const ACCOUNTS = RAW_ACCOUNTS.map(scoreAccount).sort(
  (a, b) => b.score - a.score
);
