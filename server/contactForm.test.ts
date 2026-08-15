import { describe, expect, it } from "vitest";
import { CONTACT_FORMSUBMIT_ENDPOINT, getContactSuccessUrl, isContactSubmissionSuccess } from "../client/src/lib/contactForm";

describe("Contact form provider configuration", () => {
  it("uses the configured Gmail destination without requiring visitors to authenticate", () => {
    expect(CONTACT_FORMSUBMIT_ENDPOINT).toBe("https://formsubmit.co/akmdaniel2@gmail.com");
  });

  it("returns users to a visible Contact-page success state", () => {
    expect(getContactSuccessUrl("https://talenthub-gkbobftg.manus.space")).toBe("https://talenthub-gkbobftg.manus.space/contact?sent=1");
    expect(isContactSubmissionSuccess("?sent=1")).toBe(true);
  });
});
