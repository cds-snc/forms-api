import { describe, it, expect } from "vitest";
import {
  requestContextualStore,
  RequestContextualStoreKey,
  retrieveOptionalRequestContextData,
  retrieveRequestContextData,
  saveRequestContextData,
} from "@lib/storage/requestContextualStore.js";

describe("requestContextualStore", () => {
  describe("saveRequestContextData should", () => {
    it("properly save given data in the store", () => {
      requestContextualStore.run(new Map(), () => {
        saveRequestContextData(RequestContextualStoreKey.serviceUserId, "test");

        expect(
          retrieveRequestContextData(RequestContextualStoreKey.serviceUserId),
        ).toEqual("test");
      });
    });

    it("throw an error if the requestContextualStore is undefined", () => {
      expect(() =>
        saveRequestContextData(RequestContextualStoreKey.serviceUserId, "test"),
      ).toThrowError("requestContextualStore is undefined");
    });
  });

  describe("retrieveOptionalRequestContextData should", () => {
    it("return undefined if the requested data is not available in the store", () => {
      requestContextualStore.run(new Map(), () => {
        expect(
          retrieveOptionalRequestContextData(
            RequestContextualStoreKey.clientIp,
          ),
        ).toEqual(undefined);
      });
    });

    it("throw an error if the requestContextualStore is undefined", () => {
      expect(() =>
        retrieveOptionalRequestContextData(RequestContextualStoreKey.clientIp),
      ).toThrowError("requestContextualStore is undefined");
    });
  });

  describe("retrieveRequestContextData should", () => {
    it("return the requested data if it is available in the store", () => {
      requestContextualStore.run(new Map(), () => {
        saveRequestContextData(RequestContextualStoreKey.clientIp, "8.8.8.8");

        expect(
          retrieveRequestContextData(RequestContextualStoreKey.clientIp),
        ).toEqual("8.8.8.8");
      });
    });

    it("throw an error if the requested data is not availavble in the store", () => {
      requestContextualStore.run(new Map(), () => {
        saveRequestContextData(RequestContextualStoreKey.serviceUserId, "test");

        expect(() =>
          retrieveRequestContextData(RequestContextualStoreKey.clientIp),
        ).toThrowError(
          "requestContextualStore does not have any set value for key: clientIp",
        );
      });
    });

    it("throw an error if the requestContextualStore is undefined", () => {
      expect(() =>
        retrieveRequestContextData(RequestContextualStoreKey.clientIp),
      ).toThrowError("requestContextualStore is undefined");
    });
  });
});
