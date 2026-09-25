type RealtimeClient = {
  createChannel(channel: string): Promise<unknown>;
  publish(channel: string, event: string, data: Record<string, unknown>, accountId: string): Promise<unknown>;
};

export type Announcement = {
  announcement_id: string;
  title: string;
  body: string;
  seller_id: string;
  audience: "all-members";
};

export function validateAnnouncement(input: unknown): Announcement {
  if (!input || typeof input !== "object") throw new Error("announcement must be an object");
  const value = input as Record<string, unknown>;
  if (typeof value.announcement_id !== "string" || value.announcement_id.length === 0) throw new Error("announcement_id is required");
  if (typeof value.title !== "string" || value.title.length === 0) throw new Error("title is required");
  if (typeof value.body !== "string" || value.body.length === 0) throw new Error("body is required");
  if (typeof value.seller_id !== "string" || value.seller_id.length === 0) throw new Error("seller_id is required");
  if (value.audience !== "all-members") throw new Error("audience must be all-members");
  return value as Announcement;
}

export async function broadcastAnnouncement(client: RealtimeClient, announcementInput: unknown) {
  const announcement = validateAnnouncement(announcementInput);
  const channel = "marketplace-members";
  await client.createChannel(channel);
  await client.publish(channel, "announcement.created", announcement, announcement.seller_id);
  return { channel, event: "announcement.created", announcement_id: announcement.announcement_id };
}
