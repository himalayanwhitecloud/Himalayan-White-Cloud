export async function onRequestGet({ request, env }) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "");

  if (token !== env.PORTAL_TOKEN) {
    return new Response(JSON.stringify({ ok: false }), { status: 401 });
  }

  const data = await env.HWC_PORTAL.get("portal_state_v1");

  return new Response(JSON.stringify({
    ok: true,
    state: data ? JSON.parse(data) : null
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
