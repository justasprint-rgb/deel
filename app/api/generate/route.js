// app/api/generate/route.js
// ---------------------------------------------------------------------------
// Secure serverless route. Holds the xAI (Grok) key server-side and never
// exposes it to the browser. The frontend POSTs an account signal profile;
// this route asks Grok to reason about the next-best product and draft the
// expansion play, then returns the text.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

// Swap this single string if your xAI key targets a different model.
const MODEL = "llama-3.3-70b-versatile";
const XAI_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req) {
  const key = process.env.XAI_API_KEY;
  if (!key) {
    return Response.json(
      { error: "Server is missing XAI_API_KEY. Add it in Vercel project settings." },
      { status: 500 }
    );
  }

  let account;
  try {
    ({ account } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!account) {
    return Response.json({ error: "No account provided." }, { status: 400 });
  }

  const signalLines = (account.signals || [])
    .map((s) => `- [${s.targetLabel}] ${s.label}: ${s.detail}`)
    .join("\n");

  const prompt = `You are an expansion-revenue strategist embedded in Deel's operations team. Deel sells a connected suite: Contractor Management ($49/seat/mo), EOR ($599/seat/mo), Global Payroll, Deel HR, Deel IT, Deel Benefits, Deel Mobility. Expansion (selling the next product into an existing account) drives Net Revenue Retention, the metric that moves valuation most.

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
THE SIGNAL - which usage events justify it, in plain language.
THE PLAY - the specific motion: who acts (new-logo sales / account manager / customer success), the trigger moment, and the opening angle. 2-3 sentences.
EST. EXPANSION VALUE - a rough monthly/annual ARR estimate using the seat anchors and account size. Show the arithmetic briefly. Flag it as an estimate.
WATCH - one metric that confirms the play is working.

Under 220 words. Senior, direct, specific to THIS account. No em dashes. Use a colon or period instead.`;

  try {
    const r = await fetch(XAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 700,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return Response.json(
        { error: `Grok API error (${r.status}). Check your model string and key. ${txt.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await r.json();
    const text =
      data?.choices?.[0]?.message?.content?.trim() || "No content returned.";
    return Response.json({ text, model: MODEL });
  } catch (e) {
    return Response.json(
      { error: `Request to Grok failed: ${e.message}` },
      { status: 502 }
    );
  }
}
