import { Op } from "sequelize";
import {
  ERROR_MFA_UNSUPPORTED_IDENTITY_TYPE,
  IDENTITY_TYPES,
  MAX_MFA_REQUESTS_PER_IDENTITY,
  MAX_MFA_REQUESTS_PER_IDENTITY_TIMEFRAME_MINUTES,
  MFA_EXPIRATION_MS,
} from "../constants";
import { Identity, MFARequest } from "../db";
import { randomNumber, secureRandomString } from "../utils/random";
import { RateLimiter } from "../utils/rateLimiting";

const supportedIdentityTypes = [IDENTITY_TYPES.email];

const requestMFARateLimiter = new RateLimiter({
  eventType: "MFA_REQUEST",
  timeframeMinutes: MAX_MFA_REQUESTS_PER_IDENTITY_TIMEFRAME_MINUTES,
  maxEvents: MAX_MFA_REQUESTS_PER_IDENTITY,
});

export async function requestMFA(identity: Identity) {
  if (!supportedIdentityTypes.includes(identity.IdentityType)) {
    return {
      success: false,
    };
  }

  const referenceToken = secureRandomString();
  const authenticationToken = secureRandomString();

  const request = await MFARequest.create({
    IdentityId: identity.IdentityId,
    RequestTimestamp: Date.now(),
    MFARequestId: randomNumber(17, 3),
    RequestReferenceToken: referenceToken,
    RequestAuthenticationToken: authenticationToken,
  });

  if (identity.IdentityType === IDENTITY_TYPES.email) {
    // TODO: Send email
  }

  return {
    success: true,
  };
}

export async function verifyMFA(
  identity: Identity,
  referenceToken: string,
  authenticationToken: string
) {
  await MFARequest.destroy({
    where: {
      RequestTimestamp: {
        [Op.lt]: Date.now() - MFA_EXPIRATION_MS,
      },
    },
  });

  const request = await MFARequest.findOne({
    where: {
      IdentityId: identity.IdentityId,
      RequestReferenceToken: referenceToken,
      RequestAuthenticationToken: authenticationToken,
    },
  });

  if (request == null) {
    return {
      success: false,
    };
  } else {
    request.destroy();
    return {
      success: true,
    };
  }
}
