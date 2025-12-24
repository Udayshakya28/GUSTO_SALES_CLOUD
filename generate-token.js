const snoowrap = require('snoowrap');
const readline = require('readline');

// This script will guide you through getting a refresh token.
// You will need your Client ID, Client Secret, and Redirect URI from your Reddit App settings.

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// These are the permissions your app will request.
// 'identity' is required. 'read' lets you view posts. 'submit' lets you reply.
const redditScriptScopes = [
  'identity',
  'read',
  'history',
  'submit'
];

console.log('--- Reddit Refresh Token Generator ---');

rl.question('Enter your REDDIT_CLIENT_ID: ', (clientId) => {
  rl.question('Enter your REDDIT_CLIENT_SECRET: ', (clientSecret) => {
    rl.question('Enter your REDDIT_REDIRECT_URI (e.g., http://localhost:5000/api/auth/reddit/callback): ', (redirectUri) => {

      const authenticationUrl = snoowrap.getAuthUrl({
        clientId: clientId,
        scope: redditScriptScopes,
        redirectUri: redirectUri,
        permanent: true, // This is key to get a refresh token
        state: 'redlead-auth' // Can be any random string
      });

      console.log('\nSTEP 1: Open this URL in your browser:\n');
      console.log(authenticationUrl);
      console.log('\nSTEP 2: Authorize the app. You will be redirected to a new page.');
      console.log('STEP 3: Copy the `code` value from the URL in your browser\'s address bar.');
      console.log('   (The URL will look like: http://localhost:5000/...?state=...&code=THIS_PART_HERE)\n');

      rl.question('STEP 4: Paste the `code` here and press Enter: ', (authCode) => {
        snoowrap.fromAuthCode({
          code: authCode,
          userAgent: 'token-generator-script 1.0',
          clientId: clientId,
          clientSecret: clientSecret,
          redirectUri: redirectUri
        }).then(r => {
          console.log('\n✅ Success! Here is your Refresh Token:\n');
          console.log(r.refreshToken);
          console.log('\nCopy this value into your .env file as REDDIT_REFRESH_TOKEN.');
          rl.close();
        }).catch(err => {
            console.error('\n❌ Error getting refresh token:', err.message);
            rl.close();
        });
      });
    });
  });
});