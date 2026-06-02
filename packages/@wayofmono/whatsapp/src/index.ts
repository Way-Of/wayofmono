import fetch, { RequestInit } from 'node-fetch';

const WHATSAPP_API_BASE_URL = 'https://graph.facebook.com/v19.0/'; // Placeholder for WhatsApp Cloud API

export interface WhatsAppBotInfo {
  id: string;
  name: string;
  // Add other relevant fields for WhatsApp bot info as needed
}

export interface WhatsAppSendMessageOpts {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string; // Recipient's WhatsApp ID
  type: 'text' | 'template'; // Can be expanded for other message types
  text?: {
    preview_url?: boolean;
    body: string;
  };
  // Add other message types (template, media, etc.) as needed
}

export interface WhatsAppMessageResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface WhatsAppIncomingMessage {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: 'whatsapp';
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string; // Sender's WhatsApp ID
          id: string;
          timestamp: string;
          text?: {
            body: string;
          };
          type: string; // e.g., 'text', 'image', 'video'
          // Add other message types as needed
        }>;
        statuses?: Array<{
          id: string;
          status: string; // e.g., 'sent', 'delivered', 'read', 'failed'
          timestamp: string;
          recipient_id: string;
          conversation: {
            id: string;
            origin: {
              type: string;
            };
          };
          pricing: {
            billable: boolean;
            pricing_model: string;
            category: string;
          };
        }>;
      };
      field: 'messages';
    }>;
  }>;
}


export class WhatsAppBot {
  private token: string;
  private phoneNumberId: string; // WhatsApp Cloud API uses phone number ID
  private messageHandler: ((message: WhatsAppIncomingMessage) => Promise<void>) | null = null;

  constructor(token: string, phoneNumberId: string) {
    this.token = token;
    this.phoneNumberId = phoneNumberId;
  }

  private async callApi<T>(endpoint: string, method: string = 'GET', body?: Record<string, any>): Promise<T> {
    const url = `${WHATSAPP_API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method: method,
      headers: headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WhatsApp API error (${response.status}): ${errorText}`);
    }

    const json = await response.json();
    // WhatsApp API typically returns success directly in JSON, no 'ok' field
    return json as T;
  }

  async getMe(): Promise<WhatsAppBotInfo> {
    // For WhatsApp Cloud API, 'me' endpoint returns phone number info or business profile
    // This is a simplified representation. A real implementation would query business profile or specific phone number details.
    return this.callApi<WhatsAppBotInfo>(`${this.phoneNumberId}?fields=id,name`);
  }

  async sendMessage(to: string, text: string): Promise<WhatsAppMessageResponse> {
    const body: WhatsAppSendMessageOpts = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        body: text,
      },
    };
    return this.callApi<WhatsAppMessageResponse>(`${this.phoneNumberId}/messages`, 'POST', body);
  }

  /**
   * Registers a handler for incoming WhatsApp messages.
   * This method does not set up a webhook itself; it expects an external webhook
   * receiver to call `handleIncomingWebhook` when a message is received.
   * @param handler The function to call when a new message is received.
   */
  onMessage(handler: (message: WhatsAppIncomingMessage) => Promise<void>): void {
    this.messageHandler = handler;
    console.log('WhatsApp message handler registered. Awaiting incoming webhooks...');
  }

  /**
   * Processes an incoming webhook payload from WhatsApp.
   * This method should be called by an external webhook receiver.
   * @param payload The raw webhook payload.
   */
  async handleIncomingWebhook(payload: WhatsAppIncomingMessage): Promise<void> {
    if (this.messageHandler) {
      // Basic validation: ensure it's a message event for the configured phone number
      const relevantChanges = payload.entry
        .flatMap(entry => entry.changes)
        .filter(change => change.field === 'messages' && change.value.metadata.phone_number_id === this.phoneNumberId);

      for (const change of relevantChanges) {
        if (change.value.messages) {
          for (const message of change.value.messages) {
            // Further filter to actual incoming messages (not status updates)
            if (message.type === 'text' && message.from) { // Basic check for text message from a user
              await this.messageHandler(payload); // Pass the full payload or extract relevant parts
            }
          }
        }
      }
    } else {
      console.warn('No message handler registered for WhatsApp incoming webhooks.');
    }
  }
}

export async function setupWhatsAppBot(token: string, phoneNumberId: string): Promise<{ bot: WhatsAppBot; botInfo: WhatsAppBotInfo }> {
  const bot = new WhatsAppBot(token, phoneNumberId);
  const botInfo = await bot.getMe(); // Validate the token
  return { bot, botInfo };
}
