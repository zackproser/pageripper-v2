import express from 'express';
import { fetchAndParse } from './fetchAndParse'; // Import the fetch and parse module

const app = express();
const port = 3000;

// Middlewares
app.use(express.json());

// Define the route for fetching and parsing a webpage
app.post('/parse', async (req, res) => {
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

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// Handle Ctrl+C (SIGINT) interrupt
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    // Perform any additional cleanup here if necessary
    process.exit(0);
  });
});
