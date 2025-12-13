export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email, password } = JSON.parse(event.body || "{}");

    // ✅ Change these to your own admin/staff login
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASS  = process.env.ADMIN_PASS;

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      // simple “token” (not a real JWT)
      // good for basic gatekeeping on a static site
      const token = "hwc_" + Date.now();

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, token })
      };
    }

    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, message: "Invalid email or password." })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Server error." }) };
  }
}
