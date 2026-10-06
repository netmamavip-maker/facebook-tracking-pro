# Facebook Tracker Premium - Render Deployment Guide

## 🚀 Complete Render.com Deployment (Step-by-Step)

---

## PART 1: Preparation (Local Machine)

### Step 1.1: Install Git
Download and install Git: https://git-scm.com/download

### Step 1.2: Create GitHub Account
1. Go to https://github.com/signup
2. Create account
3. Create new repository: `facebook-tracker-premium`
4. Set to **Public**

### Step 1.3: Prepare Local Files

```bash
# Navigate to your downloads folder
cd ~/Downloads

# Create main project folder
mkdir facebook-tracker-premium
cd facebook-tracker-premium

# Initialize git
git init
git remote add origin https://github.com/YOUR_USERNAME/facebook-tracker-premium.git
```

### Step 1.4: Organize Files

```
facebook-tracker-premium/
├── backend/
│   ├── app.py
│   ├── requirements_backend.txt
│   └── .env (NOT pushed to GitHub)
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProfileCard.jsx
│   │   │   ├── AddProfile.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Header.jsx
│   │   ├── styles/
│   │   │   ├── App.css
│   │   │   ├── Dashboard.css
│   │   │   ├── ProfileCard.css
│   │   │   ├── Header.css
│   │   │   ├── AddProfile.css
│   │   │   ├── Analytics.css
│   │   │   └── Settings.css
│   │   ├── index.js
│   │   └── api.js
│   ├── package.json
│   └── .env.local (NOT pushed to GitHub)
│
├── .gitignore
├── render_backend.yaml
├── Procfile
├── SETUP_INSTRUCTIONS.md
├── COMPLETE_FILE_STRUCTURE.md
└── DEPLOYMENT_GUIDE.md
```

### Step 1.5: Create .gitignore (Already provided - verify)
Make sure `.gitignore` excludes:
- `.env`
- `.env.local`
- `node_modules/`
- `__pycache__/`
- `*.db`

### Step 1.6: Verify All Files Present
```bash
# Count files
ls -la backend/          # Should have 2-3 files
ls -la frontend/src/     # Should have many files
cat .gitignore           # Should exclude .env files
```

---

## PART 2: Push to GitHub

### Step 2.1: Add All Files to Git
```bash
# From facebook-tracker-premium/
git add .
```

### Step 2.2: Commit
```bash
git commit -m "Facebook Tracker Premium v1.0 - Complete Stack"
```

### Step 2.3: Push to GitHub
```bash
git branch -M main
git push -u origin main
```

**Verify on GitHub.com that all files are there**

---

## PART 3: Deploy Backend to Render

### Step 3.1: Go to Render.com
1. Visit https://render.com
2. Click "Sign Up" → Sign in with GitHub
3. Authorize Render

### Step 3.2: Create Backend Service
1. Click "New +" → "Web Service"
2. Select your GitHub repository
3. Fill in:
   - **Name**: `facebook-tracker-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements_backend.txt`
   - **Start Command**: `cd backend && python app.py`

### Step 3.3: Set Environment Variables
1. Scroll to "Environment"
2. Add variables:

| Key | Value |
|-----|-------|
| `FB_EMAIL` | your_facebook_email@gmail.com |
| `FB_PASSWORD` | your_facebook_password |
| `PORT` | 5000 |

⚠️ **NEVER put these in GitHub - only in Render Dashboard**

### Step 3.4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (3-5 minutes)
3. Note the URL: `https://facebook-tracker-backend.onrender.com`

### Step 3.5: Test Backend
1. Go to `https://facebook-tracker-backend.onrender.com/`
2. Should see JSON response with status: `ok`

---

## PART 4: Deploy Frontend to Render

### Step 4.1: Create Frontend Service
1. Go to Render.com dashboard
2. Click "New +" → "Static Site"
3. Select same GitHub repository
4. Fill in:
   - **Name**: `facebook-tracker-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

### Step 4.2: Set Environment Variables
Add environment variable:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | https://facebook-tracker-backend.onrender.com |

### Step 4.3: Deploy
1. Click "Create Static Site"
2. Wait for deployment (3-5 minutes)
3. Note the URL: `https://facebook-tracker-frontend.onrender.com`

### Step 4.4: Test Frontend
1. Go to frontend URL
2. Should see dashboard
3. Try adding a profile

---

## PART 5: Verify Complete Deployment

