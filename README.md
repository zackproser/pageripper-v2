# Pageripper v2 

[![Pageripper Tests](https://github.com/zackproser/pageripper-v2/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/zackproser/pageripper-v2/actions/workflows/build-and-test.yml)
[![OpenAPI spec current](https://github.com/zackproser/pageripper-v2/actions/workflows/openapi.yml/badge.svg)](https://github.com/zackproser/pageripper-v2/actions/workflows/openapi.yml)
[![Pulumi Deploy](https://github.com/zackproser/pageripper-v2/actions/workflows/pulumi-deploy.yml/badge.svg)](https://github.com/zackproser/pageripper-v2/actions/workflows/pulumi-deploy.yml)

![pageripperv2](./img/pageripper-v2.png)

Pageripper: An advanced web data extraction API that seamlessly fetches and analyzes content from web pages. It efficiently extracts emails, social media links, media content, and more, offering a versatile solution for web scraping and data analysis tasks.

## Features and Capabilities

* Extracts various data types: emails, URLs, social media, and media links.
* Supports SPA and JavaScript-heavy websites.
* Customizable extraction options.
* Efficient handling with Puppeteer and Cheerio.

## API Documentation 

[Read the Docs](https://zackproser.github.io/pageripper-v2/)

## How it works 

Pageripper fetches data from URLs you indicate. On a per-request level, you can configure Pageripper's behavior. 

```mermaid
sequenceDiagram
    participant User
    participant Pageripper API
    participant Target URL

    User->>Pageripper API: Request data extraction (URL & options)
    Pageripper API->>Target URL: Fetch webpage content
    Target URL-->>Pageripper API: Webpage content
    Pageripper API->>Pageripper API: Extract specified data
    Pageripper API-->>User: Return extracted data
```

## Usage and Examples

To use Pageripper,  send a POST request to /extracts with the target URL and options. Example:

```javascript

// Example request using Node.js
const response = await fetch('http://api.pageripper.com/extracts', {
  method: 'POST',
  body: JSON.stringify({ url: 'https://example.com', options: {...} })
});
```

The production instance of the Pageripper API is [up and available on RapidAPI](https://rapidapi.com/zackproser/api/pageripper)

## License

Pageripper V2 is released under the MIT License. See the LICENSE file for more details.
