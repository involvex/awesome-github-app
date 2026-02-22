export async function POST(request: Request): Promise<Response> {
  const { code, client_id, client_secret, redirect_uri } = await request.json();

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ client_id, client_secret, code, redirect_uri }),
  });

  const data = await response.json();
  return Response.json(data);
}
