import { google } from 'googleapis';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    // Generate authorization URL
    if (!process.env.GOOGLE_ADS_CLIENT_ID || !process.env.GOOGLE_ADS_CLIENT_SECRET) {
      return Response.json({
        error: 'Missing GOOGLE_ADS_CLIENT_ID or GOOGLE_ADS_CLIENT_SECRET'
      }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_ADS_CLIENT_ID,
      process.env.GOOGLE_ADS_CLIENT_SECRET,
      'http://localhost:3000/api/auth/google-ads/callback'
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/adwords',
      prompt: 'consent'
    });

    return Response.json({
      authUrl,
      instructions: [
        '1. Klik op de authUrl hieronder',
        '2. Log in met je Google account',
        '3. Geef toestemming voor Google Ads toegang',
        '4. Je wordt automatisch doorgeleid naar deze callback URL'
      ]
    });
  }

  try {
    // Exchange code for refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_ADS_CLIENT_ID,
      process.env.GOOGLE_ADS_CLIENT_SECRET,
      'http://localhost:3000/api/auth/google-ads/callback'
    );

    const { tokens } = await oauth2Client.getToken(code);

    return Response.json({
      success: true,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
      instructions: [
        'SUCCESS! Kopieer de refresh_token hieronder naar je .env.local bestand:',
        `GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`,
        '',
        'Ga daarna naar /google-ads om je verbinding te testen!'
      ]
    });

  } catch (error) {
    console.error('OAuth Error:', error);
    return Response.json({
      error: error.message || 'Failed to exchange code for tokens',
      details: error.response?.data || null
    }, { status: 500 });
  }
} 