# 💬 Real-time Chat Application

A modern, full-stack real-time chat application built with **C# ASP.NET Core** backend and **Angular** frontend, enabling instant messaging via WebSockets.

![Chat Interface](/.gemini/antigravity/brain/0b1b8121-535b-4a9d-ae4a-760403f499b9/.system_generated/click_feedback/click_feedback_1769007028267.png)

## ✨ Features

- **Real-time Messaging** - Instant message delivery using SignalR WebSockets
- **User Presence** - See who's online with live status indicators
- **Public Channels** - Join topic-based channels (#General, #Random, #Tech)
- **Private Messaging** - Direct conversations between users
- **Rich Media Support** - Send and display images, videos, and links
- **Emoji Picker** - Express yourself with a built-in emoji selector
- **Message Persistence** - All messages saved to SQLite database
- **Typing Indicators** - See when others are typing
- **Modern UI** - Sleek dark theme with glassmorphism design

## 🏗️ Architecture

```
┌─────────────────┐      WebSocket      ┌─────────────────┐
│                 │◄──────────────────►│                 │
│  Angular SPA    │      (SignalR)      │  ASP.NET Core   │
│  (Frontend)     │                     │  (Backend)      │
│                 │                     │                 │
└─────────────────┘                     └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │     SQLite      │
                                        │   (Database)    │
                                        └─────────────────┘
```

## 📁 Project Structure

```
Instant Messaging App/
├── backend/                     # ASP.NET Core WebAPI
│   ├── Data/
│   │   └── ApplicationDbContext.cs
│   ├── Hubs/
│   │   └── ChatHub.cs          # SignalR real-time hub
│   ├── Models/
│   │   └── Entities.cs         # User, Message, Channel models
│   ├── Migrations/
│   ├── Program.cs
│   └── appsettings.json
│
└── frontend/                    # Angular 19 SPA
    └── src/app/
        ├── components/
        │   ├── login/          # Username entry screen
        │   ├── chat/           # Main chat interface
        │   ├── sidebar/        # Channels & users list
        │   ├── message-input/  # Message composer
        │   ├── message-item/   # Message bubble renderer
        │   └── emoji-picker/   # Emoji selector
        ├── services/
        │   ├── signalr.service.ts  # WebSocket connection
        │   └── chat.service.ts     # State management
        └── models/
            └── chat.models.ts      # TypeScript interfaces
```

## 🚀 Getting Started

### Prerequisites

- [.NET 8+ SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Instant Messaging App"
   ```

2. **Start the Backend**
   ```bash
   cd backend
   dotnet run --urls "http://localhost:5000"
   ```

3. **Start the Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Open the app**
   Navigate to [http://localhost:4200](http://localhost:4200)

## 📖 How It Works

### 1. User Registration
When a user visits the app, they enter a username. This creates or updates their user record in the database and establishes a SignalR WebSocket connection.

### 2. Real-time Communication
The app uses **SignalR** for bidirectional communication:
- **Client → Server**: Sending messages, joining channels, typing indicators
- **Server → Client**: New messages, user presence updates, notifications

### 3. Message Flow
```
User types message
       ↓
Frontend calls SignalR Hub method
       ↓
Backend saves to SQLite database
       ↓
Backend broadcasts to relevant users
       ↓
All connected clients receive message instantly
```

### 4. Channels & Private Messages
- **Channels**: SignalR Groups allow broadcasting to all channel members
- **Private Messages**: Direct client-to-client via connection IDs

## 🔧 Technologies

| Layer | Technology |
|-------|------------|
| Frontend | Angular 19, TypeScript, SCSS |
| Backend | ASP.NET Core 8, C# |
| Real-time | SignalR WebSockets |
| Database | SQLite + Entity Framework Core |
| State | RxJS BehaviorSubject |

## 📡 API Endpoints

### SignalR Hub (`/chathub`)

| Method | Description |
|--------|-------------|
| `Register(username)` | Join chat with username |
| `SendMessage(...)` | Send a message |
| `JoinChannel(userId, channelId)` | Join a channel |
| `LeaveChannel(userId, channelId)` | Leave a channel |
| `GetOnlineUsers()` | Get list of online users |
| `GetChannels()` | Get available channels |
| `GetChannelMessages(channelId)` | Get message history |
| `GetPrivateMessages(userId, otherUserId)` | Get private chat history |

## 🎨 UI Components

- **Login Page** - Glassmorphism card with gradient background
- **Sidebar** - Channel list with online users
- **Chat Area** - Message bubbles with timestamps
- **Message Input** - Textarea with emoji picker
- **Emoji Picker** - Categorized emoji grid

## 📝 Database Schema

```sql
Users (Id, Username, ConnectionId, IsOnline, CreatedAt)
Channels (Id, Name, Description, CreatedAt)
Messages (Id, Content, Type, Timestamp, SenderId, ReceiverId, ChannelId)
ChannelMemberships (Id, UserId, ChannelId, JoinedAt)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using Angular and ASP.NET Core
