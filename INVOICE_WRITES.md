# Invoice write contract

## Version 2 migration

`send()` returns the updated invoice or quote inside `data`, not a message/ID object. It marks the draft document as sent and emits an API event; it does not deliver email. Use the application sending flow when email delivery is required. List and send responses omit `items`; retrieve document details to access line items. The optional nested `client` can be null.

Invoice and quote creation now expose `discount_type` (`fixed` or `percentage`) and line-item `taxable`/`tax_rate`. Python updates preserve explicitly supplied `None` so nullable fields can be cleared; omit a keyword to preserve its value. Both SDKs forward client `lead_status` filters; Python creation also accepts `lead_status` and `internal_notes`.

## Payment boundary

Invoice create and update accept only `draft`, `sent`, `viewed`, `overdue`, and `cancelled` statuses. The SDK exposes `InvoiceWriteStatus` for these inputs and rejects unsupported values before HTTP. The broader `InvoiceStatus` remains available for reading invoices and filtering lists.

Payment-owned states such as `partial`, `paid`, and `voided` cannot be assigned through invoice CRUD. Changing an invoice status does not record a payment or issue a refund. Use the supported payment/refund workflow; this SDK does not expose a refund method. Refund processing and payment reconciliation determine financial balances, rather than a caller-supplied invoice status.

The API commits invoice header, line-item replacement, and calculated totals atomically. A failed write does not leave a partial replacement. Supplied `items` replace all existing lines; omitted `items` preserve them. Related client and job IDs must belong to the API key's business; invalid or foreign references return HTTP 400.

Concurrent edits or payment activity can make a write stale, returning HTTP 409. Fetch the invoice again, reconcile the intended change with its current contents, and submit only the still-valid change. Do not blindly retry the same stale update. This protects changes concurrent with the API's read/write transaction; it is not a client-supplied version or ETag contract. Existing SDK error handling preserves these server failures.

An invoice with recorded payments cannot be deleted through invoice CRUD. Cancelling an invoice is not a substitute for refunding money or reversing accounting entries.
