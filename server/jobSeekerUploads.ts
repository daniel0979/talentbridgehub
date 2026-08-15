import { storagePut } from "./storage";

export const MAX_PROFILE_PHOTO_BYTES = 2 * 1024 * 1024;
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const MAX_PROFILE_PHOTO_DATA_URL_LENGTH = 3 * 1024 * 1024;
export const MAX_RESUME_DATA_URL_LENGTH = 7 * 1024 * 1024;

type DecodedUpload = {
  contentType: string;
  bytes: Buffer;
};

type PreparedUpload = DecodedUpload & {
  extension: string;
};

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

function decodeDataUrl(dataUrl: string, maxBytes: number): DecodedUpload {
  const match = /^data:([a-zA-Z0-9/+.-]+);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) {
    throw new UploadValidationError("The selected file could not be read. Please choose the original file again.");
  }

  const [, contentType, encoded] = match;
  const bytes = Buffer.from(encoded, "base64");
  if (bytes.length === 0) {
    throw new UploadValidationError("The selected file is empty.");
  }
  if (bytes.length > maxBytes) {
    throw new UploadValidationError("The selected file is larger than the allowed upload limit.");
  }

  return { contentType: contentType.toLowerCase(), bytes };
}

function hasPrefix(bytes: Buffer, prefix: number[]) {
  return bytes.length >= prefix.length && prefix.every((value, index) => bytes[index] === value);
}

function isWebp(bytes: Buffer) {
  return (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

function isPdf(bytes: Buffer) {
  return hasPrefix(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
}

function isLegacyDoc(bytes: Buffer) {
  return hasPrefix(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
}

function isZipDocument(bytes: Buffer) {
  return hasPrefix(bytes, [0x50, 0x4b, 0x03, 0x04]);
}

export function prepareProfilePhoto(dataUrl: string): PreparedUpload {
  const upload = decodeDataUrl(dataUrl, MAX_PROFILE_PHOTO_BYTES);
  const imageTypes: Record<string, { extension: string; valid: boolean }> = {
    "image/jpeg": { extension: "jpg", valid: hasPrefix(upload.bytes, [0xff, 0xd8, 0xff]) },
    "image/png": { extension: "png", valid: hasPrefix(upload.bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
    "image/webp": { extension: "webp", valid: isWebp(upload.bytes) },
  };
  const image = imageTypes[upload.contentType];
  if (!image) {
    throw new UploadValidationError("Profile photos must be PNG, JPG, or WebP images.");
  }
  if (!image.valid) {
    throw new UploadValidationError("The selected file does not match its image type. Please choose a genuine image file.");
  }
  return { ...upload, extension: image.extension };
}

export function prepareResume(dataUrl: string): PreparedUpload {
  const upload = decodeDataUrl(dataUrl, MAX_RESUME_BYTES);
  const documents: Record<string, { extension: string; valid: boolean }> = {
    "application/pdf": { extension: "pdf", valid: isPdf(upload.bytes) },
    "application/msword": { extension: "doc", valid: isLegacyDoc(upload.bytes) },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      extension: "docx",
      valid: isZipDocument(upload.bytes),
    },
  };
  const document = documents[upload.contentType];
  if (!document) {
    throw new UploadValidationError("Resumes must be PDF, DOC, or DOCX files.");
  }
  if (!document.valid) {
    throw new UploadValidationError("The selected file does not match its document type. Please choose the original resume file.");
  }
  return { ...upload, extension: document.extension };
}

export async function storeProfilePhoto(jobSeekerId: number, dataUrl: string) {
  const upload = prepareProfilePhoto(dataUrl);
  return storagePut(
    `job-seekers/${jobSeekerId}/profile-photo.${upload.extension}`,
    upload.bytes,
    upload.contentType,
  );
}

export async function storeResume(jobSeekerId: number, dataUrl: string) {
  const upload = prepareResume(dataUrl);
  return storagePut(
    `job-seekers/${jobSeekerId}/resume.${upload.extension}`,
    upload.bytes,
    upload.contentType,
  );
}
