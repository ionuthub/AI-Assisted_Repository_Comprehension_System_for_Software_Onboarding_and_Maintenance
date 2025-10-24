# Deployment Guide

## Overview

This guide explains how to deploy **Unravel Code AI** to Vercel with proper environment variable configuration.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- Google Gemini API key (https://aistudio.google.com/app/apikey)
- Optional: GitHub Personal Access Token (for private repo access)

## Environment Variables Setup

### 1. Local Development

Create a `.env` file in the project root:

```bash
# Required for AI explanations
GEMINI_API_KEY=your_api_key_here

# Optional: For accessing private repositories
VITE_GITHUB_TOKEN=your_github_token_here

# CORS Configuration (usually not needed for local dev)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Run locally:
```bash
npm install
npm run dev
```

### 2. Vercel Deployment

#### Step 1: Connect Repository
1. Go to https://vercel.com/dashboard
2. Click "Add New..." > "Project"
3. Select your GitHub repository
4. Click "Import"

#### Step 2: Add Environment Variables
1. In the Vercel project settings, go to **Settings > Environment Variables**
2. Add the following variables:

| Variable | Value | Scope |
|----------|-------|-------|
| `GEMINI_API_KEY` | Your API key from Google AI Studio | Production, Preview, Development |
| `VITE_GITHUB_TOKEN` | Your GitHub Personal Access Token (optional) | Production, Preview, Development |
| `ALLOWED_ORIGINS` | Your production domain | Production |

**Example for ALLOWED_ORIGINS:**
```
https://yourdomain.com,https://www.yourdomain.com
```

#### Step 3: Deploy
1. Click "Deploy"
2. Vercel will automatically build and deploy your application
3. Your site will be available at `https://your-project.vercel.app`

## How Environment Variables Work

### GEMINI_API_KEY
- **Type**: Server-side secret
- **Used by**: `/api/explain-code.ts` serverless function
- **Purpose**: Authenticates requests to Google Gemini API
- **Security**: Never exposed to client (only used in serverless function)

### VITE_GITHUB_TOKEN
- **Type**: Client-side secret (prefixed with `VITE_`)
- **Used by**: Frontend code for GitHub API calls
- **Purpose**: Authenticates GitHub API requests to access private repositories
- **Security**: Visible to client but only used for GitHub API authentication

### ALLOWED_ORIGINS
- **Type**: Configuration
- **Used by**: CORS validation in serverless function
- **Purpose**: Restricts API access to specified domains
- **Default**: `http://localhost:5173,http://localhost:3000`

## Vercel Configuration

The project includes a `vercel.json` file with:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Cache control for assets

No additional configuration needed - Vercel will automatically use these settings.

## Testing Deployment

After deployment:

1. **Test AI Explanations**
   - Load a GitHub repository
   - Select a code file
   - Click on a line of code
   - Verify explanation appears (uses Gemini API)

2. **Test GitHub Integration**
   - Try loading a public repository (should work)
   - If you added `VITE_GITHUB_TOKEN`, try a private repository

3. **Check Logs**
   - Go to Vercel project > Deployments > Select deployment > Logs
   - Look for any errors related to API calls

## Troubleshooting

### "API key not configured" Error
- Check that `GEMINI_API_KEY` is added to Vercel Environment Variables
- Verify the value is correct (starts with `AIza...`)
- Redeploy after adding the variable

### "Rate limit exceeded" Error
- The app has a 10 requests/minute rate limit per IP
- Wait a minute and try again
- This is intentional to prevent abuse

### Private Repository Not Loading
- Verify `VITE_GITHUB_TOKEN` is added to Vercel Environment Variables
- Ensure the token has `repo` scope
- Check that the repository is accessible with the token

### CORS Errors
- Update `ALLOWED_ORIGINS` to include your domain
- Format: `https://yourdomain.com,https://www.yourdomain.com`
- Redeploy after updating

## Production Checklist

- [ ] `GEMINI_API_KEY` added to Vercel Environment Variables
- [ ] `VITE_GITHUB_TOKEN` added (if using private repos)
- [ ] `ALLOWED_ORIGINS` updated with production domain
- [ ] Deployment successful (check Vercel dashboard)
- [ ] Test AI explanations work
- [ ] Test GitHub integration works
- [ ] Check Vercel logs for any errors

## Support

For issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test locally with `npm run dev` to isolate issues
4. Check GitHub API status (https://www.githubstatus.com)
5. Check Google API status (https://status.cloud.google.com)
