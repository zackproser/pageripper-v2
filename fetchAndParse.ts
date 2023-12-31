import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import { URL } from 'url';

// Define a type for the parse options
type ParseOptions = {
  includeEmails: boolean;
  includeTwitterHandles: boolean;
  includeUrls: boolean;
  waitUntilEvent?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
};

// Main function to fetch and parse a webpage
async function fetchAndParse(targetUrl: string, options: ParseOptions) {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  const waitUntilEvent = options.waitUntilEvent || 'domcontentloaded';
  await page.goto(targetUrl, { waitUntil: waitUntilEvent });

  const content = await page.content();
  const $ = cheerio.load(content);

  const extractedData = {
    emails: options.includeEmails ? extractEmails($) : [],
    twitterHandles: options.includeTwitterHandles ? extractTwitterHandles($) : [],
    mediaContentLinks: extractMediaContentLinks($),
    ecommerceLinks: extractEcommerceLinks($),
    urls: options.includeUrls ? categorizeUrls($, new URL(targetUrl).hostname) : [],
  };

  await browser.close();
  return extractedData;
}

function extractEmails($: cheerio.Root): string[] {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  return Array.from(new Set($('body').text().match(emailRegex) || []));
}

function extractTwitterHandles($: cheerio.Root): string[] {
  const twitterHandleRegex = /(?:^|\s)@(\w{1,15})\b/g;
  const handles: string[] = [];

  $('body').text().replace(twitterHandleRegex, (match, handle) => {
    handles.push(`@${handle.trim()}`);
    return match; // This return is not used, but replace expects a function that returns a string.
  });

  return Array.from(new Set(handles));
}


function categorizeUrls($: cheerio.Root, baseHostname: string): { internal: string[], external: string[] } {
  const internalUrls: string[] = [];
  const externalUrls: string[] = [];

  $('a').each((_i, link) => {
    const href = $(link).attr('href');
    if (href) {
      try {
        const linkUrl = new URL(href, `https://${baseHostname}`);
        if (linkUrl.hostname === baseHostname) {
          internalUrls.push(linkUrl.href);
        } else {
          externalUrls.push(linkUrl.href);
        }
      } catch (error) {
        console.error('Invalid URL:', href, error);
      }
    }
  });

  return {
    internal: Array.from(new Set(internalUrls)),
    external: Array.from(new Set(externalUrls))
  };
}

function extractMediaContentLinks($: cheerio.Root): string[] {
  const mediaContentRegex = /\.(jpeg|jpg|gif|png|bmp|mp4|avi|mov|mp3|wav|pdf|exe|docx|zip)$/i;
  const mediaLinks: string[] = [];

  $('a').each((_i, link) => {
    const href = $(link).attr('href')?.trim();
    if (href && mediaContentRegex.test(href)) {
      mediaLinks.push(href);
    }
  });

  return Array.from(new Set(mediaLinks)); // Remove duplicates
}

function extractEcommerceLinks($: cheerio.Root): string[] {
  const ecommercePatterns = [/amazon\.com/, /ebay\.com/, /etsy\.com/, /shopify\.com/];
  return extractLinksByPattern($, ecommercePatterns);
}

function extractLinksByPattern($: cheerio.Root, patterns: RegExp[]): string[] {
  const links: string[] = [];
  $('a').each((_i, link) => {
    const href = $(link).attr('href');
    if (href && patterns.some(pattern => pattern.test(href))) {
      links.push(href);
    }
  });
  return Array.from(new Set(links));
}

export {
  fetchAndParse,
  categorizeUrls,
  extractEmails,
  extractEcommerceLinks,
  extractTwitterHandles,
  extractMediaContentLinks
};

