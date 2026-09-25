import { createServer } from "node:http";
import { InfraiRealtime, InfraiError } from "./infrai_realtime.js";
import { broadcastAnnouncement } from "./marketplace_broadcast.js";

const apiKey = process.env.INFRAI_API_KEY;
if (!apiKey) throw new Error("INFRAI_API_KEY is required");
const realtime = new InfraiRealtime(apiKey);

createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/announcements") {
    response.writeHead(404).end();
    return;
  }
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const result = await broadcastAnnouncement(realtime, JSON.parse(Buffer.concat(chunks).toString("utf8")));
    response.writeHead(201, { "content-type": "application/json" }).end(JSON.stringify(result));
  } catch (error) {
    const status = error instanceof InfraiError && error.status < 500 ? error.status : 400;
    response.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify({ error: error instanceof Error ? error.message : "Invalid request" }));
  }
}).listen(Number(process.env.PORT ?? 3000));