### Test Checklist
- [ ] Backend API responds: `https://facebook-tracker-backend.onrender.com/`
- [ ] Frontend loads: `https://facebook-tracker-frontend.onrender.com/`
- [ ] Can navigate dashboard
- [ ] Can add profile (paste Facebook URL)
- [ ] Real-time updates (wait 30 seconds)
- [ ] Profile shows online/offline status
- [ ] Analytics page loads
- [ ] Settings/Export works

---

## PART 6: Configure GitHub Secrets (Optional - For CI/CD)

### Step 6.1: GitHub Settings
1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Add:
   - `RENDER_API_KEY` (from Render.com account settings)

This allows automatic deployments on push.

---

## 🔧 Troubleshooting

### Issue: Backend won't start
**Solution:**
1. Check Render logs
2. Verify FB_EMAIL and FB_PASSWORD are correct
3. Restart service: Render Dashboard → Service → Redeploy

### Issue: "Failed to connect to API"
**Solution:**
1. Check REACT_APP_API_URL in frontend environment
2. Verify backend URL is correct
3. Clear browser cache: Ctrl+Shift+Delete

### Issue: "Cannot GET /"
**Solution:**
1. Backend running but not responding
2. Check backend logs on Render
3. Verify Python dependencies installed

### Issue: "npm ERR! missing script"
**Solution:**
1. Check package.json exists in frontend/
2. Verify build command: `cd frontend && npm install && npm run build`

### Issue: Profiles not tracking
**Solution:**
1. Wait 30 seconds for first update
2. Click "Refresh All" button
3. Check backend logs for errors
4. Verify FB credentials in Render environment

---

## 📊 Service Status Check

### Check Backend Health
```bash
curl https://facebook-tracker-backend.onrender.com/
```
Should return:
```json
{"status":"ok","service":"Facebook Tracker Premium","version":"1.0","authenticated":true}
```

### Check Frontend
Go to: `https://facebook-tracker-frontend.onrender.com/`
Should load complete dashboard

---

## 🔄 Update Deployment

### When You Make Changes:

```bash
# Local changes
# ... edit files ...

# Commit and push
git add .
git commit -m "Update: Description of changes"
git push origin main

# Render auto-deploys (usually 1-2 minutes)
# Check status on Render.com dashboard
```

---

## 💾 Backup & Data

### Export Your Tracking Data
1. Go to Settings page
2. Click "Export Data as JSON"
3. File downloads automatically

### Backup Location
- Backend database: `/backend/tracker.db` (on Render server)
- Exported data: Save JSON files locally

---

## 🚨 Important Security Notes

### NEVER:
❌ Commit `.env` files to GitHub
❌ Expose Facebook credentials publicly
❌ Use personal Facebook account for tracking
❌ Share Render.com credentials

### DO:
✅ Use dedicated bot Facebook account
✅ Store credentials in Render Environment only
✅ Enable 2FA on GitHub and Render
✅ Regularly export and backup data
✅ Keep dependencies updated

---

## 📱 Mobile Access

### Access from Phone:
1. Frontend URL works on any device
2. Dashboard is mobile responsive
3. All features work on mobile
4. Real-time updates work over LTE/WiFi

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed and responding
- [ ] Frontend deployed and loading
- [ ] Environment variables set correctly
- [ ] First profile added successfully
- [ ] Real-time updates working (30s refresh)
- [ ] Analytics page accessible
- [ ] Export data feature working
- [ ] Dark mode toggle working
- [ ] Mobile responsive verified
- [ ] Data backed up (exported JSON)

---

## 🆘 Support Commands

### View Logs on Render:
1. Go to service dashboard
2. Click "Logs" tab
3. See real-time output

### Restart Service:
1. Go to service dashboard
2. Click "Redeploy"

### Check Resource Usage:
1. Service Dashboard → Metrics
2. CPU, Memory, Network usage shown

---

## 📈 Next Steps

1. **Invite Friends**: Share your tracking dashboard
2. **Monitor Profiles**: Track Facebook activity
3. **Export Reports**: Use JSON data for analysis
4. **Customize**: Modify code and redeploy

---

## 📞 Quick Links

- **Render.com**: https://render.com
- **GitHub**: https://github.com
- **Facebook**: https://facebook.com
- **This Guide**: DEPLOYMENT_GUIDE.md

---

**Deployment Complete! Your Facebook Tracker is now live.** 🎉

**Frontend**: https://facebook-tracker-frontend.onrender.com
**Backend**: https://facebook-tracker-backend.onrender.com

Start tracking profiles in real-time! 🚀
