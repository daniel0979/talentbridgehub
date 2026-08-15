import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ storagePut: vi.fn() }));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));

import { eq } from "drizzle-orm";
import { jobSeekerRouter } from "./jobSeekerRouter";
import { getDb, getJobSeekerByEmail } from "./db";
import { jobSeekers } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";

const email = `crop-upload-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@example.test`;
let jobSeekerId: number | undefined;

function createContext(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: null,
    admin: null,
    jobSeeker: null,
    company: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { cookie: () => undefined, clearCookie: () => undefined } as TrpcContext["res"],
    ...overrides,
  };
}

afterEach(async () => {
  const db = await getDb();
  if (db && jobSeekerId) await db.delete(jobSeekers).where(eq(jobSeekers.id, jobSeekerId));
  mocks.storagePut.mockReset();
});

describe("cropped profile photo integration", () => {
  it("uploads a cropped JPEG data URL and saves only its managed-storage URL", async () => {
    mocks.storagePut.mockResolvedValue({ key: "job-seekers/test/profile-photo.jpg", url: "/manus-storage/cropped-profile-test.jpg" });
    const publicCaller = jobSeekerRouter.createCaller(createContext());
    const registered = await publicCaller.auth.register({ name: "Crop Integration Test", email, password: "CropTestPass123!" });
    jobSeekerId = registered.jobSeeker.id;
    const stored = await getJobSeekerByEmail(email);
    const caller = jobSeekerRouter.createCaller(createContext({ jobSeeker: stored! }));
    const croppedJpeg = "data:image/jpeg;base64,/9j/2Q==";

    const uploaded = await caller.uploads.profilePhoto({ dataUrl: croppedJpeg });
    const updated = await caller.profile.update({ photoUrl: uploaded.url });

    expect(mocks.storagePut).toHaveBeenCalledWith(
      `job-seekers/${jobSeekerId}/profile-photo.jpg`,
      expect.any(Buffer),
      "image/jpeg",
    );
    expect(updated.jobSeeker.photoUrl).toBe("/manus-storage/cropped-profile-test.jpg");
    expect(updated.jobSeeker.photoUrl).not.toContain("data:");
  });
});
