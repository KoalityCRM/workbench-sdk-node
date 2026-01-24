/**
 * @file types/index.ts
 * @description TypeScript type definitions for the Workbench SDK
 *
 * These types mirror the API response structures and provide
 * full type safety when working with the Workbench API.
 */

// ===========================================
// CONFIGURATION TYPES
// ===========================================

/**
 * Configuration options for the Workbench client
 */
export interface WorkbenchConfig {
  /** API key for authentication (wbk_live_xxx or wbk_test_xxx) */
  apiKey?: string;
  /** OAuth access token for third-party app authentication */
  accessToken?: string;
  /** Base URL for the API (defaults to https://api.tryworkbench.app) */
  baseUrl?: string;
  /** Request timeout in milliseconds (defaults to 30000) */
  timeout?: number;
  /** Maximum number of retries for failed requests (defaults to 3) */
  maxRetries?: number;
}

/**
 * Options for paginated list requests
 */
export interface ListOptions {
  /** Page number (1-indexed, defaults to 1) */
  page?: number;
  /** Items per page (1-100, defaults to 20) */
  per_page?: number;
  /** Limit (alternative to per_page for offset-based pagination) */
  limit?: number;
  /** Offset for offset-based pagination */
  offset?: number;
  /** Search query string */
  search?: string;
  /** Field to sort by */
  sort?: string;
  /** Sort order */
  order?: 'asc' | 'desc';
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

/**
 * Standard API response metadata
 */
export interface ResponseMeta {
  /** Unique request identifier for debugging */
  request_id: string;
  /** Server timestamp of the response */
  timestamp: string;
}

/**
 * Pagination information for list responses
 * Supports both page-based and offset-based pagination
 */
export interface Pagination {
  /** Current page number (page-based) */
  page?: number;
  /** Items per page (page-based) */
  per_page?: number;
  /** Total number of items */
  total: number;
  /** Total number of pages (page-based) */
  total_pages?: number;
  /** Limit used for the query (offset-based) */
  limit?: number;
  /** Offset used for the query (offset-based) */
  offset?: number;
  /** Whether there are more items available */
  has_more: boolean;
}

/**
 * Standard API response wrapper for single items
 */
export interface ApiResponse<T> {
  data: T;
  meta: ResponseMeta;
}

/**
 * Standard API response wrapper for lists
 */
export interface ListResponse<T> {
  data: T[];
  meta: ResponseMeta;
  pagination: Pagination;
}

/**
 * API error response
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  meta: ResponseMeta;
}

// ===========================================
// CLIENT TYPES
// ===========================================

/**
 * Client status values (lifecycle status)
 */
export type ClientStatus = 'active' | 'inactive' | 'archived';

/**
 * Lead status values (pipeline stage for leads)
 */
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

/**
 * Client record
 */
export interface Client {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  /** Lead pipeline stage */
  lead_status: LeadStatus | null;
  source: string | null;
  notes: string | null;
  /** Internal notes visible only to business users */
  internal_notes: string | null;
  tags: string[] | null;
  next_contact_date: string | null;
  ask_for_review: boolean | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Options for creating a client
 */
export interface CreateClientOptions {
  first_name: string;
  last_name?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  /** Client lifecycle status (defaults to 'active') */
  status?: ClientStatus;
  /** Lead pipeline stage (defaults to 'new') */
  lead_status?: LeadStatus | null;
  source?: string | null;
  notes?: string | null;
  internal_notes?: string | null;
  tags?: string[] | null;
}

/**
 * Options for updating a client
 */
export interface UpdateClientOptions extends Partial<CreateClientOptions> {
  next_contact_date?: string | null;
  ask_for_review?: boolean | null;
}

/**
 * Options for listing clients
 */
export interface ListClientsOptions extends ListOptions {
  status?: ClientStatus;
  lead_status?: LeadStatus;
}

// ===========================================
// INVOICE TYPES
// ===========================================

/**
 * Invoice status values
 */
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'voided';

/**
 * Invoice line item
 */
export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  sort_order?: number;
}

/**
 * Invoice record
 */
export interface Invoice {
  id: string;
  business_id: string;
  client_id: string | null;
  job_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
  discount_amount: number | null;
  total: number;
  amount_paid: number;
  notes: string | null;
  terms: string | null;
  /** Timestamp when the invoice was sent to the client */
  sent_at: string | null;
  /** Timestamp when the invoice was fully paid */
  paid_at: string | null;
  items: InvoiceItem[];
  client?: Client;
  created_at: string;
  updated_at: string | null;
}

/**
 * Options for creating an invoice
 */
export interface CreateInvoiceOptions {
  client_id?: string | null;
  job_id?: string | null;
  status?: InvoiceStatus;
  issue_date?: string;
  due_date?: string | null;
  tax_rate?: number | null;
  discount_amount?: number | null;
  notes?: string | null;
  terms?: string | null;
  items: InvoiceItem[];
}

/**
 * Options for updating an invoice
 */
export interface UpdateInvoiceOptions extends Partial<Omit<CreateInvoiceOptions, 'items'>> {
  items?: InvoiceItem[];
}

/**
 * Options for listing invoices
 */
export interface ListInvoicesOptions extends ListOptions {
  status?: InvoiceStatus;
  client_id?: string;
}

// ===========================================
// QUOTE TYPES
// ===========================================

/**
 * Quote status values
 */
export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired' | 'converted';

/**
 * Quote line item
 */
export interface QuoteItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  sort_order?: number;
}

