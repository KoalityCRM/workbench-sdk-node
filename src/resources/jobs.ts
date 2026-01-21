/**
 * @file resources/jobs.ts
 * @description Jobs resource for the Workbench SDK
 *
 * Provides methods for managing jobs/work orders in Workbench CRM.
 */

import type { WorkbenchClient } from '../client.js';
import type {
  Job,
  CreateJobOptions,
  UpdateJobOptions,
  ListJobsOptions,
  ApiResponse,
  ListResponse,
} from '../types/index.js';

/**
 * Jobs resource
 *
 * @example
 * ```typescript
 * const workbench = new WorkbenchClient({ apiKey: 'wbk_live_xxx' });
 *
 * // Create a job
 * const { data: job } = await workbench.jobs.create({
 *   client_id: 'client-uuid',
 *   title: 'Kitchen Faucet Installation',
 *   priority: 'high',
 *   scheduled_start: '2024-01-20T09:00:00Z',
 *   scheduled_end: '2024-01-20T12:00:00Z'
 * });
 *
 * // Update job status
 * await workbench.jobs.update(job.id, { status: 'completed' });
 * ```
 */
export class JobsResource {
  private readonly client: WorkbenchClient;

  constructor(client: WorkbenchClient) {
    this.client = client;
  }

  /**
   * List all jobs
   *
   * Returns a paginated list of jobs for the authenticated business.
   *
   * @param options - List options (pagination, filtering, sorting)
   * @returns Paginated list of jobs
   *
   * @example
   * ```typescript
   * // List scheduled jobs
   * const { data, pagination } = await workbench.jobs.list({
   *   status: 'scheduled',
   *   priority: 'high',
   *   per_page: 20
   * });
   * ```
   */
  async list(options: ListJobsOptions = {}): Promise<ListResponse<Job>> {
    return this.client.get<ListResponse<Job>>('/v1/jobs', {
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
   * Get a job by ID
   *
   * @param id - Job UUID
   * @returns Job details
   *
   * @example
   * ```typescript
   * const { data: job } = await workbench.jobs.get('job-uuid');
   * console.log(`Job: ${job.title} (${job.status})`);
   * ```
   */
  async get(id: string): Promise<ApiResponse<Job>> {
    return this.client.get<ApiResponse<Job>>(`/v1/jobs/${id}`);
  }

  /**
   * Create a new job
   *
   * @param data - Job data
   * @returns Created job
   *
   * @example
   * ```typescript
   * const { data: job } = await workbench.jobs.create({
   *   client_id: 'client-uuid',
   *   title: 'HVAC Maintenance',
   *   description: 'Annual AC maintenance and filter replacement',
   *   priority: 'medium',
   *   scheduled_start: '2024-01-25T10:00:00Z',
   *   estimated_duration: 120, // minutes
   *   notes: 'Customer prefers morning appointments'
   * });
   * ```
   */
  async create(data: CreateJobOptions): Promise<ApiResponse<Job>> {
    return this.client.post<ApiResponse<Job>>('/v1/jobs', data);
  }

  /**
   * Update a job
   *
   * @param id - Job UUID
   * @param data - Fields to update
   * @returns Updated job
   *
   * @example
   * ```typescript
   * // Mark job as started
   * const { data: job } = await workbench.jobs.update('job-uuid', {
   *   status: 'in_progress',
   *   actual_start: new Date().toISOString()
   * });
   *
   * // Mark job as completed
   * await workbench.jobs.update('job-uuid', {
   *   status: 'completed',
   *   actual_end: new Date().toISOString()
   * });
   * ```
   */
  async update(id: string, data: UpdateJobOptions): Promise<ApiResponse<Job>> {
    return this.client.put<ApiResponse<Job>>(`/v1/jobs/${id}`, data);
  }

  /**
   * Delete a job
   *
   * Permanently deletes a job. This action cannot be undone.
   *
   * @param id - Job UUID
   *
   * @example
   * ```typescript
   * await workbench.jobs.delete('job-uuid');
   * ```
   */
  async delete(id: string): Promise<void> {
    await this.client.delete<void>(`/v1/jobs/${id}`);
  }
}
