# 🏓 PickleHub

**A full-stack iOS application for connecting pickleball players, creating events, and chatting in real-time.**

Built with Swift + SwiftUI + Next.js + PostgreSQL + WebSocket

---

## ✨ Features

### 🔐 Authentication
- Google Sign-In integration
- Persistent authentication
- Secure token-based API access

### 📅 Event Management
- Create, update, and delete pickleball events
- Browse upcoming events
- Filter by skill level (beginner, intermediate, advanced, all)
- View event details and participants
- Track available spots

### 🎟️ Reservations
- Reserve spots in events
- Cancel reservations
- View your reserved events
- Prevent overbooking

### 💬 Real-time Chat
- WebSocket-based chat rooms for each event
- Live message delivery
- User join/leave notifications
- Persistent message history
- Automatic reconnection

---

## 🏗️ Tech Stack

### Backend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Real-time:** WebSocket (ws)
- **Auth:** Google OAuth 2.0

### iOS
- **Language:** Swift
- **UI:** SwiftUI
- **Architecture:** MVVM
- **Async:** async/await
- **Networking:** URLSession
- **Auth:** Google Sign-In SDK

---

## 📁 Project Structure

```
pickleapp/
├── backend/              # Next.js API + WebSocket server
│   ├── app/api/          # REST API endpoints
│   ├── lib/              # Utilities, types, Prisma client
│   ├── prisma/           # Database schema & migrations
│   └── server/           # WebSocket server
│
└── ios/PickleHub/        # iOS SwiftUI app
    ├── Models/           # Data models
    ├── Services/         # API & WebSocket clients
    ├── ViewModels/       # MVVM view models
    └── Views/            # SwiftUI views
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Xcode (v15+)
- Google Cloud account

### 1. Backend Setup

```bash
cd backend
npm install
createdb picklehub
cp .env.example .env
# Edit .env with your Google Client ID
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Terminal 1 - API Server
npm run dev

# Terminal 2 - WebSocket Server
npm run start:ws
```

### 2. iOS Setup

```bash
cd ios
open PickleHub.xcodeproj
```

In Xcode:
1. Add Google Sign-In package
2. Update `Config.swift` with your Google Client ID
3. Update `Info.plist` with OAuth URL scheme
4. Build and run (⌘ + R)

### 3. Configure Google OAuth

See [SETUP.md](SETUP.md) for detailed Google OAuth setup instructions.

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup guide with troubleshooting
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Full API reference
- **Backend README** - See `backend/` directory
- **iOS README** - See `ios/` directory

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/google` - Google Sign-In

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Reservations
- `GET /api/reservations` - Get user reservations
- `POST /api/reservations` - Make reservation
- `DELETE /api/reservations/:id` - Cancel reservation

### Chat
- `GET /api/chat/rooms/:eventId` - Get chat room
- `POST /api/chat/messages` - Send message

### WebSocket
- `ws://localhost:3002` - Real-time chat server

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete details.

---

## 🗄️ Database Schema

### Tables
- **User** - User accounts (Google OAuth)
- **Event** - Pickleball events
- **Reservation** - Event reservations
- **ChatRoom** - Event chat rooms
- **Message** - Chat messages

See `backend/prisma/schema.prisma` for full schema.

---

## 🧪 Testing

### Test Backend
```bash
# Test API
curl http://localhost:3001/api/events

# Test WebSocket
npm install -g wscat
wscat -c ws://localhost:3002
```

### Test iOS
1. Run in simulator (⌘ + R)
2. Sign in with Google
3. Create an event
4. Make a reservation
5. Open chat and send messages

---

## 🔧 Development

### Backend Development
```bash
cd backend

# Start API server
npm run dev

# Start WebSocket server
npm run start:ws

# View database
npm run prisma:studio

# Create migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset
```

### iOS Development
- Use SwiftUI Previews for rapid UI iteration
- Test on both simulator and physical device
- Check Xcode console for errors
- Use breakpoints in ViewModels

---

## 🚢 Deployment

### Backend (Vercel)
1. Push to GitHub
2. Import in Vercel
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

### iOS (App Store)
1. Enroll in Apple Developer Program
2. Create App ID and certificates
3. Archive app in Xcode
4. Upload to App Store Connect
5. Submit for review

---

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `brew services list`
- Verify database exists: `psql -l | grep picklehub`
- Check port 3001 is available: `lsof -i :3001`

### iOS can't connect
- Verify backend is running
- Check URLs in `Config.swift`
- For device testing, use Mac's IP address
- Disable VPN if active

### Google Sign-In fails
- Verify Client ID matches
- Check Info.plist URL scheme
- Ensure backend has correct Client ID

See [SETUP.md](SETUP.md) for complete troubleshooting guide.

---

## 📱 Screenshots

### iOS App
- Login with Google
- Browse events list
- Event details with reservations
- Create new event
- Real-time chat interface
- User profile

---

## 🛣️ Roadmap

### Upcoming Features
- [ ] Push notifications
- [ ] Image upload for events
- [ ] Event search and filters
- [ ] User ratings and reviews
- [ ] Location-based event discovery
- [ ] Calendar integration
- [ ] Email notifications

### Technical Improvements
- [ ] JWT authentication
- [ ] Rate limiting
- [ ] Caching layer
- [ ] Offline mode
- [ ] Error tracking
- [ ] Analytics

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Authors

Built as a demonstration of full-stack iOS development with modern technologies.

---

## 🆘 Support

- **Issues:** Open a GitHub issue
- **Questions:** See documentation
- **Security:** Report vulnerabilities privately

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- Google for Sign-In SDK
- Apple for SwiftUI

---

**Happy coding! 🎉**

For detailed setup instructions, see [SETUP.md](SETUP.md)

For API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)