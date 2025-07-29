import { GoogleAdsApi } from 'google-ads-api';

export async function POST(request) {
  try {
    // Check required environment variables
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

    // Remove dashes from customer ID
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

    // Gather comprehensive account data
    const dashboardData = {};

    // 1. Account Information
    try {
      const accountInfo = await customer.query(`
        SELECT 
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone,
          customer.auto_tagging_enabled,
          customer.conversion_tracking_enabled,
          customer.remarketing_enabled,
          customer.pay_per_conversion_eligibility_failure_reasons
        FROM customer 
        WHERE customer.id = ${cleanCustomerId}
      `);
      dashboardData.account = accountInfo[0]?.customer || {};
    } catch (error) {
      dashboardData.account = { error: error.message };
    }

    // 2. Campaign Performance (Last 30 days)
    try {
      const campaigns = await customer.query(`
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.bidding_strategy_type,
          campaign.start_date,
          campaign.end_date,
          campaign.budget,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc,
          metrics.conversions,
          metrics.conversion_value,
          metrics.cost_per_conversion,
          metrics.view_through_conversions
        FROM campaign 
        WHERE segments.date DURING LAST_30_DAYS
        ORDER BY metrics.cost_micros DESC
      `);
      dashboardData.campaigns = campaigns.map(row => ({
        ...row.campaign,
        metrics: {
          ...row.metrics,
          cost: row.metrics.cost_micros / 1000000, // Convert to currency
          average_cpc: row.metrics.average_cpc / 1000000,
          cost_per_conversion: row.metrics.cost_per_conversion / 1000000
        }
      }));
    } catch (error) {
      dashboardData.campaigns = { error: error.message };
    }

    // 3. Ad Groups Performance
    try {
      const adGroups = await customer.query(`
        SELECT 
          ad_group.id,
          ad_group.name,
          ad_group.status,
          ad_group.type,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr,
          metrics.conversions
        FROM ad_group 
        WHERE segments.date DURING LAST_30_DAYS
        AND metrics.impressions > 0
        ORDER BY metrics.cost_micros DESC
        LIMIT 20
      `);
      dashboardData.ad_groups = adGroups.map(row => ({
        ...row.ad_group,
        campaign_name: row.campaign.name,
        metrics: {
          ...row.metrics,
          cost: row.metrics.cost_micros / 1000000
        }
      }));
    } catch (error) {
      dashboardData.ad_groups = { error: error.message };
    }

    // 4. Keywords Performance
    try {
      const keywords = await customer.query(`
        SELECT 
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.quality_info.quality_score,
          ad_group_criterion.status,
          campaign.name,
          ad_group.name,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr,
          metrics.conversions,
          metrics.search_impression_share,
          metrics.search_rank_lost_impression_share
        FROM keyword_view 
        WHERE segments.date DURING LAST_30_DAYS
        AND metrics.impressions > 0
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
      `);
      dashboardData.keywords = keywords.map(row => ({
        keyword: row.ad_group_criterion.keyword.text,
        match_type: row.ad_group_criterion.keyword.match_type,
        quality_score: row.ad_group_criterion.quality_info?.quality_score,
        status: row.ad_group_criterion.status,
        campaign_name: row.campaign.name,
        ad_group_name: row.ad_group.name,
        metrics: {
          ...row.metrics,
          cost: row.metrics.cost_micros / 1000000
        }
      }));
    } catch (error) {
      dashboardData.keywords = { error: error.message };
    }

    // 5. Search Terms Performance
    try {
      const searchTerms = await customer.query(`
        SELECT 
          search_term_view.search_term,
          search_term_view.status,
          campaign.name,
          ad_group.name,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr,
          metrics.conversions
        FROM search_term_view 
        WHERE segments.date DURING LAST_30_DAYS
        AND metrics.impressions > 0
        ORDER BY metrics.impressions DESC
        LIMIT 30
      `);
      dashboardData.search_terms = searchTerms.map(row => ({
        search_term: row.search_term_view.search_term,
        status: row.search_term_view.status,
        campaign_name: row.campaign.name,
        ad_group_name: row.ad_group.name,
        metrics: {
          ...row.metrics,
          cost: row.metrics.cost_micros / 1000000
        }
      }));
    } catch (error) {
      dashboardData.search_terms = { error: error.message };
    }

    // 6. Geographic Performance
    try {
      const geoPerformance = await customer.query(`
        SELECT 
          geographic_view.country_criterion_id,
          geographic_view.location_type,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions
        FROM geographic_view 
        WHERE segments.date DURING LAST_30_DAYS
        AND metrics.impressions > 0
        ORDER BY metrics.cost_micros DESC
        LIMIT 20
      `);
      dashboardData.geographic = geoPerformance.map(row => ({
        ...row.geographic_view,
        metrics: {
          ...row.metrics,
          cost: row.metrics.cost_micros / 1000000
        }
      }));
    } catch (error) {
      dashboardData.geographic = { error: error.message };
    }

    // 7. Device Performance
    try {
      const devicePerformance = await customer.query(`
        SELECT 
          segments.device,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr,
          metrics.conversions,
          metrics.conversion_rate
        FROM campaign 
        WHERE segments.date DURING LAST_30_DAYS
        ORDER BY metrics.cost_micros DESC
      `);
      dashboardData.devices = devicePerformance.map(row => ({
        device: row.segments.device,
        metrics: {
          ...row.metrics,
          cost: row.metrics.cost_micros / 1000000
        }
      }));
    } catch (error) {
      dashboardData.devices = { error: error.message };
    }

    // 8. Extensions Performance
    try {
      const extensions = await customer.query(`
        SELECT 
          ad_group_extension_setting.extension_type,
          campaign.name,
          ad_group.name,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros
        FROM ad_group_extension_setting 
        WHERE segments.date DURING LAST_30_DAYS
        AND metrics.impressions > 0
        LIMIT 20
      `);
      dashboardData.extensions = extensions.map(row => ({
        extension_type: row.ad_group_extension_setting.extension_type,
        campaign_name: row.campaign.name,
        ad_group_name: row.ad_group.name,
        metrics: {
          ...row.metrics,
          cost: row.metrics.cost_micros / 1000000
        }
      }));
    } catch (error) {
      dashboardData.extensions = { error: error.message };
    }

    // 9. Budget Information
    try {
      const budgets = await customer.query(`
        SELECT 
          campaign_budget.id,
          campaign_budget.name,
          campaign_budget.amount_micros,
          campaign_budget.delivery_method,
          campaign_budget.status,
          campaign_budget.period
        FROM campaign_budget
      `);
      dashboardData.budgets = budgets.map(row => ({
        ...row.campaign_budget,
        amount: row.campaign_budget.amount_micros / 1000000
      }));
    } catch (error) {
      dashboardData.budgets = { error: error.message };
    }

    // 10. Summary Statistics
    try {
      const summary = await customer.query(`
        SELECT 
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc,
          metrics.conversions,
          metrics.conversion_rate,
          metrics.conversion_value,
          metrics.cost_per_conversion
        FROM customer 
        WHERE segments.date DURING LAST_30_DAYS
      `);
      
      if (summary.length > 0) {
        dashboardData.summary = {
          ...summary[0].metrics,
          cost: summary[0].metrics.cost_micros / 1000000,
          average_cpc: summary[0].metrics.average_cpc / 1000000,
          cost_per_conversion: summary[0].metrics.cost_per_conversion / 1000000
        };
      }
    } catch (error) {
      dashboardData.summary = { error: error.message };
    }

    return Response.json({
      success: true,
      data: dashboardData,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Google Ads Dashboard Error:', error);
    
    return Response.json({
      error: error.message || 'Unknown error occurred',
      details: error.errors || null
    }, { status: 500 });
  }
} 