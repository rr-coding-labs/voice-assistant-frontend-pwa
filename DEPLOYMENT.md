# Deployment Guide for Render.com

This guide will help you deploy your Voice Assistant PWA to Render.com.

## Prerequisites

1. Create PNG icons from your SVG:
   - Visit https://cloudconvert.com/svg-to-png
   - Upload `public/icon.svg`
   - Create two versions:
     - 192x192 pixels → save as `public/icon-192.png`
     - 512x512 pixels → save as `public/icon-512.png`

2. Ensure all files are committed to your Git repository:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push
   ```

## Deployment Steps

### 1. Create a Render Account
- Go to https://render.com
- Sign up or log in
- Connect your GitHub/GitLab account

### 2. Create a New Web Service
1. Click "New +" button
2. Select "Web Service"
3. Connect your repository
4. Select the `voice-assistant-frontend-pwa` directory

### 3. Configure the Service
Render should auto-detect the settings from `render.yaml`, but verify:

- **Name**: `voice-assistant-pwa` (or your preferred name)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free (or choose paid for better performance)

### 4. Set Environment Variables
Add these environment variables in Render dashboard:

```
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
PORT=10000
```

**Important**: Get your LiveKit credentials from:
- LiveKit Cloud Dashboard: https://cloud.livekit.io
- Or your self-hosted LiveKit instance

### 5. Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Wait for the deployment to complete (usually 2-5 minutes)

### 6. Access Your App
Once deployed, Render will provide a URL like:
```
https://voice-assistant-pwa.onrender.com
```

You can also set up a custom domain in Render settings.

## Testing the PWA

### On Desktop
1. Open your deployed URL in Chrome/Edge
2. Look for the install icon in the address bar
3. Click "Install" to add to your desktop

### On Mobile
1. Open your deployed URL in mobile browser
2. Tap the browser menu
3. Select "Add to Home Screen" or "Install App"
4. The app will appear on your home screen like a native app

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure Node version is compatible (20.x)
- Check Render build logs for specific errors

### App Doesn't Load
- Verify environment variables are set correctly
- Check browser console for errors
- Ensure LiveKit credentials are valid

### Token Generation Fails
- Verify `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` are set
- Check that the API endpoint `/api/token` is accessible
- Test locally first with `npm run build && npm start`

### PWA Not Installing
- Ensure PNG icons exist in `public` folder
- Check browser console for manifest errors
- Verify the app is served over HTTPS (Render provides this automatically)

## Local Testing Before Deployment

Test the production build locally:

```bash
# Build the app
npm run build

# Start the production server
npm start

# Visit http://localhost:3001
```

## Updating the Deployment

To update your deployed app:

```bash
git add .
git commit -m "Update app"
git push
```

Render will automatically rebuild and redeploy your app.

## Custom Domain Setup

1. In Render dashboard, go to your service settings
2. Click "Custom Domain"
3. Add your domain name
4. Update your domain's DNS settings as instructed by Render
5. Wait for DNS propagation (can take up to 48 hours)

## Performance Optimization

For better performance on the free tier:
- Render free services spin down after inactivity
- First request after inactivity may take 30-60 seconds
- Consider upgrading to a paid plan for production use

## Security Notes

- Never commit `.env` files with secrets
- Always use environment variables in Render dashboard
- Keep your LiveKit credentials secure
- Consider enabling CORS restrictions in production
