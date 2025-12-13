export async function onRequestPost({ request, env }) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "");

  if (token !== env.PORTAL_TOKEN) {
    return new Response(JSON.stringify({ ok: false }), { status: 401 });
  }

  const { state } = await request.json();
  if (!state) {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }

  await env.HWC_PORTAL.put("portal_state_v1", JSON.stringify(state));

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
