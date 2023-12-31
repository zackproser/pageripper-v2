import request from 'supertest';
import { configureServer } from '../configureServer'

// Automatically mock the fetchAndParse module
jest.mock('../fetchAndParse', () => ({
  fetchAndParse: jest.fn()
}));
const { fetchAndParse } = require('../fetchAndParse');

// Create the app using the configureServer function
const app = configureServer(fetchAndParse);

describe('POST /extracts', () => {
  it('should require a URL', async () => {
    const response = await request(app)
      .post('/extracts')
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('URL is required');
  });

  it('should return parsed data for valid request', async () => {
    fetchAndParse.mockResolvedValue({ data: 'mocked data' });

    const response = await request(app)
      .post('/extracts')
      .send({ url: 'http://example.com', options: {} });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ data: 'mocked data' });
  });

  it('should handle errors in fetchAndParse', async () => {
    fetchAndParse.mockRejectedValue(new Error('mock error'));

    const response = await request(app)
      .post('/extracts')
      .send({ url: 'http://example.com', options: {} });

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Error processing your request');
  });
});

