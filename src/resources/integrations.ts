/**
 * @file resources/integrations.ts
 * @description Integration marketplace resource for browsing and managing integrations
 *
 * The IntegrationsResource provides methods for:
 * - Browsing the public integration marketplace
 * - Viewing integration details and reviews
 * - Managing installed integrations on your business account
 */

import type { WorkbenchClient } from '../client.js';
import type {
  ApiResponse,
  ListResponse,
  Integration,
  IntegrationReview,
  InstalledIntegration,
  ListIntegrationsOptions,
  ListIntegrationReviewsOptions,
  InstallIntegrationOptions,
} from '../types/index.js';

/**
 * Integration marketplace resource
 *
 * Provides access to the Workbench integration marketplace, allowing you to
 * browse published integrations, view reviews, and manage installations.
 *
 * @example
 * ```typescript
 * // Browse marketplace
 * const { data: integrations } = await workbench.integrations.list({
 *   category: 'accounting',
 *   sort_by: 'popular'
 * });
 *
 * // Get integration details
 * const { data: integration } = await workbench.integrations.get('quickbooks');
 *
 * // List installed integrations
 * const { data: installed } = await workbench.integrations.listInstalled();
 * ```
 */
export class IntegrationsResource {
  private readonly client: WorkbenchClient;

  constructor(client: WorkbenchClient) {
    this.client = client;
  }

  // ===========================================
  // MARKETPLACE (Public)
  // ===========================================

  /**
   * List published integrations in the marketplace
   *
   * Returns a paginated list of published integrations available for installation.
   * This endpoint is publicly accessible.
   *
   * @param options - List options (pagination, filtering, sorting)
   * @returns Paginated list of integrations
   *
   * @example
   * ```typescript
   * // List all integrations
   * const { data, pagination } = await workbench.integrations.list();
   *
   * // Filter by category
   * const { data } = await workbench.integrations.list({
   *   category: 'accounting',
   *   sort_by: 'popular',
   *   per_page: 10
   * });
   *
   * // Search integrations
   * const { data } = await workbench.integrations.list({
   *   search: 'quickbooks'
   * });
   * ```
   */
  async list(options: ListIntegrationsOptions = {}): Promise<ListResponse<Integration>> {
    return this.client.get<ListResponse<Integration>>('/v1/integrations', {
      page: options.page,
      per_page: options.per_page,
      search: options.search,
      category: options.category,
      scope: options.scope,
      sort_by: options.sort_by,
    });
  }

  /**
   * Get an integration by ID or slug
   *
   * Returns detailed information about a specific integration.
   *
   * @param idOrSlug - Integration UUID or URL slug
   * @returns Integration details
   *
   * @example
   * ```typescript
   * // Get by slug
   * const { data: integration } = await workbench.integrations.get('quickbooks');
   *
   * // Get by ID
   * const { data: integration } = await workbench.integrations.get('123e4567-e89b-12d3-a456-426614174000');
   *
   * console.log(`${integration.name} by ${integration.developer.name}`);
   * console.log(`Installs: ${integration.install_count}`);
   * ```
   */
  async get(idOrSlug: string): Promise<ApiResponse<Integration>> {
    return this.client.get<ApiResponse<Integration>>(`/v1/integrations/${idOrSlug}`);
  }

  /**
   * Get reviews for an integration
   *
   * Returns a paginated list of user reviews for a specific integration.
   *
   * @param integrationId - Integration UUID or slug
   * @param options - List options (pagination, filtering)
   * @returns Paginated list of reviews
   *
   * @example
   * ```typescript
   * const { data: reviews, pagination } = await workbench.integrations.getReviews('quickbooks', {
   *   min_rating: 4,
   *   per_page: 10
   * });
   *
   * for (const review of reviews) {
   *   console.log(`${review.rating}/5 - ${review.title}`);
   * }
   * ```
   */
  async getReviews(
    integrationId: string,
    options: ListIntegrationReviewsOptions = {}
  ): Promise<ListResponse<IntegrationReview>> {
    return this.client.get<ListResponse<IntegrationReview>>(
      `/v1/integrations/${integrationId}/reviews`,
      {
        page: options.page,
        per_page: options.per_page,
        min_rating: options.min_rating,
      }
    );
  }

  // ===========================================
  // INSTALLED INTEGRATIONS (Authenticated)
  // ===========================================

