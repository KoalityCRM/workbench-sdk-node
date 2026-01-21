/**
 * @file utils/webhook-verify.ts
 * @description Utilities for verifying Workbench webhook signatures
 *
 * Workbench signs all webhook payloads using HMAC-SHA256. This module provides
 * utilities to verify these signatures to ensure webhook authenticity.
 */

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Parsed webhook signature components
 */
export interface WebhookSignature {
  /** Unix timestamp when the signature was generated */
  timestamp: number;
  /** HMAC-SHA256 signature */
  signature: string;
}

/**
 * Options for webhook signature verification
 */
export interface VerifyOptions {
  /**
   * Maximum age of the webhook in seconds (default: 300 = 5 minutes)
   * Set to 0 to disable timestamp validation
   */
  tolerance?: number;
}

/**
 * Error thrown when webhook signature verification fails
 */
export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookVerificationError';
  }
}

/**
 * Parse the X-Workbench-Signature header value
 *
 * The header format is: t=<timestamp>,v1=<signature>
 *
 * @param header - The X-Workbench-Signature header value
 * @returns Parsed signature components
 * @throws WebhookVerificationError if the header format is invalid
 *
 * @example
 * ```typescript
 * const { timestamp, signature } = parseSignatureHeader(
 *   't=1706400000,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd'
 * );
 * ```
 */
export function parseSignatureHeader(header: string): WebhookSignature {
  if (!header || typeof header !== 'string') {
    throw new WebhookVerificationError('Missing or invalid signature header');
  }

  const parts = header.split(',');
  let timestamp: number | undefined;
  let signature: string | undefined;

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') {
      timestamp = parseInt(value, 10);
      if (isNaN(timestamp)) {
        throw new WebhookVerificationError('Invalid timestamp in signature header');
      }
    } else if (key === 'v1') {
      signature = value;
    }
  }

  if (timestamp === undefined || !signature) {
    throw new WebhookVerificationError('Invalid signature header format');
  }

  return { timestamp, signature };
}

/**
 * Compute the expected signature for a webhook payload
 *
 * @param payload - The raw webhook payload (string or Buffer)
 * @param secret - The webhook secret
 * @param timestamp - The timestamp from the signature header
 * @returns The expected HMAC-SHA256 signature
 *
 * @example
 * ```typescript
 * const expectedSignature = computeSignature(
 *   '{"event":"client.created","data":{...}}',
 *   'whsec_xxxxxxxxxxxx',
 *   1706400000
 * );
 * ```
 */
export function computeSignature(
  payload: string | Buffer,
  secret: string,
  timestamp: number
): string {
  const payloadString = typeof payload === 'string' ? payload : payload.toString('utf8');
  const signedPayload = `${timestamp}.${payloadString}`;
  return createHmac('sha256', secret).update(signedPayload).digest('hex');
}

/**
 * Verify a Workbench webhook signature
 *
 * This function verifies that a webhook payload was sent by Workbench and
 * hasn't been tampered with. It also checks that the webhook isn't too old
 * to prevent replay attacks.
 *
 * @param payload - The raw webhook payload (string or Buffer)
 * @param signature - The X-Workbench-Signature header value
 * @param secret - Your webhook secret (starts with whsec_)
 * @param options - Verification options
 * @returns true if the signature is valid
 * @throws WebhookVerificationError if verification fails
 *
 * @example
 * ```typescript
 * import { verifyWebhookSignature } from '@workbench/sdk';
 *
 * app.post('/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
 *   const signature = req.headers['x-workbench-signature'] as string;
 *
 *   try {
 *     verifyWebhookSignature(req.body, signature, process.env.WEBHOOK_SECRET!);
 *
 *     // Process the webhook
 *     const event = JSON.parse(req.body.toString());
 *     console.log('Received event:', event.event);
 *
 *     res.sendStatus(200);
 *   } catch (error) {
 *     console.error('Webhook verification failed:', error);
 *     res.sendStatus(400);
 *   }
 * });
 * ```
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  options: VerifyOptions = {}
): boolean {
  const { tolerance = 300 } = options;

  // Parse the signature header
  const { timestamp, signature: providedSignature } = parseSignatureHeader(signature);

  // Check timestamp tolerance (prevent replay attacks)
  if (tolerance > 0) {
    const now = Math.floor(Date.now() / 1000);
    const age = now - timestamp;

    if (age > tolerance) {
      throw new WebhookVerificationError(
        `Webhook timestamp is too old (${age} seconds). ` +
        `Maximum allowed age is ${tolerance} seconds.`
      );
    }

    if (age < -tolerance) {
      throw new WebhookVerificationError(
        'Webhook timestamp is in the future. Check your server clock.'
      );
    }
  }

  // Compute the expected signature
  const expectedSignature = computeSignature(payload, secret, timestamp);

  // Use timing-safe comparison to prevent timing attacks
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const providedBuffer = Buffer.from(providedSignature, 'utf8');

  if (expectedBuffer.length !== providedBuffer.length) {
    throw new WebhookVerificationError('Invalid webhook signature');
  }

  if (!timingSafeEqual(expectedBuffer, providedBuffer)) {
    throw new WebhookVerificationError('Invalid webhook signature');
  }

  return true;
}

/**
 * Construct a webhook event from a verified payload
 *
 * This is a convenience function that verifies the signature and parses
 * the payload in one step.
 *
 * @param payload - The raw webhook payload (string or Buffer)
 * @param signature - The X-Workbench-Signature header value
 * @param secret - Your webhook secret
 * @param options - Verification options
 * @returns The parsed webhook event
 * @throws WebhookVerificationError if verification fails
 *
 * @example
 * ```typescript
 * import { constructWebhookEvent } from '@workbench/sdk';
 *
 * const event = constructWebhookEvent(req.body, signature, secret);
 * console.log('Event type:', event.event);
 * console.log('Event data:', event.data);
 * ```
 */
export function constructWebhookEvent<T = Record<string, unknown>>(
  payload: string | Buffer,
  signature: string,
  secret: string,
  options: VerifyOptions = {}
): { event: string; data: T; timestamp: string } {
  verifyWebhookSignature(payload, signature, secret, options);

  const payloadString = typeof payload === 'string' ? payload : payload.toString('utf8');

  try {
    return JSON.parse(payloadString);
  } catch {
    throw new WebhookVerificationError('Invalid webhook payload: not valid JSON');
  }
}
