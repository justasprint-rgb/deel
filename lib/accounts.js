// lib/accounts.js
// ---------------------------------------------------------------------------
// Illustrative Deel-style accounts + two production-real scoring layers:
//   EXPANSION (offense): which accounts are ready for the next product.
//   CHURN RISK (defense): which accounts are sliding toward leaving, derived
//     from support-portal signals (tickets, payment complaints, sentiment,
//     CSAT, contact recency).
//
// Account rows are synthetic and labeled as such in the UI. The signal logic,
// scoring, and product graph are production-real. A live deployment replaces
// rows with Deel's product-usage events and support-portal data (Zendesk/
// Intercom/review APIs).
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

// ---- EXPANSION SIGNALS -----------------------------------------------------
const SIGNAL_RULES = [
  { id: "eor_from_contractors", label: "Repeat contractors in a single country", target: "eor", weight: 32,
    detail: (a) => `${a.maxContractorsOneCountry} contractors in ${a.topCountry} signals a permanent presence better served by EOR than contractor agreements (misclassification risk + cost).`,
    fires: (a) => !a.products.includes("eor") && a.maxContractorsOneCountry >= 3 },
  { id: "it_from_fulltime", label: "Full-time hires without device management", target: "it", weight: 24,
    detail: (a) => `${a.recentFullTimeHires} new full-time hires last quarter with no Deel IT devices assigned. Each hire is an equipment and MDM trigger.`,
    fires: (a) => !a.products.includes("it") && a.recentFullTimeHires >= 2 },
  { id: "payroll_consolidation", label: "Fragmented payroll across many countries", target: "payroll", weight: 28,
    detail: (a) => `Payroll across ${a.countries} countries in separate flows. Consolidation is the most-cited reason customers stay on Deel.`,
    fires: (a) => !a.products.includes("payroll") && a.countries >= 5 },
  { id: "mobility_from_sponsorship", label: "Hiring into visa-sponsorship markets", target: "mobility", weight: 18,
    detail: (a) => `Open roles in ${a.sponsorshipMarkets.join(", ")} needing visa sponsorship. Mobility attaches at the point of hire.`,
    fires: (a) => !a.products.includes("mobility") && a.sponsorshipMarkets.length > 0 },
  { id: "hr_from_headcount", label: "Headcount past the spreadsheet threshold", target: "hr", weight: 16,
    detail: (a) => `${a.headcount} people and ${a.qoqGrowthPct}% QoQ growth with no HRIS. Past ~40 heads, manual HR breaks and Deel HR becomes the system of record.`,
    fires: (a) => !a.products.includes("hr") && a.headcount >= 40 },
  { id: "benefits_from_eor", label: "EOR employees without benefits administration", target: "benefits", weight: 14,
    detail: (a) => `${a.eorSeats} EOR employees with no Deel Benefits. Competitive local benefits cut EOR-employee attrition and deepen the account.`,
    fires: (a) => a.products.includes("eor") && !a.products.includes("benefits") && a.eorSeats >= 3 },
];

// ---- CHURN-RISK MODEL (from support-portal signals) ------------------------
// Payment complaints are weighted most heavily: our review research found
// payment failures are the dominant driver of dissatisfaction and churn.
function scoreChurn(a) {
  const s = a.support;
  const factors = [];
  let score = 0;

  if (s.paymentComplaints >= 1) { score += s.paymentComplaints * 12; factors.push(`${s.paymentComplaints} payment complaint${s.paymentComplaints > 1 ? "s" : ""} in support`); }
  if (s.openTickets >= 4) { score += s.openTickets * 4; factors.push(`${s.openTickets} open unresolved tickets`); }
  else if (s.openTickets > 0) { score += s.openTickets * 4; }
  if (s.sentiment === "declining") { score += 20; factors.push("Declining sentiment trend"); }
  else if (s.sentiment === "stable") { score += 6; }
  if (s.daysSinceContact > 30) { score += 10; factors.push(`No contact in ${s.daysSinceContact} days`); }
  else if (s.daysSinceContact > 20) { score += 6; factors.push(`No contact in ${s.daysSinceContact} days`); }
  if (s.csat < 6) { score += 20; factors.push(`CSAT critically low (${s.csat})`); }
  else if (s.csat < 7) { score += 12; factors.push(`CSAT below 7 (${s.csat})`); }
  else if (s.csat < 8) { score += 5; }

  score = Math.min(100, score);
  const tier = score >= 85 ? "CRITICAL" : score >= 55 ? "AT-RISK" : score >= 30 ? "WATCH" : "HEALTHY";
  return { churnScore: score, churnTier: tier, churnFactors: factors };
}

export function scoreAccount(a) {
  const fired = SIGNAL_RULES.filter((r) => r.fires(a)).map((r) => ({
    id: r.id, label: r.label, target: r.target,
    targetLabel: PRODUCTS[r.target].label, weight: r.weight, detail: r.detail(a),
  }));
  const raw = fired.reduce((s, f) => s + f.weight, 0);
  const score = Math.min(100, raw);
  const primary = fired.slice().sort((x, y) => y.weight - x.weight)[0] || null;
  const tier = score >= 60 ? "HOT" : score >= 35 ? "WARM" : score >= 15 ? "COOL" : "QUIET";
  const churn = a.support ? scoreChurn(a) : { churnScore: 0, churnTier: "HEALTHY", churnFactors: [] };
  return { ...a, signals: fired, score, primary, tier, ...churn };
}

