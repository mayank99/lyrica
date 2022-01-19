import type { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

export const handler: Handler = async ({ queryStringParameters }) => {
  if (!queryStringParameters) throw new Error('No query string parameters');

  const url = new URL('/.netlify/functions/lyrics', process.env.LYRICS_ENDPOINT);
  Object.entries(queryStringParameters).forEach(([key, value]) => {
    url.searchParams.set(key, value ?? '');
  });

  const response = await fetch(url.toString());

  return {
    statusCode: 200,
    body: JSON.stringify(await response.json()),
  };
};
