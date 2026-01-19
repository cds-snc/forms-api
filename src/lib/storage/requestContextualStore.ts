import { AsyncLocalStorage } from "node:async_hooks";

export enum RequestContextualStoreKey {
  ServiceUserId = "ServiceUserId",
  ServiceAccountId = "ServiceAccountId",
  TokenConsumedOnFormId = "TokenConsumedOnFormId",
  ClientIp = "ClientIp",
}

export const requestContextualStore = new AsyncLocalStorage<
  Map<string, string>
>();

export function saveRequestContextData(
  key: RequestContextualStoreKey,
  value: string,
) {
  const store = requestContextualStore.getStore();

  if (store === undefined) {
    throw new Error("requestContextualStore is undefined");
  }

  store.set(key, value);
}

export function retrieveOptionalRequestContextData(
  key: RequestContextualStoreKey,
): string | undefined {
  const store = requestContextualStore.getStore();

  if (store === undefined) {
    throw new Error("requestContextualStore is undefined");
  }

  return store.get(key);
}

export function retrieveRequestContextData(
  key: RequestContextualStoreKey,
): string {
  const value = retrieveOptionalRequestContextData(key);

  if (value === undefined) {
    throw new Error(
      `requestContextualStore does not have any set value for key: ${key}`,
    );
  }

  return value;
}
