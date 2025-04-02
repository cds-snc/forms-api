import axios from "axios";
import { FRESHDESK_API_KEY, FRESHDESK_API_URL } from "@config";
import { logMessage } from "@lib/logging/logger.js";

export type FreshdeskTicketPayload = {
  name: string;
  email: string;
  type: string;
  subject: string;
  tags: string[];
  description: string;
  preferredLanguage: "en" | "fr";
};

export async function createFreshdeskTicket(
  payload: FreshdeskTicketPayload,
): Promise<void> {
  try {
    await axios.post(
      `${FRESHDESK_API_URL}/v2/tickets`,
      {
        name: payload.name,
        email: payload.email,
        type: payload.type,
        subject: payload.subject,
        tags: payload.tags,
        description: payload.description,
        custom_fields: {
          cf_language:
            payload.preferredLanguage === "en" ? "English" : "Français",
        },
        source: 2,
        priority: 1,
        status: 2,
        product_id: 61000000642,
        group_id: 61000172262,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${FRESHDESK_API_KEY}:X`)}`,
        },
        timeout: 5000,
      },
    );
  } catch (error) {
    logMessage.info(
      error,
      "[freshdesk-connector] Failed to create Freshdesk ticket",
    );

    throw error;
  }
}
