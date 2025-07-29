import { GoogleAdsApi } from 'google-ads-api';

export async function POST(request) {
  try {
    // Check if all required environment variables are present
    const requiredVars = [
      'GOOGLE_ADS_DEVELOPER_TOKEN',
      'GOOGLE_ADS_CLIENT_ID', 
      'GOOGLE_ADS_CLIENT_SECRET',
      'GOOGLE_ADS_REFRESH_TOKEN',
      'GOOGLE_ADS_CUSTOMER_ID'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return Response.json({
        error: `Missing environment variables: ${missingVars.join(', ')}`
      }, { status: 400 });
    }

    // Remove any dashes from customer ID (Google Ads API expects format without dashes)
    const cleanCustomerId = process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, '');

    // Initialize Google Ads API client
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    // Get customer with refresh token
    const customer = client.Customer({
      customer_id: cleanCustomerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    // Test the connection by getting basic customer info
    const customerInfo = await customer.query(`
      SELECT 
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone
      FROM customer 
      WHERE customer.id = ${cleanCustomerId}
    `);

    if (customerInfo.length === 0) {
      return Response.json({
        error: 'No customer data found. Check your Customer ID.'
      }, { status: 404 });
    }

    const customer_data = customerInfo[0].customer;

    return Response.json({
      success: true,
      customerId: customer_data.id,
      accountName: customer_data.descriptive_name || 'N/A',
      currency: customer_data.currency_code || 'N/A',
      timeZone: customer_data.time_zone || 'N/A',
    });

  } catch (error) {
    console.error('Google Ads API Error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.errors && error.errors.length > 0) {
      errorMessage = error.errors[0].message;
    }

    return Response.json({
      error: errorMessage
    }, { status: 500 });
  }
} 