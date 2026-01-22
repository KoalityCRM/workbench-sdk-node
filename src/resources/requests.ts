/**
 * Requests resource for the Workbench SDK.
 *
 * Provides methods for managing service requests in Workbench CRM.
 *
 * @module resources/requests
 */

import { WorkbenchClient } from '../client.js';
import {
  ServiceRequest,
  ApiResponse,
  ListResponse,
  CreateServiceRequestOptions,
  UpdateServiceRequestOptions,
  ListServiceRequestsOptions,
} from '../types/index.js';

/**
 * Requests resource for managing service requests.
 *
 * Service requests track customer service inquiries, including
 * contact information, service details, and status.
 *
 * @example
 * ```typescript
 * const workbench = new WorkbenchClient({ apiKey: 'wbk_live_xxx' });
 *
 * // Create a new request
 * const { data: request } = await workbench.requests.create({
 *   title: 'AC Not Cooling',
 *   contact_name: 'John Doe',
 *   contact_email: 'john@example.com',
 *   priority: 'urgent'
 * });
 * ```
 */
export class RequestsResource {
  private readonly client: WorkbenchClient;

  constructor(client: WorkbenchClient) {
    this.client = client;
  }

  /**
   * List all requests
   *
   * Returns a paginated list of service requests for the authenticated business.
   *
   * @param options - List options (pagination, filtering, sorting)
   * @returns Paginated list of requests
   *
   * @example
   * ```typescript
   * // List new requests
   * const { data, pagination } = await workbench.requests.list({
   *   status: 'new',
   *   priority: 'urgent',
   *   per_page: 50
   * });
   * ```
   */
  async list(options: ListServiceRequestsOptions = {}): Promise<ListResponse<ServiceRequest>> {
    return this.client.get<ListResponse<ServiceRequest>>('/v1/requests', {
      page: options.page,
      per_page: options.per_page,
      search: options.search,
      sort: options.sort,
      order: options.order,
      status: options.status,
      priority: options.priority,
      client_id: options.client_id,
    });
  }

  /**
   * Get a request by ID
   *
   * @param id - Request UUID
   * @returns Request details
   *
   * @example
   * ```typescript
   * const { data: request } = await workbench.requests.get('request-uuid');
   * console.log(`Request: ${request.title} (${request.status})`);
   * ```
   */
  async get(id: string): Promise<ApiResponse<ServiceRequest>> {
    return this.client.get<ApiResponse<ServiceRequest>>(`/v1/requests/${id}`);
  }

  /**
   * Create a new request
   *
   * @param data - Request data
   * @returns Created request
   *
   * @example
   * ```typescript
   * const { data: request } = await workbench.requests.create({
   *   title: 'AC Not Cooling',
   *   description: 'Air conditioner is running but not producing cold air',
   *   contact_name: 'John Doe',
   *   contact_email: 'john@example.com',
   *   contact_phone: '+1-555-123-4567',
   *   address: '456 Oak Ave, Anytown, USA',
   *   priority: 'urgent',
   *   requested_date: '2024-01-20',
   *   preferred_time: 'Morning (8am-12pm)',
   *   source: 'website'
   * });
   * ```
   */
  async create(data: CreateServiceRequestOptions): Promise<ApiResponse<ServiceRequest>> {
    return this.client.post<ApiResponse<ServiceRequest>>('/v1/requests', data);
  }

  /**
   * Update a request
   *
   * @param id - Request UUID
   * @param data - Fields to update
   * @returns Updated request
   *
   * @example
   * ```typescript
   * // Assign to client and schedule
   * const { data: request } = await workbench.requests.update('request-uuid', {
   *   client_id: 'client-uuid',
   *   status: 'scheduled',
   *   notes: 'Scheduled for Monday morning'
   * });
   * ```
   */
  async update(id: string, data: UpdateServiceRequestOptions): Promise<ApiResponse<ServiceRequest>> {
    return this.client.put<ApiResponse<ServiceRequest>>(`/v1/requests/${id}`, data);
  }

  /**
   * Delete a request
   *
   * Permanently deletes a request. This action cannot be undone.
   *
   * @param id - Request UUID
   *
   * @example
   * ```typescript
   * await workbench.requests.delete('request-uuid');
   * ```
   */
  async delete(id: string): Promise<void> {
    await this.client.delete<void>(`/v1/requests/${id}`);
  }
}
