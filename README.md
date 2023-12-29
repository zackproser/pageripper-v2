# Pageripper v2 

[![CI](https://github.com/zackproser/pageripper-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/zackproser/pageripper-v2/actions/workflows/ci.yml)
[![Swagger spec up to date](https://github.com/zackproser/pageripper-v2/actions/workflows/swagger.yml/badge.svg)](https://github.com/zackproser/pageripper-v2/actions/workflows/swagger.yml)

![pageripperv2](./img/pageripper-v2.png)

A data-extracting API that can handle any type of website, including single page applications rendered via Javascript.

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


