# Velora

An AI driving companion prototype: explainable route scoring, privacy-first sharing, and a real Claude-backed "Ask Velora" assistant.

## Structure

```
client/   Vite + React + TypeScript frontend (the phone-mockup UI)
server/   Express + TypeScript API — the only place the Anthropic key lives
```

`client` never talks to Anthropic directly. It calls `POST /api/ask-velora` on
`server`, which calls Claude if `ANTHROPIC_API_KEY` is set, and otherwise
falls back to the original rule-based logic — so the app works before you've
set up billing, and gets smarter the moment you add a key.

## Setup

```bash
npm install          # installs both workspaces
cp server/.env.example server/.env
```

Get an API key at **[console.anthropic.com](https://console.anthropic.com)**
→ Settings → API Keys → Create Key (needs a payment method on the account;
usage is pay-as-you-go). Paste it into `server/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Without a key, the app still runs — `AskVeloraSheet` shows a "Prototype
logic" badge instead of "Claude" on each answer.

### Real routing (Mapbox)

```bash
cp client/.env.example client/.env
```

Get a token at **[mapbox.com](https://mapbox.com)** → sign up (free tier is
generous) → Account → Tokens → copy the default public token (or create a
new one). Paste it into `client/.env`:

```
VITE_MAPBOX_TOKEN=pk.eyJ1...
```

Unlike the Anthropic key, Mapbox public tokens are designed to be used
client-side — just restrict the token to your domain(s) in the Mapbox
dashboard once you deploy, so nobody else can use your quota. Without a
token, the Journey screen falls back to the original mock ETA/distance
numbers — the illustrated road graphic is unaffected either way.

## Run

```bash
npm run dev
```

Starts both the API (`http://localhost:8787`) and the client (Vite will pick
5173 or the next free port — check the terminal output). Open the client URL
in your browser.

## Other commands

```bash
npm run typecheck   # tsc --noEmit for both workspaces
npm run build        # production build for both workspaces
```
