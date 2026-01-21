/**
 * @file index.ts
 * @description Main entry point for the Workbench SDK
 *
 * Official Node.js SDK for the Workbench CRM API
 *
 * @example
 * ```typescript
 * import { WorkbenchClient, verifyWebhookSignature } from '@workbench/sdk';
 *
 * // Initialize the client
 * const workbench = new WorkbenchClient({
 *   apiKey: process.env.WORKBENCH_API_KEY!
 * });
 *
 * // Use the API
 * const { data: clients } = await workbench.clients.list();
 * const { data: invoice } = await workbench.invoices.create({
 *   client_id: clients[0].id,
 *   items: [{ description: 'Service', quantity: 1, unit_price: 100 }]
 * });
 *
 * // Verify webhooks
 * const isValid = verifyWebhookSignature(payload, signature, secret);
 * ```
 *
 * @packageDocumentation
 */

// Main client
export { WorkbenchClient, WorkbenchError } from './client.js';
export type { RequestOptions } from './client.js';

// Resources
export { ClientsResource } from './resources/clients.js';
export { InvoicesResource } from './resources/invoices.js';
export { QuotesResource } from './resources/quotes.js';
export { JobsResource } from './resources/jobs.js';
export { ServiceRequestsResource } from './resources/service-requests.js';
export { WebhooksResource } from './resources/webhooks.js';

// Webhook utilities
export {
  verifyWebhookSignature,
  constructWebhookEvent,
  parseSignatureHeader,
  computeSignature,
  WebhookVerificationError,
} from './utils/webhook-verify.js';
export type { WebhookSignature, VerifyOptions } from './utils/webhook-verify.js';

// Types
export type {
  // Configuration
  WorkbenchConfig,
  ListOptions,

  // API Response types
  ResponseMeta,
  Pagination,
  ApiResponse,
  ListResponse,
  ApiError,

  // Client types
  Client,
  ClientStatus,
  CreateClientOptions,
  UpdateClientOptions,
  ListClientsOptions,

  // Invoice types
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  CreateInvoiceOptions,
  UpdateInvoiceOptions,
  ListInvoicesOptions,

  // Quote types
  Quote,
  QuoteItem,
  QuoteStatus,
  CreateQuoteOptions,
  UpdateQuoteOptions,
  ListQuotesOptions,

  // Job types
  Job,
  JobStatus,
  JobPriority,
  CreateJobOptions,
  UpdateJobOptions,
  ListJobsOptions,

  // Service Request types
  ServiceRequest,
  ServiceRequestStatus,
  ServiceRequestPriority,
  CreateServiceRequestOptions,
  UpdateServiceRequestOptions,
  ListServiceRequestsOptions,

  // Webhook types
  Webhook,
  WebhookDelivery,
  WebhookEvent,
  CreateWebhookOptions,
  UpdateWebhookOptions,
  ListWebhookDeliveriesOptions,
} from './types/index.js';
