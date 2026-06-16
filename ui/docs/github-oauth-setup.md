# GitHub OAuth Setup

GitHub OAuth is **optional** — the dashboard works with pincode login alone.
It's only needed for authenticated GitHub API calls (5000 req/hr vs 60 unauthenticated).

## Zero-Setup (Way-Of Team)

The npm package ships with **Way-Of org's shared OAuth App** pre-configured:
- Client ID: `Ov23liy3r3AGOFaXT6YV`
- Callback URL: `http://localhost:6969/api/auth/callback/github`

**Just run `wodev` and click "Sign in with GitHub"** — works out of the box.

## Required: Organization Admin Approval

**An org admin must approve the OAuth App once:**

1. Go to: `https://github.com/organizations/Way-Of/settings/oauth_application_policy`
2. Find **WayOfDev CTO Dashboard** (Client ID: `Ov23liy3r3AGOFaXT6YV`)
3. Click **Approve**

Without this, GitHub API returns 403 and developers can't be fetched from f-rr-d.

## Custom OAuth (For Other Companies)

Each company deploys their own OAuth App:

```bash
# Configure custom OAuth
wodev --setup
# Enter your Client ID and Client Secret
```

**Required settings:**
| Field | Value |
|-------|-------|
| Application name | `YourCompany CTO Dashboard` |
| Homepage URL | `http://localhost:6969` |
| Authorization callback URL | `http://localhost:6969/api/auth/callback/github` |

## Scopes Requested

| Scope | Purpose |
|-------|---------|
| `read:user` | Profile info |
| `user:email` | Email address |
| `repo` | **Required** for private f-rr-d repo access |

## Without GitHub Auth

The dashboard works fine without GitHub login:
- Use **pincode login** with your GitHub username
- Tickets load from local `thoughts/` or GitHub (unauthenticated, 60 req/hr)
- All other features work normally

## Troubleshooting

| Error | Solution |
|-------|----------|
| `redirect_uri_mismatch` | Callback URL in GitHub OAuth App must match exactly |
| 403 Forbidden fetching developers | Org admin must approve OAuth App in org settings |
| "No developer matched" | GitHub username must match `githubUsername` in f-rr-d config.md |

## See Also

- [Login Guide](login.md) — Complete login methods and user roles
- [Architecture](architecture.md) — System overview