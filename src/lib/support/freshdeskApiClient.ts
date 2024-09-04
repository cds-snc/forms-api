import axios from "axios";
import { FRESHDESK_API_KEY, FRESHDESK_API_URL } from "@src/config";

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
    await axios({
      url: `${FRESHDESK_API_URL}/v2/tickets`,
      method: "POST",
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${FRESHDESK_API_KEY}:X`)}`,
      },
      data: {
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
    });
  } catch (error) {
    let errorMessage = "";

    if (axios.isAxiosError(error)) {
      if (error.response) {
        /*
         * The request was made and the server responded with a
         * status code that falls out of the range of 2xx
         */
        errorMessage = `Freshdesk API errored with status code ${error.response.status} and returned the following errors ${JSON.stringify(error.response.data)}.`;
      } else if (error.request) {
        /*
         * The request was made but no response was received, `error.request`
         * is an instance of XMLHttpRequest in the browser and an instance
         * of http.ClientRequest in Node.js
         */
        errorMessage = "Request timed out.";
      }
    } else if (error instanceof Error) {
      errorMessage = `${(error as Error).message}.`;
    }

    throw new Error(
      `Failed to create Freshdesk ticket. Reason: ${errorMessage}`,
    );
  }
}
