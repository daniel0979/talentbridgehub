import { describe, expect, it } from "vitest";
import {
  LegacyProfileMediaError,
  prepareProfileMediaUpdate,
} from "./profileMediaCompatibility";

const legacyPhoto = "data:image/jpeg;base64,/9j/4AAQ";
const storedMedia = {
  photoUrl: legacyPhoto,
  resumeUrl: "data:application/pdf;base64,JVBERi0=",
};

describe("legacy profile media compatibility", () => {
  it("allows other profile fields to save without resubmitting unchanged legacy media", () => {
    const prepared = prepareProfileMediaUpdate(
      { name: "Daniel", photoUrl: legacyPhoto, resumeUrl: storedMedia.resumeUrl },
      storedMedia,
    );

    expect(prepared).toEqual({ name: "Daniel" });
  });

  it("retains a newly uploaded managed-storage URL in the update", () => {
    const prepared = prepareProfileMediaUpdate(
      { photoUrl: "/manus-storage/job-seekers/60002/profile-photo_abc123.jpg" },
      storedMedia,
    );

    expect(prepared.photoUrl).toContain("/manus-storage/");
  });

  it("rejects a new direct data URI so it cannot be written back into the database", () => {
    expect(() =>
      prepareProfileMediaUpdate(
        { photoUrl: "data:image/jpeg;base64,QU5FV0ZJTEU=" },
        storedMedia,
      ),
    ).toThrow(LegacyProfileMediaError);
  });
});
