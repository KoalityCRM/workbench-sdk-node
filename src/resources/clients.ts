/**
 * @file resources/clients.ts
 * @description Clients resource for the Workbench SDK
 *
 * Provides methods for managing clients in Workbench CRM.
 */

import type { WorkbenchClient } from '../client.js';
import type {
  Client,
  CreateClientOptions,
  UpdateClientOptions,
  ListClientsOptions,
  ApiResponse,
  ListResponse,
} from '../types/index.js';

/**
 * Clients resource
 *
 * @example
 * ```typescript
 * const workbench = new WorkbenchClient({ apiKey: 'wbk_live_xxx' });
 *
 * // List clients
 * const { data: clients, pagination } = await workbench.clients.list({
 *   status: 'active',
 *   per_page: 10
 * });
 *
 * // Create a client
 * const { data: client } = await workbench.clients.create({
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   email: 'john@example.com'
 * });
 *
 * // Get a client
 * const { data: client } = await workbench.clients.get('client-uuid');
 *
 * // Update a client
 * const { data: updated } = await workbench.clients.update('client-uuid', {
 *   phone: '+1-555-123-4567'
 * });
 *
 * // Delete a client
 * await workbench.clients.delete('client-uuid');
 * ```
 */
export class ClientsResource {
  private readonly client: WorkbenchClient;

  constructor(client: WorkbenchClient) {
    this.client = client;
  }

  /**
   * List all clients
   *
   * Returns a paginated list of clients for the authenticated business.
   *
   * @param options - List options (pagination, filtering, sorting)
   * @returns Paginated list of clients
   *
   * @example
   * ```typescript
   * // List all active clients
   * const { data, pagination } = await workbench.clients.list({
   *   status: 'active',
   *   page: 1,
   *   per_page: 20
   * });
   *
   * console.log(`Found ${pagination.total} clients`);
   * ```
   */
  async list(options: ListClientsOptions = {}): Promise<ListResponse<Client>> {
    return this.client.get<ListResponse<Client>>('/v1/clients', {
      page: options.page,
      per_page: options.per_page,
      search: options.search,
      sort: options.sort,
      order: options.order,
      status: options.status,
    });
  }

  /**
   * Get a client by ID
   *
   * @param id - Client UUID
   * @returns Client details
   *
   * @example
   * ```typescript
   * const { data: client } = await workbench.clients.get('client-uuid');
   * console.log(`Client: ${client.first_name} ${client.last_name}`);
   * ```
   */
  async get(id: string): Promise<ApiResponse<Client>> {
    return this.client.get<ApiResponse<Client>>(`/v1/clients/${id}`);
  }

  /**
   * Create a new client
   *
   * @param data - Client data
   * @returns Created client
   *
   * @example
   * ```typescript
   * const { data: client } = await workbench.clients.create({
   *   first_name: 'John',
   *   last_name: 'Doe',
   *   email: 'john@example.com',
   *   phone: '+1-555-123-4567',
   *   company: 'Acme Corp',
   *   status: 'active',
   *   source: 'referral',
   *   tags: ['vip', 'commercial']
   * });
   * ```
   */
  async create(data: CreateClientOptions): Promise<ApiResponse<Client>> {
    return this.client.post<ApiResponse<Client>>('/v1/clients', data as Record<string, unknown>);
  }

  /**
   * Update a client
   *
   * @param id - Client UUID
   * @param data - Fields to update
   * @returns Updated client
   *
   * @example
   * ```typescript
   * const { data: client } = await workbench.clients.update('client-uuid', {
   *   status: 'inactive',
   *   notes: 'Client requested to pause services'
   * });
   * ```
   */
  async update(id: string, data: UpdateClientOptions): Promise<ApiResponse<Client>> {
    return this.client.put<ApiResponse<Client>>(`/v1/clients/${id}`, data as Record<string, unknown>);
  }

  /**
   * Delete a client
   *
   * Permanently deletes a client and all associated data.
   * This action cannot be undone.
   *
   * @param id - Client UUID
   *
   * @example
   * ```typescript
   * await workbench.clients.delete('client-uuid');
   * ```
   */
  async delete(id: string): Promise<void> {
    await this.client.delete<void>(`/v1/clients/${id}`);
  }
}
