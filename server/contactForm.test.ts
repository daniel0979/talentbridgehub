import { describe, expect, it, vi } from "vitest";
import { CONTACT_FORMSUBMIT_AJAX_ENDPOINT, submitContactMessage } from "../client/src/lib/contactForm";

const message = {
  name: "Contact Test",
  email: "contact@example.com",
  subject: "Contact delivery test",
  message: "This is a valid contact form message.",
};

describe("Contact form AJAX delivery", () => {
  it("posts a JSON message to the configured provider endpoint without navigation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: "true" }) });

    await submitContactMessage(message, fetchMock as unknown as typeof fetch);

    expect(fetchMock).toHaveBeenCalledWith(
      CONTACT_FORMSUBMIT_AJAX_ENDPOINT,
      expect.objectContaining({ method: "POST", headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(fetchMock.mock.calls[0][1].body).toContain('"_captcha":"false"');
    expect(fetchMock.mock.calls[0][1].body).toContain('"_honey":""');
  });

  it("surfaces provider errors to the Contact page", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: "Delivery unavailable" }) });

    await expect(submitContactMessage(message, fetchMock as unknown as typeof fetch)).rejects.toThrow("Delivery unavailable");
  });
});
