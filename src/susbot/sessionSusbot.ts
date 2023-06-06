import { Session, SessionUse } from "../db";
import { SESSION_SUSBOT_CONFIG } from "../constants";

function countMostOccuringDuplicate(arr: Array<string>): number {
  const map = Object.fromEntries(arr.map((key) => [key, 0]));
  arr.forEach((i) => (map[i] += 1));
  return Math.max(...Object.values(map));
}

export default async function sessionSusbot(session: Session) {
  const sessionUses = await SessionUse.findAll({
    where: {
      SessionId: session.SessionId,
    },
  });

  const sessionUseStrings = sessionUses.map((su) =>
    JSON.stringify({
      country: su.ClientCountry,
      ip: su.ClientIP,
      fingerprint: su.ClientFingerprint,
      userAgentHash: su.ClientUserAgentHash,
    })
  );

  const clientIPChanges: Array<string> = [];
  const clientCountryChanges: Array<string> = [];
  const clientFingerprintChanges: Array<string> = [];
  const clientUserAgentHashChanges: Array<string> = [];

  sessionUses.forEach((su) => {
    if (clientIPChanges.at(-1) !== su.ClientIP) {
      clientIPChanges.push(su.ClientIP);
    }
    if (clientCountryChanges.at(-1) !== su.ClientCountry) {
      clientCountryChanges.push(su.ClientCountry);
    }
    if (clientFingerprintChanges.at(-1) !== su.ClientFingerprint) {
      clientFingerprintChanges.push(su.ClientFingerprint);
    }
    if (clientUserAgentHashChanges.at(-1) !== su.ClientUserAgentHash) {
      clientUserAgentHashChanges.push(su.ClientUserAgentHash);
    }
  });

  const numClientIPChanges = clientIPChanges.length - 1;
  const numClientIPSwitchbacks =
    countMostOccuringDuplicate(clientIPChanges) - 1;

  const numClientCountryChanges = clientCountryChanges.length - 1;
  const numClientCountrySwitchbacks =
    countMostOccuringDuplicate(clientCountryChanges) - 1;

  const numClientFingerprintChanges = clientFingerprintChanges.length - 1;
  const numClientFingerprintSwitchbacks =
    countMostOccuringDuplicate(clientFingerprintChanges) - 1;

  const numClientUserAgentHashChanges = clientUserAgentHashChanges.length - 1;
  const numClientUserAgentHashSwitchbacks =
    countMostOccuringDuplicate(clientUserAgentHashChanges) - 1;

  console.log({
    numClientIPChanges,
    numClientIPSwitchbacks,
    numClientCountryChanges,
    numClientCountrySwitchbacks,
    numClientFingerprintChanges,
    numClientFingerprintSwitchbacks,
    numClientUserAgentHashChanges,
    numClientUserAgentHashSwitchbacks,
  });

  let pass = true;

  if (
    numClientIPChanges > SESSION_SUSBOT_CONFIG.limits.clientIP.maxChanges ||
    numClientIPSwitchbacks >
      SESSION_SUSBOT_CONFIG.limits.clientIP.maxSwitchbacks
  ) {
    pass = false;
  } else if (
    numClientCountryChanges >
      SESSION_SUSBOT_CONFIG.limits.clientCountry.maxChanges ||
    numClientCountrySwitchbacks >
      SESSION_SUSBOT_CONFIG.limits.clientCountry.maxSwitchbacks
  ) {
    pass = false;
  } else if (
    numClientFingerprintChanges >
      SESSION_SUSBOT_CONFIG.limits.clientFingerprint.maxChanges ||
    numClientFingerprintSwitchbacks >
      SESSION_SUSBOT_CONFIG.limits.clientFingerprint.maxSwitchbacks
  ) {
    pass = false;
  } else if (
    numClientUserAgentHashChanges >
      SESSION_SUSBOT_CONFIG.limits.clientUserAgentHash.maxChanges ||
    numClientUserAgentHashSwitchbacks >
      SESSION_SUSBOT_CONFIG.limits.clientUserAgentHash.maxSwitchbacks
  ) {
    pass = false;
  }

  return {
    pass: pass,
  };
}
