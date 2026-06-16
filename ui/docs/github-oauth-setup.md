# GitHub OAuth App Setup

Required for private `f-rr-d` repo access (5000 req/hr vs 60 unauthenticated).

## 1. Create OAuth App

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:

| Field | Value |
|-------|-------|
| Application name | `WayOfDev CTO Dashboard` (or your org name) |
| Homepage URL | `http://localhost:6969` (dev) or `https://your-domain.com` (prod) |

| Authorization callback URL | `http://localhost:6969/api/auth/callback/github` (dev) or `https://your-domain.com/api/auth/callback/github` (prod) |
4. Click **Register application**
5. Copy **Client ID** and generate **Client Secret**

## 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
GITHUB_CLIENT_ID=your_client_id_from_step_5
GITHUB_CLIENT_SECRET=your_client_secret_from_step_5
NEXTAUTH_SECRET=openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:6969
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## 3. Verify Scopes

The app requests these scopes:
- `read:user` - Read user profile
- `user:email` - Read user email
- `repo` - **Required for private repo access** (f-rr-d)

## 4. Test

```bash
pnpm dev
# Open http://localhost:6969
# Click "Sign in with GitHub"
```

## Production Deployment

For production (Vercel, Docker, etc.):

1. Update OAuth App:
   - Homepage URL: `https://your-domain.com`
   - Callback URL: `https://your-domain.com/api/auth/callback/github`

2. Update `.env`:
   ```env
   NEXTAUTH_URL=https://your-domain.com
   ```

3. Add env vars to your deployment platform (Vercel, Railway, etc.)

## Troubleshooting

| Error | Solution |
|-------|----------|
| `client_id is required` | Check `.env` has `GITHUB_CLIENT_ID` |
| `redirect_uri_mismatch` | Callback URL must match exactly (including trailing slash) |
| `bad_verification_code` | Ensure `NEXTAUTH_SECRET` is set and same across restarts |
| 403 on API calls | Ensure `repo` scope is granted; check token not expired |