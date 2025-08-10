# Ad Alignment Backend Service

A Node.js backend service with Puppeteer for accurate web scraping and Groq AI analysis.

## Features

- **Puppeteer Web Scraping**: Extremely accurate content extraction using real browser automation
- **Groq AI Analysis**: Advanced misalignment detection using Llama 3.1
- **Comprehensive Content Extraction**: Headlines, CTAs, offers, urgency cues, pricing, social proof
- **RESTful API**: Clean endpoints for scraping and analysis

## Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Production Deployment

#### Deploy to Railway
1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Railway will auto-deploy on push

#### Deploy to Render
1. Connect repo to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

#### Deploy to Vercel (Serverless)
```bash
npm install -g vercel
vercel --prod
```

## API Endpoints

### Health Check
```
GET /health
```

### Scrape Single URL
```
POST /api/scrape
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Full Analysis
```
POST /api/analyze
Content-Type: application/json

{
  "adUrl": "https://facebook.com/ads/...",
  "landingPageUrl": "https://example.com"
}
```

## Environment Variables

- `GROQ_API_KEY`: Your Groq API key
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `PUPPETEER_EXECUTABLE_PATH`: Custom Chrome path (for some cloud platforms)

## Cloud Platform Notes

### Railway
- Automatically installs Chromium
- No additional configuration needed

### Render
- Add buildpack: `https://github.com/jontewks/puppeteer-heroku-buildpack`
- Set `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser`

### Google Cloud Run
- Use custom Dockerfile with Chrome installed
- Increase memory allocation to 2GB+

## Performance Tips

- Service handles browser lifecycle automatically
- Each request launches fresh browser instance for accuracy
- Typical response time: 5-15 seconds per analysis
- Consider implementing request queuing for high traffic