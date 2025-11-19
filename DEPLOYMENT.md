# PickleHub Deployment Guide

This guide covers deploying PickleHub backend to Render.

---

## 🚀 Quick Deploy to Render

### Option 1: Using Render Blueprint (Recommended)

1. **Push code to GitHub:**
   ```bash
   git push origin main
   ```

2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **New** → **Blueprint**
   - Connect your GitHub repository
   - Select the `render.yaml` file
   - Click **Apply**

3. **Configure Environment Variables:**

   For **picklehub-api** service:
   - `DATABASE_URL`: Copy from the database service (auto-filled)
   - `GOOGLE_CLIENT_ID_IOS`: Your Google OAuth Client ID
   - `NEXT_PUBLIC_API_URL`: Your Render API URL (e.g., `https://picklehub-api.onrender.com`)

   For **picklehub-websocket** service:
   - `DATABASE_URL`: Same as API service
   - `WEBSOCKET_PORT`: `10000` (already set)

4. **Run Database Migration:**
   - Go to **picklehub-api** service
   - Click **Shell**
   - Run:
     ```bash
     npm run prisma:migrate
     ```

### Option 2: Manual Setup

#### 1. Create PostgreSQL Database

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Name: `picklehub-db`
3. Region: Oregon (Free)
4. Plan: Free
5. Click **Create Database**
6. Copy the **Internal Database URL**

#### 2. Create API Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `picklehub-api`
   - **Region**: Oregon (Free)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**:
     ```
     npm install && npm run prisma:generate && npm run build
     ```
   - **Start Command**:
     ```
     npm start
     ```
   - **Plan**: Free

4. **Environment Variables:**
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (paste Internal Database URL)
   - `GOOGLE_CLIENT_ID_IOS`: (your Google OAuth Client ID)
   - `NEXT_PUBLIC_API_URL`: (will be `https://YOUR-SERVICE-NAME.onrender.com`)

5. Click **Create Web Service**

6. **Run Migration** (after first deploy):
   - Go to service → **Shell**
   - Run: `npm run prisma:migrate`

#### 3. Create WebSocket Service

1. Click **New** → **Web Service**
2. Connect same repository
3. Configure:
   - **Name**: `picklehub-websocket`
   - **Region**: Oregon (Free)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**:
     ```
     npm install && npm run prisma:generate
     ```
   - **Start Command**:
     ```
     npx ts-node server/index.ts
     ```
   - **Plan**: Free

4. **Environment Variables:**
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (same as API service)
   - `WEBSOCKET_PORT`: `10000`

5. Click **Create Web Service**

---

## 🔧 Configuration

### Environment Variables Reference

**Required for API Service:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
GOOGLE_CLIENT_ID_IOS=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

**Required for WebSocket Service:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
WEBSOCKET_PORT=10000
```

### Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your iOS OAuth Client ID
5. Copy the Client ID (format: `xxx.apps.googleusercontent.com`)
6. Paste into Render environment variables

---

## 📱 Update iOS App

After deployment, update your iOS app configuration:

### Update `ios/PickleHub/Config.swift`

```swift
enum Config {
    // Production URLs
    static let apiBaseURL = "https://your-api.onrender.com"
    static let websocketURL = "wss://your-websocket.onrender.com"

    // For development, use localhost:
    #if DEBUG
    static let apiBaseURL = "http://localhost:3001"
    static let websocketURL = "ws://localhost:3002"
    #endif

    static let googleClientID = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
}
```

Or use conditional compilation:

```swift
enum Config {
    #if DEBUG
    static let apiBaseURL = "http://localhost:3001"
    static let websocketURL = "ws://localhost:3002"
    #else
    static let apiBaseURL = "https://your-api.onrender.com"
    static let websocketURL = "wss://your-websocket.onrender.com"
    #endif

    static let googleClientID = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
}
```

---

## 🔍 Verify Deployment

### Test API

```bash
# Check API is running
curl https://your-api.onrender.com

# Test events endpoint
curl https://your-api.onrender.com/api/events
```

### Test WebSocket

Use a WebSocket client or browser console:

```javascript
const ws = new WebSocket('wss://your-websocket.onrender.com');
ws.onopen = () => console.log('Connected');
ws.onerror = (error) => console.error('Error:', error);
```

---

## ⚠️ Important Notes

### Free Tier Limitations

Render Free tier has some limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free usage per service
- Database limited to 1GB

### Database Migrations

**Important:** Run migrations manually after deployment:

```bash
# Via Render Shell (recommended)
1. Go to API service → Shell
2. Run: npm run prisma:migrate

