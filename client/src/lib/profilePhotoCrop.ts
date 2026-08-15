export const PROFILE_PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PROFILE_PHOTO_OUTPUT_SIZE = 400;
export const PROFILE_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type CropArea = { x: number; y: number; width: number; height: number };

export function getProfilePhotoValidationError(file: Pick<File, "size" | "type">) {
  if (!PROFILE_PHOTO_MIME_TYPES.includes(file.type as (typeof PROFILE_PHOTO_MIME_TYPES)[number])) {
    return "Profile photos must be PNG, JPG, or WebP images.";
  }
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return "Image is too large. Please choose a photo under 2MB.";
  }
  return null;
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected image could not be opened."));
    image.src = source;
  });
}

export async function createCroppedProfilePhoto(source: string, crop: CropArea, quality = 0.88) {
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = PROFILE_PHOTO_OUTPUT_SIZE;
  canvas.height = PROFILE_PHOTO_OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare the cropped image.");

  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    PROFILE_PHOTO_OUTPUT_SIZE,
    PROFILE_PHOTO_OUTPUT_SIZE,
  );
  return canvas.toDataURL("image/jpeg", quality);
}
