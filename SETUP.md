# PickleHub - Complete Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup database
createdb picklehub

# Copy environment file
cp .env.example .env

# Edit .env and add your Google Client ID
# DATABASE_URL="postgresql://postgres:password@localhost:5432/picklehub?schema=public"
# GOOGLE_CLIENT_ID_IOS="your-ios-client-id.apps.googleusercontent.com"

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# Optional: Seed test data
npm run prisma:seed

# Start API server (Terminal 1)
npm run dev

# Start WebSocket server (Terminal 2)
npx ts-node server/index.ts
```

### Step 2: iOS Setup

```bash
# Navigate to iOS directory
cd ios

# Open in Xcode
open PickleHub.xcodeproj
```

In Xcode:
1. Add Google Sign-In package: **File > Add Packages**
   - URL: `https://github.com/google/GoogleSignIn-iOS`
   - Version: Up to Next Major (7.0.0)

2. Update `Config.swift`:
   ```swift
   static let googleClientID = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
   ```

3. Update `Info.plist` with your Client ID

4. Build and Run (**⌘ + R**)

## 📋 Prerequisites

### Required Software

1. **Node.js** (v18+)
   ```bash
   # Install via Homebrew (macOS)
   brew install node

   # Verify
   node --version
   npm --version
   ```

2. **PostgreSQL** (v14+)
   ```bash
   # Install via Homebrew (macOS)
   brew install postgresql@14

   # Start service
   brew services start postgresql@14

   # Verify
   psql --version
   ```

3. **Xcode** (v15+)
   - Download from Mac App Store
   - Install Command Line Tools:
     ```bash
     xcode-select --install
     ```

4. **Google Cloud Account**
   - For OAuth credentials

## 🔐 Google OAuth Setup (Detailed)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name: "PickleHub" → **Create**

### Step 2: Enable Google Sign-In API

1. Navigate to **APIs & Services** → **Library**
2. Search for "Google Sign-In"
3. Click **Enable**

### Step 3: Create OAuth Credentials

#### iOS Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **iOS**
4. Name: "PickleHub iOS"
5. Bundle ID: `com.yourcompany.PickleHub`
6. Click **Create**
7. **Copy the Client ID** (format: `xxx.apps.googleusercontent.com`)

#### Web Client ID (for backend verification)

1. Click **Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Name: "PickleHub Backend"
4. Click **Create**
5. Save both Client ID and Client Secret

### Step 4: Configure iOS App

1. Open `ios/PickleHub/Config.swift`
2. Replace:
   ```swift
   static let googleClientID = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
   ```

3. Open `ios/PickleHub/Info.plist`
4. Update:
   ```xml
   <key>GIDClientID</key>
   <string>YOUR_IOS_CLIENT_ID.apps.googleusercontent.com</string>

   <key>CFBundleURLSchemes</key>
   <array>
       <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
   </array>
   ```

### Step 5: Configure Backend

1. Open `backend/.env`
2. Add:
   ```env
   GOOGLE_CLIENT_ID_IOS="YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
   ```

## 🗄️ Database Setup (Detailed)

### Create Database

```bash
# Create database
createdb picklehub

# Verify
psql -l | grep picklehub
```

### Update Connection String

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/picklehub?schema=public"
```

**Default PostgreSQL credentials:**
- Username: `postgres` (or your system username)
- Password: (empty) or set during installation
- Host: `localhost`
- Port: `5432`

### Run Migrations

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Create tables
npm run prisma:migrate

# View in Prisma Studio (optional)
npm run prisma:studio
```

### Seed Test Data (Optional)

```bash
npm run prisma:seed
```

This creates:
- 2 test users
- 1 sample event
- 1 chat room

## 🏃 Running the Application

### Backend

**Terminal 1 - API Server:**
```bash
cd backend
npm run dev
```
→ API running on http://localhost:3001

**Terminal 2 - WebSocket Server:**
```bash
cd backend
npx ts-node server/index.ts
```
→ WebSocket running on ws://localhost:3002

**Verify:**
```bash
# Test API
curl http://localhost:3001

# Test health
curl http://localhost:3001/api/events
```

### iOS App

1. Open `ios/PickleHub.xcodeproj` in Xcode
2. Select target: **iPhone 15 Pro** (simulator)
3. Press **⌘ + R** to build and run

**For Physical Device:**
1. Connect iPhone via USB
2. Select device in Xcode
3. Update `Config.swift`:
   ```swift
   static let apiBaseURL = "http://YOUR_MAC_IP:3001"
   static let websocketURL = "ws://YOUR_MAC_IP:3002"
   ```
4. Find your Mac's IP:
   ```bash
   ipconfig getifaddr en0
   ```
5. Ensure Mac and iPhone are on same WiFi network
6. Build and run

## 🧪 Testing the App

### 1. Sign In
- Tap **Sign in with Google**
- Select Google account
- Grant permissions
- Should redirect to Events screen

### 2. Create Event
- Tap **+** button
- Fill in event details:
  - Title: "Test Pickleball Game"
  - Description: "Casual play"
  - Location: "Local Courts"
  - Date/Time: Tomorrow at 6 PM
  - Max Participants: 8
  - Skill Level: Beginner
