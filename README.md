# Expansion Signal Engine

Event-driven cross-sell intelligence for Deel's product suite. It listens for the moment an account reveals (through its own usage) that it is ready for the next product in Deel's graph, then generates the expansion play live using Grok.

## The thesis

Expansion (selling the next product into an existing account) is the highest-leverage growth lever in SaaS, because it drives Net Revenue Retention, the metric most tied to valuation. Deel's most-loved attribute, consolidation, is the mechanism. This tool turns cross-sell from a static scoring sheet into an event-driven engine: the signal and the seller finally meet.

## What is real vs illustrative

- **Illustrative:** the account rows in `lib/accounts.js` are synthetic, plausible Deel-style accounts. Not real customer data.
- **Production-real:** the signal logic (the usage events that reveal next-product readiness) and the product-sequence reasoning.
- **Live:** the expansion play is generated in real time by Grok via a secure server route. The key never touches the browser.

## Stack

Next.js 14 (App Router) + a single serverless API route. No database. Deploys clean to Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local      # then paste your real key into .env.local
npm run dev                      # http://localhost:3000
```

## Deploy to Vercel via GitHub

1. Create a new GitHub repo and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Expansion Signal Engine"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. Go to vercel.com, **Add New > Project**, import the repo. Framework preset auto-detects Next.js. Click Deploy.
3. After the first deploy, open **Project > Settings > Environment Variables** and add:
   - Name: `XAI_API_KEY`
   - Value: your key from https://console.x.ai
   - Apply to Production, Preview, Development.
4. **Redeploy** (Deployments tab > latest > Redeploy) so the new env var is picked up.

That is it. The live URL works for anyone; the key stays server-side.

## Changing the model

The model string lives in one place: the `MODEL` constant at the top of `app/api/generate/route.js`. It is set to `grok-4`. If your key targets a different model, change that one line.

## File map

```
app/
  layout.jsx            shell + metadata
  page.jsx              the Engine UI (client component)
  globals.css           styling
  api/generate/route.js secure serverless route -> Grok
lib/
  accounts.js           synthetic accounts + signal logic
.env.example            key placeholder
next.config.js
```

## Notes for the demo

- Driving it live (clicking Generate) shows Grok reasoning over each account's real signal profile and drafting the play. That is the AI-execution moment.
- The honesty banner is intentional. It states plainly what is illustrative and what is real, which is more credible than faking a data feed.
