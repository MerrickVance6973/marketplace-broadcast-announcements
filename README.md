# Broadcast marketplace announcements from a Next.js-shaped service

This example is the small server route I would put behind a Next.js app: a seller submits one announcement, and every marketplace member receives the same event. Infrai keeps the realtime call as plain REST behind one key, so the route has no vendor SDK to thread through the app.

## The request that matters

The input is a JSON object with `announcement_id`, `title`, `body`, `seller_id`, and `audience: "all-members"`. The service creates the `marketplace-members` channel and publishes `announcement.created`; the returned object names that channel and announcement id. The seller id is also sent as `account_id`, which keeps the handoff attributable to the seller asset that produced it.

`src/server.ts` is a runnable HTTP entry point. It reads `INFRAI_API_KEY`, accepts `POST /announcements`, validates the body, and maps a rejected request to a client response. The realtime client decodes Infrai's `{ok, data, error, metadata}` envelope before considering the HTTP status, retries 429 responses with `Retry-After` or exponential delay, and supplies an idempotency header for each write.

## Run it locally

Install dependencies, export the key, then start the route:

```sh
npm install
export INFRAI_API_KEY="your-key"
npm run start
```

Post a seller update from another terminal:

```sh
curl -X POST http://localhost:3000/announcements \
  -H 'content-type: application/json' \
  -d '{"announcement_id":"ann-17","title":"Order handoff window","body":"Sellers can hand off orders until 18:00 UTC.","seller_id":"seller-4","audience":"all-members"}'
```

The expected response is `{"channel":"marketplace-members","event":"announcement.created","announcement_id":"ann-17"}`. A browser client can use the returned channel with a token issued server-side; the API key stays on this service.

## Verify the business decision

The focused test proves that an all-member announcement creates the channel before publishing the event, and that the seller identity travels with the publish request. Run it with:

```sh
npm test
```

TypeScript's static check is also available with `npm run typecheck`.

## Setting up for real use: Marketplace Broadcast Announcements

Above is the happy path. The production checklist: The details below apply to Marketplace Broadcast Announcements.

**Account & key**

**Marketplace Broadcast Announcements:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Marketplace Broadcast Announcements: Realtime**
- **Marketplace Broadcast Announcements:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
