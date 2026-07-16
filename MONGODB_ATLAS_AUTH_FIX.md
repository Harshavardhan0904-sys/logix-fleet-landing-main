# MONGODB ATLAS - FIX AUTHENTICATION ERROR

Error: `bad auth : authentication failed`

This means MongoDB Atlas is rejecting the connection. Fix it in **2 steps**:

---

## ✅ STEP 1: Whitelist Your IP in Atlas

1. **Go to MongoDB Atlas Dashboard**: https://cloud.mongodb.com/
2. Click your cluster (Cluster0)
3. Go to **"Security"** → **"Network Access"**
4. Click **"Add IP Address"**
5. Choose **"Allow access from anywhere"** → Enter `0.0.0.0/0`
6. Click **"Confirm"**

This allows connections from your computer.

---

## ✅ STEP 2: Verify Database User Exists

1. In MongoDB Atlas Dashboard
2. Go to **"Security"** → **"Database Access"**
3. Make sure you see:
   - Username: **Freightflow26**
   - Status: **Active**

If not visible or deleted, create new user:
- Click **"Add New Database User"**
- Username: `Freightflow26`
- Password: `Freightflow2026`
- Database Privileges: **"Built-in Role: Atlas Admin"**
- Click **"Add User"**

---

## ✅ STEP 3: Test Connection (After Atlas Updates)

Wait 1-2 minutes for Atlas to apply changes, then restart server:

```powershell
cd backend
node server.js
```

**Expected output:**
```
✅ MongoDB connected: mongodb+srv://Freightflow26@cluster0...
📦 Now connected to Atlas!
```

---

## 🆘 STILL NOT WORKING?

Try this simplified connection string:

```
MONGO_URI=mongodb+srv://Freightflow26:Freightflow2026@cluster0.qkylk9h.mongodb.net/?retryWrites=true&w=majority
```

Or whitelist **all IPs**:
- Network Access → Edit → Change to **0.0.0.0/0**

---

**After fix, run:**
```powershell
cd backend && node insert-real-test-data.js
```

This will insert 8 real shipments! ✅

