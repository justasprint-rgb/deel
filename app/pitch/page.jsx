// app/pitch/page.jsx
"use client";

import { useEffect } from "react";

export default function Pitch() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("vis")),
      { threshold: 0.18 }
    );
    document.querySelectorAll(".rv").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="pitch">
      <style>{CSS}</style>

      {/* progress rail */}
      <div className="rail">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="raildot" title={s.label} />
        ))}
      </div>

      {/* HERO */}
      <section id="hero" className="hero">
        <div className="kicker">FOR DEEL · GHOSTBUSTER SUBMISSION</div>
        <h1>The Expansion<br /><span>Signal Engine</span></h1>
        <p className="sub">
          Deel's fastest growth is not a new product or a new market. It is the next product sold into a
          customer who already trusts you. This is the system that hears the moment they are ready, and routes
          the play before the moment passes.
        </p>
        <div className="herobtns">
          <a href="/" className="btn primary">▶ Open the live engine</a>
          <a href="#problem" className="btn ghost">Read the thinking ↓</a>
        </div>
        <div className="pillars">
          <span>EXECUTION WITH AI</span><i>·</i><span>DISPROPORTIONATE IMPACT</span><i>·</i><span>SPEED</span>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" className="sec rv">
        <div className="seckick">01 / THE PROBLEM</div>
        <h2>The most valuable growth lever at Deel is the one nobody owns.</h2>
        <p className="lead">
          New-logo sales chases fresh logos. Customer success defends renewals. Product ships features.
          The motion of "this account uses EOR but not IT, here is why it is ready, here is who acts" falls
          between all of them. It is real revenue, sitting unowned, because expansion is everyone's upside
          and no one's job.
        </p>
        <div className="cards3">
          <div className="card">
            <div className="cardv">66%</div>
            <div className="cardl">higher retention for multi-product customers vs single-product</div>
          </div>
          <div className="card">
            <div className="cardv">27%</div>
            <div className="cardl">of SaaS companies have any structured way to measure cross-sell</div>
          </div>
          <div className="card">
            <div className="cardv">#1</div>
            <div className="cardl">reason reviewers stay on Deel despite price: consolidation</div>
          </div>
        </div>
        <p className="lead dim">
          Deel's most-loved attribute, the all-in-one suite, is the exact mechanism expansion runs on.
          The strength and the opportunity are the same thing. It is just not instrumented.
        </p>
      </section>

      {/* WHY THIS */}
      <section id="why" className="sec rv">
        <div className="seckick">02 / WHY THIS, NOT THE OBVIOUS THINGS</div>
        <h2>I pressure-tested four levers. Three collapse. One compounds.</h2>
        <div className="elim">
          <div className="elimrow out">
            <span className="elimx">✕</span>
            <div><b>Cost.</b> Deel already runs ~85% gross margins, EBITDA positive since 2022. Optimizing cost fights for basis points.</div>
          </div>
          <div className="elimrow out">
            <span className="elimx">✕</span>
            <div><b>Turnaround time.</b> The payment-delivery pain is real, but fixing it means owning payment rails: a multi-year capital project, not a fast win.</div>
          </div>
          <div className="elimrow out">
            <span className="elimx">✕</span>
            <div><b>New products / channels.</b> Deel already launched IT, Mobility, Benefits, Hire. A ninth product is incremental, and new-logo acquisition keeps getting more expensive.</div>
          </div>
          <div className="elimrow in">
            <span className="elimcheck">✓</span>
            <div><b>Retention through expansion.</b> The one lever that compounds, ties directly to valuation, and weaponizes a strength Deel already has. This is the choice.</div>
          </div>
        </div>
        <p className="lead dim">
          And one honest reframe I would say out loud, not hide: the payment complaints I found are a separate
          trust problem, not the expansion mechanism. Forcing them together is where weaker analysis breaks.
          Kept separate, expansion stands on its own.
        </p>
      </section>

      {/* IMPACT */}
      <section id="impact" className="sec rv">
        <div className="seckick">03 / DISPROPORTIONATE IMPACT</div>
        <h2>Expansion moves Net Revenue Retention, and NRR moves valuation more than anything else.</h2>
        <div className="impactgrid">
          <div className="impactbig">
            <div className="impactnum">+20 to 30%</div>
            <div className="impactcap">valuation uplift per <b>10-point NRR improvement</b></div>
          </div>
          <div className="impactchain">
            <div className="chainstep">Consolidation is the strength</div>
            <div className="chainarrow">↓</div>
            <div className="chainstep">Multi-product adoption is the mechanism</div>
            <div className="chainarrow">↓</div>
            <div className="chainstep">NRR is the metric</div>
            <div className="chainarrow">↓</div>
            <div className="chainstep hot">Valuation is the prize</div>
          </div>
        </div>
        <p className="lead">
          For a company valued in the tens of billions, ten points of NRR is measured in billions of enterprise
          value. No cost cut and no ninth product is in that weight class. The engine does not chase one deal;
          it makes every expansion-ready account in the entire base visible and actionable at once. That is the
          definition of disproportionate: small input, base-wide leverage.
        </p>
      </section>

      {/* AI */}
      <section id="ai" className="sec rv">
        <div className="seckick">04 / AI, IN BUILDING AND IN EXECUTION</div>
        <h2>AI did the work to find this, and AI does the work inside the product.</h2>
        <div className="split">
          <div className="splitcol">
            <div className="splittag build">IN THE BUILDING</div>
            <ul className="ailist">
              <li>Classified 659 scraped reviews into categories and corridors</li>
              <li>Ran competitive research across the EOR field (Rippling, Remote, Papaya, G-P)</li>
              <li>Built the risk and signal models that rank accounts</li>
              <li>Wrote and shipped this working application</li>
            </ul>
          </div>
          <div className="splitcol">
            <div className="splittag exec">IN THE EXECUTION</div>
            <ul className="ailist">
              <li>Grok reasons live over each account's real signal profile</li>
              <li>It picks the next-best product and drafts the play on demand</li>
              <li>Event-driven reasoning, not a static template or a prompt wrapper</li>
              <li>Account data is illustrative; the logic and reasoning are production-real</li>
            </ul>
          </div>
        </div>
        <p className="lead dim">
          The point Artan made was "execution especially using AI." Not AI as decoration. AI as the thing that
          actually does the cognitive labor, on both sides: finding the opportunity, and acting on it.
        </p>
      </section>

      {/* SPEED */}
      <section id="speed" className="sec rv">
        <div className="seckick">05 / SPEED, IN BUILDING AND IN ACTION</div>
        <h2>Built in under a day. Acts in the moment, not the quarter.</h2>
        <div className="split">
          <div className="splitcol">
            <div className="splittag build">SPEED OF BUILDING</div>
            <div className="bignum">&lt; 24h</div>
            <p className="splitp">
              Scrape to classification to competitive research to risk model to a deployed, working tool. One
              person, one day. That is the operating tempo this role is described around.
            </p>
          </div>
          <div className="splitcol">
            <div className="splittag exec">SPEED OF ACTION</div>
            <div className="bignum">90d → now</div>
            <p className="splitp">
              Traditional cross-sell waits for a quarterly business review, up to 90 days of latency. The engine
              fires on the usage event itself, collapsing time-to-play from a quarter to the moment the signal
              appears. The signal and the seller finally meet.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="sec rv cta">
        <div className="seckick">06 / SEE IT RUN</div>
        <h2>The thinking is the easy half. Here is the working half.</h2>
        <p className="lead">
          The live engine ranks a set of illustrative Deel-style accounts by expansion-readiness, shows the
          exact usage signals that fired, and generates the cross-sell play in real time with Grok. Open a HOT
          account and run it.
        </p>
        <a href="/" className="btn primary big">▶ Open the live engine</a>
      </section>

      <footer className="foot">
        <span>Expansion Signal Engine · problem found, solution built, in under 24 hours</span>
        <span className="name">[YOUR NAME]</span>
      </footer>
    </div>
  );
}

