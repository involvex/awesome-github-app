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
      const { code, redirect_uri, client_id, code_verifier } =
        await request.json();
      const credentialPairs = [
        {
          clientId: env.GITHUB_CLIENT_ID_WEB,
          clientSecret: env.GITHUB_CLIENT_SECRET_WEB,
        },
        {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      ].filter(pair => pair.clientId && pair.clientSecret);

      const selectedPair = client_id
        ? credentialPairs.find(pair => pair.clientId === client_id)
        : credentialPairs[0];
      const workerClientId = selectedPair?.clientId;
      const workerClientSecret = selectedPair?.clientSecret;

      if (!code) {
        return Response.json({ error: "Missing code" }, { status: 400 });
      }
      if (!workerClientId || !workerClientSecret) {
        return Response.json(
          {
            error: "Worker OAuth credentials are not configured",
            error_description:
              "Set worker OAuth credentials for the requested client ID (WEB/EXPO_GO or fallback GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET).",
          },
          { status: 500 },
        );
      }
      if (client_id && client_id !== workerClientId) {
        return Response.json(
          {
            error: "client_id_mismatch",
            error_description:
              "The worker does not have matching credentials for the OAuth client_id used for authorization.",
          },
          { status: 400 },
        );
      }
      if (client_id && !code_verifier) {
        return Response.json(
          {
            error: "missing_code_verifier",
            error_description:
              "The token request is missing PKCE code_verifier. Redeploy both app and worker with the latest OAuth changes.",
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
            ...(code_verifier ? { code_verifier } : {}),
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