  /**
   * List installed integrations on your business account
   *
   * Returns all integrations that have been installed on the authenticated
   * business account.
   *
   * @returns List of installed integrations
   *
   * @example
   * ```typescript
   * const { data: installed } = await workbench.integrations.listInstalled();
   *
   * for (const install of installed) {
   *   console.log(`${install.integration.name} - Active: ${install.is_active}`);
   *   console.log(`Scopes: ${install.granted_scopes.join(', ')}`);
   * }
   * ```
   */
  async listInstalled(): Promise<ListResponse<InstalledIntegration>> {
    return this.client.get<ListResponse<InstalledIntegration>>('/v1/integrations/installed');
  }

  /**
   * Get an installed integration by ID
   *
   * @param installationId - Installation UUID
   * @returns Installed integration details
   *
   * @example
   * ```typescript
   * const { data: install } = await workbench.integrations.getInstalled('install-uuid');
   * console.log(`Installed on: ${install.installed_at}`);
   * ```
   */
  async getInstalled(installationId: string): Promise<ApiResponse<InstalledIntegration>> {
    return this.client.get<ApiResponse<InstalledIntegration>>(
      `/v1/integrations/installed/${installationId}`
    );
  }

  /**
   * Install an integration on your business account
   *
   * Completes the OAuth flow and installs an integration. This requires an
   * authorization code obtained from the user consent flow.
   *
   * @param options - Installation options including authorization code
   * @returns Installed integration details
   *
   * @example
   * ```typescript
   * // After user completes OAuth consent flow:
   * const { data: install } = await workbench.integrations.install({
   *   integration_id: 'integration-uuid',
   *   scopes: ['clients:read', 'invoices:read'],
   *   authorization_code: 'code_from_oauth_flow',
   *   code_verifier: 'pkce_code_verifier'
   * });
   *
   * console.log(`Installed! Token prefix: ${install.access_token_prefix}`);
   * ```
   */
  async install(options: InstallIntegrationOptions): Promise<ApiResponse<InstalledIntegration>> {
    return this.client.post<ApiResponse<InstalledIntegration>>(
      '/v1/integrations/install',
      options
    );
  }

  /**
   * Uninstall an integration from your business account
   *
   * Revokes all access tokens and removes the integration. This action
   * cannot be undone.
   *
   * @param installationId - Installation UUID
   *
   * @example
   * ```typescript
   * await workbench.integrations.uninstall('install-uuid');
   * console.log('Integration uninstalled');
   * ```
   */
  async uninstall(installationId: string): Promise<void> {
    await this.client.delete<void>(`/v1/integrations/installed/${installationId}`);
  }

  /**
   * Temporarily disable an installed integration
   *
   * Pauses the integration without uninstalling it. The integration can
   * be re-enabled later.
   *
   * @param installationId - Installation UUID
   * @returns Updated installation
   *
   * @example
   * ```typescript
   * const { data: install } = await workbench.integrations.disable('install-uuid');
   * console.log(`Active: ${install.is_active}`); // false
   * ```
   */
  async disable(installationId: string): Promise<ApiResponse<InstalledIntegration>> {
    return this.client.post<ApiResponse<InstalledIntegration>>(
      `/v1/integrations/installed/${installationId}/disable`
    );
  }

  /**
   * Re-enable a disabled integration
   *
   * @param installationId - Installation UUID
   * @returns Updated installation
   *
   * @example
   * ```typescript
   * const { data: install } = await workbench.integrations.enable('install-uuid');
   * console.log(`Active: ${install.is_active}`); // true
   * ```
   */
  async enable(installationId: string): Promise<ApiResponse<InstalledIntegration>> {
    return this.client.post<ApiResponse<InstalledIntegration>>(
      `/v1/integrations/installed/${installationId}/enable`
    );
  }

  // ===========================================
  // REVIEWS (Authenticated)
  // ===========================================

  /**
   * Submit a review for an installed integration
   *
   * You can only review integrations that are installed on your business account.
   *
   * @param integrationId - Integration UUID
   * @param review - Review data
   * @returns Created review
   *
   * @example
   * ```typescript
   * const { data: review } = await workbench.integrations.submitReview('integration-uuid', {
   *   rating: 5,
   *   title: 'Great integration!',
   *   content: 'This integration saved us hours of manual work...'
   * });
   * ```
   */
  async submitReview(
    integrationId: string,
    review: { rating: number; title?: string; content?: string }
  ): Promise<ApiResponse<IntegrationReview>> {
    return this.client.post<ApiResponse<IntegrationReview>>(
      `/v1/integrations/${integrationId}/reviews`,
      review
    );
  }
}
