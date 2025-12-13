export async function onRequestPost({ request, env }) {
  try {
    const { email, password } = await request.json();

    if (
      email === env.ADMIN_EMAIL &&
      password === env.ADMIN_PASSWORD
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          token: env.PORTAL_TOKEN
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Invalid credentials" }),
      { status: 401 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500 }
    );
  }
}
