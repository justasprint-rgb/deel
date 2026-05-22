// app/page.jsx
"use client";

import { useState } from "react";
import { ACCOUNTS, PRODUCTS } from "../lib/accounts";

const TIER_CLASS = { HOT: "t-HOT", WARM: "t-WARM", COOL: "t-COOL", QUIET: "t-QUIET" };
const TIER_COLOR = { HOT: "var(--red)", WARM: "var(--amber)", COOL: "var(--blue)", QUIET: "var(--text3)" };

export default function Page() {
  const [selected, setSelected] = useState(ACCOUNTS[0]);
  const [play, setPlay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function pick(a) {
    setSelected(a);
    setPlay(null);
    setError(null);
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setPlay(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed.");
      } else {
        setPlay(data.text);
      }
    } catch (e) {
      setError("Network error reaching the server route.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <header className="head">
        <div>
          <div className="brand"><span className="mark">◳</span> EXPANSION SIGNAL ENGINE</div>
          <div className="tagline">
            Listens for the moment an account reveals it needs the next product in Deel's suite,
            then routes the expansion play to an owner while the signal is hot.
          </div>
        </div>
        <div className="head-meta">
          THESIS · cross-sell drives NRR<br />
          ENGINE · event-driven, not static scoring<br />
          MODEL · <span className="live">Grok (live, server-side)</span><br />
          <a href="/pitch" className="live" style={{ textDecoration: "none" }}>← read the pitch</a>
        </div>
      </header>

      <div className="banner">
        <b>Read me first.</b> Account rows below are illustrative, not real Deel data. The signal logic and
        the product-sequence reasoning are production-real. A live deployment wires these same signals into
        Deel's actual product-usage events. The expansion play is generated live by Grok when you click.
      </div>

      <div className="cols">
        {/* LEFT: ranked accounts */}
        <div className="panel">
          <div className="panel-label">Accounts · ranked by expansion-readiness</div>
          {ACCOUNTS.map((a) => (
            <button
              key={a.id}
              className={`acct ${selected.id === a.id ? "sel" : ""}`}
              onClick={() => pick(a)}
            >
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
                <div className="chips">
                  {a.signals.map((s) => (
                    <span key={s.id} className="chip">→ {PRODUCTS[s.target].label}</span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* RIGHT: detail + live play */}
        <div className="panel">
          {!selected ? (
            <div className="empty"><div className="empty-mark">◳</div>Select an account.</div>
          ) : (
            <>
              <div className="detail-head">
                <div>
                  <div className="detail-name">{selected.name}</div>
                  <div className="detail-sub">{selected.industry} · uses {selected.products.map((p) => PRODUCTS[p].label).join(", ")}</div>
                </div>
                <span className={`tierpill ${TIER_CLASS[selected.tier]}`} style={{ fontSize: 11 }}>
                  {selected.tier} · {selected.score}
                </span>
              </div>

              <div className="facts">
                <div className="fact"><div className="fact-v">{selected.contractors}</div><div className="fact-l">Contractors</div></div>
                <div className="fact"><div className="fact-v">{selected.eorSeats}</div><div className="fact-l">EOR seats</div></div>
                <div className="fact"><div className="fact-v">{selected.recentFullTimeHires}</div><div className="fact-l">New FT hires</div></div>
                <div className="fact"><div className="fact-v">{selected.qoqGrowthPct}%</div><div className="fact-l">QoQ growth</div></div>
              </div>

              <div className="panel-label">Fired signals · {selected.signals.length}</div>
              {selected.signals.length === 0 ? (
                <div className="sig"><div className="sig-detail">No expansion signals firing. Account is well-matched to current products.</div></div>
              ) : (
                selected.signals.map((s) => (
                  <div key={s.id} className="sig">
                    <div className="sig-top">
                      <span className="sig-label">{s.label}</span>
                      <span className="sig-target">→ {s.targetLabel}</span>
                    </div>
                    <div className="sig-detail">{s.detail}</div>
                  </div>
                ))
              )}

              <button className="btn" onClick={generate} disabled={loading || selected.signals.length === 0}>
                {loading ? "GROK IS REASONING…" : "▶ GENERATE EXPANSION PLAY (LIVE)"}
              </button>

              {loading && (
                <div className="thinking"><span className="pulse" />Reasoning over {selected.name}'s signal profile…</div>
              )}

              {error && <div className="err">{error}</div>}

              {play && (
                <div className="play">
                  <div className="play-head">
                    <span>⚡ EXPANSION PLAY · {selected.name.toUpperCase()}</span>
                    <span>via Grok</span>
                  </div>
                  <div className="play-body">{play}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <footer className="foot">
        <span>Expansion Signal Engine · event-driven cross-sell intelligence · illustrative data, production-real logic</span>
        <span className="name">[YOUR NAME]</span>
      </footer>
    </div>
  );
}
