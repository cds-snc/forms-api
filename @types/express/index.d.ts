// Needs to make this file a module
export type {};

declare global {
  // biome-ignore lint/style/noNamespace: <It is the only way to do this.  If we use module Biome also complains>
  namespace Express {
    interface Request {
      serviceAccountId: string;
      username: string;
    }
  }
}
