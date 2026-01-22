/**
 * Notifications Resource
 *
 * Provides methods for sending email notifications to clients and
 * business team members via the Workbench API.
 *
 * @module resources/notifications
 *
 * @example
 * // Send a welcome notification to a new client
 * await workbench.notifications.sendToClient({
 *   clientId: 'client-uuid',
 *   event: 'sdk_client_created',
 *   templateData: { client_name: 'John Doe' }
 * });
 *
 * @example
 * // Notify business admins about a new request
 * await workbench.notifications.sendToTeam({
 *   event: 'sdk_request_created',
 *   roles: ['owner', 'admin'],
 *   templateData: { request_title: 'AC Repair', client_name: 'John' }
 * });
 *
 * @example
 * // Send a custom notification
 * await workbench.notifications.sendCustom({
 *   type: 'CLIENT',
 *   clientId: 'client-uuid',
 *   subject: 'Your appointment is confirmed!',
 *   html: '<h1>Confirmed!</h1><p>See you tomorrow at 10am.</p>'
 * });
 */

import type { WorkbenchClient } from '../client.js';
import type {
  ApiResponse,
  NotificationResult,
  SendToClientOptions,
  SendToTeamOptions,
  SendCustomNotificationOptions,
} from '../types/index.js';

/**
 * Request body for the notifications API endpoint
 */
interface NotificationRequestBody {
  type: 'CLIENT' | 'BUSINESS';
  event: string;
  client_id?: string;
  roles?: string[];
  template_data?: Record<string, string | number>;
  subject_override?: string;
  html_override?: string;
  entity_type?: string;
  entity_id?: string;
}

/**
 * Notifications resource for sending email notifications via the SDK
 */
export class NotificationsResource {
  private readonly client: WorkbenchClient;

  constructor(client: WorkbenchClient) {
    this.client = client;
  }

  /**
   * Send a notification to a specific client
   *
   * Sends an email notification to a client using a predefined template
   * or custom content. The client must have a valid email address.
   *
   * @param options - Notification options
   * @returns Notification result with delivery statistics
   *
   * @example
   * // Welcome a new client
   * const result = await workbench.notifications.sendToClient({
   *   clientId: 'client-uuid',
   *   event: 'sdk_client_created',
   *   templateData: {
   *     client_name: 'John Doe'
   *   }
   * });
   * console.log(`Sent to ${result.data.sent_count} recipient(s)`);
   *
   * @example
   * // Notify client about a new quote with custom subject
   * const result = await workbench.notifications.sendToClient({
   *   clientId: 'client-uuid',
   *   event: 'sdk_quote_created',
   *   templateData: {
   *     client_name: 'John',
   *     quote_number: 'Q-001',
   *     quote_total: '$1,500.00'
   *   },
   *   subjectOverride: 'Your custom quote is ready!'
   * });
   */
  async sendToClient(options: SendToClientOptions): Promise<ApiResponse<NotificationResult>> {
    const body: NotificationRequestBody = {
      type: 'CLIENT',
      event: options.event,
      client_id: options.clientId,
      template_data: options.templateData,
      subject_override: options.subjectOverride,
      html_override: options.htmlOverride,
      entity_type: options.entityType,
      entity_id: options.entityId,
    };

    return this.client.post<ApiResponse<NotificationResult>>('/v1/notifications', body);
  }

  /**
   * Send a notification to business team members
   *
   * Sends an email notification to team members, optionally filtered
   * by their role in the business.
   *
   * @param options - Notification options
   * @returns Notification result with delivery statistics
   *
   * @example
   * // Notify all team members about a new service request
   * const result = await workbench.notifications.sendToTeam({
   *   event: 'sdk_request_created',
   *   templateData: {
   *     request_title: 'Emergency AC Repair',
   *     client_name: 'John Doe',
   *     request_description: 'AC not cooling, needs urgent attention'
   *   }
   * });
   *
   * @example
   * // Notify only owners and admins
   * const result = await workbench.notifications.sendToTeam({
   *   event: 'sdk_invoice_created',
   *   roles: ['owner', 'admin'],
   *   templateData: {
   *     invoice_number: 'INV-001',
   *     invoice_total: '$2,500.00',
   *     client_name: 'Acme Corp'
   *   }
   * });
   */
  async sendToTeam(options: SendToTeamOptions): Promise<ApiResponse<NotificationResult>> {
    const body: NotificationRequestBody = {
      type: 'BUSINESS',
      event: options.event,
      roles: options.roles,
      template_data: options.templateData,
      subject_override: options.subjectOverride,
      html_override: options.htmlOverride,
      entity_type: options.entityType,
      entity_id: options.entityId,
    };

    return this.client.post<ApiResponse<NotificationResult>>('/v1/notifications', body);
  }

  /**
   * Send a custom notification
   *
   * Sends a notification with fully custom subject and HTML content.
   * Can be sent to either a client or business team members.
   *
   * @param options - Custom notification options
   * @returns Notification result with delivery statistics
   *
   * @example
   * // Send custom appointment confirmation to client
   * const result = await workbench.notifications.sendCustom({
   *   type: 'CLIENT',
   *   clientId: 'client-uuid',
   *   subject: 'Your appointment is confirmed for tomorrow!',
   *   html: `
   *     <h1>Appointment Confirmed</h1>
   *     <p>Hi John,</p>
   *     <p>Your appointment has been confirmed:</p>
   *     <ul>
   *       <li><strong>Date:</strong> January 23, 2026</li>
   *       <li><strong>Time:</strong> 10:00 AM</li>
   *       <li><strong>Service:</strong> AC Maintenance</li>
   *     </ul>
   *     <p>See you tomorrow!</p>
   *   `
   * });
   *
   * @example
   * // Send custom alert to admins
   * const result = await workbench.notifications.sendCustom({
   *   type: 'BUSINESS',
   *   roles: ['owner', 'admin'],
   *   subject: 'High-value quote approved!',
   *   html: '<p>Quote Q-001 for $10,000 has been approved by Acme Corp.</p>',
   *   templateData: {
   *     quote_number: 'Q-001'
   *   }
   * });
   */
  async sendCustom(options: SendCustomNotificationOptions): Promise<ApiResponse<NotificationResult>> {
    const body: NotificationRequestBody = {
      type: options.type,
      event: 'sdk_custom',
      client_id: options.clientId,
      roles: options.roles,
      template_data: options.templateData,
      subject_override: options.subject,
      html_override: options.html,
      entity_type: options.entityType,
      entity_id: options.entityId,
    };

    return this.client.post<ApiResponse<NotificationResult>>('/v1/notifications', body);
  }
}
