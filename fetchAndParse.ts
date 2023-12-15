import puppeteer from 'puppeteer';

// Define a type for the parse options
type ParseOptions = {
  includeEmails: boolean;
  includeTwitterHandles: boolean;
  includeUrls: boolean;
};

// Main function to fetch and parse a webpage
async function fetchAndParse(url: string, options: ParseOptions) {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  const content = await page.content();
  console.log(`content: ${content}`)

  // Extract data based on options
  const extractedData = {
    emails: options.includeEmails ? extractEmails(content) : [],
    twitterHandles: options.includeTwitterHandles ? extractTwitterHandles(content) : [],
    urls: options.includeUrls ? extractUrls(content) : [],
  };

  await browser.close();
  return extractedData;
}

// Regex functions
function extractEmails(content: string): string[] {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  return Array.from(new Set(content.match(emailRegex) || []));
}

function extractTwitterHandles(content: string): string[] {
  const twitterHandleRegex = /(?:^|\s)@(\w{1,15})\b/g;
  return Array.from(new Set(content.match(twitterHandleRegex)?.map(handle => `@${handle.trim()}`) || []));
}

function extractUrls(content: string): string[] {
  const urlRegex = /https?:\/\/[^\s$.?#].[^\s]*/g;
  return Array.from(new Set(content.match(urlRegex) || []));
}

export { fetchAndParse, extractEmails, extractTwitterHandles, extractUrls };

