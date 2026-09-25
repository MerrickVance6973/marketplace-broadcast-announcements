import assert from "node:assert/strict";
import { broadcastAnnouncement } from "./marketplace_broadcast.js";

const calls: unknown[][] = [];
const fakeClient = {
  async createChannel(channel: string) { calls.push(["create", channel]); },
  async publish(channel: string, event: string, data: unknown, accountId: string) { calls.push(["publish", channel, event, data, accountId]); }
};

const result = await broadcastAnnouncement(fakeClient, {
  announcement_id: "ann-17",
  title: "Order handoff window",
  body: "Sellers can hand off orders until 18:00 UTC.",
  seller_id: "seller-4",
  audience: "all-members"
});
assert.deepEqual(result, { channel: "marketplace-members", event: "announcement.created", announcement_id: "ann-17" });
assert.equal(calls.length, 2);
assert.equal((calls[1] as unknown[])[2], "announcement.created");
console.log("broadcast decision test passed");
