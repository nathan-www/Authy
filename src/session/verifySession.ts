import { ClientInfoType, ClientInfoValidator } from "../utils/validators";
import { RateLimiter } from "../utils/rateLimiting";
import {
  ERROR_SESSION_INVALID_CLIENTINFO,
  ERROR_SESSION_MISSING_TOKEN,
  SESSION_TOKEN_COOKIE_NAME,
  ERROR_SESSION_INVALID_TOKEN,
  ERROR_SESSION_TOKEN_BINDING_FAILED,
  ERROR_SESSION_TIMEOUT,
  ERROR_SESSION_SUSBOT_FAILED,
  SECURITY_CONFIG_SESSIONS,
} from "../constants";
import { Session, SessionUse } from "../db";
import sessionSusbot from "../susbot/sessionSusbot";
import md5 from "md5";

export default async function verifySession(clientInfo: ClientInfoType) {
  // Sanitise clientInfo
  if (!ClientInfoValidator(clientInfo)) {
    return {
      error: ERROR_SESSION_INVALID_CLIENTINFO,
      verified: false,
    };
  }

  const userAgentHash = md5(clientInfo.userAgent.slice(0, 255));

  if (!Object.hasOwn(clientInfo.cookies, SESSION_TOKEN_COOKIE_NAME)) {
    // Session token not set
    return {
      error: ERROR_SESSION_MISSING_TOKEN,
      verified: false,
    };
  }

  const session = await Session.findOne({
    where: {
      Token: clientInfo.cookies[SESSION_TOKEN_COOKIE_NAME],
    },
  });

  if (session === null) {
    // Session token invalid
    return {
      error: ERROR_SESSION_INVALID_TOKEN,
      verified: false,
    };
  }

  if (
    SECURITY_CONFIG_SESSIONS.bindClientCountry &&
    session.ClientCountry !== clientInfo.country
  ) {
    // Client country does not match session country
    await destroySession(session);
    return {
      error: ERROR_SESSION_TOKEN_BINDING_FAILED,
      verified: false,
    };
  }

  if (
    SECURITY_CONFIG_SESSIONS.bindClientFingerprint &&
    session.ClientFingerprint !== clientInfo.fingerprint
  ) {
    // Client fingerprint does not match session fingerprint
    await destroySession(session);
    return {
      error: ERROR_SESSION_TOKEN_BINDING_FAILED,
      verified: false,
    };
  }

  if (
    SECURITY_CONFIG_SESSIONS.bindClientIP &&
    session.ClientIP !== clientInfo.ip
  ) {
    // Client ip does not match session ip
    await destroySession(session);
    return {
      error: ERROR_SESSION_TOKEN_BINDING_FAILED,
      verified: false,
    };
  }

  if (
    SECURITY_CONFIG_SESSIONS.bindClientUserAgent &&
    session.ClientUserAgentHash !== userAgentHash
  ) {
    // Client user agent does not match session user agent
    await destroySession(session);
    return {
      error: ERROR_SESSION_TOKEN_BINDING_FAILED,
      verified: false,
    };
  }

  const lastUseTimestamp =
    (await getLastSessionUse(session))?.EndTimestamp ??
    session.CreatedTimestamp;

  if (
    Date.now() - lastUseTimestamp >
    SECURITY_CONFIG_SESSIONS.idleTimeoutMinutes * 60000
  ) {
    // Session idle timeout
    await destroySession(session);
    return {
      error: ERROR_SESSION_TIMEOUT,
      verified: false,
    };
  }

  if (
    Date.now() - session.CreatedTimestamp >
    SECURITY_CONFIG_SESSIONS.absoluteTimeoutMinutes * 60000
  ) {
    // Session absolute timeout
    await destroySession(session);
    return {
      error: ERROR_SESSION_TIMEOUT,
      verified: false,
    };
  }

  const susbotResults = await sessionSusbot(session);

  if (!susbotResults.pass) {
    // Session susbot failed - possible session hijacking
    await destroySession(session);
    return {
      error: ERROR_SESSION_SUSBOT_FAILED,
      verified: false,
    };
  }

  // All good
  await recordSessionUse(session, clientInfo);
  return {
    verified: true,
    accountId: session.AccountId,
  };
}

async function recordSessionUse(session: Session, clientInfo: ClientInfoType) {
  const lastSessionUse = await getLastSessionUse(session);
  const userAgentHash = md5(clientInfo.userAgent.slice(0, 255));
  if (
    lastSessionUse == null ||
    lastSessionUse.ClientCountry !== clientInfo.country ||
    lastSessionUse.ClientFingerprint !== clientInfo.fingerprint ||
    lastSessionUse.ClientIP !== clientInfo.ip ||
    lastSessionUse.ClientUserAgentHash !== userAgentHash
  ) {
    // Create new sessionUse entry
    SessionUse.create({
      SessionId: session.SessionId,
      ClientCountry: clientInfo.country,
      ClientFingerprint: clientInfo.fingerprint,
      ClientUserAgentHash: userAgentHash,
      ClientIP: clientInfo.ip,
      EndTimestamp: Date.now(),
      StartTimestamp: Date.now(),
    });
  } else {
    // Extend original sessionUse entry
    lastSessionUse.update({
      EndTimestamp: Date.now(),
    });
  }
}

async function getLastSessionUse(session: Session) {
  return await SessionUse.findOne({
    order: [["EndTimestamp", "DESC"]],
  });
}

async function destroySession(session: Session) {
  try {
    // Todo: uncomment below
    //await session.destroy();
  } catch {
    // Todo: Log error
  }
}
