import express, { Express } from 'express';

export function configureServer(fetchAndParse: Function): Express {
  const app = express();

  // Middlewares
  app.use(express.json());

  // Health Check Endpoint
  app.get('/', (_req, res) => {
    res.status(200).send('OK');
  });

  // Define the route for fetching and parsing a webpage
  app.post('/extracts', async (req, res) => {
    try {
      const { url, options } = req.body;
      if (!url) {
        return res.status(400).send('URL is required');
      }

      console.log(`Fetching and parsing ${url}`);

      const parsedData = await fetchAndParse(url, options);
      res.status(200).json(parsedData);
    } catch (error) {
      console.log(`error: ${error}`);
      res.status(500).send('Error processing your request');
    }
  });

  return app;
}

