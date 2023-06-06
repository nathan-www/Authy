import {
  ERROR_REGISTRATION_INVALID_STRATEGY,
  ERROR_SESSION_INVALID_CLIENTINFO,
} from "../constants";
import { register as emailSimpleRegister } from "./strategies/emailsimple";
import { ClientInfoType, ClientInfoValidator } from "../utils/validators";

export default async function register(
  clientInfo: ClientInfoType,
  registrationInfo: any
) {
  // Sanitise clientInfo
  if (!ClientInfoValidator(clientInfo)) {
    return {
      error: ERROR_SESSION_INVALID_CLIENTINFO,
      success: false,
    };
  }

  if (registrationInfo?.strategy === "emailsimple") {
    return await emailSimpleRegister(clientInfo, registrationInfo);
  } else {
    return {
      success: false,
      error: ERROR_REGISTRATION_INVALID_STRATEGY,
    };
  }
}
