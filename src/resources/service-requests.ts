/**
 * @file resources/service-requests.ts
 * @description Service Requests resource for the Workbench SDK
 *
 * Provides methods for managing service requests in Workbench CRM.
 */

import type { WorkbenchClient } from '../client.js';
import type {
  ServiceRequest,
  CreateServiceRequestOptions,
  UpdateServiceRequestOptions,
  ListServiceRequestsOptions,
  ApiResponse,
  ListResponse,
} from '../types/index.js';

/**
 * Service Requests resource
 *
 * @example
 * ```typescript
 * const workbench = new WorkbenchClient({ apiKey: 'wbk_live_xxx' });
 *
 * // Create a service request
 * const { data: request } = await workbench.serviceRequests.create({
 *   title: 'Leaky Faucet Repair',
 *   contact_name: 'Jane Smith',
 *   contact_email: 'jane@example.com',
 *   contact_phone: '+1-555-987-6543',
 *   address: '123 Main St, Anytown, USA',
 *   priority: 'high'
 * });
 *
 * // Update request status
 * await workbench.serviceRequests.update(request.id, { status: 'scheduled' });
 * ```
 */
export class ServiceRequestsResource {
  private readonly client: WorkbenchClient;

  constructor(client: WorkbenchClient) {
    this.client = client;
  }

  /**
   * List all service requests
   *
   * Returns a paginated list of service requests for the authenticated business.
   *
   * @param options - List options (pagination, filtering, sorting)
   * @returns Paginated list of service requests
   *
   * @example
   * ```typescript
   * // List new requests
   * const { data, pagination } = await workbench.serviceRequests.list({
   *   status: 'new',
   *   priority: 'urgent',
   *   per_page: 50
   * });
   * ```
   */
  async list(options: ListServiceRequestsOptions = {}): Promise<ListResponse<ServiceRequest>> {
    return this.client.get<ListResponse<ServiceRequest>>('/v1/service-requests', {
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
   * Get a service request by ID
   *
   * @param id - Service request UUID
   * @returns Service request details
   *
   * @example
   * ```typescript
   * const { data: request } = await workbench.serviceRequests.get('request-uuid');
   * console.log(`Request: ${request.title} (${request.status})`);
   * ```
   */
  async get(id: string): Promise<ApiResponse<ServiceRequest>> {
    return this.client.get<ApiResponse<ServiceRequest>>(`/v1/service-requests/${id}`);
  }

  /**
   * Create a new service request
   *
   * @param data - Service request data
   * @returns Created service request
   *
   * @example
   * ```typescript
   * const { data: request } = await workbench.serviceRequests.create({
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
    return this.client.post<ApiResponse<ServiceRequest>>('/v1/service-requests', data);
  }

  /**
   * Update a service request
   *
   * @param id - Service request UUID
   * @param data - Fields to update
   * @returns Updated service request
   *
   * @example
   * ```typescript
   * // Assign to client and schedule
   * const { data: request } = await workbench.serviceRequests.update('request-uuid', {
   *   client_id: 'client-uuid',
   *   status: 'scheduled',
   *   notes: 'Scheduled for Monday morning'
   * });
   * ```
   */
  async update(id: string, data: UpdateServiceRequestOptions): Promise<ApiResponse<ServiceRequest>> {
    return this.client.put<ApiResponse<ServiceRequest>>(`/v1/service-requests/${id}`, data);
  }

  /**
   * Delete a service request
   *
   * Permanently deletes a service request. This action cannot be undone.
   *
   * @param id - Service request UUID
   *
   * @example
   * ```typescript
   * await workbench.serviceRequests.delete('request-uuid');
   * ```
   */
  async delete(id: string): Promise<void> {
    await this.client.delete<void>(`/v1/service-requests/${id}`);
  }
}
