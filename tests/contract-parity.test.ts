import { describe, expect, it, vi } from 'vitest';
import { WorkbenchClient } from '../src/client.js';

describe('API wire contract', () => {
  it('forwards the declared client lead-stage filter', async () => {
    const client = new WorkbenchClient({ apiKey: 'wbk_test_fixture' });
    const get = vi.spyOn(client, 'get').mockResolvedValue({ data: [] });
    await client.clients.list({ lead_status: 'qualified' });
    expect(get).toHaveBeenCalledWith('/v1/clients', expect.objectContaining({ lead_status: 'qualified' }));
  });
  it.each(['invoices', 'quotes'] as const)('%s preserves discount mode, item tax, and explicit null updates', async (resource) => {
    const client = new WorkbenchClient({ apiKey: 'wbk_test_fixture' });
    const post = vi.spyOn(client, 'post').mockResolvedValue({ data: {} });
    const put = vi.spyOn(client, 'put').mockResolvedValue({ data: {} });
    const body = { items: [{ description: 'Service', quantity: 1, unit_price: 10, taxable: false, tax_rate: null }], discount_type: 'percentage' as const, discount_amount: 10 };
    await client[resource].create(body);
    expect(post).toHaveBeenCalledWith(`/v1/${resource}`, body);
    await client[resource].update('id', { notes: null });
    expect(put).toHaveBeenCalledWith(`/v1/${resource}/id`, { notes: null });
  });
  it.each(['invoices', 'quotes'] as const)('%s send returns the document, not an invented message response', async (resource) => {
    const client = new WorkbenchClient({ apiKey: 'wbk_test_fixture' });
    const response = { data: { id: 'id', status: 'sent' } };
    const post = vi.spyOn(client, 'post').mockResolvedValue(response);
    expect(await client[resource].send('id')).toBe(response);
    expect(post).toHaveBeenCalledWith(`/v1/${resource}/id/send`);
  });
});
