import puppeteer from 'puppeteer';

export async function scrapeWithPuppeteer(url) {
  let browser;
  
  try {
    console.log(`Launching browser for ${url}`);
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log(`Navigating to ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    console.log('Extracting content...');
    
    const scrapedData = await page.evaluate(() => {
      // Helper function to get text content safely
      const getTextContent = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : '';
      };
      
      // Helper function to get all text contents
      const getAllTextContents = (selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements)
          .map(el => el.textContent.trim())
          .filter(text => text.length > 0);
      };
      
      // Extract title
      const title = document.title || '';
      
      // Extract headlines with priority order
      const h1Elements = getAllTextContents('h1');
      const h2Elements = getAllTextContents('h2');
      const h3Elements = getAllTextContents('h3');
      
      const headline = h1Elements[0] || h2Elements[0] || h3Elements[0] || title;
      const subheadline = h1Elements[1] || h2Elements[0] || h3Elements[0] || '';
      
      // Extract CTAs with comprehensive selectors
      const ctaSelectors = [
        'button',
        'a[href*="signup"]',
        'a[href*="demo"]',
        'a[href*="trial"]',
        'a[href*="free"]',
        'a[href*="get"]',
        'a[href*="start"]',
        'a[href*="buy"]',
        'a[href*="purchase"]',
        'a[href*="order"]',
        '.cta',
        '.btn',
        '.button',
        '[class*="button"]',
        '[class*="cta"]',
        '[role="button"]',
        'input[type="submit"]'
      ];
      
      const ctas = [];
      ctaSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const text = el.textContent?.trim();
          const ariaLabel = el.getAttribute('aria-label');
          const title = el.getAttribute('title');
          
          const ctaText = text || ariaLabel || title;
          if (ctaText && ctaText.length < 100 && ctaText.length > 2) {
            ctas.push(ctaText);
          }
        });
      });
      
      // Extract offers and value propositions
      const offerKeywords = [
        'free', 'discount', 'save', '%', 'trial', 'limited', 'bonus', 
        'exclusive', 'special', 'offer', 'deal', 'promotion', 'coupon',
        'off', 'reduction', 'sale', 'clearance', 'bargain'
      ];
      
      const offers = [];
      const textElements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li');
      
      textElements.forEach(element => {
        const text = element.textContent?.trim() || '';
        const lowerText = text.toLowerCase();
        
        // Check if text contains offer keywords and is reasonable length
        if (text.length > 10 && text.length < 300) {
          offerKeywords.forEach(keyword => {
            if (lowerText.includes(keyword)) {
              offers.push(text);
            }
          });
        }
      });
      
      // Extract images
      const images = Array.from(document.querySelectorAll('img'))
        .map(img => ({
          src: img.src,
          alt: img.alt || '',
          title: img.title || ''
        }))
        .filter(img => img.src && !img.src.includes('data:image'));
      
      // Extract urgency cues
      const urgencyKeywords = [
        'limited', 'hurry', 'today', 'now', 'expires', 'countdown', 
        'spots left', 'act fast', 'don\'t miss', 'last chance', 
        'ending soon', 'while supplies last', 'urgent', 'immediate'
      ];
      
      const urgencyCues = [];
      textElements.forEach(element => {
        const text = element.textContent?.trim() || '';
        const lowerText = text.toLowerCase();
        
        urgencyKeywords.forEach(keyword => {
          if (lowerText.includes(keyword) && text.length < 200) {
            urgencyCues.push(text);
          }
        });
      });
      
      // Extract body text (main content)
      const contentSelectors = [
        'main', 'article', '.content', '.main-content', 
        '[role="main"]', '.post-content', '.entry-content'
      ];
      
      let bodyText = '';
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          bodyText = element.textContent?.trim() || '';
          break;
        }
      }
      
      // Fallback to paragraphs if no main content found
      if (!bodyText) {
        const paragraphs = getAllTextContents('p');
        bodyText = paragraphs.slice(0, 10).join(' ');
      }
      
      // Limit body text length
      bodyText = bodyText.substring(0, 2000);
      
      // Extract target audience indicators
      const audienceKeywords = [
        'developer', 'cto', 'devops', 'engineer', 'business', 'enterprise', 
        'startup', 'agency', 'freelancer', 'consultant', 'manager', 'director',
        'ceo', 'founder', 'entrepreneur', 'professional', 'team', 'company'
      ];
      
      let targetAudience = '';
      const fullText = (title + ' ' + headline + ' ' + bodyText).toLowerCase();
      
      audienceKeywords.forEach(keyword => {
        if (fullText.includes(keyword) && !targetAudience) {
          targetAudience = keyword;
        }
      });
      
      // Extract meta description
      const metaDescription = getTextContent('meta[name="description"]') || 
                             document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      
      // Extract pricing information
      const priceElements = document.querySelectorAll('[class*="price"], [class*="cost"], [class*="dollar"]');
      const pricing = Array.from(priceElements)
        .map(el => el.textContent?.trim())
        .filter(text => text && text.match(/[\$€£¥]/))
        .slice(0, 5);
      
      return {
        url: window.location.href,
        title,
        headline,
        subheadline,
        cta: [...new Set(ctas)].slice(0, 10), // Remove duplicates, limit to 10
        offers: [...new Set(offers)].slice(0, 10),
        images: images.slice(0, 15),
        bodyText,
        targetAudience,
        urgencyCues: [...new Set(urgencyCues)].slice(0, 10),
        metaDescription,
        pricing,
        wordCount: bodyText.split(' ').length,
        hasVideo: document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0,
        hasForm: document.querySelectorAll('form').length > 0,
        socialProof: getAllTextContents('[class*="testimonial"], [class*="review"], [class*="rating"]').slice(0, 5)
      };
    });
    
    console.log(`Successfully scraped ${url}`);
    return scrapedData;
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw new Error(`Failed to scrape ${url}: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}