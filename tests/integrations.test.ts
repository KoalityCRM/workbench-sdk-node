/**
 * @fileoverview Integration resource tests
 *
 * Tests all IntegrationsResource methods to ensure they:
 * - Make correct API calls with proper parameters
 * - Handle responses correctly
 * - Pass appropriate query parameters
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorkbenchClient } from '../src/client.js';

// =============================================================================
// TEST SETUP
// =============================================================================

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

/**
 * Creates a mock API response
 */
function createMockResponse(data: unknown, options: { status?: number; ok?: boolean } = {}) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

/**
 * Mock integration data
 */
const mockIntegration = {
  id: 'int-123',
  slug: 'quickbooks',
  name: 'QuickBooks Integration',
  short_description: 'Sync invoices with QuickBooks',
  description: 'Full description...',
  category: 'accounting',
  icon_url: 'https://example.com/icon.png',
  scopes: [{ scope: 'invoices:read', description: 'Read invoices', required: true }],
  webhook_events: ['invoice.created'],
  install_count: 150,
  average_rating: 4.5,
  review_count: 25,
  developer: { id: 'dev-123', name: 'Intuit', website: null, verified: true },
  published_at: '2025-06-15T10:00:00Z',
  created_at: '2025-06-01T08:00:00Z',
  updated_at: null,
};

const mockReview = {
  id: 'rev-123',
  integration_id: 'int-123',
  rating: 5,
  title: 'Great!',
  content: 'Loved it!',
  reviewer_name: 'John D.',
  created_at: '2025-12-20T14:30:00Z',
};

const mockInstalledIntegration = {
  id: 'inst-123',
  integration_id: 'int-123',
  integration: mockIntegration,
  access_token_prefix: 'wbk_at_x',
  granted_scopes: ['invoices:read'],
  installed_at: '2025-12-15T10:00:00Z',
  installed_by: 'user-123',
  is_active: true,
};

// =============================================================================
// TESTS
// =============================================================================

