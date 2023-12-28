import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

// Define a type for the parse options
type ParseOptions = {
  includeEmails: boolean;
  includeTwitterHandles: boolean;
  includeUrls: boolean;
  waitUntilEvent?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
};

// Main function to fetch and parse a webpage
async function fetchAndParse(url: string, options: ParseOptions) {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Use the specified waitUntil event or default to 'domcontentloaded'
  const waitUntilEvent = options.waitUntilEvent || 'domcontentloaded';
  await page.goto(url, { waitUntil: waitUntilEvent });

  const content = await page.content();
  const $ = cheerio.load(content);

  // Extract data based on options
  const extractedData = {
    emails: options.includeEmails ? extractEmails($) : [],
    twitterHandles: options.includeTwitterHandles ? extractTwitterHandles($) : [],
    urls: options.includeUrls ? extractUrls($) : [],
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
  return Array.from(new Set($('body').text().match(twitterHandleRegex) || []));
}

function extractUrls($: cheerio.Root): string[] {
  const urls: string[] = [];
  $('a').each((i, link) => {
    const href = $(link).attr('href');
    if (href && href.startsWith('http')) {
      urls.push(href);
    }
  });
  return Array.from(new Set(urls));
}

export {
  fetchAndParse,
  extractEmails,
  extractTwitterHandles,
  extractUrls
};

