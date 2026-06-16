# CTO Dashboard Login Guide

## Overview

The CTO Dashboard supports two login methods:
1. **GitHub OAuth** (recommended) - Sign in with your GitHub account
2. **Pincode Login** - Username + pincode (works without GitHub API access)

## Login Methods

### 1. GitHub OAuth (Recommended)

**Prerequisites:**
- GitHub account that's registered in the f-rr-d repository
- Organization admin has approved the OAuth App (Client ID: `Ov23liy3r3AGOFaXT6YV`)

**Flow:**
1. Open the dashboard → Click "Sign in with GitHub"
2. Authorize the "WayOfDev CTO Dashboard" OAuth App on GitHub
3. Complete 2FA if enabled on your GitHub account
4. Dashboard fetches your profile from f-rr-d using the OAuth access token
5. Automatic redirect to dashboard with your role and permissions

**Troubleshooting:**
- If "No developer matched" appears → Your GitHub username must match `githubUsername` in f-rr-d config.md
- If 403 errors in logs → Organization admin must approve OAuth App at:
  `https://github.com/organizations/Way-Of/settings/oauth_application_policy`
- Find Client ID `Ov23liy3r3AGOFaXT6YV` and click "Approve"

### 2. Pincode Login (Fallback)

Works without GitHub API access or OAuth approval.

**Credentials:**
| User | GitHub Username | Pincode | Role |
|------|----------------|---------|------|
| Craig Martin | craigmartin | 1234 | CTO |
| Zerwiz | zerwiz | 1234 | Lead |
| Andre | Epileptickk | 1234 | Senior |
| Tomas | tomchi-debug | 1234 | Developer |

**Flow:**
1. Enter your GitHub username (e.g., `zerwiz`)
2. Enter pincode (`1234`)
3. Click "Sign In"

## User Roles & Permissions

| Role | Dashboard Access |
|------|------------------|
| **CTO** | Full access: all projects, admin panel, billing |
| **Admin** | User management, repo config (assigned repos) |
| **Lead** | Assigned projects, team tickets, review queue, deploy |
| **Senior Dev** | Assigned projects, own tickets, create tickets |
| **Junior Dev** | Assigned projects, own tickets, view only |

## GitHub Account Linking

Users who initially log in with pincode can later link their GitHub account:
1. Go to **Profile → GitHub Connection**
2. Click "Connect GitHub" → OAuth flow
3. Future logins work with "Sign in with GitHub"

## Developer Setup (f-rr-d config)

Each developer needs a `config.md` in the f-rr-d repo:

```
thoughts/wayofmono/{username}/config.md
```

```yaml
---
githubUsername: "zerwiz"      # Must match GitHub username exactly
pincode: "1234"               # For pincode login fallback
role: "Lead"                  # CTO, Admin, Lead, Senior, Developer
displayName: "Zerwiz"         # Display name in UI
email: "josef.lindbom@gmail.com"  # For notifications
avatarUrl: ""                 # Optional avatar URL
projects:
  - "wayofmono"
  - "wow"
  - "opticat"
isActive: true
---
```

## Admin: GitHub OAuth App Approval

**Required for GitHub OAuth to work:**

1. Go to: `https://github.com/organizations/Way-Of/settings/oauth_application_policy`
2. Find the OAuth App: **WayOfDev CTO Dashboard** (Client ID: `Ov23liy3r3AGOFaXT6YV`)
3. Click **Approve** or **Allow access**

Without this, GitHub API calls return 403 and developers can't be fetched from f-rr-d.

## Session Persistence

- Sessions persist across restarts (fixed NEXTAUTH_SECRET)
- JWT secret is hardcoded: SHA256("wo-cto-dashboard-0.4.21")
- Cookie clearing only needed once for users on v0.4.22-v0.4.25

## Quick Reference

```bash
# Install & run
npm install -g @wayofmono/wo-cto-dashboard
sudo wodev --build
wodev

# Pincode login (always works)
Username: zerwiz
Pincode: 1234

# GitHub OAuth (requires org approval)
Click "Sign in with GitHub" → Authorize → Auto-login
```