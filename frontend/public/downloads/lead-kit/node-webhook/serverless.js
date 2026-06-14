const axios = require('axios');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL || '';
const NOTION_WEBHOOK_URL = process.env.NOTION_WEBHOOK_URL || '';
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const SLACK_TOKEN = process.env.SLACK_TOKEN || '';
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || '#leads';
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3', 10);
const RETRY_DELAY_MS = parseInt(process.env.RETRY_DELAY_MS || '1000', 10);

function validateLead(data) {
  const errors = [];
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('name is required (min 2 characters)');
  }
  if (!data.email || typeof data.email !== 'string') {
    errors.push('email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('email is invalid');
  }
  if (data.phone && !/^[\d\s\-\+\(\)]{7,20}$/.test(data.phone)) {
    errors.push('phone format is invalid');
  }
  if (data.lead_score !== undefined) {
    const score = Number(data.lead_score);
    if (isNaN(score) || score < 0 || score > 100) {
      errors.push('lead_score must be a number between 0 and 100');
    }
  }
  return errors;
}

async function deliverWithRetry(url, payload, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      return { success: true, status: response.status, data: response.data };
    } catch (err) {
      const isLast = attempt === retries;
      if (!isLast) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * Math.pow(2, attempt - 1)));
      }
      if (isLast) {
        return {
          success: false,
          error: err.message,
          status: err.response?.status,
          attempt,
        };
      }
    }
  }
}

function formatSlackBlocks(lead) {
  const score = Number(lead.lead_score) || 0;
  let color;
  if (score >= 80) color = '#36a64f';
  else if (score >= 50) color = '#daa038';
  else color = '#a0a0a0';

  return {
    channel: SLACK_CHANNEL,
    attachments: [{
      color,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `New Lead: ${lead.name}` },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Name:*\n${lead.name}` },
            { type: 'mrkdwn', text: `*Email:*\n${lead.email}` },
            { type: 'mrkdwn', text: `*Phone:*\n${lead.phone || 'N/A'}` },
            { type: 'mrkdwn', text: `*Source:*\n${lead.source || 'Direct'}` },
            { type: 'mrkdwn', text: `*Score:*\n${score}/100` },
            { type: 'mrkdwn', text: `*Date:*\n${new Date().toISOString().split('T')[0]}` },
          ],
        },
      ],
    }],
  };
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    };
  }

  if (WEBHOOK_SECRET) {
    const received = event.headers['x-webhook-secret'] || event.headers['X-Webhook-Secret'];
    if (received !== WEBHOOK_SECRET) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid webhook secret' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  }

  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  const validationErrors = validateLead(body);
  if (validationErrors.length > 0) {
    return {
      statusCode: 422,
      body: JSON.stringify({ error: 'Validation failed', details: validationErrors }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  const lead = {
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone ? body.phone.trim() : '',
    source: body.source || 'Website Form',
    message: body.message || '',
    lead_score: Number(body.lead_score) || 0,
    timestamp: new Date().toISOString(),
  };

  const destinations = [];

  if (SHEETS_WEBHOOK_URL) {
    destinations.push({
      name: 'Google Sheets',
      url: SHEETS_WEBHOOK_URL,
      payload: lead,
    });
  }

  if (NOTION_WEBHOOK_URL) {
    destinations.push({
      name: 'Notion',
      url: NOTION_WEBHOOK_URL,
      payload: lead,
    });
  }

  if (SLACK_WEBHOOK_URL) {
    destinations.push({
      name: 'Slack',
      url: SLACK_WEBHOOK_URL,
      payload: formatSlackBlocks(lead),
    });
  }

  if (SLACK_TOKEN) {
    destinations.push({
      name: 'Slack API',
      url: 'https://slack.com/api/chat.postMessage',
      payload: formatSlackBlocks(lead),
      headers: { Authorization: `Bearer ${SLACK_TOKEN}` },
    });
  }

  if (destinations.length === 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Lead received but no destinations configured',
        lead_id: `lead_${Date.now()}`,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  const results = await Promise.allSettled(
    destinations.map(dest => deliverWithRetry(dest.url, dest.payload))
  );

  const deliveryResults = destinations.map((dest, i) => ({
    destination: dest.name,
    success: results[i].status === 'fulfilled' ? results[i].value.success : false,
    ...(results[i].status === 'fulfilled' ? {} : { error: results[i].reason?.message }),
  }));

  const allSucceeded = deliveryResults.every(r => r.success);

  return {
    statusCode: allSucceeded ? 200 : 207,
    body: JSON.stringify({
      success: allSucceeded,
      lead_id: `lead_${Date.now()}`,
      deliveries: deliveryResults,
    }),
    headers: { 'Content-Type': 'application/json' },
  };
};