/**
 * Quote record
 */
export interface Quote {
  id: string;
  business_id: string;
  client_id: string | null;
  job_id: string | null;
  quote_number: string;
  status: QuoteStatus;
  issue_date: string;
  valid_until: string | null;
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
  discount_amount: number | null;
  total: number;
  notes: string | null;
  terms: string | null;
  /** Timestamp when the quote was sent to the client */
  sent_at: string | null;
  /** Timestamp when the quote was approved/accepted */
  approved_at: string | null;
  /** User ID or name of who approved the quote */
  approved_by: string | null;
  items: QuoteItem[];
  client?: Client;
  created_at: string;
  updated_at: string | null;
}

/**
 * Options for creating a quote
 */
export interface CreateQuoteOptions {
  client_id?: string | null;
  job_id?: string | null;
  status?: QuoteStatus;
  issue_date?: string;
  valid_until?: string | null;
  tax_rate?: number | null;
  discount_amount?: number | null;
  notes?: string | null;
  terms?: string | null;
  items: QuoteItem[];
}

/**
 * Options for updating a quote
 */
export interface UpdateQuoteOptions extends Partial<Omit<CreateQuoteOptions, 'items'>> {
  items?: QuoteItem[];
}

/**
 * Options for listing quotes
 */
export interface ListQuotesOptions extends ListOptions {
  status?: QuoteStatus;
  client_id?: string;
}

// ===========================================
// JOB TYPES
// ===========================================

/**
 * Job status values
 */
export type JobStatus = 'draft' | 'scheduled' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | 'invoiced' | 'closed';

/**
 * Job priority values
 */
export type JobPriority = 'low' | 'medium' | 'normal' | 'high' | 'urgent';

/**
 * Job record
 */
export interface Job {
  id: string;
  business_id: string;
  client_id: string | null;
  /** Unique job number for display/reference */
  job_number: string | null;
  title: string;
  description: string | null;
  status: JobStatus;
  priority: JobPriority;
  scheduled_start: string | null;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  estimated_duration: number | null;
  address_id: string | null;
  notes: string | null;
  client?: Client;
  created_at: string;
  updated_at: string | null;
}

/**
 * Options for creating a job
 */
export interface CreateJobOptions {
  client_id?: string | null;
  title: string;
  description?: string | null;
  status?: JobStatus;
  priority?: JobPriority;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  estimated_duration?: number | null;
  address_id?: string | null;
  notes?: string | null;
}

/**
 * Options for updating a job
 */
export interface UpdateJobOptions extends Partial<CreateJobOptions> {
  actual_start?: string | null;
  actual_end?: string | null;
}

/**
 * Options for listing jobs
 */
export interface ListJobsOptions extends ListOptions {
  status?: JobStatus;
  priority?: JobPriority;
  client_id?: string;
}

// ===========================================
// SERVICE REQUEST TYPES
// ===========================================

/**
 * Service request status values
 */
export type ServiceRequestStatus = 'new' | 'in_progress' | 'assessment_complete' | 'completed' | 'cancelled';

/**
 * Service request priority values
 */
export type ServiceRequestPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Service request record
 */
export interface ServiceRequest {
  id: string;
  business_id: string;
  client_id: string | null;
  /** Unique request number for display/reference (auto-generated) */
  request_number: string;
  title: string;
  description: string | null;
  status: ServiceRequestStatus;
  source: string | null;
  priority: ServiceRequestPriority | null;
  requested_date: string | null;
  preferred_time: string | null;
  address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  client?: Client;
  created_at: string;
  updated_at: string | null;
}

/**
 * Options for creating a service request
 */
export interface CreateServiceRequestOptions {
  client_id?: string | null;
  title: string;
  description?: string | null;
  status?: ServiceRequestStatus;
  source?: string | null;
  priority?: ServiceRequestPriority | null;
  requested_date?: string | null;
  preferred_time?: string | null;
  address?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  notes?: string | null;
}

/**
 * Options for updating a service request
 */
export type UpdateServiceRequestOptions = Partial<CreateServiceRequestOptions>;

/**
 * Options for listing service requests
 */
