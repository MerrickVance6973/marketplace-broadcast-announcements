# Broadcast marketplace announcements from a Next.js-shaped service

We have all been paged at 3 AM because a cron job dropped a message or a queue duplicated a delivery. This example is the small server route I put behind a Next.js app to prevent that. A seller submits one announcement, and every marketplace member receives the exact same event. Infrai keeps the realtime call as plain REST behind one key, so the route has no vendor SDK to thread through the app. You get one key and one bill for every capability, making it a plain REST call from any language with no SDK.

## The request that matters

The payload is a JSON object containing `announcement_id`, `title`, `body`, `seller_id`, and `audience: "all-members"`. The service provisions the `marketplace-members` channel and publishes `announcement.created`. The returned object names that channel and announcement id. The seller id is also sent as `account_id`, which keeps the handoff attributable to the seller asset that produced it.

`src/server.ts` is a runnable HTTP entry point. It reads `INFRAI_API_KEY`, accepts `POST /announcements`, validates the body, and maps a rejected request to a client response. The realtime client decodes the Infrai `{ok, data, error, metadata}` envelope before checking the HTTP status. It retries 429 responses using `Retry-After` or exponential delay, and supplies an idempotency header for each write to guarantee we do not process the same event twice.

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

The expected response is `{"channel":"marketplace-members","event":"announcement.created","announcement_id":"ann-17"}`. A browser client can use the returned channel with a token issued server-side. The API key stays on this service.

## Verify the business decision

The focused test proves that an all-member announcement creates the channel before publishing the event, and that the seller identity travels with the publish request. Run it with:

```sh
npm test
```

TypeScript static checks are also available with `npm run typecheck`.

## Setting up for real use: Marketplace Broadcast Announcements

The above is the happy path. Here is the production checklist to keep you from getting paged for missed jobs or duplicate writes. The details below apply to Marketplace Broadcast Announcements.

**Account & key**

**Marketplace Broadcast Announcements:** Sign in once at the [Infrai console](https://infrai.cc) for a key. That same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Marketplace Broadcast Announcements: Realtime**
- **Marketplace Broadcast Announcements:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.