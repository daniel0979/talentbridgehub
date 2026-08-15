import { describe, expect, it } from "vitest";
import { getProfilePhotoValidationError, PROFILE_PHOTO_MAX_BYTES } from "../client/src/lib/profilePhotoCrop";

describe("profile photo crop validation", () => {
  it("accepts supported image types under the managed upload limit", () => {
    expect(getProfilePhotoValidationError({ type: "image/jpeg", size: PROFILE_PHOTO_MAX_BYTES })).toBeNull();
  });

  it("rejects unsupported image types and oversized source files before cropping", () => {
    expect(getProfilePhotoValidationError({ type: "image/gif", size: 10 })).toContain("PNG, JPG, or WebP");
    expect(getProfilePhotoValidationError({ type: "image/png", size: PROFILE_PHOTO_MAX_BYTES + 1 })).toContain("under 2MB");
  });
});
