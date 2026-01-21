/**
 * @file resources/webhooks.ts
 * @description Webhooks resource for the Workbench SDK
 *
 * Provides methods for managing webhook subscriptions in Workbench CRM.
 */

import type { WorkbenchClient } from '../client.js';
import type {
  Webhook,
  WebhookDelivery,
  CreateWebhookOptions,
  UpdateWebhookOptions,
  ListWebhookDeliveriesOptions,
  ListOptions,
  ApiResponse,
  ListResponse,
} from '../types/index.js';

/**
 * Webhooks resource
 *
 * @example
 * ```typescript
 * const workbench = new WorkbenchClient({ apiKey: 'wbk_live_xxx' });
 *
 * // Create a webhook
 * const { data: webhook } = await workbench.webhooks.create({
 *   name: 'Invoice Notifications',
 *   url: 'https://example.com/webhooks/workbench',
 *   events: ['invoice.created', 'invoice.paid']
 * });
 *
 * console.log('Webhook secret:', webhook.secret);
 * // Store this secret securely to verify webhook signatures
 * ```
 */
export class WebhooksResource {
  private readonly client: WorkbenchClient;

  constructor(client: WorkbenchClient) {
    this.client = client;
  }

  /**
   * List all webhooks
   *
   * Returns a paginated list of webhook subscriptions for the authenticated business.
   *
   * @param options - List options (pagination)
   * @returns Paginated list of webhooks
   *
   * @example
   * ```typescript
   * const { data: webhooks } = await workbench.webhooks.list();
   * webhooks.forEach(webhook => {
   *   console.log(`${webhook.name}: ${webhook.events.join(', ')}`);
   * });
   * ```
   */
  async list(options: ListOptions = {}): Promise<ListResponse<Webhook>> {
    return this.client.get<ListResponse<Webhook>>('/v1/webhooks', {
      page: options.page,
      per_page: options.per_page,
    });
  }

  /**
   * Get a webhook by ID
   *
   * @param id - Webhook UUID
   * @returns Webhook details
   *
   * @example
   * ```typescript
   * const { data: webhook } = await workbench.webhooks.get('webhook-uuid');
   * console.log(`Webhook: ${webhook.name}`);
   * console.log(`Events: ${webhook.events.join(', ')}`);
   * ```
   */
  async get(id: string): Promise<ApiResponse<Webhook>> {
    return this.client.get<ApiResponse<Webhook>>(`/v1/webhooks/${id}`);
  }

  /**
   * Create a new webhook
   *
   * Creates a webhook subscription. The webhook secret is returned
   * in the response - store it securely to verify webhook signatures.
   *
   * @param data - Webhook data
   * @returns Created webhook (includes secret)
   *
   * @example
   * ```typescript
   * const { data: webhook } = await workbench.webhooks.create({
   *   name: 'All Events',
   *   url: 'https://example.com/webhooks',
   *   events: [
   *     'client.created',
   *     'client.updated',
   *     'invoice.created',
   *     'invoice.paid',
   *     'quote.accepted',
   *     'job.completed'
   *   ]
   * });
   *
   * // IMPORTANT: Store the secret securely!
   * console.log('Store this secret:', webhook.secret);
   * ```
   */
  async create(data: CreateWebhookOptions): Promise<ApiResponse<Webhook>> {
    return this.client.post<ApiResponse<Webhook>>('/v1/webhooks', data as Record<string, unknown>);
  }

  /**
   * Update a webhook
   *
   * @param id - Webhook UUID
   * @param data - Fields to update
   * @returns Updated webhook
   *
   * @example
   * ```typescript
   * // Add more events to the webhook
   * const { data: webhook } = await workbench.webhooks.update('webhook-uuid', {
   *   events: ['invoice.created', 'invoice.paid', 'invoice.overdue']
   * });
   *
   * // Disable a webhook
   * await workbench.webhooks.update('webhook-uuid', { is_active: false });
   * ```
   */
  async update(id: string, data: UpdateWebhookOptions): Promise<ApiResponse<Webhook>> {
    return this.client.put<ApiResponse<Webhook>>(`/v1/webhooks/${id}`, data as Record<string, unknown>);
  }

  /**
   * Delete a webhook
   *
   * Permanently deletes a webhook subscription. No more events
   * will be sent to this endpoint.
   *
   * @param id - Webhook UUID
   *
   * @example
   * ```typescript
   * await workbench.webhooks.delete('webhook-uuid');
   * ```
   */
  async delete(id: string): Promise<void> {
    await this.client.delete<void>(`/v1/webhooks/${id}`);
  }

  /**
   * List webhook deliveries
   *
   * Returns recent delivery attempts for a webhook. Useful for
   * debugging and monitoring webhook health.
   *
   * @param webhookId - Webhook UUID
   * @param options - List options (pagination, filtering)
   * @returns Paginated list of delivery attempts
   *
   * @example
   * ```typescript
   * const { data: deliveries } = await workbench.webhooks.listDeliveries('webhook-uuid', {
   *   per_page: 50
   * });
   *
   * deliveries.forEach(delivery => {
   *   const status = delivery.delivered_at ? 'delivered' : 'pending';
   *   console.log(`${delivery.event_type}: ${status}`);
   * });
   * ```
   */
  async listDeliveries(
    webhookId: string,
    options: ListWebhookDeliveriesOptions = {}
  ): Promise<ListResponse<WebhookDelivery>> {
    return this.client.get<ListResponse<WebhookDelivery>>(`/v1/webhooks/${webhookId}/deliveries`, {
      page: options.page,
      per_page: options.per_page,
      event_type: options.event_type,
    });
  }

  /**
   * Send a test webhook
   *
   * Sends a test event to the webhook endpoint. Useful for
   * verifying your webhook handler is working correctly.
   *
   * @param id - Webhook UUID
   * @returns Test delivery result
   *
   * @example
   * ```typescript
   * const { data: result } = await workbench.webhooks.test('webhook-uuid');
   * console.log('Test delivery:', result);
   * ```
   */
  async test(id: string): Promise<ApiResponse<{ message: string; delivery_id: string }>> {
    return this.client.post<ApiResponse<{ message: string; delivery_id: string }>>(`/v1/webhooks/${id}/test`);
  }
}
