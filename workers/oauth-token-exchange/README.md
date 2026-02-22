# awesomegithubapp-api

Cloudflare Worker for handling GitHub OAuth token exchange.

## Purpose

This Worker proxies OAuth token exchange requests to GitHub, keeping the client secret secure and handling CORS for the web app.

## Setup

1. Copy `.env.example` to `.env`
2. Add your GitHub OAuth credentials:
   ```
   GITHUB_CLIENT_ID=your_web_client_id
   GITHUB_CLIENT_SECRET=your_web_client_secret
   ```

## Development

```bash
bun install
bun run dev
```

## Deployment

### Development (with .env file)

```bash
bun run deploy
```

### Production (using secrets)

```bash
# Set secrets in Cloudflare
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET

# Deploy
bun run deploy:prod
```

The worker will be deployed at: `https://awesomegithubapp-api.workers.dev`

## API Endpoint

### POST /token

Exchange an OAuth code for an access token.

**Request:**

```json
{
  "code": "github_oauth_code",
  "redirect_uri": "http://localhost:8081/oauth/callback"
}
```

**Response:**

```json
{
  "access_token": "github_access_token",
  "token_type": "bearer",
  "scope": "read:user,user:email,repo,notifications,workflow"
}
```

**Error Response:**

```json
{
  "error": "error_description",
  "error_description": "details",
  "error_uri": "https://docs.github.com/..."
}
```
