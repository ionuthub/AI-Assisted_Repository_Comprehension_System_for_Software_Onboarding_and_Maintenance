# GitHub Token Setup Guide

## Why You Need a GitHub Token

By default, the GitHub API allows **unauthenticated requests** for public repositories only. To access **private repositories**, you need to authenticate with a GitHub Personal Access Token.

## Creating a GitHub Personal Access Token

### Step 1: Go to GitHub Settings
1. Visit https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**

### Step 2: Configure Token Permissions
- **Token name**: `unravel-code-ai` (or any descriptive name)
- **Expiration**: Choose based on your security preference (90 days recommended)
- **Scopes**: Select **`repo`** (Full control of private repositories)
  - This includes read access to private repos

### Step 3: Generate and Copy
1. Click **"Generate token"**
2. **Copy the token immediately** (you won't see it again)

## Adding Token to Your Environment

### Local Development

Add to your `.env` file:
```bash
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add new variable:
   - **Name**: `VITE_GITHUB_TOKEN`
   - **Value**: Your GitHub token
   - **Environments**: Select appropriate environments (Production, Preview, Development)

## Security Best Practices

- ✅ **Never commit tokens to git** - `.env` is already in `.gitignore`
- ✅ **Rotate tokens regularly** - Regenerate every 90 days
- ✅ **Use minimal scopes** - Only `repo` scope is needed
- ✅ **Monitor token usage** - Check GitHub settings for suspicious activity
- ✅ **Revoke compromised tokens immediately** - Go to https://github.com/settings/tokens

## Troubleshooting

### Still Getting 404 for Private Repos?

1. **Verify token is set**:
   ```bash
   echo $VITE_GITHUB_TOKEN
   ```

2. **Check token has correct scopes**:
   - Visit https://github.com/settings/tokens
   - Verify `repo` scope is checked

3. **Verify token is not expired**:
   - Tokens expire after the set duration
   - Generate a new one if needed

4. **Test with GitHub CLI** (optional):
   ```bash
   gh auth login
   gh repo view ionuthub/unravel-code-ai
   ```

## API Rate Limits

With authentication:
- **Authenticated requests**: 5,000 requests/hour per user
- **Unauthenticated requests**: 60 requests/hour per IP

## References

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub API Authentication](https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api)
- [GitHub API Rate Limiting](https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api)
