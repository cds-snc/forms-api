import {
  mapFormSubmissionFromDynamoDbResponse,
  mapNewFormSubmissionFromDynamoDbResponse,
} from "@lib/vault/mappers/formSubmission.mapper.js";
import { AttachmentScanStatus } from "@lib/vault/types/formSubmission.types.js";
import { describe, expect, it } from "vitest";

describe("in formSubmission mapper", () => {
  describe("mapNewFormSubmissionFromDynamoDbResponse should", () => {
    it("return proper NewFormSubmission when DynamoDB response is complete and valid", () => {
      const newFormSubmission = mapNewFormSubmissionFromDynamoDbResponse({
        Name: "18-06-977e7",
        CreatedAt: 1750263415913,
        Version: 8,
      });

      expect(newFormSubmission).toEqual({
        name: "18-06-977e7",
        createdAt: 1750263415913,
        version: 8,
      });
    });

    // This test can be deleted once form versioning is well established in Production
    it("return proper NewFormSubmission when DynamoDB response does not include a Version attribute (testing backward compatibility with submissions that were produced when form versioning did not exist)", () => {
      const newFormSubmission = mapNewFormSubmissionFromDynamoDbResponse({
        Name: "18-06-977e7",
        CreatedAt: 1750263415913,
      });

      expect(newFormSubmission).toEqual(
        expect.objectContaining({
          version: 1,
        }),
      );
    });

    it("throw an error when DynamoDB response is incomplete", () => {
      expect(() =>
        mapNewFormSubmissionFromDynamoDbResponse({
          Name: "18-06-977e7",
        }),
      ).toThrow("Missing key properties in DynamoDB response");
    });

    it("throw an error when DynamoDB response is invalid", () => {
      expect(() =>
        mapNewFormSubmissionFromDynamoDbResponse({
          Name: "18-06-977e7",
          CreatedAt: "1750263415913",
        }),
      ).toThrow("Unexpected type in DynamoDB response");
    });
  });

  describe("mapFormSubmissionFromDynamoDbResponse should", () => {
    it("return proper FormSubmission when DynamoDB response is complete and valid", () => {
      const formSubmission = mapFormSubmissionFromDynamoDbResponse({
        CreatedAt: 1750263415913,
        "Status#CreatedAt": "New#1750263415913",
        ConfirmationCode: "99063d75-9804-4efa-8f4c-605b4ba6ad95",
        FormSubmission: '{"1":"Test response"}',
        FormSubmissionHash: "5981e9cd2a2f0032e9b8c99eb7bb8841",
        SubmissionAttachments: JSON.stringify([
          {
            id: "testId",
            name: "output.txt",
            path: "filePath",
            scanStatus: "NO_THREATS_FOUND",
          },
        ]),
        Version: 8,
      });

      expect(formSubmission).toEqual({
        createdAt: 1750263415913,
        status: "New",
        confirmationCode: "99063d75-9804-4efa-8f4c-605b4ba6ad95",
        answers: '{"1":"Test response"}',
        checksum: "5981e9cd2a2f0032e9b8c99eb7bb8841",
        attachments: [
          {
            id: "testId",
            name: "output.txt",
            path: "filePath",
            scanStatus: AttachmentScanStatus.noThreatsFound,
          },
        ],
        version: 8,
      });
    });

    // This test should be deleted once `PartialAttachment` has its `md5` property set to non optional
    it("return proper FormSubmission when DynamoDB response is complete and valid (testing backwards compatibility with file attachments not having defined 'md5')", () => {
      const formSubmission = mapFormSubmissionFromDynamoDbResponse({
        CreatedAt: 1750263415913,
        "Status#CreatedAt": "New#1750263415913",
        ConfirmationCode: "99063d75-9804-4efa-8f4c-605b4ba6ad95",
        FormSubmission: '{"1":"Test response"}',
        FormSubmissionHash: "5981e9cd2a2f0032e9b8c99eb7bb8841",
        SubmissionAttachments: JSON.stringify([
          {
            id: "test",
            name: "output.txt",
            path: "filePath",
            scanStatus: "NO_THREATS_FOUND",
          },
        ]),
        Version: 8,
      });

      expect(formSubmission).toEqual({
        createdAt: 1750263415913,
        status: "New",
        confirmationCode: "99063d75-9804-4efa-8f4c-605b4ba6ad95",
        answers: '{"1":"Test response"}',
        checksum: "5981e9cd2a2f0032e9b8c99eb7bb8841",
        attachments: [
          {
            id: "test",
            name: "output.txt",
            path: "filePath",
            scanStatus: AttachmentScanStatus.noThreatsFound,
            md5: undefined,
          },
        ],
        version: 8,
      });
    });

    it("return proper FormSubmission when DynamoDB response is complete and valid but has missing SubmissionAttachments property", () => {
      const formSubmission = mapFormSubmissionFromDynamoDbResponse({
        CreatedAt: 1750263415913,
        "Status#CreatedAt": "New#1750263415913",
        ConfirmationCode: "99063d75-9804-4efa-8f4c-605b4ba6ad95",
        FormSubmission: '{"1":"Test response"}',
        FormSubmissionHash: "5981e9cd2a2f0032e9b8c99eb7bb8841",
        Version: 8,
      });

      expect(formSubmission).toEqual({
        createdAt: 1750263415913,
        status: "New",
        confirmationCode: "99063d75-9804-4efa-8f4c-605b4ba6ad95",
        answers: '{"1":"Test response"}',
        checksum: "5981e9cd2a2f0032e9b8c99eb7bb8841",
        attachments: [],
        version: 8,
      });
    });

    // This test can be deleted once form versioning is well established in Production
    it("return proper FormSubmission when DynamoDB response does not include a Version attribute (testing backward compatibility with submissions that were produced when form versioning did not exist)", () => {
      const formSubmission = mapFormSubmissionFromDynamoDbResponse({
        CreatedAt: 1750263415913,
        "Status#CreatedAt": "New#1750263415913",
        ConfirmationCode: "99063d75-9804-4efa-8f4c-605b4ba6ad95",
        FormSubmission: '{"1":"Test response"}',
        FormSubmissionHash: "5981e9cd2a2f0032e9b8c99eb7bb8841",
      });

      expect(formSubmission).toEqual(
        expect.objectContaining({
          version: 1,
        }),
      );
    });

    it("throw an error when SubmissionAttachments in DynamoDB response is present but invalid", () => {
      expect(() =>
        mapFormSubmissionFromDynamoDbResponse({
          CreatedAt: 1750263415913,
          "Status#CreatedAt": "New#1750263415913",
          ConfirmationCode: "99063d75-9804-4efa-8f4c-605b4ba6ad95",
          FormSubmission: '{"1":"Test response"}',
          FormSubmissionHash: "5981e9cd2a2f0032e9b8c99eb7bb8841",
          SubmissionAttachments: [],
        }),
      ).toThrow("Unexpected type in DynamoDB response");
    });

    it("throw an error when DynamoDB response is incomplete", () => {
      expect(() =>
        mapFormSubmissionFromDynamoDbResponse({
          CreatedAt: 1750263415913,
          "Status#CreatedAt": "New#1750263415913",
          ConfirmationCode: "99063d75-9804-4efa-8f4c-605b4ba6ad95",
          FormSubmissionHash: "5981e9cd2a2f0032e9b8c99eb7bb8841",
        }),
      ).toThrow("Missing key properties in DynamoDB response");
    });

    it("throw an error when DynamoDB response is invalid", () => {
      expect(() =>
        mapFormSubmissionFromDynamoDbResponse({
          CreatedAt: 1750263415913,
          "Status#CreatedAt": "New#1750263415913",
          ConfirmationCode: 123,
          FormSubmission: '{"1":"Test response"}',
          FormSubmissionHash: "5981e9cd2a2f0032e9b8c99eb7bb8841",
        }),
      ).toThrow("Unexpected type in DynamoDB response");
    });
  });
});
