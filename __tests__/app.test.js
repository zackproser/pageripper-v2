import request from 'supertest';
import express from 'express';
import { fetchAndParse } from '../fetchAndParse';

jest.mock('../fetchAndParse'); // Mock the fetchAndParse module

const app = express();
app.use(express.json());

app.post('/parse', async (req, res) => {
  try {
    const { url, options } = req.body;
    if (!url) {
      return res.status(400).send('URL is required');
    }

    const parsedData = await fetchAndParse(url, options);
    res.status(200).json(parsedData);
  } catch (error) {
    res.status(500).send('Error processing your request');
  }
});

describe('POST /parse', () => {
  it('should require a URL', async () => {
    const response = await request(app)
      .post('/parse')
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('URL is required');
  });

  it('should return parsed data for valid request', async () => {
    fetchAndParse.mockResolvedValue({ data: 'mocked data' });

    const response = await request(app)
      .post('/parse')
      .send({ url: 'http://example.com', options: {} });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ data: 'mocked data' });
  });

  it('should handle errors in fetchAndParse', async () => {
    fetchAndParse.mockRejectedValue(new Error('mock error'));

    const response = await request(app)
      .post('/parse')
      .send({ url: 'http://example.com', options: {} });

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Error processing your request');
  });
});

