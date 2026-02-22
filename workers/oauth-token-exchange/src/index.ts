export interface Env {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID_WEB?: string;
  GITHUB_CLIENT_SECRET_WEB?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      const { code, redirect_uri, client_id } = await request.json();
      const workerClientId = env.GITHUB_CLIENT_ID_WEB ?? env.GITHUB_CLIENT_ID;
      const workerClientSecret =
        env.GITHUB_CLIENT_SECRET_WEB ?? env.GITHUB_CLIENT_SECRET;

      if (!code) {
        return Response.json({ error: "Missing code" }, { status: 400 });
      }
      if (!workerClientId || !workerClientSecret) {
        return Response.json(
          {
            error: "Worker OAuth credentials are not configured",
            error_description:
              "Set GITHUB_CLIENT_ID_WEB/GITHUB_CLIENT_SECRET_WEB or GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET.",
          },
          { status: 500 },
        );
      }
      if (client_id && client_id !== workerClientId) {
        return Response.json(
          {
            error: "client_id_mismatch",
            error_description:
              "The worker client_id does not match the web OAuth app client_id used for authorization.",
          },
          { status: 400 },
        );
      }

      // Exchange code for token with GitHub
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: workerClientId,
            client_secret: workerClientSecret,
            code,
            redirect_uri,
          }),
        },
      );

      const data = await response.json();

      // Forward GitHub's response (including errors)
      return Response.json(data, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return Response.json(
        { error: "Internal server error", details: String(error) },
        { status: 500 },
      );
    }
  },
};
