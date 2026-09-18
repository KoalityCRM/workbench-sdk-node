import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorkbenchClient } from '../src/client.js';
import type { CreateInvoiceOptions, UpdateInvoiceOptions, InvoiceWriteStatus } from '../src/index.js';

describe('invoice payment boundary', () => {
  afterEach(() => vi.restoreAllMocks());
  const client = () => new WorkbenchClient({ apiKey: 'wbk_test_fixture' });

  it.each(['paid', 'partial', 'voided', 'refunded'])('rejects %s before HTTP', async (status) => {
    const sdk = client();
    const post = vi.spyOn(sdk, 'post');
    const put = vi.spyOn(sdk, 'put');
    // Exercise JavaScript/untyped callers deliberately bypassing compile-time checks.
    await expect(sdk.invoices.create({ items: [], status } as CreateInvoiceOptions)).rejects.toThrow('read-only');
    await expect(sdk.invoices.update('invoice-id', { status } as UpdateInvoiceOptions)).rejects.toThrow('read-only');
    expect(post).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
  });

  it.each<InvoiceWriteStatus>(['draft', 'sent', 'viewed', 'overdue', 'cancelled'])('preserves %s in writes', async (status) => {
    const sdk = client();
    const post = vi.spyOn(sdk, 'post').mockResolvedValue({ data: {} });
    const put = vi.spyOn(sdk, 'put').mockResolvedValue({ data: {} });
    await sdk.invoices.create({ items: [], status });
    await sdk.invoices.update('invoice-id', { status, notes: 'fixture' });
    expect(post).toHaveBeenCalledWith('/v1/invoices', { items: [], status });
    expect(put).toHaveBeenCalledWith('/v1/invoices/invoice-id', { status, notes: 'fixture' });
  });

  it('allows payment-state filters and propagates conflicts without hiding them', async () => {
    const sdk = client();
    const get = vi.spyOn(sdk, 'get').mockResolvedValue({ data: [] });
    await sdk.invoices.list({ status: 'paid' });
    expect(get).toHaveBeenCalledWith('/v1/invoices', expect.objectContaining({ status: 'paid' }));
    const conflict = new Error('Invoice changed. Reload it before retrying.');
    vi.spyOn(sdk, 'put').mockRejectedValue(conflict);
    await expect(sdk.invoices.update('invoice-id', { notes: 'fixture' })).rejects.toBe(conflict);
  });
});
