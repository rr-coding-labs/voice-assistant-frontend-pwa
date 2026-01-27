import express from 'express';
import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';

// Try loading .env.local first, then .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/api/token', async (req, res) => {
  try {
    const { roomName, participantName, metadata } = req.body;
    
    if (!roomName || !participantName) {
      return res.status(400).json({ error: 'roomName and participantName required' });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('❌ Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET in .env or .env.local');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: '10h',
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    // Add metadata to the token if provided
    if (metadata) {
      at.metadata = metadata;
    }

    const token = await at.toJwt();

    res.json({
      token,
      roomName,
      url: process.env.LIVEKIT_URL || process.env.VITE_LIVEKIT_URL,
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Token server running on http://localhost:${PORT}`);
  console.log(`📡 LiveKit URL: ${process.env.LIVEKIT_URL || process.env.VITE_LIVEKIT_URL}`);
  console.log(`🔑 API Key: ${process.env.LIVEKIT_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`🔐 API Secret: ${process.env.LIVEKIT_API_SECRET ? '✅ Set' : '❌ Missing'}`);
});