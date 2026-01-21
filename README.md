# @workbench/sdk

Official Node.js SDK for the [Workbench CRM](https://tryworkbench.app) API.

## Installation

```bash
npm install @workbench/sdk
# or
yarn add @workbench/sdk
# or
pnpm add @workbench/sdk
```

## Quick Start

```typescript
import { WorkbenchClient } from '@workbench/sdk';

// Initialize with your API key
const workbench = new WorkbenchClient({
  apiKey: 'wbk_live_xxxxxxxxxxxxxxxxxxxxx'
});

// List clients
const { data: clients, pagination } = await workbench.clients.list({
  status: 'active',
  per_page: 10
});

// Create an invoice
const { data: invoice } = await workbench.invoices.create({
  client_id: clients[0].id,
  items: [
    { description: 'Consulting Services', quantity: 2, unit_price: 150 }
  ],
  tax_rate: 8.5
});

// Send the invoice
await workbench.invoices.send(invoice.id);
```

## Authentication

### API Key Authentication

Get your API key from [Workbench Settings > API Keys](https://app.tryworkbench.app/settings/api-keys).

```typescript
const workbench = new WorkbenchClient({
  apiKey: 'wbk_live_xxxxxxxxxxxxxxxxxxxxx'
});
```

### OAuth Authentication

For third-party applications using OAuth 2.0:

```typescript
const workbench = new WorkbenchClient({
  accessToken: 'wbk_at_xxxxxxxxxxxxxxxxxxxxx'
});
```

## Configuration

```typescript
const workbench = new WorkbenchClient({
  apiKey: 'wbk_live_xxx',

  // Optional: Custom base URL (default: https://api.tryworkbench.app)
  baseUrl: 'https://api.tryworkbench.app',

  // Optional: Request timeout in milliseconds (default: 30000)
  timeout: 30000,

  // Optional: Maximum retries for failed requests (default: 3)
  maxRetries: 3
});
```

## Resources

### Clients

```typescript
// List clients
const { data, pagination } = await workbench.clients.list({
  status: 'active',
  search: 'john',
  page: 1,
  per_page: 20
});

// Get a client
const { data: client } = await workbench.clients.get('client-uuid');

// Create a client
const { data: newClient } = await workbench.clients.create({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '+1-555-123-4567',
  company: 'Acme Corp',
  status: 'active',
  tags: ['vip', 'commercial']
});

// Update a client
const { data: updated } = await workbench.clients.update('client-uuid', {
  status: 'inactive'
});

// Delete a client
await workbench.clients.delete('client-uuid');
```

### Invoices

```typescript
// List invoices
const { data, pagination } = await workbench.invoices.list({
  status: 'sent',
  client_id: 'client-uuid'
});

// Get an invoice
const { data: invoice } = await workbench.invoices.get('invoice-uuid');

// Create an invoice
const { data: newInvoice } = await workbench.invoices.create({
  client_id: 'client-uuid',
  due_date: '2024-02-15',
  items: [
    { description: 'Web Development', quantity: 10, unit_price: 100 },
    { description: 'Hosting Setup', quantity: 1, unit_price: 50 }
  ],
  tax_rate: 8.5,
  notes: 'Payment due within 30 days'
});

// Update an invoice
await workbench.invoices.update('invoice-uuid', {
  status: 'paid'
});

// Send an invoice
await workbench.invoices.send('invoice-uuid');

// Delete an invoice
await workbench.invoices.delete('invoice-uuid');
```

### Quotes

```typescript
// List quotes
const { data } = await workbench.quotes.list({ status: 'sent' });

// Create a quote
const { data: quote } = await workbench.quotes.create({
  client_id: 'client-uuid',
  valid_until: '2024-03-01',
  items: [
    { description: 'Kitchen Renovation', quantity: 1, unit_price: 5000 }
  ]
});

// Send a quote
await workbench.quotes.send(quote.id);
```

### Jobs

```typescript
// List jobs
const { data } = await workbench.jobs.list({
  status: 'scheduled',
  priority: 'high'
});

// Create a job
const { data: job } = await workbench.jobs.create({
  client_id: 'client-uuid',
  title: 'Kitchen Faucet Installation',
  priority: 'high',
  scheduled_start: '2024-01-20T09:00:00Z',
  scheduled_end: '2024-01-20T12:00:00Z'
});

// Update job status
await workbench.jobs.update(job.id, {
  status: 'completed',
  actual_end: new Date().toISOString()
});
```

### Service Requests

```typescript
// List service requests
const { data } = await workbench.serviceRequests.list({ status: 'new' });

// Create a service request
const { data: request } = await workbench.serviceRequests.create({
  title: 'AC Repair',
  contact_name: 'Jane Smith',
  contact_email: 'jane@example.com',
  contact_phone: '+1-555-987-6543',
  address: '123 Main St',
  priority: 'urgent'
});
```

### Webhooks

```typescript
// List webhooks
const { data: webhooks } = await workbench.webhooks.list();

// Create a webhook
const { data: webhook } = await workbench.webhooks.create({
  name: 'Invoice Notifications',
  url: 'https://example.com/webhooks/workbench',
  events: ['invoice.created', 'invoice.paid']
});

// IMPORTANT: Store the webhook secret securely!
console.log('Webhook secret:', webhook.secret);

// Update a webhook
await workbench.webhooks.update(webhook.id, {
  events: ['invoice.created', 'invoice.paid', 'invoice.overdue']
});

// Delete a webhook
await workbench.webhooks.delete(webhook.id);
```

## Webhook Signature Verification

Verify that webhooks are actually from Workbench:

```typescript
import { verifyWebhookSignature, constructWebhookEvent } from '@workbench/sdk';
import express from 'express';

const app = express();

// Use raw body for signature verification
app.post('/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-workbench-signature'] as string;
  const secret = process.env.WEBHOOK_SECRET!;

  try {
    // Option 1: Just verify
    verifyWebhookSignature(req.body, signature, secret);
    const event = JSON.parse(req.body.toString());

    // Option 2: Verify and parse in one step
    const event = constructWebhookEvent(req.body, signature, secret);

    // Handle the event
    switch (event.event) {
      case 'invoice.paid':
        console.log('Invoice paid:', event.data.id);
        break;
      case 'client.created':
        console.log('New client:', event.data.first_name);
        break;
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook verification failed:', error);
    res.sendStatus(400);
  }
});
```

## Error Handling

```typescript
import { WorkbenchClient, WorkbenchError } from '@workbench/sdk';

try {
  const { data } = await workbench.clients.get('invalid-uuid');
} catch (error) {
  if (error instanceof WorkbenchError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Request ID:', error.requestId);

    if (error.details) {
      error.details.forEach(d => {
        console.error(`  ${d.field}: ${d.message}`);
      });
    }
  }
}
```

## TypeScript Support

This SDK is written in TypeScript and includes full type definitions:

```typescript
import type {
  Client,
  Invoice,
  Quote,
  Job,
  ServiceRequest,
  Webhook,
  CreateClientOptions,
  InvoiceStatus
} from '@workbench/sdk';

// Types are inferred from methods
const { data: clients } = await workbench.clients.list();
// clients is Client[]

const { data: invoice } = await workbench.invoices.get('uuid');
// invoice is Invoice
```

## API Documentation

For complete API documentation, visit [docs.tryworkbench.app](https://docs.tryworkbench.app).

## Support

- **Documentation**: [docs.tryworkbench.app](https://docs.tryworkbench.app)
- **Issues**: [GitHub Issues](https://github.com/KoalityCRM/workbench-sdk-node/issues)
- **Email**: support@tryworkbench.app

## License

MIT License - see [LICENSE](LICENSE) for details.
