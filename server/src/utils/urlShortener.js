const axios = require('axios');

// Helper to shorten URLs using TinyURL
async function getShortUrl(longUrl) {
  try {
    const response = await axios.get('https://tinyurl.com/api-create.php', {
      params: { url: longUrl }
    });
    return response.data;
  } catch (err) {
    console.error('[TinyURL] Failed to shorten URL:', err);
    // Fallback to long URL if shortener fails
    return longUrl;
  }
}

module.exports = { getShortUrl };
