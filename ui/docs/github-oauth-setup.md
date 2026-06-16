# GitHub OAuth Setup

GitHub OAuth is **optional** — the dashboard works with pincode login alone.
It's only needed for authenticated GitHub API calls (5000 req/hr vs 60 unauthenticated).

**Each user needs their own OAuth App** because GitHub requires a single fixed
callback URL, and every machine's `localhost` is different.

## 1. Create Your OAuth App

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:

| Field | Value |
|-------|-------|
| Application name | `WayOfDev CTO Dashboard` (or anything) |
| Homepage URL | `http://localhost:6969` |
| Authorization callback URL | `http://localhost:6969/api/auth/callback/github` |
4. Click **Register application**
5. Copy **Client ID** and generate **Client Secret**

## 2. Configure via wodev

```bash
wodev --setup
```

Enter your Client ID and Client Secret when prompted. Credentials are saved to
`~/.config/wodev/.env` and auto-loaded on every run.

## 3. Rebuild & Start

```bash
sudo wodev --build   # only needed after npm update
wodev
```

## Scopes Requested

- `read:user` — profile info
- `user:email` — email address
- `repo` — **required** for private f-rr-d repo ticket fetching

## Without GitHub Auth

The dashboard works fine without GitHub login:
- Use the **pincode login** with your GitHub username
- Tickets show from local `thoughts/` directory (not GitHub API)
- All other features work normally

## Troubleshooting

| Error | Solution |
|-------|----------|
| `redirect_uri_mismatch` | Callback URL in GitHub OAuth App must match exactly |

---