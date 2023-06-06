import {
  ERROR_LOGIN_EMAIL_UNVERIFIED,
  ERROR_LOGIN_IDENTITY_NOT_FOUND,
  ERROR_LOGIN_INFO_INVALID,
  ERROR_LOGIN_IP_RATE_LIMITED,
  ERROR_REGISTRATION_EMAIL_EXISTS,
  ERROR_REGISTRATION_INFO_INVALID,
  ERROR_REGISTRATION_INSECURE_PASSWORD,
  ERROR_REGISTRATION_IP_RATE_LIMITED,
  IDENTITY_TYPES,
  MAX_LOGIN_ATTEMPTS_PER_ACCOUNT,
  MAX_LOGIN_ATTEMPTS_PER_ACCOUNT_TIMEFRAME_MINUTES,
  MAX_LOGIN_ATTEMPTS_PER_IP,
  MAX_LOGIN_ATTEMPTS_PER_IP_TIMEFRAME_MINUTES,
  MAX_REGISTRATIONS_PER_IP,
  MAX_REGISTRATIONS_PER_IP_TIMEFRAME_MINUTES,
} from "../../constants";
import { Identity, Account, Password } from "../../db";
import {
  ClientInfoType,
  EmailSimpleLoginInfoType,
  EmailSimpleLoginInfoValidator,
  EmailSimpleRegistrationInfoType,
  EmailSimpleRegistrationInfoValidator,
} from "../../utils/validators";
import { measurePasswordStrength } from "../../utils/passwordStrength";
import { RateLimiter } from "../../utils/rateLimiting";
import { randomNumber } from "../../utils/random";
import { hashPassword } from "../../utils/passwordHash";

// IP-based rate limiter for registrations
const registrationRateLimiter = new RateLimiter({
  eventType: "REGISTRATION_ATTEMPT_IP",
  timeframeMinutes: MAX_REGISTRATIONS_PER_IP_TIMEFRAME_MINUTES,
  maxEvents: MAX_REGISTRATIONS_PER_IP,
});

export async function register(
  clientInfo: ClientInfoType,
  registrationInfo: EmailSimpleRegistrationInfoType
) {
  try {
    await registrationRateLimiter.limit(clientInfo.ip);
  } catch (e) {
    // Rate limited
    return {
      success: false,
      error: ERROR_REGISTRATION_IP_RATE_LIMITED,
    };
  }

  if (!EmailSimpleRegistrationInfoValidator(registrationInfo)) {
    return {
      success: false,
      error: ERROR_REGISTRATION_INFO_INVALID,
    };
  }

  if (
    (await findAccountWithIdentity(
      registrationInfo.emailAddress,
      IDENTITY_TYPES.email
    )) != null
  ) {
    // Fail - an account with this email already exists
    return {
      success: false,
      error: ERROR_REGISTRATION_EMAIL_EXISTS,
    };
  }

  const passwordScore = measurePasswordStrength(
    registrationInfo.password
  ).score;
  if (passwordScore < 3) {
    // Fail - password not secure
    return {
      success: false,
      error: ERROR_REGISTRATION_INSECURE_PASSWORD,
    };
  }

  // Success - create account
  await createAccount(registrationInfo.emailAddress, registrationInfo.password);

  return {
    success: true,
  };
}

async function createAccount(email: string, password: string) {
  const account = await Account.create({
    AccountId: randomNumber(),
    CreatedTimestamp: Date.now(),
  });

  const identity = await Identity.create({
    AccountId: account.AccountId,
    AddedTimestamp: Date.now(),
    IdentityContent: email,
    IdentityId: randomNumber(17, 2),
    IdentityType: IDENTITY_TYPES.email,
    Verified: false,
  });

  const passwordObj = await Password.create({
    AccountId: account.AccountId,
    PasswordHash: await hashPassword(password),
    LastSetTimestamp: Date.now(),
    NumChanges: 0,
  });
}

async function findAccountWithIdentity(
  identityContent: string,
  identityType: number
) {
  const identity = await Identity.findOne({
    where: {
      IdentityContent: identityContent,
      IdentityType: identityType,
    },
  });

  const account = await Account.findOne({
    where: {
      AccountId: identity?.AccountId ?? 0,
    },
  });

  if (identity == null || account == null) return null;

  return { identity, account };
}

// IP-based rate limiter for logins
const loginIPRateLimiter = new RateLimiter({
  eventType: "LOGIN_ATTEMPT_IP",
  timeframeMinutes: MAX_LOGIN_ATTEMPTS_PER_IP_TIMEFRAME_MINUTES,
  maxEvents: MAX_LOGIN_ATTEMPTS_PER_IP,
});

// Account-based rate limiter for logins
const loginAccountRateLimiter = new RateLimiter({
  eventType: "LOGIN_ATTEMPT_ACCOUNT",
  timeframeMinutes: MAX_LOGIN_ATTEMPTS_PER_ACCOUNT_TIMEFRAME_MINUTES,
  maxEvents: MAX_LOGIN_ATTEMPTS_PER_ACCOUNT,
});

export async function login(
  clientInfo: ClientInfoType,
  loginInfo: EmailSimpleLoginInfoType
) {
  if (!EmailSimpleLoginInfoValidator(loginInfo)) {
    // Invalid login info object
    return {
      success: false,
      error: ERROR_LOGIN_INFO_INVALID,
    };
  }

  try {
    await loginIPRateLimiter.limit(clientInfo.ip);
  } catch (e) {
    // Rate limited
    return {
      success: false,
      error: ERROR_LOGIN_IP_RATE_LIMITED,
    };
  }

  const accountInfo = await findAccountWithIdentity(
    loginInfo.emailAddress,
    IDENTITY_TYPES.email
  );

  if (accountInfo == null) {
    // Account not found
    return {
      success: false,
      error: ERROR_LOGIN_IDENTITY_NOT_FOUND,
    };
  }

  const { account, identity } = accountInfo;

  // Account-based rate limiting (user should login with OTP)
  try {
    loginAccountRateLimiter.limit(account.AccountId.toString());
  } catch (e) {
    return {
      success: false,
      error: ERROR_LOGIN_IP_RATE_LIMITED,
    };
  }

  if (!identity.Verified) {
    // Account not verified

    return {
      success: false,
      error: ERROR_LOGIN_EMAIL_UNVERIFIED,
    };
  }

  return {
    success: true,
  };
}
