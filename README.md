# Chronos — Smart Reminder App

A production-grade multilingual reminder application with voice alerts, beautiful design, and full CRUD functionality.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Framer Motion, Zustand, react-i18next |
| Backend | Node.js + Express, JWT Auth, Mongoose |
| Database | MongoDB Atlas |
| Voice | Web Speech API (abstracted for ElevenLabs/OpenAI TTS swap) |
| Sound | Web Audio API (no external files) |
| Notifications | Web Notifications API + PWA Service Worker |
| i18n | Uzbek / Russian / English |

---

## Project Structure

```
напоминатель/
├── server/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic
│   │   └── seed.js         # Sample data
│   ├── index.js
│   ├── .env.example
│   └── package.json
│
└── client/                 # React + Vite SPA
    ├── public/             # Static assets, SW, manifest
    └── src/
        ├── components/     # UI primitives + layout
        ├── hooks/          # useAuth, useReminders, scheduler
        ├── i18n/           # uz / ru / en translations
        ├── pages/          # All app pages
        ├── services/       # API client
        ├── store/          # Zustand stores
        ├── utils/          # Date, constants
        └── voice/          # TTS abstraction layer
```

---

## Quick Start

### 1. Clone and install

```bash
# Backend
cd server
npm install
cp .env.example .env
# Edit .env — add your MONGODB_URI and JWT_SECRET

# Frontend
cd ../client
npm install
```

### 2. Configure environment

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chronos
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed demo data (optional)

```bash
cd server
npm run seed
# Creates demo user: demo@chronos.app / demo1234
# Creates 10 sample reminders
```

### 4. Run

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

App runs at: **http://localhost:5173**
API runs at: **http://localhost:5000**

---

## Features

### Reminders
- Title, guest name, description
- Date/time with timezone support
- Priority: Low / Medium / High / Urgent
- Color tags (6 colors)
- Repeat: Daily / Weekly / Monthly / Custom
- Pin, complete, snooze (5/10/30 min)
- Trigger history

### Voice & Sound
- speechSynthesis for MVP (abstraction layer ready for ElevenLabs)
- Language per reminder: uz / ru / en / auto
- Auto-detect language from text content
- Multiple sound options (Web Audio API — no files needed)
- Test voice/sound from reminder form

### Scheduling
- Polls every 30 seconds for due reminders
- Checks missed reminders on tab visibility change (30-min window)
- Browser notifications (requires permission)
- Service Worker registered for future push support

### Filters
All · Today · Tomorrow · Overdue · Important · Completed · Repeating · Pinned

### Pages
- **Landing** — Hero, features, language badges
- **Login / Register** — Split-screen with decorative panel
- **Dashboard** — Stats grid, upcoming list, priority breakdown
- **Reminders** — Grid/list view, filters, search, FAB
- **Reminder Detail** — Full view, trigger history, snooze, test voice
- **Calendar** — Month grid with dot indicators, day sidebar
- **Settings** — Profile, theme, i18n, voice, export/import, password
- **404** — Gradient number, back home button

### i18n
- Uzbek, Russian, English
- Per-reminder voice language (auto-detect or manual)
- Language persisted in localStorage

### Design
- Deep dark theme + clean light theme
- CSS custom properties design system
- Framer Motion animations
- Fully responsive (mobile-first collapse)
- No UI library dependencies

---

## API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PATCH /api/auth/profile
PATCH /api/auth/change-password
```

### Reminders
```
GET    /api/reminders          ?filter=today&search=...&sort=remindAt&page=1&limit=50
GET    /api/reminders/active   — for scheduler polling
GET    /api/reminders/stats    — dashboard stats
GET    /api/reminders/export
GET    /api/reminders/:id
POST   /api/reminders
POST   /api/reminders/import
POST   /api/reminders/bulk-delete
POST   /api/reminders/:id/trigger
POST   /api/reminders/:id/snooze
PATCH  /api/reminders/:id
DELETE /api/reminders/:id
```

---

## Voice Provider Swap

To switch from speechSynthesis to ElevenLabs:

1. Create `client/src/voice/elevenLabsProvider.js` implementing the same interface:
   ```js
   export const elevenLabsProvider = {
     isSupported() { return true; },
     async speak(text, lang, options) { /* ElevenLabs API call */ },
     stop() { /* cancel request */ },
     getVoices(lang) { /* return voice list */ },
     buildReminderText(reminder, lang) { /* same logic */ },
   };
   ```

2. In `client/src/voice/VoiceProvider.js`, change:
   ```js
   import { elevenLabsProvider } from './elevenLabsProvider.js';
   const activeProvider = elevenLabsProvider;
   ```

No other code changes needed.

---

## MongoDB Setup (Atlas)

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user
3. Whitelist your IP (or `0.0.0.0/0` for dev)
4. Get connection string → paste into `server/.env` as `MONGODB_URI`

---

## PWA

The app includes a Service Worker (`public/sw.js`) and Web App Manifest.
On mobile: add to home screen for app-like experience.

---

## License

MIT
