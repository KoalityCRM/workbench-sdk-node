/**
 * @file client.ts
 * @description Main Workbench API client class
 *
 * The WorkbenchClient is the primary interface for interacting with the
 * Workbench CRM API. It handles authentication, request management, and
 * provides access to all API resources.
 */

import type {
  WorkbenchConfig,
  ApiResponse,
  ListResponse,
  ApiError,
} from './types/index.js';

import { ClientsResource } from './resources/clients.js';
import { InvoicesResource } from './resources/invoices.js';
import { QuotesResource } from './resources/quotes.js';
import { JobsResource } from './resources/jobs.js';
import { ServiceRequestsResource } from './resources/service-requests.js';
import { WebhooksResource } from './resources/webhooks.js';

/**
 * Default configuration values
 */
const DEFAULT_BASE_URL = 'https://api.tryworkbench.app';
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MAX_RETRIES = 3;

/**
 * Error thrown when an API request fails
 */
export class WorkbenchError extends Error {
  /** HTTP status code */
  public readonly status: number;
  /** Error code from the API */
  public readonly code: string;
  /** Additional error details */
  public readonly details?: Array<{ field: string; message: string }>;
  /** Request ID for debugging */
  public readonly requestId?: string;

  constructor(
    message: string,
    status: number,
    code: string,
    details?: Array<{ field: string; message: string }>,
    requestId?: string
  ) {
    super(message);
    this.name = 'WorkbenchError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

/**
 * HTTP request options
 */
export interface RequestOptions {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Request path (without base URL) */
  path: string;
  /** Query parameters */
  query?: Record<string, string | number | boolean | undefined>;
  /** Request body */
  body?: Record<string, unknown>;
  /** Additional headers */
  headers?: Record<string, string>;
}

/**
 * Main Workbench API client
 *
 * @example
 * ```typescript
 * import { WorkbenchClient } from '@workbench/sdk';
 *
 * // Using API key authentication
 * const workbench = new WorkbenchClient({
 *   apiKey: 'wbk_live_xxxxxxxxxxxxxxxxxxxxx'
 * });
 *
 * // Using OAuth access token
 * const workbench = new WorkbenchClient({
 *   accessToken: 'wbk_at_xxxxxxxxxxxxxxxxxxxxx'
 * });
 *
 * // List clients
 * const clients = await workbench.clients.list({ page: 1, per_page: 10 });
 *
 * // Create an invoice
 * const invoice = await workbench.invoices.create({
 *   client_id: 'client-uuid',
 *   items: [{ description: 'Service', quantity: 1, unit_price: 100 }]
 * });
 * ```
 */
export class WorkbenchClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly authHeader: string;

  /** Clients resource */
  public readonly clients: ClientsResource;
  /** Invoices resource */
  public readonly invoices: InvoicesResource;
  /** Quotes resource */
  public readonly quotes: QuotesResource;
  /** Jobs resource */
  public readonly jobs: JobsResource;
  /** Service requests resource */
  public readonly serviceRequests: ServiceRequestsResource;
  /** Webhooks resource */
  public readonly webhooks: WebhooksResource;

  /**
   * Create a new Workbench client
   *
   * @param config - Client configuration
   * @throws Error if neither apiKey nor accessToken is provided
   */
  constructor(config: WorkbenchConfig) {
    if (!config.apiKey && !config.accessToken) {
      throw new Error('Either apiKey or accessToken must be provided');
    }

    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.maxRetries = config.maxRetries || DEFAULT_MAX_RETRIES;

    // Set up authentication header
    const token = config.accessToken || config.apiKey;
    this.authHeader = `Bearer ${token}`;

    // Initialize resources
    this.clients = new ClientsResource(this);
    this.invoices = new InvoicesResource(this);
    this.quotes = new QuotesResource(this);
    this.jobs = new JobsResource(this);
    this.serviceRequests = new ServiceRequestsResource(this);
    this.webhooks = new WebhooksResource(this);
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path, this.baseUrl);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculate exponential backoff delay
   */
  private getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, etc.
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryable(status: number): boolean {
    // Retry on rate limiting (429) and server errors (5xx)
    return status === 429 || (status >= 500 && status < 600);
  }

  /**
   * Make an API request
   *
   * @param options - Request options
   * @returns API response
   * @throws WorkbenchError if the request fails
   */
  async request<T>(options: RequestOptions): Promise<T> {
    const { method, path, query, body, headers } = options;
    const url = this.buildUrl(path, query);

    const requestHeaders: Record<string, string> = {
      'Authorization': this.authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse response
        const responseText = await response.text();
        let responseData: T | ApiError;

        try {
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch {
          throw new WorkbenchError(
            'Invalid JSON response from API',
            response.status,
            'INVALID_RESPONSE'
          );
        }

        // Handle error responses
        if (!response.ok) {
          const errorResponse = responseData as ApiError;

          // Check if retryable
          if (this.isRetryable(response.status) && attempt < this.maxRetries) {
            const delay = this.getRetryDelay(attempt);
            await this.sleep(delay);
            continue;
          }

          throw new WorkbenchError(
            errorResponse.error?.message || 'Unknown error',
            response.status,
            errorResponse.error?.code || 'UNKNOWN_ERROR',
            errorResponse.error?.details,
            errorResponse.meta?.request_id
          );
        }

        return responseData as T;
      } catch (error) {
        if (error instanceof WorkbenchError) {
          throw error;
        }

        // Handle abort/timeout
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new WorkbenchError(
            'Request timeout',
            0,
            'TIMEOUT'
          );
        } else {
          lastError = error instanceof Error ? error : new Error(String(error));
        }

        // Retry on network errors
        if (attempt < this.maxRetries) {
          const delay = this.getRetryDelay(attempt);
          await this.sleep(delay);
          continue;
        }
      }
    }

    // If we get here, all retries failed
    throw lastError || new WorkbenchError('Request failed', 0, 'UNKNOWN_ERROR');
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>({ method: 'GET', path, query });
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: 'POST', path, body });
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', path });
  }
}
