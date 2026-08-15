export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  adminCookieSecret: process.env.ADMIN_JWT_SECRET ?? process.env.JWT_SECRET ?? "",
jobSeekerCookieSecret:
    process.env.JOB_SEEKER_JWT_SECRET ?? process.env.JWT_SECRET ?? "",
  companyCookieSecret:
    process.env.COMPANY_JWT_SECRET ?? process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
