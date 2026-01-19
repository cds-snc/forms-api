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
        saveRequestContextData(RequestContextualStoreKey.ServiceUserId, "test");

        expect(
          retrieveRequestContextData(RequestContextualStoreKey.ServiceUserId),
        ).toEqual("test");
      });
    });

    it("throw an error if the requestContextualStore is undefined", () => {
      expect(() =>
        saveRequestContextData(RequestContextualStoreKey.ServiceUserId, "test"),
      ).toThrowError("requestContextualStore is undefined");
    });
  });

  describe("retrieveOptionalRequestContextData should", () => {
    it("return undefined if the requested data is not available in the store", () => {
      requestContextualStore.run(new Map(), () => {
        expect(
          retrieveOptionalRequestContextData(
            RequestContextualStoreKey.ClientIp,
          ),
        ).toEqual(undefined);
      });
    });

    it("throw an error if the requestContextualStore is undefined", () => {
      expect(() =>
        retrieveOptionalRequestContextData(RequestContextualStoreKey.ClientIp),
      ).toThrowError("requestContextualStore is undefined");
    });
  });

  describe("retrieveRequestContextData should", () => {
    it("return the requested data if it is available in the store", () => {
      requestContextualStore.run(new Map(), () => {
        saveRequestContextData(RequestContextualStoreKey.ClientIp, "8.8.8.8");

        expect(
          retrieveRequestContextData(RequestContextualStoreKey.ClientIp),
        ).toEqual("8.8.8.8");
      });
    });

    it("throw an error if the requested data is not availavble in the store", () => {
      requestContextualStore.run(new Map(), () => {
        saveRequestContextData(RequestContextualStoreKey.ServiceUserId, "test");

        expect(() =>
          retrieveRequestContextData(RequestContextualStoreKey.ClientIp),
        ).toThrowError(
          "requestContextualStore does not have any set value for key: ClientIp",
        );
      });
    });

    it("throw an error if the requestContextualStore is undefined", () => {
      expect(() =>
        retrieveRequestContextData(RequestContextualStoreKey.ClientIp),
      ).toThrowError("requestContextualStore is undefined");
    });
  });
});
