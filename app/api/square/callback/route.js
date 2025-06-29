// app/api/square/callback/route.js
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  console.log('Square callback received:', { code: !!code, state, error });

  if (error) {
    console.error('Square OAuth error:', error);
    return NextResponse.redirect(new URL(`/square/error?error=${encodeURIComponent(error)}`, request.url));
  }

  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(new URL('/square/error?error=no_code', request.url));
  }

  // Optional: Verify state parameter for security
  // const expectedState = 'your_unique_state_value_123';
  // if (state !== expectedState) {
  //   console.error('Invalid state parameter');
  //   return NextResponse.redirect(new URL('/square/error?error=invalid_state', request.url));
  // }

  try {
    console.log('Exchanging authorization code for tokens...');
    
    // Determine the correct base URL based on environment
    const baseUrl = process.env.SQUARE_ENVIRONMENT === 'sandbox' 
      ? 'https://connect.squareupsandbox.com' 
      : 'https://connect.squareup.com';
    
    // Get the redirect URI from the current request
    const redirectUri = new URL('/api/square/callback', request.url).toString();
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch(`${baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.SQUARE_APPLICATION_ID,
        client_secret: process.env.SQUARE_APPLICATION_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenResponse.json();

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response data:', tokenData);

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      const errorMsg = tokenData.error_description || tokenData.error || 'unknown_error';
      return NextResponse.redirect(new URL(`/square/error?error=token_exchange_failed&details=${encodeURIComponent(errorMsg)}`, request.url));
    }

    console.log('Token exchange successful!');
    console.log('Merchant ID:', tokenData.merchant_id);
    console.log('Access token received:', !!tokenData.access_token);
    console.log('Refresh token received:', !!tokenData.refresh_token);

    // TODO: Store tokens securely in your database
    // Example structure:
    const tokenInfo = {
      merchant_id: tokenData.merchant_id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      created_at: new Date().toISOString()
    };

    // Replace this with your actual database storage
    console.log('Tokens to store:', {
      merchant_id: tokenInfo.merchant_id,
      expires_at: tokenInfo.expires_at,
      scope: tokenInfo.scope
    });

    // Redirect to success page with merchant info
    const successUrl = new URL('/square/success', request.url);
    successUrl.searchParams.set('merchant_id', tokenData.merchant_id);
    
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Square callback error:', error);
    return NextResponse.redirect(new URL('/square/error?error=server_error', request.url));
  }
}