describe('IntegrationsResource', () => {
  let client: WorkbenchClient;

  beforeEach(() => {
    mockFetch.mockClear();
    client = new WorkbenchClient({ apiKey: 'wbk_test_xxx' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // list() - Marketplace listing
  // ===========================================================================

  describe('list()', () => {
    it('should list marketplace integrations', async () => {
      const response = {
        data: [mockIntegration],
        meta: { request_id: 'req-123' },
        pagination: { page: 1, per_page: 20, total: 1, total_pages: 1, has_next: false, has_prev: false },
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      const result = await client.integrations.list();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/integrations'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].slug).toBe('quickbooks');
    });

    it('should pass category filter', async () => {
      const response = {
        data: [mockIntegration],
        pagination: { page: 1, per_page: 20, total: 1, total_pages: 1, has_next: false, has_prev: false },
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      await client.integrations.list({ category: 'accounting' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/category=accounting/),
        expect.any(Object)
      );
    });

    it('should pass search parameter', async () => {
      const response = { data: [], pagination: { page: 1, per_page: 20, total: 0, total_pages: 0, has_next: false, has_prev: false } };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      await client.integrations.list({ search: 'quickbooks' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/search=quickbooks/),
        expect.any(Object)
      );
    });

    it('should pass sort_by parameter', async () => {
      const response = { data: [], pagination: { page: 1, per_page: 20, total: 0, total_pages: 0, has_next: false, has_prev: false } };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      await client.integrations.list({ sort_by: 'rating' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/sort_by=rating/),
        expect.any(Object)
      );
    });

    it('should pass pagination parameters', async () => {
      const response = { data: [], pagination: { page: 2, per_page: 10, total: 50, total_pages: 5, has_next: true, has_prev: true } };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      await client.integrations.list({ page: 2, per_page: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/page=2.*per_page=10|per_page=10.*page=2/),
        expect.any(Object)
      );
    });
  });

  // ===========================================================================
  // get() - Get integration by ID or slug
  // ===========================================================================

  describe('get()', () => {
    it('should get integration by slug', async () => {
      const response = { data: mockIntegration, meta: { request_id: 'req-123' } };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      const result = await client.integrations.get('quickbooks');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/integrations/quickbooks'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.data.slug).toBe('quickbooks');
    });

    it('should get integration by UUID', async () => {
      const response = { data: mockIntegration, meta: { request_id: 'req-123' } };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      await client.integrations.get('550e8400-e29b-41d4-a716-446655440000');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/integrations/550e8400-e29b-41d4-a716-446655440000'),
        expect.any(Object)
      );
    });
  });

  // ===========================================================================
  // getReviews() - Get reviews for an integration
  // ===========================================================================

  describe('getReviews()', () => {
    it('should get reviews for an integration', async () => {
      const response = {
        data: [mockReview],
        pagination: { page: 1, per_page: 10, total: 1, total_pages: 1, has_next: false, has_prev: false },
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      const result = await client.integrations.getReviews('quickbooks');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/integrations/quickbooks/reviews'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].rating).toBe(5);
    });

    it('should filter reviews by minimum rating', async () => {
      const response = { data: [], pagination: { page: 1, per_page: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      await client.integrations.getReviews('quickbooks', { min_rating: 4 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/min_rating=4/),
        expect.any(Object)
      );
    });
  });

  // ===========================================================================
  // listInstalled() - List installed integrations
  // ===========================================================================

  describe('listInstalled()', () => {
    it('should list installed integrations', async () => {
      const response = {
        data: [mockInstalledIntegration],
        pagination: { page: 1, per_page: 20, total: 1, total_pages: 1, has_next: false, has_prev: false },
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      const result = await client.integrations.listInstalled();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/integrations/installed'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].is_active).toBe(true);
    });
  });

  // ===========================================================================
  // getInstalled() - Get installed integration details
  // ===========================================================================

  describe('getInstalled()', () => {
    it('should get installed integration by ID', async () => {
      const response = { data: mockInstalledIntegration, meta: { request_id: 'req-123' } };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      const result = await client.integrations.getInstalled('inst-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/integrations/installed/inst-123'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.data.id).toBe('inst-123');
    });
  });

  // ===========================================================================
  // install() - Install an integration
  // ===========================================================================

  describe('install()', () => {
    it('should install an integration', async () => {
      const response = { data: mockInstalledIntegration, meta: { request_id: 'req-123' } };

      mockFetch.mockResolvedValueOnce(createMockResponse(response, { status: 201 }));

      const result = await client.integrations.install({
        integration_id: 'int-123',
        scopes: ['invoices:read'],
        authorization_code: 'auth_code_xxx',
        code_verifier: 'verifier_xxx_xxx_xxx_xxx_xxx_xxx_xxx_xxx_xxx_xxx_xxx',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/integrations/install'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('integration_id'),
        })
      );
      expect(result.data.integration_id).toBe('int-123');
    });
  });

  // ===========================================================================
  // uninstall() - Uninstall an integration
  // ===========================================================================

  describe('uninstall()', () => {
    it('should uninstall an integration', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}, { status: 204 }));

      await client.integrations.uninstall('inst-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/integrations/installed/inst-123'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  // ===========================================================================
  // disable() - Disable an integration
  // ===========================================================================

  describe('disable()', () => {
    it('should disable an integration', async () => {
      const response = { data: { ...mockInstalledIntegration, is_active: false }, meta: { request_id: 'req-123' } };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      const result = await client.integrations.disable('inst-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/integrations/installed/inst-123/disable'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.data.is_active).toBe(false);
    });
  });

  // ===========================================================================
  // enable() - Enable an integration
  // ===========================================================================

  describe('enable()', () => {
    it('should enable an integration', async () => {
      const response = { data: mockInstalledIntegration, meta: { request_id: 'req-123' } };

      mockFetch.mockResolvedValueOnce(createMockResponse(response));

      const result = await client.integrations.enable('inst-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/integrations/installed/inst-123/enable'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.data.is_active).toBe(true);
    });
  });

  // ===========================================================================
  // submitReview() - Submit a review
  // ===========================================================================

  describe('submitReview()', () => {
    it('should submit a review', async () => {
      const response = { data: mockReview, meta: { request_id: 'req-123' } };

      mockFetch.mockResolvedValueOnce(createMockResponse(response, { status: 201 }));

      const result = await client.integrations.submitReview('int-123', {
        rating: 5,
        title: 'Great!',
        content: 'Loved it!',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/integrations/int-123/reviews'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"rating":5'),
        })
      );
      expect(result.data.rating).toBe(5);
    });

    it('should submit review without optional fields', async () => {
      const response = { data: { ...mockReview, title: null, content: null }, meta: { request_id: 'req-123' } };

      mockFetch.mockResolvedValueOnce(createMockResponse(response, { status: 201 }));

      await client.integrations.submitReview('int-123', { rating: 4 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"rating":4'),
        })
      );
    });
  });

  // ===========================================================================
  // Error handling
  // ===========================================================================

  describe('Error handling', () => {
    it('should throw error on 404 response', async () => {
      const errorResponse = {
        error: { code: 'NOT_FOUND', message: 'Integration not found' },
        meta: { request_id: 'req-123' },
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(errorResponse, { status: 404, ok: false }));

      await expect(client.integrations.get('non-existent')).rejects.toThrow('Integration not found');
    });

    it('should throw error on 401 response', async () => {
      const errorResponse = {
        error: { code: 'UNAUTHORIZED', message: 'Invalid API key' },
        meta: { request_id: 'req-123' },
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(errorResponse, { status: 401, ok: false }));

      await expect(client.integrations.listInstalled()).rejects.toThrow('Invalid API key');
    });

    it('should throw error on 403 response', async () => {
      const errorResponse = {
        error: { code: 'FORBIDDEN', message: 'Missing required scope' },
        meta: { request_id: 'req-123' },
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(errorResponse, { status: 403, ok: false }));

      await expect(
        client.integrations.submitReview('int-123', { rating: 5 })
      ).rejects.toThrow('Missing required scope');
    });
  });
});