export interface ListServiceRequestsOptions extends ListOptions {
  status?: ServiceRequestStatus;
  priority?: ServiceRequestPriority;
  client_id?: string;
}

// ===========================================
// WEBHOOK TYPES
// ===========================================

/**
 * Available webhook event types
 */
export type WebhookEvent =
  // Client events
  | 'client.created'
  | 'client.updated'
  | 'client.deleted'
  // Invoice events
  | 'invoice.created'
  | 'invoice.updated'
  | 'invoice.sent'
  | 'invoice.viewed'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'invoice.voided'
  // Quote events
  | 'quote.created'
  | 'quote.updated'
  | 'quote.sent'
  | 'quote.viewed'
  | 'quote.accepted'
  | 'quote.rejected'
  | 'quote.expired'
  // Job events
  | 'job.created'
  | 'job.updated'
  | 'job.status_changed'
  | 'job.completed'
  | 'job.cancelled'
  // Service request events
  | 'service_request.created'
  | 'service_request.updated'
  | 'service_request.assigned'
  | 'service_request.completed';

/**
 * Webhook subscription
 */
export interface Webhook {
  id: string;
  business_id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  is_active: boolean;
  /** Custom metadata attached to the webhook */
  metadata: Record<string, unknown> | null;
  /** Number of consecutive delivery failures */
  failure_count: number;
  /** Timestamp of the last webhook trigger */
  last_triggered_at: string | null;
  /** Timestamp of the last successful delivery */
  last_success_at: string | null;
  /** Timestamp of the last failed delivery */
  last_failure_at: string | null;
  /** User ID who created the webhook */
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Webhook delivery record
 */
export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  /** Unique event ID for idempotency */
  event_id: string;
  event_type: WebhookEvent;
  payload: Record<string, unknown>;
  /** Headers sent with the webhook request */
  request_headers: Record<string, string> | null;
  response_status: number | null;
  /** Headers received in the response */
  response_headers: Record<string, string> | null;
  response_body: string | null;
  /** Response time in milliseconds */
  response_time_ms: number | null;
  attempt_count: number;
  /** Maximum number of delivery attempts */
  max_attempts: number;
  next_retry_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  /** Error message if delivery failed */
  error_message: string | null;
  created_at: string;
}

/**
 * Options for creating a webhook
 */
export interface CreateWebhookOptions {
  name: string;
  url: string;
  events: WebhookEvent[];
  /** Custom metadata to attach to the webhook */
  metadata?: Record<string, unknown>;
}

/**
 * Options for updating a webhook
 */
