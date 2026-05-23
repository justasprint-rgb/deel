// app/api/generate/route.js
// ---------------------------------------------------------------------------
// Secure serverless route. Holds the xAI (Grok) key server-side, never exposed
// to the browser. Tasks:
//   play     -> reason over an account's signals, draft the expansion play
//   refine   -> continue the conversation on a play
//   escalate -> draft a churn-save escalation for an at-risk account
//   analyst  -> answer a business-analyst question over the whole book
//   slack    -> post a message to SLACK_WEBHOOK_URL (real if configured)
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

const MODEL = "llama-3.3-70b-versatile";
const XAI_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYS = "You are an expansion and retention strategist embedded in Deel's operations team. You write tight, senior, specific output. Never use em dashes; use a colon, comma, or period instead.";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { task = "play" } = body || {};

  // ---- Slack: post a message to the configured webhook --------------------
  if (task === "slack") {
    const hook = process.env.SLACK_WEBHOOK_URL;
    const message = body.message;
    if (!message) return Response.json({ error: "No message to send." }, { status: 400 });
    if (!hook) {
      return Response.json({ sent: false, notConfigured: true });
    }
    try {
      const r = await fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });
      if (!r.ok) {
        const t = await r.text();
        return Response.json({ sent: false, error: `Slack returned ${r.status}. ${t.slice(0, 120)}` }, { status: 502 });
      }
      return Response.json({ sent: true });
    } catch (e) {
      return Response.json({ sent: false, error: `Slack post failed: ${e.message}` }, { status: 502 });
    }
  }

  // ---- everything else needs the Grok key ---------------------------------
  const key = process.env.XAI_API_KEY;
  if (!key) {
    return Response.json({ error: "Server is missing XAI_API_KEY. Add it in Vercel project settings." }, { status: 500 });
  }

  let messages;

  if (task === "analyst") {
    const { dataset, question, history = [] } = body;
    if (!dataset || !question) return Response.json({ error: "Analyst needs a dataset and a question." }, { status: 400 });
    messages = [
      {
        role: "system",
        content: `You are a senior revenue/operations analyst at Deel. Answer questions using ONLY the account book below. Be precise: give counts, totals, and name specific accounts. For revenue use the seat anchors Contractor $49/seat/mo and EOR $599/seat/mo, state assumptions plainly, and label figures as estimates. If something is not answerable from the data, say so. Under 200 words, no em dashes.

ACCOUNT BOOK (JSON):
${JSON.stringify(dataset)}`,
      },
      ...history.map((h) => ({ role: h.role === "you" ? "user" : "assistant", content: h.text })),
      { role: "user", content: question },
    ];
  } else if (task === "escalate") {
    const { account } = body;
    if (!account) return Response.json({ error: "No account provided." }, { status: 400 });
    messages = [
      { role: "system", content: SYS },
      {
        role: "user",
        content: `This account is flagging churn risk from support-portal signals. Write a tight internal CHURN ESCALATION for the account's customer-success owner.

ACCOUNT: ${account.name} (${account.industry})
Headcount ${account.headcount}, uses ${(account.products || []).join(", ")}, EOR seats ${account.eorSeats}
Churn risk: ${account.churnTier} (${account.churnScore}/100)
Support signals: ${(account.churnFactors || []).join("; ") || "none"}

Use these exact caps headers: RISK, LIKELY CAUSE, SAVE PLAY, OWNER.
RISK: one line on severity and what is driving it.
LIKELY CAUSE: 2 sentences. If the account recently migrated from a legacy payroll provider, reason about migration friction (dual-system runs, settlement lag) as the probable root.
SAVE PLAY: 2-3 concrete actions in the next 48 hours.
OWNER: which role should run it.
Under 160 words, no preamble, no em dashes.`,
      },
    ];
  } else if (task === "refine") {
    const { account, play, question } = body;
    if (!account || !play || !question) return Response.json({ error: "Refine needs the account, prior output, and a question." }, { status: 400 });
    messages = [
      { role: "system", content: SYS },
      { role: "user", content: `This is output you produced for ${account.name} (${account.industry}; uses ${(account.products || []).join(", ")}):

${play}

Handle this request about it. Concrete and ready to use. Under 160 words, no preamble, no em dashes:

${question}` },
    ];
  } else {
    // task: play
    const { account } = body;
    if (!account) return Response.json({ error: "No account provided." }, { status: 400 });
    const signalLines = (account.signals || []).map((s) => `- [${s.targetLabel}] ${s.label}: ${s.detail}`).join("\n");
    messages = [{
      role: "user",
      content: `You are an expansion-revenue strategist at Deel. Deel sells a connected suite: Contractor Management ($49/seat/mo), EOR ($599/seat/mo), Global Payroll, Deel HR, Deel IT, Deel Benefits, Deel Mobility. Expansion (selling the next product into an existing account) drives Net Revenue Retention, the metric that moves valuation most.

An account has emitted usage signals indicating readiness for a product it does NOT yet own. Reason about the SINGLE best next product and write a tight expansion play.

ACCOUNT
Name: ${account.name}
Industry: ${account.industry}
Headcount: ${account.headcount}, QoQ growth: ${account.qoqGrowthPct}%
Operating countries: ${account.countries}
Currently uses: ${(account.products || []).join(", ")}
Contractors: ${account.contractors} (max ${account.maxContractorsOneCountry} in ${account.topCountry}); EOR seats: ${account.eorSeats}
Recent full-time hires (last quarter): ${account.recentFullTimeHires}

FIRED SIGNALS
${signalLines || "- (none)"}

Write the play with these exact caps headers, no preamble:
NEXT PRODUCT - one product and a one-line why.
THE SIGNAL - which usage events justify it.
THE PLAY - the motion: who acts, the trigger moment, the opening angle. 2-3 sentences.
EST. EXPANSION VALUE - rough ARR estimate using the seat anchors and account size. Show the arithmetic. Flag as estimate.
WATCH - one metric that confirms it is working.

Under 220 words. Senior, direct, specific. No em dashes.`,
    }];
  }

  try {
    const r = await fetch(XAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.45, max_tokens: 800 }),
    });
    if (!r.ok) {
      const txt = await r.text();
      return Response.json({ error: `Grok API error (${r.status}). Check your model string and key. ${txt.slice(0, 200)}` }, { status: 502 });
    }
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "No content returned.";
    return Response.json({ text, model: MODEL });
  } catch (e) {
    return Response.json({ error: `Request to Grok failed: ${e.message}` }, { status: 502 });
  }
}