const SECTIONS = [
  { id: "hero", label: "Top" },
  { id: "problem", label: "Problem" },
  { id: "why", label: "Why this" },
  { id: "impact", label: "Impact" },
  { id: "ai", label: "AI" },
  { id: "speed", label: "Speed" },
  { id: "cta", label: "Live tool" },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

.pitch {
  --bg:#0a0e0f; --surface:#0d1213; --border:#1c2628; --text:#c8d2d0;
  --text2:#8a9794; --text3:#5a6b6e; --accent:#22e0a1; --accent-dim:#11201d;
  --amber:#ff9f1c; --red:#ff3b47;
  --mono:'IBM Plex Mono',monospace; --sans:'IBM Plex Sans',sans-serif;
  background:var(--bg); color:var(--text); font-family:var(--sans);
  line-height:1.6; min-height:100vh; overflow-x:hidden;
}
.pitch * { box-sizing:border-box; }
.pitch a { text-decoration:none; }

.rail { position:fixed; right:22px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:11px; z-index:40; }
.raildot { width:9px; height:9px; border-radius:50%; background:var(--border); transition:all .25s; }
.raildot:hover { background:var(--accent); box-shadow:0 0 9px rgba(34,224,161,.5); }
@media (max-width:760px){ .rail{ display:none; } }

.hero { max-width:920px; margin:0 auto; padding:140px 28px 90px; }
.kicker { font-family:var(--mono); font-size:11px; letter-spacing:3px; color:var(--accent); margin-bottom:22px; }
.hero h1 { font-size:62px; font-weight:700; line-height:1.04; letter-spacing:-1.5px; margin:0 0 26px; color:#fff; }
.hero h1 span { color:var(--accent); }
.sub { font-size:18px; line-height:1.7; color:var(--text2); max-width:660px; margin:0 0 34px; }
.herobtns { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:46px; }
.btn { font-family:var(--mono); font-size:13px; font-weight:600; letter-spacing:.5px; padding:13px 22px; border-radius:7px; display:inline-block; transition:all .2s; }
.btn.primary { background:var(--accent); color:#06110d; }
.btn.primary:hover { box-shadow:0 0 24px rgba(34,224,161,.35); transform:translateY(-1px); }
.btn.ghost { background:transparent; color:var(--text2); border:1px solid var(--border); }
.btn.ghost:hover { border-color:var(--accent); color:var(--accent); }
.btn.big { font-size:15px; padding:16px 30px; }
.pillars { display:flex; align-items:center; gap:14px; flex-wrap:wrap; font-family:var(--mono); font-size:11px; letter-spacing:2px; color:var(--text3); }
.pillars i { color:var(--accent); font-style:normal; }

.sec { max-width:920px; margin:0 auto; padding:80px 28px; border-top:1px solid var(--border); opacity:0; transform:translateY(22px); transition:opacity .6s ease, transform .6s ease; }
.sec.vis { opacity:1; transform:none; }
.seckick { font-family:var(--mono); font-size:11px; letter-spacing:3px; color:var(--text3); margin-bottom:16px; }
.sec h2 { font-size:30px; font-weight:700; line-height:1.2; letter-spacing:-.6px; color:#fff; margin:0 0 22px; }
.lead { font-size:16px; line-height:1.75; color:var(--text); max-width:740px; margin:0 0 18px; }
.lead.dim { color:var(--text2); font-size:14.5px; }

.cards3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin:26px 0; }
.card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:22px; }
.cardv { font-family:var(--mono); font-size:38px; font-weight:600; color:var(--accent); line-height:1; margin-bottom:12px; }
.cardl { font-size:13px; color:var(--text2); line-height:1.5; }

.elim { display:flex; flex-direction:column; gap:10px; margin:24px 0; }
.elimrow { display:grid; grid-template-columns:30px 1fr; gap:14px; align-items:start; padding:16px 18px; border-radius:10px; border:1px solid var(--border); background:var(--surface); font-size:14.5px; line-height:1.6; }
.elimrow.out { opacity:.62; }
.elimrow.in { border-color:var(--accent); background:var(--accent-dim); opacity:1; }
.elimx { color:var(--red); font-size:18px; }
.elimcheck { color:var(--accent); font-size:18px; }
.elimrow b { color:#fff; }

.impactgrid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin:26px 0; align-items:center; }
.impactbig { background:var(--surface); border:1px solid var(--accent); border-radius:12px; padding:34px; text-align:center; }
.impactnum { font-family:var(--mono); font-size:46px; font-weight:600; color:var(--accent); line-height:1; margin-bottom:14px; }
.impactcap { font-size:14px; color:var(--text2); }
.impactcap b { color:#fff; }
.impactchain { display:flex; flex-direction:column; gap:8px; }
.chainstep { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:12px 16px; font-family:var(--mono); font-size:13px; text-align:center; color:var(--text2); }
.chainstep.hot { border-color:var(--accent); color:var(--accent); font-weight:600; }
.chainarrow { text-align:center; color:var(--text3); font-size:14px; }

.split { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin:24px 0; }
.splitcol { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:24px; }
.splittag { font-family:var(--mono); font-size:11px; letter-spacing:2px; margin-bottom:16px; padding:4px 9px; border-radius:5px; display:inline-block; }
.splittag.build { background:var(--accent-dim); color:var(--accent); }
.splittag.exec { background:#2a1c08; color:var(--amber); }
.ailist { list-style:none; padding:0; margin:0; }
.ailist li { font-size:14px; color:var(--text2); line-height:1.5; padding:9px 0 9px 22px; position:relative; border-bottom:1px solid var(--border); }
.ailist li:last-child { border-bottom:none; }
.ailist li:before { content:"▹"; position:absolute; left:0; color:var(--accent); }
.bignum { font-family:var(--mono); font-size:42px; font-weight:600; color:#fff; margin-bottom:14px; }
.splitp { font-size:13.5px; color:var(--text2); line-height:1.6; margin:0; }

.cta { text-align:center; }
.cta .lead { margin-left:auto; margin-right:auto; }
.cta .btn { margin-top:14px; }

.foot { max-width:920px; margin:0 auto; padding:40px 28px 70px; border-top:1px solid var(--border); display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; font-family:var(--mono); font-size:11px; color:var(--text3); }
.foot .name { color:var(--text2); letter-spacing:1px; }

@media (max-width:760px){
  .hero h1 { font-size:42px; }
  .cards3, .impactgrid, .split { grid-template-columns:1fr; }
}
`;
