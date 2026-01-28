import express from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local in development, or from system env in production
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env or system environment variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Serve static files from dist folder
app.use(express.static(join(__dirname, 'dist')));

// Token generation endpoint
app.post('/api/token', async (req, res) => {
  try {
    const { roomName, participantName, metadata } = req.body;

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName || 'User',
        ttl: '10m',
      }
    );

    at.addGrant({
      room: roomName || `voice-assistant-${Date.now()}`,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    // Pass through metadata from frontend (contains voice selection)
    if (metadata) {
      at.metadata = metadata;
    }

    const token = await at.toJwt();

    res.json({
      token,
      url: process.env.LIVEKIT_URL || process.env.VITE_LIVEKIT_URL,
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`LiveKit URL: ${process.env.LIVEKIT_URL || process.env.VITE_LIVEKIT_URL}`);
});
