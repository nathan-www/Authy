import {
  ERROR_LOGIN_INVALID_STRATEGY,
  ERROR_SESSION_INVALID_CLIENTINFO,
} from "../constants";
import { ClientInfoType, ClientInfoValidator } from "../utils/validators";
import { login as EmailSimpleLogin } from "./strategies/emailsimple";

export default async function login(
  clientInfo: ClientInfoType,
  loginInfo: any
) {
  // Sanitise clientInfo
  if (!ClientInfoValidator(clientInfo)) {
    return {
      error: ERROR_SESSION_INVALID_CLIENTINFO,
      success: false,
    };
  }

  if (loginInfo?.strategy === "emailsimple") {
    return await EmailSimpleLogin(clientInfo, loginInfo);
  } else {
    return {
      success: false,
      error: ERROR_LOGIN_INVALID_STRATEGY,
    };
  }
}
