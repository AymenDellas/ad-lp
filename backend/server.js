import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scrapeWithPuppeteer } from './scraper.js';
import { analyzeWithGroq } from './groqAnalysis.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Ad Alignment Backend is running' });
});

// Scrape endpoint
app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Scraping URL: ${url}`);
    const scrapedData = await scrapeWithPuppeteer(url);
    
    res.json(scrapedData);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape URL', 
      details: error.message 
    });
  }
});

// Analyze endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { adUrl, landingPageUrl } = req.body;
    
    if (!adUrl || !landingPageUrl) {
      return res.status(400).json({ 
        error: 'Both adUrl and landingPageUrl are required' 
      });
    }

    console.log(`Starting analysis for ad: ${adUrl} and LP: ${landingPageUrl}`);
    
    // Scrape both pages
    console.log('Scraping ad content...');
    const adContent = await scrapeWithPuppeteer(adUrl);
    
    console.log('Scraping landing page content...');
    const landingPageContent = await scrapeWithPuppeteer(landingPageUrl);
    
    // Analyze with Groq
    console.log('Analyzing with Groq AI...');
    const analysisResult = await analyzeWithGroq(adContent, landingPageContent);
    
    res.json({
      adContent,
      landingPageContent,
      analysis: analysisResult
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze pages', 
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Ad Alignment Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});