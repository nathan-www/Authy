// Cookie name for storing session token
export const SESSION_TOKEN_COOKIE_NAME = "SessID";

// Identity types
export const IDENTITY_TYPES = {
  email: 0,
};

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
  // How long to keep records of session use
  sessionUseRetentionTimeMinutes: 1440, //24 hours
};

// Limit the number of changes to clientInfo while using a session
export const SESSION_SUSBOT_CONFIG = {
  limits: {
    clientIP: {
      maxChanges: 30,
      maxSwitchbacks: 8,
    },
    clientCountry: {
      maxChanges: 2,
      maxSwitchbacks: 1,
    },
    clientFingerprint: {
      maxChanges: 3,
      maxSwitchbacks: 0,
    },
    clientUserAgentHash: {
      maxChanges: 1,
      maxSwitchbacks: 0,
    },
  },
};

// Registration IP rate limiting
export const MAX_REGISTRATIONS_PER_IP = 15;
export const MAX_REGISTRATIONS_PER_IP_TIMEFRAME_MINUTES = 5;

// Login IP rate limiting
export const MAX_LOGIN_ATTEMPTS_PER_IP = 35;
export const MAX_LOGIN_ATTEMPTS_PER_IP_TIMEFRAME_MINUTES = 5;

// Login account rate limiting (will require OTP login)
export const MAX_LOGIN_ATTEMPTS_PER_ACCOUNT = 50;
export const MAX_LOGIN_ATTEMPTS_PER_ACCOUNT_TIMEFRAME_MINUTES = 5;

// MFA expiration ms
export const MFA_EXPIRATION_MS = 600000; // 10 minutes

//MFA request limits
export const MAX_MFA_REQUESTS_PER_IDENTITY = 5;
export const MAX_MFA_REQUESTS_PER_IDENTITY_TIMEFRAME_MINUTES = 5;

/*
Errors
*/

export const ERROR_SESSION_INVALID_CLIENTINFO = {
  HTTPCode: 400,
  id: 1,
  external: "Invalid request",
  internal: "Failed to validate clientInfo object",
};

export const ERROR_SESSION_MISSING_TOKEN = {
  HTTPCode: 401,
  id: 2,
  external: "You are not authorized to perform this action",
  internal: "Missing session token cookie",
};

export const ERROR_SESSION_INVALID_TOKEN = {
  HTTPCode: 401,
  id: 3,
  external: "You are not authorized to perform this action",
  internal: "Invalid session token",
};

export const ERROR_SESSION_TOKEN_BINDING_FAILED = {
  HTTPCode: 401,
  id: 4,
  external: "You are not authorized to perform this action",
  internal: "ClientInfo does not match properties bound to session",
};

export const ERROR_SESSION_TIMEOUT = {
  HTTPCode: 401,
  id: 5,
  external: "You are not authorized to perform this action",
  internal: "Session has reached its idle and/or absolute timeout",
};

export const ERROR_SESSION_SUSBOT_FAILED = {
  HTTPCode: 401,
  id: 6,
  external: "You are not authorized to perform this action",
  internal: "Session susbot failed - possible session hijacking in progress",
};

export const ERROR_REGISTRATION_INVALID_STRATEGY = {
  HTTPCode: 403,
  id: 7,
  external: "Something went wrong",
  internal: "Registration failed - invalid strategy provided",
};

export const ERROR_REGISTRATION_INFO_INVALID = {
  HTTPCode: 403,
  id: 8,
  external: "Something went wrong",
  internal: "Invalid registration info object",
};

export const ERROR_REGISTRATION_EMAIL_EXISTS = {
  HTTPCode: 403,
  id: 9,
  external: "An account with that email already exists, please try logging-in",
  internal: "Registration attempted with existing email account",
};

export const ERROR_REGISTRATION_INSECURE_PASSWORD = {
  HTTPCode: 403,
  id: 10,
  external: "The password provided is not secure",
  internal: "Registration attempted with score < 3",
};

export const ERROR_REGISTRATION_IP_RATE_LIMITED = {
  HTTPCode: 429,
  id: 11,
  external: "Slow down! We've received too many requests from your IP address",
  internal: "Registration IP rate limited",
};

export const ERROR_LOGIN_INVALID_STRATEGY = {
  HTTPCode: 403,
  id: 12,
  external: "Something went wrong",
  internal: "Login failed - invalid strategy provided",
};

export const ERROR_LOGIN_INFO_INVALID = {
  HTTPCode: 403,
  id: 13,
  external: "Something went wrong",
  internal: "Invalid login info object",
};

export const ERROR_LOGIN_IP_RATE_LIMITED = {
  HTTPCode: 429,
  id: 14,
  external: "Slow down! We've received too many requests from your IP address",
  internal: "Login IP rate limited",
};

export const ERROR_LOGIN_ACCOUNT_RATE_LIMITED = {
  HTTPCode: 429,
  id: 15,
  external:
    "We've detected unusual activity on your account, please try again later",
  internal: "Login account rate limited",
};

export const ERROR_LOGIN_IDENTITY_NOT_FOUND = {
  HTTPCode: 403,
  id: 16,
  external: "Incorrect login information",
  internal: "Login attempted with non-existent identity",
};

export const ERROR_LOGIN_EMAIL_UNVERIFIED = {
  HTTPCode: 403,
  id: 17,
  external: "Your email address has not been verified",
  internal: "Login attempted with unverified email address",
};

export const ERROR_MFA_UNSUPPORTED_IDENTITY_TYPE = {
  HTTPCode: 403,
  id: 18,
  external: "Something went wrong",
  internal: "MFA request attempted with unsupported identity type",
};
