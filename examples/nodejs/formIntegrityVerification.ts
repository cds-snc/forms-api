import { createHash } from "node:crypto";

export const verifyIntegrity = (submission: string, hash: string) => {
  const hashBuffer = createHash("md5").update(submission).digest("hex");
  return hashBuffer.toString() === hash;
};