export interface UpdateWebhookOptions {
  name?: string;
  url?: string;
  events?: WebhookEvent[];
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Options for listing webhook deliveries
 */
export interface ListWebhookDeliveriesOptions extends ListOptions {
  event_type?: WebhookEvent;
  /** Filter by delivery status */
  status?: 'pending' | 'delivered' | 'failed';
}

/**
 * Response from regenerating a webhook secret
 */
export interface WebhookSecretResponse {
  secret: string;
}

/**
 * Webhook event type information
 */
export interface WebhookEventTypeInfo {
  event: WebhookEvent;
  description: string;
  category: 'client' | 'invoice' | 'quote' | 'job' | 'service_request';
}

// ===========================================
// NOTIFICATION TYPES
// ===========================================

/**
 * Notification type - who receives the notification
 */
export type NotificationType = 'CLIENT' | 'BUSINESS';

/**
 * Notification events supported by the SDK
 * - sdk_client_created: Welcome notification for new clients
 * - sdk_request_created: New service request notification
 * - sdk_quote_created: Quote sent notification
 * - sdk_invoice_created: Invoice sent notification
 * - sdk_job_created: Job scheduled notification
 * - sdk_custom: Custom notification (requires subject/html overrides)
 */
export type NotificationEvent =
  | 'sdk_client_created'
  | 'sdk_request_created'
  | 'sdk_quote_created'
  | 'sdk_invoice_created'
  | 'sdk_job_created'
  | 'sdk_custom';

/**
 * Business user roles for BUSINESS notifications
 */
export type BusinessUserRole = 'owner' | 'admin' | 'manager' | 'member';

/**
 * Base options for sending notifications
 */
export interface SendNotificationBaseOptions {
  /** Template data for variable interpolation (e.g., client_name, quote_total) */
  templateData?: Record<string, string | number>;
  /** Custom subject line (overrides template) */
  subjectOverride?: string;
  /** Custom HTML body (overrides template) */
  htmlOverride?: string;
  /** Entity type for audit logging (e.g., 'client', 'invoice') */
  entityType?: string;
  /** Entity ID for audit logging */
  entityId?: string;
}

/**
 * Options for sending a notification to a client
 */
export interface SendToClientOptions extends SendNotificationBaseOptions {
  /** Client ID to send the notification to */
  clientId: string;
  /** Event type for template selection */
  event: NotificationEvent;
}

/**
 * Options for sending a notification to business team members
 */
export interface SendToTeamOptions extends SendNotificationBaseOptions {
  /** Event type for template selection */
  event: NotificationEvent;
  /** Roles to notify (defaults to all if not specified) */
  roles?: BusinessUserRole[];
}

/**
 * Options for sending a custom notification
 */
export interface SendCustomNotificationOptions extends SendNotificationBaseOptions {
  /** Notification type - CLIENT or BUSINESS */
  type: NotificationType;
  /** Client ID (required for CLIENT type) */
  clientId?: string;
  /** Roles to notify (for BUSINESS type) */
  roles?: BusinessUserRole[];
  /** Required: Custom subject line */
  subject: string;
  /** Required: Custom HTML body */
  html: string;
}

/**
 * Result of sending notifications
 */
export interface NotificationResult {
  /** Whether at least one notification was sent successfully */
  success: boolean;
  /** Unique ID for this notification batch */
  notification_id: string;
  /** Total number of recipients */
  recipients_count: number;
  /** Number of successful email sends */
  sent_count: number;
  /** Number of failed email sends */
  failed_count: number;
  /** Error messages if any failures occurred */
  errors?: string[];
}


// ===========================================
// INTEGRATION MARKETPLACE TYPES
// ===========================================

/**
 * Integration status values
 */
export type IntegrationStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'suspended';

/**
 * Integration category values
 */
export type IntegrationCategory =
  | 'accounting'
  | 'analytics'
  | 'automation'
  | 'communication'
  | 'crm'
  | 'ecommerce'
  | 'marketing'
  | 'payments'
  | 'productivity'
  | 'scheduling'
  | 'other';

/**
 * OAuth scope information
 */
export interface IntegrationScope {
  /** Scope identifier (e.g., 'clients:read') */
  scope: string;
  /** Human-readable description of what the scope allows */
  description: string;
  /** Whether this scope is required for the integration */
  required: boolean;
}

/**
 * Published integration in the marketplace
 */
export interface Integration {
  id: string;
  /** URL-friendly identifier */
  slug: string;
  name: string;
  /** Short description (max 200 chars) */
  short_description: string;
  /** Full description with markdown support */
  description: string;
  /** Category for filtering/discovery */
  category: IntegrationCategory;
  /** URL to integration icon/logo */
  icon_url: string | null;
  /** URL to integration website */
  website_url: string | null;
  /** Support email for the integration */
  support_email: string | null;
  /** Privacy policy URL */
  privacy_policy_url: string | null;
  /** Terms of service URL */
  terms_url: string | null;
  /** OAuth scopes required by the integration */
  scopes: IntegrationScope[];
  /** Webhook events the integration subscribes to */
  webhook_events: WebhookEvent[];
  /** Number of businesses using this integration */
  install_count: number;
  /** Average rating (1-5) */
  average_rating: number | null;
  /** Number of reviews */
  review_count: number;
  /** Developer/company information */
  developer: {
    id: string;
    name: string;
    website: string | null;
    verified: boolean;
  };
  /** When the integration was published */
  published_at: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Integration review from a user
 */
export interface IntegrationReview {
  id: string;
  integration_id: string;
  /** Rating 1-5 */
  rating: number;
  /** Review title */
  title: string | null;
  /** Review body */
  content: string | null;
  /** Reviewer display name */
  reviewer_name: string;
  /** When the review was submitted */
  created_at: string;
}

/**
 * Options for listing integrations
 */
export interface ListIntegrationsOptions extends ListOptions {
  /** Filter by category */
  category?: IntegrationCategory;
  /** Filter by scope (returns integrations that request this scope) */
  scope?: string;
  /** Sort by: 'popular' | 'recent' | 'rating' | 'name' */
  sort_by?: 'popular' | 'recent' | 'rating' | 'name';
}

/**
 * Options for listing integration reviews
 */
export interface ListIntegrationReviewsOptions extends ListOptions {
  /** Minimum rating to filter by */
  min_rating?: number;
}

/**
 * Installed integration on a business account
 */
export interface InstalledIntegration {
  id: string;
  integration_id: string;
  integration: Integration;
  /** OAuth access token (masked for security) */
  access_token_prefix: string;
  /** Scopes that were granted */
  granted_scopes: string[];
  /** When the integration was installed */
  installed_at: string;
  /** User who installed the integration */
  installed_by: string | null;
  /** Whether the integration is currently active */
  is_active: boolean;
}

/**
 * Options for installing an integration
 */
export interface InstallIntegrationOptions {
  /** Integration ID to install */
  integration_id: string;
  /** Scopes to grant (must be subset of integration's requested scopes) */
  scopes: string[];
  /** OAuth authorization code (from consent flow) */
  authorization_code: string;
  /** PKCE code verifier */
  code_verifier: string;
}
