import {
  EnvironmentMode,
  FRESHDESK_API_KEY,
  FRESHDESK_API_URL,
} from "@src/config.js";
import axios, { type AxiosInstance } from "axios";
import { logMessage } from "./logger.js";

export class FreshdeskServiceConnector {
  private static instance: FreshdeskServiceConnector | undefined = undefined;

  public mainClient: FreshdeskApiClient;

  private constructor() {
    this.mainClient = new FreshdeskApiClient(
      FRESHDESK_API_URL,
      FRESHDESK_API_KEY,
      5000,
    );
  }

  public static getInstance(): FreshdeskServiceConnector {
    if (FreshdeskServiceConnector.instance === undefined) {
      FreshdeskServiceConnector.instance = new FreshdeskServiceConnector();
    }

    return FreshdeskServiceConnector.instance;
  }
}

export type FreshdeskTicketPayload = {
  name: string;
  email: string;
  type: string;
  subject: string;
  tags: string[];
  description: string;
  preferredLanguage: "en" | "fr";
};

export class FreshdeskApiClient {
  private axiosInstance: AxiosInstance;

  public constructor(apiUrl: string, apiKey: string, timeout: number) {
    this.axiosInstance = axios.create({
      baseURL: apiUrl,
      timeout: timeout,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${apiKey}:X`)}`,
      },
    });
  }

  public async createTicket(
    payload: FreshdeskTicketPayload,
    environmentMode: EnvironmentMode,
  ): Promise<void> {
    if (environmentMode === EnvironmentMode.Local) {
      logMessage.debug(
        `[local] Skip request to create Freshdesk ticket. Ticket payload = ${JSON.stringify(
          payload,
        )}`,
      );
      return Promise.resolve();
    }

    try {
      await this.axiosInstance.post("/v2/tickets", {
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
      });
    } catch (error) {
      let errorMessage = "";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          /*
           * The request was made and the server responded with a
           * status code that falls out of the range of 2xx
           */
          errorMessage = `Freshdesk API errored with status code ${
            error.response.status
          } and returned the following errors ${JSON.stringify(error.response.data)}.`;
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
}