# Or add to build command (not recommended for production)
npm install && npm run prisma:generate && npm run prisma:migrate && npm run build
```

### WebSocket Connection

- Use `wss://` (not `ws://`) for production
- WebSocket service needs to be always running
- Consider upgrading to paid plan for production use

---

## 🐛 Troubleshooting

### Error: "Couldn't find package.json"

**Solution:** Set **Root Directory** to `backend`

In Render service settings:
- Go to **Settings**
- Set **Root Directory**: `backend`
- Click **Save Changes**

### Error: "Prisma Client not generated"

**Solution:** Add `prisma:generate` to build command

```
npm install && npm run prisma:generate && npm run build
```

### Error: "Cannot connect to database"

**Solution:** Check DATABASE_URL

1. Copy **Internal Database URL** from database service
2. Paste into both API and WebSocket services
3. Redeploy services

### Error: "Migration failed"

**Solution:** Run migrations manually

```bash
# Via Render Shell
npm run prisma:migrate
```

### WebSocket won't connect

**Solution:** Check protocol and port

- Use `wss://` not `ws://`
- Don't include port in URL for Render
- Correct: `wss://your-websocket.onrender.com`
- Wrong: `wss://your-websocket.onrender.com:10000`

---

## 🔐 Security Checklist

Before going to production:

- [ ] Set strong database password
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS only (Render does this automatically)
- [ ] Restrict database access to Render services only
- [ ] Set proper CORS origins in Next.js
- [ ] Validate all Google OAuth tokens
- [ ] Add rate limiting to API endpoints
- [ ] Enable database backups
- [ ] Monitor service logs
- [ ] Set up error tracking (Sentry, etc.)

---

## 📊 Monitoring

### View Logs

1. Go to service in Render Dashboard
2. Click **Logs** tab
3. View real-time logs

### Metrics

- **Metrics** tab shows CPU, Memory, and Request metrics
- Set up alerts for service failures
- Monitor database size and connections

---

## 🚀 Production Recommendations

For production use, consider:

1. **Upgrade Database Plan**
   - Free tier limited to 1GB
   - Paid plans offer backups and better performance

2. **Upgrade Web Services**
   - Paid plans ($7/month) have:
     - No spin-down
     - Better performance
     - Custom domains

3. **Add Redis Cache**
   - Cache API responses
   - Session management
   - WebSocket connection tracking

4. **CDN for Static Assets**
   - Cloudflare or similar
   - Faster asset delivery

5. **Error Tracking**
   - Sentry for error monitoring
   - Application performance monitoring

6. **Backup Strategy**
   - Regular database backups
   - Code backups via Git

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to your main branch:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render automatically deploys
```

To disable auto-deploy:
1. Go to service **Settings**
2. Scroll to **Auto-Deploy**
3. Toggle off

---

## 📝 Alternative Platforms

If Render doesn't meet your needs:

### Vercel (API only)
- Best for Next.js
- Free tier available
- No PostgreSQL (use external)

### Railway
- Similar to Render
- $5/month credit
- Easy setup

### Heroku
- Established platform
- No free tier anymore
- $5-7/month minimum

### DigitalOcean App Platform
- $5/month minimum
- Managed databases available
- Good performance

### AWS (Advanced)
- Most flexible
- Complex setup
- Pay per use

---

## 🎯 Summary

**Quick Steps:**
1. Create PostgreSQL database on Render
2. Create API service (root: `backend/`)
3. Create WebSocket service (root: `backend/`)
4. Set environment variables
5. Run `npm run prisma:migrate` via Shell
6. Update iOS app URLs
7. Test and deploy!

**Your URLs will be:**
- API: `https://picklehub-api.onrender.com`
- WebSocket: `wss://picklehub-websocket.onrender.com`
- Database: Internal URL (not public)

---

For more help, see:
- [Render Documentation](https://render.com/docs)
- [Deploying Next.js on Render](https://render.com/docs/deploy-nextjs)
- [Render PostgreSQL](https://render.com/docs/databases)
