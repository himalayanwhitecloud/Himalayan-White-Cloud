import { getStore } from "@netlify/blobs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // basic auth (optional but recommended)
    const auth = event.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (process.env.PORTAL_TOKEN && token !== process.env.PORTAL_TOKEN) {
      return { statusCode: 401, body: JSON.stringify({ ok: false, message: "Unauthorized" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const state = body.state;

    if (!state) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, message: "Missing state" }) };
    }

    const store = getStore("hwc-portal");
    const key = "portal_state_v1";

    await store.set(key, JSON.stringify(state));

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, message: "Save failed" }) };
  }
}
