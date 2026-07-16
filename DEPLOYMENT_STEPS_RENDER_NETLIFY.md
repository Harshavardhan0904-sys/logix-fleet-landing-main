# 🚀 DEPLOYMENT GUIDE: Render + Netlify

**Status**: Ready for Production Deployment  
**Timeline**: ~20-30 minutes  
**Components**: Backend (Render) + Frontend (Netlify)

---

## ⚡ QUICK START CHECKLIST

- [ ] Step 1: Verify code is pushed to GitHub
- [ ] Step 2: Deploy backend to Render (get live URL)
- [ ] Step 3: Update frontend API endpoints
- [ ] Step 4: Deploy frontend to Netlify
- [ ] Step 5: Test complete system
- [ ] Step 6: Configure domain (optional)

---

## STEP 1: Verify GitHub Repository

Your code needs to be on GitHub for both platforms to deploy automatically.

### Check if your code is pushed:
```bash
git log --oneline -5
# Should show your recent commits

git remote -v
# Should show your GitHub remote
```

### If not yet pushed:
```bash
git add .
git commit -m "Email-only invitation system - production ready"
git branch -M main
git push -u origin main
```

**Your Repository**: `https://github.com/YOUR_USERNAME/YOUR_REPO`

---

## STEP 2: Deploy Backend to Render.com

### 2A: Go to Render Dashboard
1. Open: https://render.com
2. Sign in with GitHub
3. Dashboard → Click **"New Web Service"**

### 2B: Connect Your Repository
1. Click **"Connect a repository"**
2. Find your GitHub repo (e.g., "logix" or "freightflow")
3. Click **"Connect"**

### 2C: Configure Service
Fill in these details:

| Setting | Value |
|---------|-------|
| **Name** | `logix-backend` or `freightflow-backend` |
| **Environment** | Node.js |
| **Region** | Singapore / US East (closest to users) |
| **Branch** | main |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `node backend/server.js` |

### 2D: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** for each:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | `mongodb+srv://Freightflow26:Freightflow2026@cluster0.qkylk9h.mongodb.net/freightflow` |
| `JWT_SECRET` | `your-super-secret-production-key-change-this` |
| `EMAIL_PROVIDER` | `gmail` |
| `EMAIL_USER` | `harsha63810@gmail.com` |
| `EMAIL_PASSWORD` | `pnhqxrcigqqtklbh` |
| `EMAIL_FROM` | `harsha63810@gmail.com` |
| `WHATSAPP_PROVIDER` | `mock` |
| `FRONTEND_URL` | `https://your-netlify-domain.netlify.app` (update after Netlify deploy) |

### 2E: Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Once done, copy your backend URL: `https://logix-backend-xxxxx.onrender.com`

**✅ Backend is now live!**

---

## STEP 3: Update Frontend API Endpoints

Your frontend needs to point to the live backend URL.

### Find and Update API Calls

**File: `js/api.js`** (or wherever API calls are made)

Find all instances of `localhost:5000` and replace with your Render backend URL:

```javascript
// BEFORE
const API_URL = 'http://localhost:5000';

// AFTER
const API_URL = 'https://logix-backend-xxxxx.onrender.com';
```

**Common files to check:**
- `js/api.js`
- `js/main.js`
- `js/pages/settings.js`
- `js/pages/dashboard.js`
- Any other files making API calls

### Commit Changes
```bash
git add js/
git commit -m "Update API endpoints to production backend"
git push origin main
```

---

## STEP 4: Deploy Frontend to Netlify

### 4A: Go to Netlify Dashboard
1. Open: https://app.netlify.com
2. Sign in with GitHub
3. Click **"Add new site"** → **"Import an existing project"**

### 4B: Connect Repository
1. Choose GitHub as deployment method
2. Find your repository
3. Click **"Connect"**

### 4C: Configure Build Settings

| Setting | Value |
|---------|-------|
| **Branch to deploy** | main |
| **Build command** | `echo "No build needed"` (or blank) |
| **Publish directory** | `.` (root) or `./frontend` |

### 4D: Deploy
1. Click **"Deploy site"**
2. Wait 1-2 minutes for deployment
3. Your site is live at: `https://your-site-name.netlify.app`

**✅ Frontend is now live!**

---

## STEP 5: Test Complete System

### Test Backend
```bash
curl https://logix-backend-xxxxx.onrender.com/api/email/status
```

Should return email service status.

### Test Frontend
1. Open your Netlify URL: `https://your-site.netlify.app`
2. Try logging in with: `demo@freightflow.in` / `demo1234`
3. Test invite functionality (Settings → Invite)
4. Verify API calls are hitting the backend

### Test Invitation Flow
1. Login as admin
2. Go to Settings → Team → Invite
3. Enter test email: `testuser@example.com`
4. Check if email was sent (check backend logs on Render)
5. Accept invitation and verify new user can login

---

## STEP 6: Configure Custom Domain (Optional)

### For Netlify
1. Netlify Dashboard → Your site → **Domain settings**
2. Click **"Add domain"**
3. Enter your domain: `app.yourcompany.com`
4. Update DNS records (Netlify will provide instructions)

### For Render
1. Render Dashboard → Your service → **Settings**
2. Scroll to **"Custom Domains"**
3. Add your domain: `api.yourcompany.com`

### Suggested Aetra domain setup
- Frontend: `aetra.com`
- API: `api.aetra.com`
- Optional staging: `staging.aetra.com`

---

## 📊 Live URLs After Deployment

Once complete, you'll have:

| Component | URL |
|-----------|-----|
| **Frontend** | `https://your-site.netlify.app` |
| **Backend API** | `https://logix-backend-xxxxx.onrender.com` |
| **Email Status** | `https://logix-backend-xxxxx.onrender.com/api/email/status` |
| **Live Demo** | Login: `demo@freightflow.in` / `demo1234` |

---

## 🔄 Continuous Deployment

### Auto-Deploy on Push
- **Netlify**: Automatically deploys on every push to `main`
- **Render**: Automatically deploys on every push to `main`

### Making Updates
```bash
# Make changes locally
git add .
git commit -m "Your commit message"
git push origin main

# Netlify and Render will automatically redeploy!
```

---

## ⚠️ Troubleshooting

### Backend not connecting from frontend
- Check that `API_URL` in frontend matches Render backend URL
- Check CORS is enabled in `server.js`
- Check `.env` variables are set on Render

### Email not sending in production
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` in Render env vars
- Check Gmail app password is correct
- Review backend logs: `Render Dashboard → Logs`

### Frontend not loading
- Check publish directory is correct (`.` or `./frontend`)
- Clear browser cache
- Check Netlify build logs

### Still having issues?
1. Check backend logs: Render Dashboard → Logs tab
2. Check frontend build logs: Netlify Dashboard → Deploys
3. Check browser console for errors: F12 → Console

---

## ✅ Sign-Off

Your system is now:
- ✅ Backend live on Render
- ✅ Frontend live on Netlify
- ✅ Email invitations working
- ✅ Users can signup and login
- ✅ Full end-to-end workflow verified

**🎉 Ready for production!**
