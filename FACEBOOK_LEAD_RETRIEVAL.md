# Facebook Lead Retrieval Feature

## Overview

The Facebook Lead Retrieval feature allows you to pull lead data directly from Facebook Lead Ads API to handle cases where webhooks miss lead submissions. This ensures that no leads are lost due to webhook delivery issues.

## Features

- **Direct API Integration**: Fetches leads directly from Facebook's Graph API
- **Duplicate Prevention**: Automatically detects and skips existing leads
- **Welcome Message**: Sends automated welcome messages to new leads
- **Real-time Results**: Shows detailed results of the retrieval process
- **Integration Management**: Works with existing Facebook lead form integrations

## How It Works

### 1. Webhook vs API Retrieval

**Webhook Method (Existing)**:
- Facebook sends lead data to your webhook endpoint when forms are submitted
- Real-time but can miss leads due to delivery issues

**API Retrieval Method (New)**:
- Manually pull lead data from Facebook's API
- Ensures no leads are missed
- Can be used as a backup or periodic sync

### 2. Process Flow

1. **Form Selection**: Choose which Facebook lead form to retrieve from
2. **API Call**: Fetch leads using Facebook Graph API
3. **Data Processing**: Extract and format lead information
4. **Duplicate Check**: Compare with existing leads in your database
5. **Lead Creation**: Create new leads for submissions not already in your system
6. **Welcome Message**: Send automated welcome messages to new leads
7. **Results Display**: Show summary of processed leads

## Usage

### Frontend (Leads Page)

1. Navigate to the **Leads** page
2. Click the **"Retrieve Facebook Leads"** button
3. Select a Facebook lead form from the dropdown
4. Choose the associated integration
5. Click **"Retrieve Leads"**
6. View the results showing new and existing leads

### Backend API Endpoints

#### Get Facebook Lead Forms
```
GET /api/facebook-lead-forms
```

**Response**:
```json
{
  "forms": [
    {
      "id": "123456789",
      "name": "Contact Form",
      "status": "ACTIVE",
      "integration_id": 1,
      "page_id": "987654321"
    }
  ]
}
```

#### Retrieve Facebook Leads
```
POST /api/facebook-lead-retrieval
```

**Request Body**:
```json
{
  "form_id": "123456789",
  "integration_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Retrieved 5 new leads and found 2 existing leads",
  "data": {
    "total_processed": 7,
    "new_leads": 5,
    "existing_leads": 2,
    "processed_leads": [
      {
        "facebook_lead_id": "lead_123",
        "status": "created",
        "lead_id": 456,
        "name": "John Doe"
      }
    ]
  }
}
```

## Configuration

### Prerequisites

1. **Facebook Lead Form Integration**: Must have a configured Facebook lead form integration
2. **Page Access Token**: Valid Facebook page access token with `leads_retrieval` permission
3. **Form ID**: Facebook lead form ID

### Integration Setup

1. Go to **Integrations** page
2. Configure Facebook Lead Form integration
3. Ensure page access token has required permissions
4. Test the integration

## Error Handling

### Common Issues

1. **No Integrations Found**: Configure a Facebook lead form integration first
2. **Missing Access Token**: Ensure the integration has a valid page access token
3. **API Rate Limits**: Facebook has rate limits on API calls
4. **Permission Issues**: Ensure the access token has `leads_retrieval` permission

### Error Responses

```json
{
  "error": "Lead form integration not found"
}
```

```json
{
  "error": "Facebook access token not found"
}
```

```json
{
  "error": "Failed to fetch leads from Facebook"
}
```

## Security Considerations

- **Access Token Security**: Store Facebook access tokens securely
- **User Isolation**: Each user can only access their own integrations
- **API Rate Limits**: Respect Facebook's API rate limits
- **Data Privacy**: Handle lead data according to privacy regulations

## Monitoring

### Logs

The system logs all Facebook API interactions:

- Lead form fetching
- Lead data retrieval
- Error responses
- Processing results

### Metrics

Track the following metrics:

- Number of leads retrieved
- Success/failure rates
- Processing time
- Duplicate detection rate

## Best Practices

1. **Regular Sync**: Use this feature periodically to catch missed leads
2. **Monitor Logs**: Check logs for any API errors or issues
3. **Test Integrations**: Regularly test Facebook integrations
4. **Backup Strategy**: Use this as a backup to webhook-based lead capture

## Troubleshooting

### No Forms Available

1. Check if Facebook integration is properly configured
2. Verify page access token is valid
3. Ensure the page has lead forms
4. Check Facebook API permissions

### API Errors

1. Verify access token permissions
2. Check Facebook API status
3. Review error logs for specific issues
4. Ensure form ID is correct

### No New Leads Retrieved

1. Check if leads were already processed via webhook
2. Verify form has recent submissions
3. Check Facebook API response for data
4. Review lead processing logic

## Future Enhancements

- **Scheduled Retrieval**: Automate periodic lead retrieval
- **Bulk Operations**: Retrieve from multiple forms at once
- **Advanced Filtering**: Filter leads by date range or other criteria
- **Webhook Status Monitoring**: Track webhook delivery success rates