// ---- ACCOUNT PROFILES ------------------------------------------------------
const RAW_ACCOUNTS = [
  {
    id: "acc_001", name: "Cascade Labs", industry: "B2B SaaS · Series B",
    products: ["contractors"], headcount: 28, contractors: 11, eorSeats: 0,
    countries: 3, maxContractorsOneCountry: 4, topCountry: "Germany",
    recentFullTimeHires: 3, qoqGrowthPct: 38, sponsorshipMarkets: [],
    support: { openTickets: 2, paymentComplaints: 1, sentiment: "stable", daysSinceContact: 18, csat: 7.9 },
  },
  {
    id: "acc_002", name: "Blackmoor Studios", industry: "Gaming",
    products: ["contractors", "eor"], headcount: 52, contractors: 30, eorSeats: 11,
    countries: 7, maxContractorsOneCountry: 6, topCountry: "Poland",
    recentFullTimeHires: 3, qoqGrowthPct: 22, sponsorshipMarkets: ["Japan"],
    support: { openTickets: 1, paymentComplaints: 0, sentiment: "improving", daysSinceContact: 5, csat: 8.9 },
  },
  {
    // The Safeguard-migrated account. Both the biggest expansion target AND the
    // biggest churn risk: migration friction shows up as payment complaints and
    // declining sentiment. The tool surfaces both at once.
    id: "acc_003", name: "Archon Data", industry: "Data / AI (migrated from legacy payroll provider)",
    products: ["contractors", "eor", "payroll"], headcount: 88, contractors: 14, eorSeats: 21,
    countries: 9, maxContractorsOneCountry: 2, topCountry: "United Kingdom",
    recentFullTimeHires: 6, qoqGrowthPct: 44, sponsorshipMarkets: ["United States", "Canada"],
    support: { openTickets: 6, paymentComplaints: 4, sentiment: "declining", daysSinceContact: 21, csat: 5.8 },
  },
  {
    id: "acc_004", name: "Sunstone Health", industry: "Healthtech",
    products: ["contractors", "hr"], headcount: 34, contractors: 16, eorSeats: 0,
    countries: 2, maxContractorsOneCountry: 5, topCountry: "United Kingdom",
    recentFullTimeHires: 3, qoqGrowthPct: 31, sponsorshipMarkets: [],
    support: { openTickets: 3, paymentComplaints: 1, sentiment: "stable", daysSinceContact: 14, csat: 7.4 },
  },
  {
    id: "acc_005", name: "Vanta Fintech", industry: "Fintech",
    products: ["eor"], headcount: 18, contractors: 6, eorSeats: 8,
    countries: 3, maxContractorsOneCountry: 2, topCountry: "Netherlands",
    recentFullTimeHires: 4, qoqGrowthPct: 27, sponsorshipMarkets: ["United States"],
    support: { openTickets: 2, paymentComplaints: 0, sentiment: "stable", daysSinceContact: 14, csat: 8.2 },
  },
  {
    id: "acc_006", name: "Meridian Freight", industry: "Logistics",
    products: ["contractors", "payroll"], headcount: 120, contractors: 8, eorSeats: 0,
    countries: 3, maxContractorsOneCountry: 4, topCountry: "Mexico",
    recentFullTimeHires: 1, qoqGrowthPct: 7, sponsorshipMarkets: [],
    support: { openTickets: 4, paymentComplaints: 2, sentiment: "declining", daysSinceContact: 24, csat: 7.1 },
  },
  {
    id: "acc_007", name: "Orinoco Commerce", industry: "E-commerce · LATAM",
    products: ["contractors"], headcount: 19, contractors: 13, eorSeats: 0,
    countries: 4, maxContractorsOneCountry: 4, topCountry: "Mexico",
    recentFullTimeHires: 0, qoqGrowthPct: 14, sponsorshipMarkets: [],
    support: { openTickets: 3, paymentComplaints: 2, sentiment: "stable", daysSinceContact: 28, csat: 6.6 },
  },
  {
    id: "acc_008", name: "Pinetree Creative", industry: "Design Agency",
    products: ["contractors"], headcount: 11, contractors: 7, eorSeats: 0,
    countries: 2, maxContractorsOneCountry: 2, topCountry: "France",
    recentFullTimeHires: 0, qoqGrowthPct: 4, sponsorshipMarkets: [],
    support: { openTickets: 0, paymentComplaints: 0, sentiment: "stable", daysSinceContact: 40, csat: 8.0 },
  },
];

export const ACCOUNTS = RAW_ACCOUNTS.map(scoreAccount).sort((a, b) => b.score - a.score);

// Convenience: same accounts ranked by churn risk (defense view).
export const BY_CHURN = [...ACCOUNTS].sort((a, b) => b.churnScore - a.churnScore);
