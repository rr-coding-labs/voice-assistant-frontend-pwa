# Voice Assistant PWA - Mobile-First Setup Guide

A professional, mobile-first Progressive Web App (PWA) voice assistant with voice selection and audio visualizations. Optimized for mobile but beautiful on desktop too!

## ✨ Features

**Mobile-First Design:**
- 📱 Responsive design optimized for mobile phones
- 📲 Install as PWA - works like a native app
- 👆 Touch-optimized UI with proper tap targets
- 🔄 Pull-to-refresh disabled for app-like experience
- 📐 Safe area support for notched devices (iPhone, etc.)

**Visual Design:**
- 🎨 Sleek silver/grey gradient aesthetic
- ✨ Glassmorphic UI with backdrop blur
- 🌊 Smooth animations optimized for 60fps
- 📊 Dual visualizations: Wave & Bars

**Voice Features:**
- 🎙️ 4 voice options (British Male, American Female, Polish Male, Default)
- 🗣️ Real-time voice activity detection
- 🎵 Beautiful audio visualizations

## 📦 Project Structure

```
voice-assistant-pwa/
├── public/
│   └── icon.svg              # PWA icon
├── App.jsx                   # Main React component (mobile-first)
├── main.jsx                  # React entry point
├── index.html                # PWA-enabled HTML
├── package.json              # Dependencies with PWA plugin
├── vite.config.js            # Vite + PWA configuration
├── token-server.js           # Backend token generation
└── .env.local                # Environment variables (create this)
```

## 🚀 Quick Start

### 1. Create project directory

```bash
mkdir voice-assistant-pwa
cd voice-assistant-pwa
```

### 2. Copy all files

Copy these files into your new directory:
- `App.jsx`
- `main.jsx`
- `index.html`
- `package.json`
- `vite.config.js`
- `token-server.js`
- `.env.example`
- `public/icon.svg`

### 3. Set up environment variables

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your LiveKit credentials
```

Your `.env.local`:
```
VITE_LIVEKIT_URL=wss://test-todo-list-3hn7r57r.livekit.cloud
LIVEKIT_API_KEY=APIoRoJ8rHNK6cR
LIVEKIT_API_SECRET=LmK0vX4tCBof4xehf61KV7e4UbfffIp2IMBLjqsCvNoe
PORT=3001
```

### 4. Install dependencies

```bash
npm install
# or
pnpm install
```

### 5. Create PWA icons

You need to create PNG versions of the icon:

**Option A - Using ImageMagick (recommended):**
```bash
# Install ImageMagick first if you don't have it
# macOS: brew install imagemagick
# Linux: sudo apt install imagemagick
# Windows: Download from imagemagick.org

# Then generate icons
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
```

**Option B - Use an online converter:**
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `public/icon.svg`
3. Convert to 192x192 and save as `icon-192.png`
4. Convert to 512x512 and save as `icon-512.png`
5. Place both files in `public/` directory

### 6. Run the application

You need **THREE terminals**:

**Terminal 1 - Token Server:**
```bash
npm run server
# or
pnpm server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# or
pnpm dev
```

**Terminal 3 - Agent (in your agent directory):**
```bash
pnpm dev
```

### 7. Access the app

**On Desktop:**
- Go to `http://localhost:3000`

**On Mobile (same network):**
1. Find your computer's local IP address:
   - macOS/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`
2. Go to `http://YOUR-IP:3000` on your phone
3. Example: `http://192.168.1.100:3000`

## 📱 Installing as PWA

### On Mobile (iOS):
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. The app will appear on your home screen like a native app!

### On Mobile (Android):
1. Open the app in Chrome
2. Tap the three dots menu
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Install"

### On Desktop (Chrome/Edge):
1. Click the install icon in the address bar (➕ or computer icon)
2. Click "Install"

## 🎨 Mobile-Specific Features

**Touch Optimizations:**
- Minimum 44px tap targets (iOS guidelines)
- `touchAction` controls for better scrolling
- `-webkit-tap-highlight-color` removed for native feel
- No accidental zooming on inputs

**Visual Optimizations:**
- `clamp()` for responsive font sizes
- Dynamic viewport height (dvh) for mobile browsers
- Safe area insets for notched devices
- Optimized animations for mobile performance

**PWA Features:**
- Works offline after first load
- Add to home screen
- Standalone display mode (no browser UI)
- Custom theme color
- Persistent storage

## 🎤 How to Use

1. **Select a voice** from the dropdown
2. **Click "Connect"** to join a room
3. The agent joins automatically with your selected voice
4. **Start talking!** The visualization responds in real-time
5. **Toggle visualization** between wave and bars
6. **Disconnect** when done

## 🔧 Voice Configuration

Available voices (defined in both frontend and agent):
- `default` - Original voice
- `en-male` - British male voice  
- `en-female` - American female voice
- `pl-male` - Polish male voice

The frontend sends the voice choice via room metadata:
```javascript
metadata: JSON.stringify({ voice: 'en-male' })
```

## 📊 Audio Visualizations

**Wave Visualization:**
- Multi-layer sine waves
- Responds to speech activity
- Smooth 60fps animation
- Optimized for mobile performance

**Bar Visualization:**
- Real-time audio frequency bars
- Adaptive bar count (25 on mobile, 40 on desktop)
- Responsive sizing based on screen

## 🐛 Troubleshooting

### "Cannot connect" error
- Ensure all three servers are running (token, frontend, agent)
- Check `.env.local` credentials match between frontend and agent
- Verify `VITE_LIVEKIT_URL` starts with `wss://`

### PWA not installing
- Make sure you have `icon-192.png` and `icon-512.png` in `public/`
- Try building: `npm run build` then `npm run preview`
- Check browser console for service worker errors

### Mobile can't access
- Ensure phone and computer are on same WiFi network
- Use your computer's local IP, not `localhost`
- Check firewall isn't blocking port 3000

### Voice not changing
- Verify you selected voice BEFORE clicking "Connect"
- Check agent logs: should see `🎙️ Starting agent with voice: en-male`
- Ensure agent has updated voice configurations

## 🌐 Production Build

```bash
# Build for production
npm run build
# or
pnpm build

# Preview production build
npm run preview
# or
pnpm preview
```

Deploy the `dist/` folder to:
- Vercel, Netlify, or Cloudflare Pages (frontend)
- Your backend server needs to serve the token endpoint

## 📝 Customization

### Change theme colors
Edit gradients in `App.jsx`:
```javascript
background: 'linear-gradient(135deg, #1a1d23 0%, #2a2f38 100%)'
```

### Add more voices
1. Update `VOICE_CONFIGS` in your `agent.ts`
2. Update `VOICE_OPTIONS` in `App.jsx`

### Adjust mobile breakpoints
Modify `clamp()` values in `App.jsx`:
```javascript
fontSize: 'clamp(minSize, preferredSize, maxSize)'
```

## 🎯 Performance Tips

- First load may be slow while downloading models
- PWA caches assets for instant subsequent loads
- Mobile uses fewer visualization bars for better FPS
- Animations use CSS transforms for GPU acceleration

---

**Enjoy your mobile-first voice assistant PWA!** 🎉📱

For issues or questions, check the troubleshooting section above.
