// app/page.jsx
"use client";

import { useState, useMemo } from "react";
import { ACCOUNTS, BY_CHURN, PRODUCTS, scoreAccount } from "../lib/accounts";

const TIER_CLASS = { HOT: "t-HOT", WARM: "t-WARM", COOL: "t-COOL", QUIET: "t-QUIET" };
const TIER_COLOR = { HOT: "var(--red)", WARM: "var(--amber)", COOL: "var(--blue)", QUIET: "var(--text3)" };
const CHURN_CLASS = { CRITICAL: "c-CRIT", "AT-RISK": "c-RISK", WATCH: "c-WATCH", HEALTHY: "c-OK" };
const CHURN_COLOR = { CRITICAL: "var(--red)", "AT-RISK": "var(--amber)", WATCH: "var(--blue)", HEALTHY: "var(--accent)" };
const ALL_PRODUCTS = ["contractors", "eor", "payroll", "hr", "it", "benefits", "mobility"];

function eorProjection(a) {
  return a.signals.some((s) => s.target === "eor") ? Math.round(a.headcount * 0.3) * 599 * 12 : 0;
}

export default function Page() {
  const [tab, setTab] = useState("expansion");
  const [selected, setSelected] = useState(ACCOUNTS[0]);
  const [conv, setConv] = useState(50);

  const portfolio = useMemo(() => {
    const hot = ACCOUNTS.filter((a) => a.tier === "HOT").length;
    const atRisk = ACCOUNTS.filter((a) => a.churnTier === "CRITICAL" || a.churnTier === "AT-RISK").length;
    const plays = ACCOUNTS.reduce((s, a) => s + a.signals.length, 0);
    const eorArr = ACCOUNTS.reduce((s, a) => s + eorProjection(a), 0);
    return { count: ACCOUNTS.length, hot, atRisk, plays, eorArr, weighted: Math.round((eorArr * conv) / 100) };
  }, [conv]);

  return (
    <div className="wrap">
      <header className="head">
        <div>
          <div className="brand"><span className="mark">◳</span> EXPANSION SIGNAL ENGINE</div>
          <div className="tagline">
            Offense and defense on the existing base: grow the accounts that signal readiness, save the
            accounts that signal risk, and ask the book anything.
          </div>
        </div>
        <div className="head-meta">
          OFFENSE · expansion signals → NRR<br />
          DEFENSE · churn signals → retention<br />
          MODEL · <span className="live">Grok (live, server-side)</span><br />
          <a href="/pitch" className="live" style={{ textDecoration: "none" }}>← read the pitch</a>
        </div>
      </header>

      <div className="banner">
        <b>Read me first.</b> Account rows and support signals are illustrative, not real Deel data. The signal
        logic, scoring, and reasoning are production-real. A live deployment wires expansion signals into Deel's
        product-usage events and churn signals into the support portal (Zendesk / Intercom / review APIs).
        Plays, escalations, and analyst answers are generated live by Grok.
      </div>

      <div className="portfolio">
        <div className="pf-stat"><div className="pf-v">{portfolio.count}</div><div className="pf-l">Accounts</div></div>
        <div className="pf-stat"><div className="pf-v" style={{ color: "var(--red)" }}>{portfolio.hot}</div><div className="pf-l">Hot to expand</div></div>
        <div className="pf-stat"><div className="pf-v" style={{ color: "var(--amber)" }}>{portfolio.atRisk}</div><div className="pf-l">At churn risk</div></div>
        <div className="pf-stat"><div className="pf-v">{portfolio.plays}</div><div className="pf-l">Expansion plays</div></div>
        <div className="pf-proj">
          <div className="pf-proj-top">
            <span className="pf-l">Projected EOR-led expansion ARR</span>
            <span className="pf-v" style={{ color: "var(--accent)" }}>${(portfolio.weighted / 1000).toFixed(0)}k</span>
          </div>
          <input className="slider" type="range" min="10" max="100" step="5" value={conv} onChange={(e) => setConv(Number(e.target.value))} />
          <div className="pf-assume">assume <b>{conv}%</b> convert · full pipeline ${(portfolio.eorArr / 1000).toFixed(0)}k · EOR anchor $599/seat/mo · illustrative</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "expansion" ? "on" : ""}`} onClick={() => setTab("expansion")}>Expansion</button>
        <button className={`tab ${tab === "churn" ? "on" : ""}`} onClick={() => setTab("churn")}>Churn watch</button>
        <button className={`tab ${tab === "model" ? "on" : ""}`} onClick={() => setTab("model")}>Model an account</button>
        <button className={`tab ${tab === "analyst" ? "on" : ""}`} onClick={() => setTab("analyst")}>Ask the analyst</button>
      </div>

      {tab === "expansion" && (
        <div className="cols">
          <div className="panel">
            <div className="panel-label">Accounts · ranked by expansion-readiness</div>
            {ACCOUNTS.map((a) => (
              <button key={a.id} className={`acct ${selected.id === a.id ? "sel" : ""}`} onClick={() => setSelected(a)}>
                <div className="acct-top">
                  <div>
                    <div className="acct-name">{a.name}</div>
                    <div className="acct-ind">{a.industry} · {a.headcount} ppl · {a.countries} countries</div>
                  </div>
                  <div className="acct-score">
                    <span className="scorenum" style={{ color: TIER_COLOR[a.tier] }}>{a.score}</span>
                    <span className={`tierpill ${TIER_CLASS[a.tier]}`}>{a.tier}</span>
                  </div>
                </div>
                {a.signals.length > 0 && (
                  <div className="chips">{a.signals.map((s) => <span key={s.id} className="chip">→ {PRODUCTS[s.target].label}</span>)}</div>
                )}
              </button>
            ))}
          </div>
          <div className="panel"><Workspace key={selected.id} account={selected} /></div>
        </div>
      )}

      {tab === "churn" && <ChurnMode />}
      {tab === "model" && <ModelMode />}
      {tab === "analyst" && <Analyst />}

      <footer className="foot">
        <span>Expansion Signal Engine · offense + defense on the existing base · illustrative data, production-real logic</span>
        <span className="name">SRINIVAS PAI, FUTURE GHOSTBUSTER :)</span>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CHURN WATCH: accounts ranked by churn risk, with live escalation + Slack.
// ---------------------------------------------------------------------------
function ChurnMode() {
  const [open, setOpen] = useState(BY_CHURN[0].id);
  return (
    <div className="panel">
      <div className="panel-label">Accounts · ranked by churn risk · from support-portal signals</div>
      {BY_CHURN.map((a) => (
        <ChurnRow key={a.id} account={a} open={open === a.id} onToggle={() => setOpen(open === a.id ? null : a.id)} />
      ))}
    </div>
  );
}

function ChurnRow({ account, open, onToggle }) {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [slack, setSlack] = useState(null); // null | "sending" | "sent" | "notconfigured" | error string

  async function compose() {
    setLoading(true); setError(null); setBrief(null); setSlack(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "escalate", account }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed."); else setBrief(data.text);
    } catch { setError("Network error reaching the server route."); }
    finally { setLoading(false); }
  }

  async function sendSlack() {
    setSlack("sending");
    const message = `:rotating_light: *Churn escalation — ${account.name}* (${account.churnTier}, ${account.churnScore}/100)\n\n${brief}`;
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "slack", message }),
      });
      const data = await res.json();
      if (data.sent) setSlack("sent");
      else if (data.notConfigured) setSlack("notconfigured");
      else setSlack(data.error || "Slack send failed.");
    } catch { setSlack("Network error."); }
  }

  return (
    <div className={`crow ${open ? "open" : ""}`}>
      <button className="crow-head" onClick={onToggle}>
        <div className="crow-left">
          <span className={`dot ${CHURN_CLASS[account.churnTier]}`} />
          <div>
            <div className="acct-name">{account.name}</div>
            <div className="acct-ind">{account.industry} · CSAT {account.support.csat} · {account.support.openTickets} open tickets</div>
          </div>
        </div>
        <div className="acct-score">
          <span className="scorenum" style={{ color: CHURN_COLOR[account.churnTier] }}>{account.churnScore}</span>
          <span className={`tierpill ${CHURN_CLASS[account.churnTier]}`}>{account.churnTier}</span>
        </div>
      </button>

      {open && (
        <div className="crow-body">
          {account.churnFactors.length === 0 ? (
            <div className="sig-detail">No active risk factors. Account looks healthy.</div>
          ) : (
            <div className="factorlist">
              {account.churnFactors.map((f, i) => <div key={i} className="factor">⚠ {f}</div>)}
            </div>
          )}

          {account.churnTier !== "HEALTHY" && (
            <button className="btn" onClick={compose} disabled={loading} style={{ marginTop: 12 }}>
              {loading ? "GROK IS DRAFTING…" : "▶ COMPOSE CHURN ESCALATION (LIVE)"}
            </button>
          )}
          {loading && <div className="thinking"><span className="pulse" />Drafting the save play…</div>}
          {error && <div className="err">{error}</div>}

          {brief && (
            <>
              <div className="play" style={{ borderColor: CHURN_COLOR[account.churnTier] }}>
                <div className="play-head" style={{ background: "var(--surface2)", color: CHURN_COLOR[account.churnTier] }}>
                  <span>⚑ CHURN ESCALATION · {account.name.toUpperCase()}</span>
                  <span>via Grok</span>
                </div>
                <div className="play-body">{brief}</div>
              </div>
              <div className="slackrow">
                <button className="slackbtn" onClick={sendSlack} disabled={slack === "sending" || slack === "sent"}>
                  {slack === "sent" ? "✓ Sent to Slack" : slack === "sending" ? "Sending…" : "Send to Slack / Teams"}
                </button>
                {slack === "notconfigured" && <span className="slacknote">No webhook configured. Set SLACK_WEBHOOK_URL to post for real. This is the message that would send.</span>}
                {slack && slack !== "sent" && slack !== "sending" && slack !== "notconfigured" && <span className="slacknote err-text">{slack}</span>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ANALYST: ask the whole book anything. Grok answers over the dataset.
// ---------------------------------------------------------------------------
function Analyst() {
  const [thread, setThread] = useState([]);
  const [ask, setAsk] = useState("");
  const [busy, setBusy] = useState(false);

  const dataset = useMemo(
    () => ACCOUNTS.map((a) => ({
      name: a.name, industry: a.industry, headcount: a.headcount, countries: a.countries,
      products: a.products, contractors: a.contractors, eorSeats: a.eorSeats,
      expansionScore: a.score, expansionTier: a.tier,
      nextProducts: a.signals.map((s) => s.targetLabel),
      churnScore: a.churnScore, churnTier: a.churnTier, csat: a.support.csat,
    })),
    []
  );

  const SUGGESTED = [
    "How many accounts can be converted, and to what?",
    "What is the total expansion revenue opportunity?",
    "Which ICP is the best fit for EOR?",
    "Who is the top expansion account and why?",
    "Which accounts are both high-value and high-risk?",
  ];

  async function send(q) {
    const question = (q || "").trim();
    if (!question || busy) return;
    setBusy(true);
    const history = thread.slice();
    setThread((t) => [...t, { role: "you", text: question }]);
    setAsk("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "analyst", dataset, question, history }),
      });
      const data = await res.json();
      setThread((t) => [...t, { role: "analyst", text: res.ok ? data.text : (data.error || "Failed.") }]);
    } catch {
      setThread((t) => [...t, { role: "analyst", text: "Network error reaching the server route." }]);
    } finally { setBusy(false); }
  }

  return (
    <div className="panel">
      <div className="panel-label">Ask the analyst · Grok answers over the whole book of {ACCOUNTS.length} accounts</div>

      {thread.length === 0 && (
        <div className="suggest">
          {SUGGESTED.map((q) => <button key={q} className="quick" onClick={() => send(q)} disabled={busy}>{q}</button>)}
        </div>
      )}

      <div className="chat">
        {thread.map((m, i) => (
          <div key={i} className={`turn ${m.role === "you" ? "you" : "grok"}`}>
            <div className="turn-who">{m.role === "you" ? "YOU" : "ANALYST"}</div>
            <div className="turn-text">{m.text}</div>
          </div>
        ))}
        {busy && <div className="thinking"><span className="pulse" />Analyzing the book…</div>}
      </div>

      <div className="askrow">
        <input className="inp" placeholder="Ask anything: totals, conversions, ICP, top accounts, risk concentration…"
          value={ask} onChange={(e) => setAsk(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(ask); }} disabled={busy} />
        <button className="askbtn" onClick={() => send(ask)} disabled={busy || !ask.trim()}>Ask</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MODEL MODE: live input + live scoring + play + refinement.
// ---------------------------------------------------------------------------
function ModelMode() {
  const [a, setA] = useState({
    id: "custom", name: "Your Account", industry: "Custom", products: ["contractors"],
    headcount: 30, contractors: 12, eorSeats: 0, countries: 3, maxContractorsOneCountry: 4,
    topCountry: "Germany", recentFullTimeHires: 2, qoqGrowthPct: 25, sponsorshipMarkets: [],
    support: { openTickets: 0, paymentComplaints: 0, sentiment: "stable", daysSinceContact: 10, csat: 8.0 },
  });
  const scored = useMemo(() => scoreAccount(a), [a]);
  const set = (k, v) => setA((p) => ({ ...p, [k]: v }));
  const toggleProduct = (p) => setA((prev) => ({ ...prev, products: prev.products.includes(p) ? prev.products.filter((x) => x !== p) : [...prev.products, p] }));

  return (
    <div className="cols">
      <div className="panel">
        <div className="panel-label">Model an account · scores live as you type</div>
        <div className="field"><label>Name</label><input className="inp" value={a.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="field"><label>Industry</label><input className="inp" value={a.industry} onChange={(e) => set("industry", e.target.value)} /></div>
        <label className="field-label">Products currently used</label>
        <div className="prodrow">
          {ALL_PRODUCTS.map((p) => (
            <button key={p} className={`prodtog ${a.products.includes(p) ? "on" : ""}`} onClick={() => toggleProduct(p)}>{PRODUCTS[p].label.split(" (")[0]}</button>
          ))}
        </div>
        <div className="grid2">
          <NumField label="Headcount" v={a.headcount} on={(v) => set("headcount", v)} />
          <NumField label="Contractors" v={a.contractors} on={(v) => set("contractors", v)} />
          <NumField label="Max contractors in 1 country" v={a.maxContractorsOneCountry} on={(v) => set("maxContractorsOneCountry", v)} />
          <div className="field"><label>Top country</label><input className="inp" value={a.topCountry} onChange={(e) => set("topCountry", e.target.value)} /></div>
          <NumField label="New FT hires (qtr)" v={a.recentFullTimeHires} on={(v) => set("recentFullTimeHires", v)} />
          <NumField label="Operating countries" v={a.countries} on={(v) => set("countries", v)} />
          <NumField label="EOR seats" v={a.eorSeats} on={(v) => set("eorSeats", v)} />
          <NumField label="QoQ growth %" v={a.qoqGrowthPct} on={(v) => set("qoqGrowthPct", v)} />
        </div>
        <div className="field"><label>Visa-sponsorship markets (comma separated)</label>
          <input className="inp" value={a.sponsorshipMarkets.join(", ")} onChange={(e) => set("sponsorshipMarkets", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></div>
      </div>
      <div className="panel"><Workspace account={scored} live /></div>
    </div>
  );
}

function NumField({ label, v, on }) {
  return (
    <div className="field"><label>{label}</label>
      <input className="inp" type="number" min="0" value={v} onChange={(e) => on(Math.max(0, Number(e.target.value) || 0))} /></div>
  );
}

// ---------------------------------------------------------------------------
// WORKSPACE: detail + signals + play + refinement (expansion + model modes).
// ---------------------------------------------------------------------------
function Workspace({ account, live }) {
  const [play, setPlay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [thread, setThread] = useState([]);
  const [refining, setRefining] = useState(false);
  const [ask, setAsk] = useState("");

  async function generate() {
    setLoading(true); setError(null); setPlay(null); setThread([]);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ account, task: "play" }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Generation failed."); else setPlay(data.text);
    } catch { setError("Network error reaching the server route."); }
    finally { setLoading(false); }
  }

  async function refine(question) {
    if (!question.trim() || !play) return;
    setRefining(true);
    setThread((t) => [...t, { role: "you", text: question }]);
    setAsk("");
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ account, task: "refine", play, question }) });
      const data = await res.json();
      setThread((t) => [...t, { role: "grok", text: res.ok ? data.text : (data.error || "Refine failed.") }]);
    } catch { setThread((t) => [...t, { role: "grok", text: "Network error reaching the server route." }]); }
    finally { setRefining(false); }
  }

  const QUICK = ["Draft the outreach email", "Handle a price objection", "Make the opening sharper"];

  return (
    <>
      <div className="detail-head">
        <div>
          <div className="detail-name">{account.name}</div>
          <div className="detail-sub">{account.industry} · uses {account.products.map((p) => PRODUCTS[p].label).join(", ") || "nothing yet"}</div>
        </div>
        <span className={`tierpill ${TIER_CLASS[account.tier]}`} style={{ fontSize: 11 }}>{account.tier} · {account.score}</span>
      </div>

      <div className="facts">
        <div className="fact"><div className="fact-v">{account.contractors}</div><div className="fact-l">Contractors</div></div>
        <div className="fact"><div className="fact-v">{account.eorSeats}</div><div className="fact-l">EOR seats</div></div>
        <div className="fact"><div className="fact-v">{account.recentFullTimeHires}</div><div className="fact-l">New FT hires</div></div>
        <div className="fact"><div className="fact-v">{account.qoqGrowthPct}%</div><div className="fact-l">QoQ growth</div></div>
      </div>

      <div className="panel-label">Fired signals · {account.signals.length}{live && <span className="livedot"> ● live</span>}</div>
      {account.signals.length === 0 ? (
        <div className="sig"><div className="sig-detail">No expansion signals firing. Adjust the inputs or pick another account.</div></div>
      ) : (
        account.signals.map((s) => (
          <div key={s.id} className="sig">
            <div className="sig-top"><span className="sig-label">{s.label}</span><span className="sig-target">→ {s.targetLabel}</span></div>
            <div className="sig-detail">{s.detail}</div>
          </div>
        ))
      )}

      <button className="btn" onClick={generate} disabled={loading || account.signals.length === 0}>
        {loading ? "GROK IS REASONING…" : "▶ GENERATE EXPANSION PLAY (LIVE)"}
      </button>
      {loading && <div className="thinking"><span className="pulse" />Reasoning over {account.name}'s signal profile…</div>}
      {error && <div className="err">{error}</div>}

      {play && (
        <>
          <div className="play">
            <div className="play-head"><span>⚡ EXPANSION PLAY · {account.name.toUpperCase()}</span><span>via Grok</span></div>
            <div className="play-body">{play}</div>
          </div>
          <div className="refine">
            <div className="panel-label" style={{ marginTop: 16 }}>Work the play · ask Grok to refine it</div>
            <div className="quickrow">{QUICK.map((q) => <button key={q} className="quick" disabled={refining} onClick={() => refine(q)}>{q}</button>)}</div>
            {thread.map((m, i) => (
              <div key={i} className={`turn ${m.role}`}>
                <div className="turn-who">{m.role === "you" ? "YOU" : "GROK"}</div>
                <div className="turn-text">{m.text}</div>
              </div>
            ))}
            {refining && <div className="thinking"><span className="pulse" />Grok is responding…</div>}
            <div className="askrow">
              <input className="inp" placeholder="Ask anything: tighten it, change channel, draft a Slack message to the AM…"
                value={ask} onChange={(e) => setAsk(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") refine(ask); }} disabled={refining} />
              <button className="askbtn" onClick={() => refine(ask)} disabled={refining || !ask.trim()}>Send</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
