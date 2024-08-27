export {};
declare global {
  namespace Express {
    interface Request {
      serviceAccountId?: string;
    }
  }
}
