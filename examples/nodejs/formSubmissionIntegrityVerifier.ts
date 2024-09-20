import { createHash } from "node:crypto";

export const verifyIntegrity = (answers: string, checksum: string) => {
  const generatedChecksumFromReceivedData = createHash("md5")
    .update(answers)
    .digest("hex");

  return generatedChecksumFromReceivedData.toString() === checksum;
};
