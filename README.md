# Sit or Jump

A single-page React app that sends a short video to the Sit or Jump prediction API and displays the predicted movement, confidence, and class probabilities.

## Local development

Requirements: Node.js 20.19+ or 22.12+ and npm.

1. Install packages:

   ```bash
   npm install
   ```

2. Create a local environment file from the example:

   ```bash
   cp .env.example .env.local
   ```

3. Check that `.env.local` contains the API base URL (without a trailing slash):

   ```dotenv
   VITE_API_URL=https://agus-dev-sit-jump-space.hf.space
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Open the local URL printed by Vite. To validate the production bundle and TypeScript/ESLint checks, run:

```bash
npm run build
npm run lint
```

The app checks API health automatically. The Hugging Face Space may need up to 90 seconds to wake on its first request.

## Deploy to Vercel

1. Push this project to GitHub and import the repository in Vercel.
2. Use the **Vite** framework preset.
3. In **Project Settings → Environment Variables**, add `VITE_API_URL` with the API base URL, without a trailing slash.
4. Redeploy after adding or changing the environment variable; Vite embeds it at build time.

The backend must allow your Vercel deployment domain through its CORS configuration. If it does not, browser requests to health and prediction endpoints will be blocked.

## API

The frontend uses `GET /api/v1/health` and posts the selected video as multipart form data (`file`) to `POST /api/v1/predict`. Video files must use `.mp4`, `.mov`, `.avi`, `.mkv`, or `.webm` and be no larger than 20 MB.
