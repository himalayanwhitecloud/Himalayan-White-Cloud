import { getStore } from "@netlify/blobs";

export async function handler(event) {
  try {
    // basic auth (optional but recommended)
    const auth = event.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (process.env.PORTAL_TOKEN && token !== process.env.PORTAL_TOKEN) {
      return { statusCode: 401, body: JSON.stringify({ ok: false, message: "Unauthorized" }) };
    }

    const store = getStore("hwc-portal");
    const key = "portal_state_v1";

    const raw = await store.get(key);
    if (!raw) {
      // return an empty default
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, state: null })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, state: JSON.parse(raw) })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, message: "Load failed" }) };
  }
}
