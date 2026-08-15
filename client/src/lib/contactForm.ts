export const CONTACT_DESTINATION = "akmdaniel2@gmail.com";
export const CONTACT_FORMSUBMIT_ENDPOINT = `https://formsubmit.co/${CONTACT_DESTINATION}`;

export function getContactSuccessUrl(origin: string) {
  return `${origin}/contact?sent=1`;
}

export function isContactSubmissionSuccess(search: string) {
  return new URLSearchParams(search).get("sent") === "1";
}
