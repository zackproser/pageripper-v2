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
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


