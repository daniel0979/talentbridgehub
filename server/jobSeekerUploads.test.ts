import { describe, expect, it } from "vitest";
import {
  MAX_PROFILE_PHOTO_BYTES,
  UploadValidationError,
  prepareProfilePhoto,
  prepareResume,
} from "./jobSeekerUploads";

function toDataUrl(contentType: string, bytes: Buffer) {
  return `data:${contentType};base64,${bytes.toString("base64")}`;
}

describe("job seeker upload validation", () => {
  it("accepts a real PNG profile photo", () => {
    const upload = prepareProfilePhoto(
      toDataUrl("image/png", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])),
    );

    expect(upload.extension).toBe("png");
    expect(upload.contentType).toBe("image/png");
  });

  it("rejects a PDF disguised as a JPEG profile photo", () => {
    expect(() => prepareProfilePhoto(toDataUrl("image/jpeg", Buffer.from("%PDF-1.7")))).toThrow(
      UploadValidationError,
    );
  });

  it("rejects oversized profile photos before storage", () => {
    const tooLargeJpeg = Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff]),
      Buffer.alloc(MAX_PROFILE_PHOTO_BYTES),
    ]);

    expect(() => prepareProfilePhoto(toDataUrl("image/jpeg", tooLargeJpeg))).toThrow(
      "larger than the allowed upload limit",
    );
  });

  it("accepts a valid PDF resume", () => {
    const upload = prepareResume(toDataUrl("application/pdf", Buffer.from("%PDF-1.7\nresume")));

    expect(upload.extension).toBe("pdf");
    expect(upload.contentType).toBe("application/pdf");
  });
});
