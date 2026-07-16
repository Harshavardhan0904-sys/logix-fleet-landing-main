# MONGODB ATLAS SETUP - FAST CLOUD ALTERNATIVE (5 minutes, no installation)

## ⚡ Quick Setup Steps

### 1. Create Free MongoDB Atlas Account
- Visit: https://www.mongodb.com/cloud/atlas
- Click **"Sign Up"** (completely free tier)
- Create account with your email

### 2. Create Cluster (3-5 minutes)
After signing in:
1. Click **"Create Deployment"**
2. Choose **"M0 Free"** tier
3. Select cloud provider: **AWS**
4. Select region: **ap-south-1** (India - closest to you)
5. Click **"Create Cluster"** 
   - Wait 3-5 minutes for creation

### 3. Create Database User
In Atlas Dashboard:
1. Go to **"Security"** → **"Database Access"**
2. Click **"Add New Database User"**
3. Enter credentials:
   ```
   Username: freightflow_user
   Password: FreightFlow2026@123
   ```
4. Click **"Add User"**

### 4. Get Connection String
1. Click **"Overview"** tab
2. Find your cluster, click **"Connect"**
3. Choose **"Drivers"** (Node.js)
4. Copy the connection string that looks like:
   ```
   mongodb+srv://freightflow_user:FreightFlow2026@123@cluster0.xxxxx.mongodb.net/freightflow?retryWrites=true&w=majority
   ```

### 5. Update .env File
Edit `backend/.env`:

```env
# Change this line:
MONGO_URI=mongodb://127.0.0.1:27017/freightflow

# To this (paste your Atlas connection string):
MONGO_URI=mongodb+srv://freightflow_user:FreightFlow2026@123@cluster0.xxxxx.mongodb.net/freightflow?retryWrites=true&w=majority

# Keep other settings
PORT=5000
FRONTEND_URL=http://localhost:5000
EMAIL_PROVIDER=gmail
EMAIL_USER=harsha63810@gmail.com
...
```

### 6. Test Connection
```powershell
# Terminal 1: Backend already running? Kill it (Ctrl+C)
# Then restart:
cd backend
node server.js

# Check logs for:
# ✅ MongoDB connected: mongodb+srv://...
```

### 7. Insert Test Data
```powershell
# Terminal 2: New terminal
cd backend
node insert-real-test-data.js
```

### 8. Run Tests
```powershell
cd backend
node test-nomadia-endpoints.js
```

---

## 🎯 YOU'LL HAVE:

✅ Cloud MongoDB database (512MB free, no credit card needed)  
✅ 8 shipments + 5 vehicles automatically inserted  
✅ All 4 API endpoints querying real data  
✅ Complete end-to-end testing ready  

**Time to complete: ~8 minutes**

---

## 🔐 Security Notes

- Change default password when in production
- Database is only accessible from your IP
- Free tier sufficient for demo/testing
- Upgrade to paid only when production-ready

---

## ✅ Confirm Connection Works

After updating `.env`, you should see in backend logs:
```
✅ MongoDB connected: mongodb+srv://freightflow_user@cluster0...
📦 Test data insertion complete
🚀 Server ready for API requests
```

Then proceed with test data insertion & API testing!

