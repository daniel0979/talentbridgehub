type ProfileMediaInput = {
  photoUrl?: string | null;
  resumeUrl?: string | null;
};

type StoredProfileMedia = {
  photoUrl: string | null;
  resumeUrl: string | null;
};

export class LegacyProfileMediaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LegacyProfileMediaError";
  }
}

export function isLegacyDataUri(value: string | null | undefined) {
  return typeof value === "string" && /^data:[a-zA-Z0-9/+.-]+;base64,/.test(value);
}

/**
 * Keeps an unchanged legacy data URI out of the database update. This lets a
 * user save other profile edits while their historic photo or resume remains
 * available. New data-URI values must go through the upload endpoint instead.
 */
export function prepareProfileMediaUpdate<T extends ProfileMediaInput>(
  input: T,
  stored: StoredProfileMedia,
): T {
  const update = { ...input };

  for (const field of ["photoUrl", "resumeUrl"] as const) {
    const candidate = update[field];
    if (!isLegacyDataUri(candidate)) continue;

    if (candidate === stored[field]) {
      delete update[field];
      continue;
    }

    throw new LegacyProfileMediaError(
      "The selected file must finish uploading before you save your profile. Please choose the file again and wait for the upload to complete.",
    );
  }

  return update;
}
