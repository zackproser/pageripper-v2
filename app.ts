import { fetchAndParse } from './fetchAndParse';
import { configureServer } from './configureServer'

const app = configureServer(fetchAndParse);
const port = 3000;

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
