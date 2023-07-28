const express = require('express');
const app = express();
const OAuth = require('oauth-1.0a');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors')
app.use(cors())
const consumerKey = 'wf2dYCRq9PFaDI13bTiFROFz4';
const consumerSecret = 'NGN9xlVRvFWC6VqwaSREpN1GiXIFa6eSC16SscAsO68oIAAC8n';

const oauth = OAuth({
  consumer: {
    key: consumerKey,
    secret: consumerSecret,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

const getRequestToken = async () => {
  const requestData = {
    url: 'https://api.twitter.com/oauth/request_token',
    method: 'POST',
    data: { oauth_callback: 'http://localhost:3001/twitter/callback' },
  };

  try {
    const response = await axios.post(requestData.url, null, {
      headers: oauth.toHeader(oauth.authorize(requestData)),
    });

    const responseData = new URLSearchParams(response.data);
    const oauthToken = responseData.get('oauth_token');
    const oauthTokenSecret = responseData.get('oauth_token_secret');
    console.log('oauthToken:', oauthToken);
    console.log('oauthTokenSecret:', oauthTokenSecret);
    return { oauthToken, oauthTokenSecret };
  } catch (error) {
    console.error('Error getting request token:', error.message);
    throw new Error('Failed to get request token.');
  }
};

const getAccessToken = async (oauthToken, oauthVerifier) => {
  const requestData = {
    url: 'https://api.twitter.com/oauth/access_token',
    method: 'POST',
    data: { oauth_verifier: oauthVerifier }, // Change the key to oauth_verifier
    options: {
      oauth_token: oauthToken,
    },
  };

  try {
    const headers = oauth.toHeader(
      oauth.authorize(requestData, { key: oauthToken }) // Add the 'key' option to specify the token
    );

    const response = await axios.post(requestData.url, null, {
      headers,
    });

    const responseData = new URLSearchParams(response.data);
    const accessToken = responseData.get('oauth_token');
    const accessTokenSecret = responseData.get('oauth_token_secret');

    return { accessToken, accessTokenSecret };
  } catch (error) {
    console.error('Error getting access token:', error.message);
    console.error('Twitter API error response:', error.response?.data);
    throw new Error('Failed to get access token.');
  }
};


// Route to initiate the OAuth 1.0a flow and get the request token
app.get('/twitter/request-token', async (req, res) => {
  try {
    const { oauthToken } = await getRequestToken();

    const authUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`;
    res.json({ authUrl });
  } catch (error) {
    console.error('Error during OAuth flow:', error.message);
    res.status(500).json({ error: 'Failed to initiate OAuth flow.' });
  }
});

// Callback route after user authorizes the app
app.get('/twitter/callback', async (req, res) => {
  // Extract oauth_verifier and oauth_token from the query parameters
  const oauthVerifier = req.query.oauth_verifier;
  const oauthToken = req.query.oauth_token;
  console.log('oauthVerifier:', oauthVerifier);
  console.log('oauthToken:', oauthToken);

  try {
      const { accessToken, accessTokenSecret } = await getAccessToken(
        oauthToken,
        oauthVerifier
      );

    console.log('accessToken:', accessToken);
    console.log('accessTokenSecret:', accessTokenSecret);
    const userDetails = await fetchUserDetails(accessToken, accessTokenSecret);

    // At this point, you have the user's access token, access token secret,
    // and the user details. You can use this information as needed.

    // For demonstration purposes, we'll return the user details as JSON.
    res.json(userDetails);
    // At this point, you have the user's access token and access token secret.
    // You can use these tokens to make authorized requests to the Twitter API.
    // For demonstration purposes, we'll return the access token and access token secret as JSON.
    // res.json({ accessToken, accessTokenSecret });
  } catch (error) {
    console.error('Error during access token retrieval:', error.message);
    console.error('Twitter API error response:', error.response?.data);
    res.status(500).json({ error: 'Failed to get access token.' });
  }
});
// const fetchUserDetails = async (accessToken, accessTokenSecret) => {
//   const client = new Twitter({
//     consumer_key: consumerKey,
//     consumer_secret: consumerSecret,
//     access_token_key: accessToken,
//     access_token_secret: accessTokenSecret,
//   });

//   return new Promise((resolve, reject) => {
//     client.get('account/verify_credentials', {}, (error, user, response) => {
//       if (error) {
//         console.error('Error fetching user details:', error.message);
//         reject(error);
//       } else {
//         resolve(user);
//       }
//     });
//   });
// };
const fetchUserDetails = async (accessToken, accessTokenSecret) => {
  const requestData = {
    url: 'https://api.twitter.com/1.1/account/verify_credentials.json',
    method: 'GET',
  };

  try {
    const headers = oauth.toHeader(
      oauth.authorize(requestData, {
        key: accessToken,
        secret: accessTokenSecret,
      })
    );

    const response = await axios.get(requestData.url, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    throw new Error('Failed to fetch user details.');
  }
};
  

app.listen(3001, () => console.log('Backend server running on port 3001.'));
