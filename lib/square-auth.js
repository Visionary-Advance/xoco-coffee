// lib/square-auth.js
// Simplified version for Xoco - just reads from Supabase

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Get Square auth credentials for Xoco
 */
export async function getSquareAuth() {
  try {
    const clientId = process.env.XOCO_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('XOCO_CLIENT_ID not configured');
    }

    const { data, error } = await supabase
      .from('square_auth')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to get Square auth: ${error.message}`);
    }

    if (!data) {
      throw new Error(`No active Square authorization found for ${clientId}`);
    }

    // Check if token is expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    
    if (expiresAt <= now) {
      throw new Error('Square access token has expired. Please contact Visionary Advance to refresh.');
    }

    // Update last used timestamp
    await supabase
      .from('square_auth')
      .update({ last_used_at: new Date().toISOString() })
      .eq('client_id', clientId);

    return {
      accessToken: data.access_token,
      locationId: data.default_location_id,
      merchantId: data.square_merchant_id,
      restaurantName: data.restaurant_name,
      expiresAt: data.expires_at
    };
  } catch (error) {
    console.error('Error getting Square auth:', error);
    throw error;
  }
}

/**
 * Get location ID for Xoco
 */
export async function getLocationId() {
  try {
    const auth = await getSquareAuth();
    return auth.locationId;
  } catch (error) {
    console.error('Error getting location ID:', error);
    throw error;
  }
}