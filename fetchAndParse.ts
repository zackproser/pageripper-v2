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

  // Use the specified waitUntil event or default to 'domcontentloaded'
  const waitUntilEvent = options.waitUntilEvent || 'domcontentloaded';
  await page.goto(targetUrl, { waitUntil: waitUntilEvent });

  const content = await page.content();
  const $ = cheerio.load(content);

  // Extract data based on options
  const extractedData = {
    emails: options.includeEmails ? extractEmails($) : [],
    twitterHandles: options.includeTwitterHandles ? extractTwitterHandles($) : [],
    urls: options.includeUrls ? categorizeUrls($, new URL(targetUrl).hostname) : [],
  };

  await browser.close();
  return extractedData;
}

function categorizeUrls($: cheerio.Root, baseHostname: string): { internal: string[], external: string[] } {
  const internalUrls: string[] = [];
  const externalUrls: string[] = [];

  $('a').each((i, link) => {
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

function extractEmails($: cheerio.Root): string[] {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  return Array.from(new Set($('body').text().match(emailRegex) || []));
}

function extractTwitterHandles($: cheerio.Root): string[] {
  const twitterHandleRegex = /(?:^|\s)@(\w{1,15})\b/g;
  return Array.from(new Set($('body').text().match(twitterHandleRegex) || []));
}

export { fetchAndParse };