- Tap **Create Event**
- Event appears in list

### 3. Make Reservation
- Tap on an event
- Tap **Reserve Spot**
- Should show "✓ Reserved"
- Check **My Events** tab

### 4. Chat
- Open a reserved event
- Tap **Open Chat**
- Type a message
- Message appears in real-time
- Open same event in another device/simulator
- Messages sync in real-time

### 5. Cancel Reservation
- Open reserved event
- Tap **Cancel Reservation**
- Confirmation appears
- Event removed from **My Events**

## 🔧 Troubleshooting

### Backend Issues

#### "Cannot connect to database"
```bash
# Check PostgreSQL status
brew services list

# Restart PostgreSQL
brew services restart postgresql@14

# Check connection
psql -U postgres -d picklehub
```

#### "Port 3001 already in use"
```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- -p 3003
```

#### "Prisma Client not generated"
```bash
cd backend
npm run prisma:generate
```

### iOS Issues

#### "Google Sign-In Failed"
**Check:**
1. Client ID in `Config.swift` matches Google Console
2. Info.plist URL scheme is correct
3. Backend is running
4. Network connection is working

**Debug:**
```swift
// Add to AuthViewModel.signInWithGoogle()
print("Client ID: \(Config.googleClientID)")
print("Error: \(error)")
```

#### "Cannot connect to API"
**For Simulator:**
- Use `http://localhost:3001`

**For Physical Device:**
- Use Mac's local IP: `http://192.168.x.x:3001`
- Verify same WiFi network
- Check Mac firewall settings:
  - System Preferences → Security & Privacy → Firewall
  - Allow incoming connections for Node

**Test connection:**
```bash
# From Mac
curl http://localhost:3001/api/events

# From iPhone Safari
http://YOUR_MAC_IP:3001
```

#### "Build Failed - Missing Package"
1. File → Packages → Resolve Package Versions
2. File → Packages → Update to Latest Package Versions
3. Clean build folder: ⌘ + Shift + K
4. Rebuild: ⌘ + B

#### "WebSocket won't connect"
**Check:**
1. WebSocket server is running
2. URL in `Config.swift` is correct
3. No firewall blocking port 3002

**Debug:**
```swift
// Add to WebSocketClient.connect()
print("Connecting to: \(Config.websocketURL)")
```

### Common Errors

#### "ECONNREFUSED"
→ Backend server is not running. Start `npm run dev`

#### "Invalid token"
→ Google Client ID mismatch. Verify IDs match between iOS and backend

#### "Database migration failed"
```bash
# Reset database
cd backend
npx prisma migrate reset

# Rerun migration
npm run prisma:migrate
```

#### "Xcode: Command PhaseScriptExecution failed"
→ Clean build folder (⌘ + Shift + K) and rebuild

## 📱 Device Testing

### iOS Simulator
- No special configuration needed
- Use `localhost` URLs
- Google Sign-In works
- Good for quick testing

### Physical iPhone
1. **Same WiFi Network**
   - Mac and iPhone must be on same network
   - Corporate networks may block connections

2. **Update URLs**
   ```swift
   // Config.swift
   static let apiBaseURL = "http://192.168.1.100:3001" // Your Mac IP
   static let websocketURL = "ws://192.168.1.100:3002"
   ```

3. **Firewall Settings**
   - Allow Node.js in Mac firewall
   - Or temporarily disable firewall for testing

4. **Developer Certificate**
   - Sign in to Xcode with Apple ID
   - Trust certificate on iPhone:
     - Settings → General → VPN & Device Management

## 🎯 Next Steps

### Enhance Backend
- [ ] Add JWT authentication
- [ ] Implement rate limiting
- [ ] Add image upload for events
- [ ] Email notifications
- [ ] Push notifications setup

### Enhance iOS
- [ ] Add image picker for profile
- [ ] Implement event search/filter
- [ ] Add calendar integration
- [ ] Offline mode support
- [ ] Push notifications

### Production Deployment
- [ ] Deploy backend to Vercel/Railway
- [ ] Setup production PostgreSQL (Supabase/Neon)
- [ ] Configure production OAuth
- [ ] Setup SSL/TLS
- [ ] Submit iOS app to App Store

## 💡 Tips

### Development Workflow
1. Keep both backend servers running
2. Use Xcode SwiftUI Previews for UI
3. Use Prisma Studio to inspect database
4. Use Postman/curl to test APIs
5. Check server logs for errors

### Performance
- WebSocket reconnects automatically
- API calls use async/await
- Images load asynchronously
- Database queries are optimized

### Security
- Never commit `.env` file
- Keep API tokens secure
- Validate all user input
- Use HTTPS in production

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Google Sign-In iOS](https://developers.google.com/identity/sign-in/ios)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 🆘 Getting Help

If you encounter issues:
1. Check this troubleshooting guide
2. Review server logs
3. Check Xcode console
4. Open GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

**Happy coding! 🎉**
