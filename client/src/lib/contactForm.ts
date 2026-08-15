export const CONTACT_DESTINATION = "akmdaniel2@gmail.com";
export const CONTACT_FORMSUBMIT_AJAX_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_DESTINATION}`;

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string;
};

type ContactResponse = { success?: string | boolean; message?: string };

export async function submitContactMessage(message: ContactMessage, fetchImpl: typeof fetch = fetch) {
  const response = await fetchImpl(CONTACT_FORMSUBMIT_AJAX_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      ...message,
      _subject: "New TalentBridgeHub contact message",
      _template: "table",
      _captcha: "false",
      _honey: message.honeypot ?? "",
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as ContactResponse;
  if (!response.ok || payload.success !== "true") {
    throw new Error(payload.message || "We could not send your message. Please try again shortly.");
  }
}
