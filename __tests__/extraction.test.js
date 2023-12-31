import {
  categorizeUrls,
  extractEmails,
  extractTwitterHandles
} from '../fetchAndParse';

import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

describe('categorizeUrls', () => {
  it('should extract URLs correctly from mock HTML', () => {
    const html = fs.readFileSync(path.join(__dirname, 'mocks', 'simple.html'), 'utf8');
    const $ = cheerio.load(html);
    const extractedUrls = categorizeUrls($);

    expect(extractedUrls).toEqual({ external: ["http://wakka.com/", "http://flokka.com/"], internal: [] });
  });
});

describe('extractEmails', () => {
  it('should extract email addresses correctly from mock HTML', () => {
    const html = fs.readFileSync(path.join(__dirname, 'mocks', 'emails.html'), 'utf8');
    const $ = cheerio.load(html);
    const extractedEmails = extractEmails($);

    expect(extractedEmails).toEqual([
      'john.doe@example.com',
      'jane.smith@test.com',
      'random.person@random.com'
    ]);
  });
});

describe('extractTwitterHandles', () => {
  it('should extract Twitter handles correctly from mock HTML', () => {
    const html = fs.readFileSync(path.join(__dirname, 'mocks', 'twitter.html'), 'utf8');
    const $ = cheerio.load(html);
    const extractedHandles = extractTwitterHandles($);

    // Define the expected Twitter handles
    const expectedHandles = ['@user1', '@user2', '@user3', '@user4'];

    // Test if the extracted handles match the expected ones
    expect(extractedHandles.sort()).toEqual(expectedHandles.sort());
  });
});

