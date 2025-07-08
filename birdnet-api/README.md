# BirdNET API Backend

This is the BirdNET API backend service for the QuStar bird identification app.

## What This Does

- Provides `/analyze` endpoint for bird audio analysis
- Uses BirdNET machine learning models to identify bird species
- Accepts audio file URLs and returns species predictions
- Designed to work with QuStar's Supabase Edge Functions

## Deployment to Railway

1. Create new Railway project
2. Connect this folder to Railway
3. Railway will automatically use the `dockerfile`
4. The service will be available at: `https://your-project.railway.app`

## API Endpoints

- `GET /` - Health check
- `POST /analyze` - Analyze bird audio
  ```json
  {
    "url": "https://example.com/audio.wav",
    "min_conf": 0.1
  }
  ```

## Environment Variables

No additional environment variables needed - the dockerfile handles everything.

## Usage in QuStar

Set this Railway URL as `BIRDNET_URL` in your Supabase Edge Functions environment variables. 