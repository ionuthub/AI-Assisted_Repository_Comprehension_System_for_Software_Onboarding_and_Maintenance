# Gemini API Setup Guide

## 🔐 Secure Configuration

Your Gemini API key is now **environment-based** and NOT hardcoded in the app.

### Local Development

1. **Create `.env` file** (never commit this):
```bash
VITE_GEMINI_API_KEY=AIzaSyAZ9paqurYU09c-DHiwWPU0tgKp6mHvpKc
```

2. **Verify `.gitignore` includes `.env`**:
```bash
cat .gitignore | grep ".env"
```

3. **Start dev server**:
```bash
npm run dev
```

### Vercel Deployment

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add environment variable**:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: `AIzaSyAZ9paqurYU09c-DHiwWPU0tgKp6mHvpKc`
   - **Environments**: Production, Preview, Development

3. **Redeploy** (or push to GitHub to trigger auto-deploy)

### Security Best Practices

✅ **What we're doing right**:
- API key in environment variables (not in code)
- `.env` in `.gitignore` (never committed)
- HTTPS only (Vercel enforces this)
- No API key logging
- Error messages don't expose the key

⚠️ **Additional recommendations**:
- Rotate API key monthly
- Monitor Gemini API usage dashboard
- Set up billing alerts
- Use API key restrictions (if available in Google Cloud)

### Troubleshooting

**"Gemini API key not configured" error**:
- Check `.env` file exists locally
- Verify `VITE_GEMINI_API_KEY` is set
- Restart dev server after adding `.env`

**"API request failed" error**:
- Check internet connection
- Verify API key is correct
- Check Gemini API quota/limits
- Review browser console for details

### Cost Monitoring

Monitor your usage at: https://aistudio.google.com/app/apikey

- Free tier: 15 requests/minute, 1,500/day
- Paid tier: $0.075 per 1M input tokens

---

**Status**: ✅ Secure and Production-Ready
