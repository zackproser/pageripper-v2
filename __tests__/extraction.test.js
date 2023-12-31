import { categorizeUrls } from '../fetchAndParse';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

describe('extractUrls', () => {
  it('should extract URLs correctly from mock HTML', () => {
    const html = fs.readFileSync(path.join(__dirname, 'mocks', 'sample.html'), 'utf8');
    const $ = cheerio.load(html);
    const extractedUrls = categorizeUrls($);

    expect(extractedUrls).toEqual({ external: ["http://wakka.com/", "http://flokka.com/"], internal: [] });
  });
});

