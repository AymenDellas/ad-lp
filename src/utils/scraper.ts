export async function scrapeContent(url: string): Promise<any> {
  try {
    // Try multiple CORS proxies for better reliability
    const proxies = [
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    ];
    
    let response;
    let data;
    let lastError;
    
    for (const proxyUrl of proxies) {
      try {
        response = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (proxyUrl.includes('allorigins.win')) {
          data = await response.json();
          if (data.contents) {
            data = { contents: data.contents };
            break;
          }
        } else {
          const text = await response.text();
          if (text && text.length > 100) {
            data = { contents: text };
            break;
          }
        }
      } catch (error) {
        lastError = error;
        console.warn(`Proxy ${proxyUrl} failed:`, error);
        continue;
      }
    }
    
    if (!data || !data.contents) {
      throw new Error(`All CORS proxies failed. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');

    // Extract key elements
    const title = doc.querySelector('title')?.textContent || '';
    
    // Find headlines (h1, h2, or prominent text)
    const h1Elements = Array.from(doc.querySelectorAll('h1')).map(h => h.textContent?.trim()).filter(Boolean);
    const h2Elements = Array.from(doc.querySelectorAll('h2')).map(h => h.textContent?.trim()).filter(Boolean);
    const headline = h1Elements[0] || h2Elements[0] || title;
    
    const subheadline = h1Elements[1] || h2Elements[0] || '';

    // Extract CTAs (buttons, links with action words)
    const ctaSelectors = [
      'button',
      'a[href*="signup"]',
      'a[href*="demo"]',
      'a[href*="trial"]',
      'a[href*="free"]',
      'a[href*="get"]',
      'a[href*="start"]',
      '.cta',
      '.btn',
      '[class*="button"]'
    ];
    
    const ctas: string[] = [];
    ctaSelectors.forEach(selector => {
      doc.querySelectorAll(selector).forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length < 50) {
          ctas.push(text);
        }
      });
    });

    // Extract offers and value propositions
    const offerKeywords = ['free', 'discount', 'save', '%', 'trial', 'limited', 'bonus', 'exclusive'];
    const offers: string[] = [];
    const textNodes = doc.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6');
    textNodes.forEach(node => {
      const text = node.textContent?.trim().toLowerCase() || '';
      offerKeywords.forEach(keyword => {
        if (text.includes(keyword) && text.length < 200) {
          offers.push(node.textContent?.trim() || '');
        }
      });
    });

    // Extract images
    const images = Array.from(doc.querySelectorAll('img')).map(img => img.src).filter(Boolean);

    // Extract urgency cues
    const urgencyKeywords = ['limited', 'hurry', 'today', 'now', 'expires', 'countdown', 'spots left', 'act fast'];
    const urgencyCues: string[] = [];
    textNodes.forEach(node => {
      const text = node.textContent?.trim().toLowerCase() || '';
      urgencyKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          urgencyCues.push(node.textContent?.trim() || '');
        }
      });
    });

    // Extract body text (first few paragraphs)
    const paragraphs = Array.from(doc.querySelectorAll('p')).slice(0, 5);
    const bodyText = paragraphs.map(p => p.textContent?.trim()).filter(Boolean).join(' ').substring(0, 1000);

    // Try to identify target audience
    const audienceKeywords = ['developer', 'cto', 'devops', 'engineer', 'business', 'enterprise', 'startup', 'agency'];
    let targetAudience = '';
    audienceKeywords.forEach(keyword => {
      if (bodyText.toLowerCase().includes(keyword)) {
        targetAudience = keyword;
      }
    });

    return {
      url,
      title,
      headline,
      subheadline,
      cta: [...new Set(ctas)].slice(0, 5), // Remove duplicates, limit to 5
      offers: [...new Set(offers)].slice(0, 5),
      images: images.slice(0, 10),
      bodyText,
      targetAudience,
      urgencyCues: [...new Set(urgencyCues)].slice(0, 5)
    };

  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape ${url}: ${error.message}`);
  }
}