// Cookie name for storing session token
export const SESSION_TOKEN_COOKIE_NAME = "SessID";

/*
Security options
*/

export const SECURITY_CONFIG_SESSIONS = {
  bindClientCountry: true,
  bindClientIP: false,
  bindClientUserAgent: false,
  bindClientFingerprint: false,
  // Session timeout
  idleTimeoutMinutes: 43200, // 30 days
  absoluteTimeoutMinutes: 259200, // 180 days
};

export const SESSION_SUSBOT_CONFIG = {};

/*
Errors
*/

export const ERROR_SESSION_INVALID_CLIENTINFO = {
  HTTPCode: 400,
  external: "Invalid request",
  id: 0,
  internal: "Failed to validate clientInfo object",
};

export const ERROR_SESSION_MISSING_TOKEN = {
  HTTPCode: 401,
  external: "You are not authorized to perform this action",
  id: 1,
  internal: "Missing session token cookie",
};

export const ERROR_SESSION_INVALID_TOKEN = {
  HTTPCode: 401,
  external: "You are not authorized to perform this action",
  id: 1,
  internal: "Invalid session token",
};

export const ERROR_SESSION_TOKEN_BINDING_FAILED = {
  HTTPCode: 401,
  external: "You are not authorized to perform this action",
  id: 1,
  internal: "ClientInfo does not match properties bound to session",
};

export const ERROR_SESSION_TIMEOUT = {
  HTTPCode: 401,
  external: "You are not authorized to perform this action",
  id: 1,
  internal: "Session has reached its idle and/or absolute timeout",
};

export const ERROR_SESSION_SUSBOT_FAILED = {
  HTTPCode: 401,
  external: "You are not authorized to perform this action",
  id: 1,
  internal: "Session susbot failed - possible session hijacking in progress",
};
