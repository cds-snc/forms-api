export enum EnvironmentMode {
  Local = "local",
  Staging = "staging",
  Production = "production",
}

export function getEnvironmentModeFromRequestHostHeader(
  host: string | undefined,
): EnvironmentMode {
  if (host === undefined || host.includes("localhost") || host === "") {
    return EnvironmentMode.Local;
  }

  if (host.includes("staging")) {
    return EnvironmentMode.Staging;
  }

  return EnvironmentMode.Production;
}
